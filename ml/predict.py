"""
Health Score Prediction Module.
Loads the trained model and produces health scores + alert levels.
"""

import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List

import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from ml.preprocessing import engineer_features, ALL_FEATURES

ARTIFACTS_DIR = Path(__file__).parent / "artifacts"

# Alert thresholds
ALERT_LEVELS = {
    "critical": {"min": 0, "max": 30, "emoji": "🔴", "label": "Critical", "action": "Schedule immediate maintenance"},
    "warning": {"min": 30, "max": 60, "emoji": "🟡", "label": "Warning", "action": "Preventive maintenance recommended"},
    "good": {"min": 60, "max": 80, "emoji": "🟢", "label": "Good", "action": "Monitor trends"},
    "excellent": {"min": 80, "max": 100, "emoji": "✅", "label": "Excellent", "action": "No action needed"},
}


def get_alert_level(score: float) -> Dict:
    """Determine alert level based on health score."""
    for key, level in ALERT_LEVELS.items():
        if level["min"] <= score < level["max"] or (key == "excellent" and score >= level["min"]):
            return {
                "level": key,
                "emoji": level["emoji"],
                "label": level["label"],
                "action": level["action"],
            }
    return {"level": "unknown", "emoji": "❓", "label": "Unknown", "action": "Check sensor data"}


class HealthScorePredictor:
    """Predicts AC health scores from sensor data."""

    def __init__(self, model_path: str = None, scaler_path: str = None):
        model_path = model_path or str(ARTIFACTS_DIR / "model.joblib")
        scaler_path = scaler_path or str(ARTIFACTS_DIR / "scaler.joblib")

        self.model = joblib.load(model_path)
        self.scaler = joblib.load(scaler_path)
        self.feature_names = ALL_FEATURES

    def predict(self, readings: List[Dict]) -> List[Dict]:
        """
        Predict health scores for a batch of sensor readings.

        Args:
            readings: list of dicts with sensor values

        Returns:
            list of dicts with unit_id, health_score, alert_level, and sensor summary
        """
        df = pd.DataFrame(readings)
        df_eng = engineer_features(df)

        # Ensure all required features exist
        for feat in self.feature_names:
            if feat not in df_eng.columns:
                df_eng[feat] = 0

        X = df_eng[self.feature_names].values
        X_scaled = self.scaler.transform(X)
        scores = self.model.predict(X_scaled)
        scores = np.clip(scores, 0, 100)

        results = []
        for i, score in enumerate(scores):
            reading = readings[i]
            alert = get_alert_level(score)

            result = {
                "unit_id": reading.get("unit_id", f"UNIT-{i+1}"),
                "health_score": round(float(score), 2),
                "alert": alert,
                "sensor_summary": {
                    "indoor_temp": reading.get("indoor_temp"),
                    "set_temp": reading.get("set_temp"),
                    "temp_deviation": round(abs(reading.get("indoor_temp", 0) - reading.get("set_temp", 0)), 2),
                    "filter_status": reading.get("filter_status"),
                    "refrigerant_pressure": reading.get("refrigerant_pressure"),
                    "vibration_level": reading.get("vibration_level"),
                    "power_consumption": reading.get("power_consumption"),
                },
            }
            results.append(result)

        return results

    def predict_fleet_summary(self, data_path: str = None) -> Dict:
        """
        Generate a fleet-wide health summary from the latest readings.

        Returns summary with per-unit scores and fleet-level statistics.
        """
        if data_path is None:
            data_path = Path(__file__).parent.parent / "data" / "ac_sensor_data.csv"

        df = pd.read_csv(data_path, parse_dates=["timestamp"])

        # Get the latest reading for each unit
        latest = df.sort_values("timestamp").groupby("unit_id").last().reset_index()

        readings = latest[["unit_id"] + [f for f in self.feature_names if f in latest.columns]].to_dict("records")
        predictions = self.predict(readings)

        scores = [p["health_score"] for p in predictions]

        summary = {
            "total_units": len(predictions),
            "average_score": round(float(np.mean(scores)), 2),
            "min_score": round(float(np.min(scores)), 2),
            "max_score": round(float(np.max(scores)), 2),
            "critical_count": sum(1 for s in scores if s < 30),
            "warning_count": sum(1 for s in scores if 30 <= s < 60),
            "good_count": sum(1 for s in scores if 60 <= s < 80),
            "excellent_count": sum(1 for s in scores if s >= 80),
            "units": predictions,
        }

        return summary
