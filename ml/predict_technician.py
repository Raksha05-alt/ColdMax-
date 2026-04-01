"""
Real-time Technician Prediction Module.
Loads the trained matching model and returns the best technician for a job request.
"""

import json
import math
from pathlib import Path
from typing import Dict, Any

import joblib
import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).parent.parent
ARTIFACTS_DIR = PROJECT_ROOT / "ml" / "artifacts"

# ── Full technician roster (single source of truth) ───────────────────────────
TECHNICIAN_ROSTER = {
    "T001": {
        "id": "T001",
        "name": "David Tan",
        "skills": ["General Servicing", "Chemical Wash", "Diagnostics"],
        "specialisation": "General Maintenance",
        "base_lat": 1.3100,
        "base_lon": 103.8200,
        "rating": 4.9,
        "jobs_completed": 1204,
        "image": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=150&q=80",
        "phone": "+65 9123 4567",
        "years_experience": 8,
    },
    "T002": {
        "id": "T002",
        "name": "Ahmad Rizal",
        "skills": ["Chemical Wash", "Chemical Overhaul", "Gas Top-Up"],
        "specialisation": "Chemical Treatments",
        "base_lat": 1.3500,
        "base_lon": 103.8500,
        "rating": 4.7,
        "jobs_completed": 876,
        "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        "phone": "+65 9234 5678",
        "years_experience": 5,
    },
    "T003": {
        "id": "T003",
        "name": "Priya Nair",
        "skills": ["General Servicing", "Repair", "Diagnostics", "Installation"],
        "specialisation": "Diagnostics & Repair",
        "base_lat": 1.2900,
        "base_lon": 103.8400,
        "rating": 4.8,
        "jobs_completed": 1051,
        "image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
        "phone": "+65 9345 6789",
        "years_experience": 7,
    },
    "T004": {
        "id": "T004",
        "name": "Marcus Lew",
        "skills": ["Gas Top-Up", "Repair", "Chemical Overhaul"],
        "specialisation": "Gas & Overhaul",
        "base_lat": 1.3300,
        "base_lon": 103.7900,
        "rating": 4.6,
        "jobs_completed": 632,
        "image": "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=150&q=80",
        "phone": "+65 9456 7890",
        "years_experience": 4,
    },
    "T005": {
        "id": "T005",
        "name": "Sarah Lim",
        "skills": ["General Servicing", "Chemical Wash", "Installation", "Diagnostics"],
        "specialisation": "Installation & Servicing",
        "base_lat": 1.3700,
        "base_lon": 103.8100,
        "rating": 4.9,
        "jobs_completed": 987,
        "image": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
        "phone": "+65 9567 8901",
        "years_experience": 6,
    },
}


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _eta_minutes(distance_km: float, speed_kmh: float = 30.0) -> int:
    return max(5, int((distance_km / speed_kmh) * 60))


class TechnicianMatcher:
    """Loads the trained Random Forest and predicts the best technician."""

    def __init__(self):
        model_path   = ARTIFACTS_DIR / "technician_model.joblib"
        encoder_path = ARTIFACTS_DIR / "technician_label_encoder.joblib"
        meta_path    = ARTIFACTS_DIR / "technician_model_metadata.json"

        if not model_path.exists():
            raise FileNotFoundError(
                "Technician model not found. Run: python ml/train_technician_model.py"
            )

        self.model   = joblib.load(model_path)
        self.encoder = joblib.load(encoder_path)
        with open(meta_path) as f:
            self.metadata = json.load(f)
        self.feature_cols = self.metadata["feature_columns"]

    def _build_feature_row(self, service_type: str, urgency: str,
                            customer_lat: float, customer_lon: float,
                            time_slot: str, num_units: int) -> pd.DataFrame:
        row = {
            "customer_lat": customer_lat,
            "customer_lon": customer_lon,
            "num_units": num_units,
        }

        # Service type dummies
        for svc in ["servicing", "chemical", "overhaul", "gas", "repair"]:
            row[f"svc_{svc}"] = 1 if service_type == svc else 0

        # Urgency dummies
        for urg in ["low", "medium", "high", "emergency"]:
            row[f"urg_{urg}"] = 1 if urgency == urg else 0

        # Time slot dummies
        for slot in ["morning", "afternoon", "evening"]:
            row[f"slot_{slot}"] = 1 if time_slot == slot else 0

        df = pd.DataFrame([row])

        # Reindex to match training columns (fills 0 for missing)
        df = df.reindex(columns=self.feature_cols, fill_value=0)
        return df

    def predict(self, service_type: str, urgency: str,
                customer_lat: float, customer_lon: float,
                time_slot: str, num_units: int = 1) -> Dict[str, Any]:
        """
        Returns the best matched technician with metadata and estimated ETA.
        """
        X = self._build_feature_row(service_type, urgency, customer_lat, customer_lon, time_slot, num_units)

        # Get probability distribution over all technicians
        proba = self.model.predict_proba(X)[0]
        tech_ids = self.encoder.classes_
        ranked   = sorted(zip(tech_ids, proba), key=lambda x: x[1], reverse=True)

        best_id    = ranked[0][0]
        confidence = round(float(ranked[0][1]) * 100, 1)

        tech = TECHNICIAN_ROSTER[best_id].copy()
        dist = _haversine_km(customer_lat, customer_lon, tech["base_lat"], tech["base_lon"])
        eta  = _eta_minutes(dist)

        return {
            "technician": tech,
            "confidence": confidence,
            "distance_km": round(dist, 2),
            "eta_minutes": eta,
            "distance_label": f"{dist:.1f} km away",
            "model_accuracy": self.metadata.get("accuracy", 0),
        }


# Singleton
_matcher: TechnicianMatcher | None = None


def get_matcher() -> TechnicianMatcher:
    global _matcher
    if _matcher is None:
        _matcher = TechnicianMatcher()
    return _matcher
