"""
Generate synthetic historical technician-assignment training data.
Run once to create: ml/data/technician_assignments.csv
"""

import random
import pandas as pd
import numpy as np
from pathlib import Path

random.seed(42)
np.random.seed(42)

# ── Technician roster ─────────────────────────────────────────────────────────
TECHNICIANS = [
    {
        "id": "T001",
        "name": "David Tan",
        "skills": ["general_servicing", "chemical_wash", "diagnostics"],
        "base_lat": 1.3100,
        "base_lon": 103.8200,
        "rating": 4.9,
        "jobs_completed": 1204,
        "image": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=150&q=80",
    },
    {
        "id": "T002",
        "name": "Ahmad Rizal",
        "skills": ["chemical_wash", "chemical_overhaul", "gas_top_up"],
        "base_lat": 1.3500,
        "base_lon": 103.8500,
        "rating": 4.7,
        "jobs_completed": 876,
        "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    },
    {
        "id": "T003",
        "name": "Priya Nair",
        "skills": ["general_servicing", "repair", "diagnostics", "installation"],
        "base_lat": 1.2900,
        "base_lon": 103.8400,
        "rating": 4.8,
        "jobs_completed": 1051,
        "image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
    },
    {
        "id": "T004",
        "name": "Marcus Lew",
        "skills": ["gas_top_up", "repair", "chemical_overhaul"],
        "base_lat": 1.3300,
        "base_lon": 103.7900,
        "rating": 4.6,
        "jobs_completed": 632,
        "image": "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=150&q=80",
    },
    {
        "id": "T005",
        "name": "Sarah Lim",
        "skills": ["general_servicing", "chemical_wash", "installation", "diagnostics"],
        "base_lat": 1.3700,
        "base_lon": 103.8100,
        "rating": 4.9,
        "jobs_completed": 987,
        "image": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
    },
]

SERVICE_TYPE_MAP = {
    "general_servicing": "servicing",
    "chemical_wash": "chemical",
    "chemical_overhaul": "overhaul",
    "gas_top_up": "gas",
    "repair": "repair",
    "diagnostics": "repair",
    "installation": "repair",
}

URGENCY_LEVELS = ["low", "medium", "high", "emergency"]

# Singapore bounding box
LAT_RANGE = (1.25, 1.45)
LON_RANGE = (103.65, 104.05)


def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = np.sin(dlat / 2) ** 2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon / 2) ** 2
    return R * 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))


def pick_best_technician(service_type, urgency, cust_lat, cust_lon, time_slot):
    """Rule-based oracle that mirrors ground truth for training."""
    candidates = []
    for tech in TECHNICIANS:
        # Skill match
        skill_match = any(
            SERVICE_TYPE_MAP.get(s, "") == service_type or s == service_type
            for s in tech["skills"]
        )
        if not skill_match:
            continue

        distance = haversine(cust_lat, cust_lon, tech["base_lat"], tech["base_lon"])
        score = (
            tech["rating"] * 15
            - distance * 5
            + tech["jobs_completed"] / 200
            + (10 if urgency in ["high", "emergency"] and tech["rating"] >= 4.8 else 0)
            + random.gauss(0, 2)  # slight noise so model generalises
        )
        candidates.append((tech["id"], score))

    if not candidates:
        return random.choice(TECHNICIANS)["id"]
    candidates.sort(key=lambda x: x[1], reverse=True)
    return candidates[0][0]


def generate_dataset(n=3000):
    rows = []
    service_types = list(SERVICE_TYPE_MAP.values())
    unique_services = list(set(service_types))

    for _ in range(n):
        service_type = random.choice(unique_services)
        urgency = random.choice(URGENCY_LEVELS)
        cust_lat = random.uniform(*LAT_RANGE)
        cust_lon = random.uniform(*LON_RANGE)
        time_slot = random.choice(["morning", "afternoon", "evening"])
        num_units = random.randint(1, 4)

        tech_id = pick_best_technician(service_type, urgency, cust_lat, cust_lon, time_slot)

        rows.append({
            "service_type": service_type,
            "urgency": urgency,
            "customer_lat": round(cust_lat, 6),
            "customer_lon": round(cust_lon, 6),
            "time_slot": time_slot,
            "num_units": num_units,
            "assigned_technician_id": tech_id,
        })

    return pd.DataFrame(rows)


if __name__ == "__main__":
    out_dir = Path(__file__).parent / "data"
    out_dir.mkdir(exist_ok=True)
    df = generate_dataset(3000)
    out_path = out_dir / "technician_assignments.csv"
    df.to_csv(out_path, index=False)
    print(f"✅ Generated {len(df)} training samples → {out_path}")
    print(df["assigned_technician_id"].value_counts())
