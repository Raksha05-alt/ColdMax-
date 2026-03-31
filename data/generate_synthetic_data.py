"""
Synthetic Data Generator for AC Health Score System
Generates realistic IoT sensor data for 50 AC units over 90 days.
Each unit has a unique degradation curve to simulate real-world aging.
"""

import sys
import io
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime, timedelta

# Fix Windows console encoding for special characters
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# --- Configuration ---
NUM_UNITS = 50
NUM_DAYS = 90
READINGS_PER_DAY = 48  # every 30 minutes
OUTPUT_DIR = Path(__file__).parent
OUTPUT_FILE = OUTPUT_DIR / "ac_sensor_data.csv"

# Seed for reproducibility
np.random.seed(42)


def generate_outdoor_temp(timestamps: pd.DatetimeIndex) -> np.ndarray:
    """Generate realistic outdoor temperatures with diurnal + seasonal patterns."""
    hours = timestamps.hour + timestamps.minute / 60.0
    # Convert timedelta to fractional days using total_seconds
    td = timestamps - timestamps[0]
    days = np.array([t.total_seconds() / 86400.0 for t in td])

    # Diurnal cycle: peaks at ~14:00, trough at ~05:00
    diurnal = 5.0 * np.sin(2 * np.pi * (hours - 5) / 24)

    # Seasonal baseline (tropical climate, 28-36 C range)
    seasonal = 32 + 4 * np.sin(2 * np.pi * days / 365)

    # Random weather noise
    noise = np.random.normal(0, 1.5, len(timestamps))

    return np.clip(seasonal + diurnal + noise, 20, 45)


def generate_unit_profile() -> dict:
    """Generate a random degradation profile for one AC unit."""
    return {
        "initial_health": np.random.uniform(85, 100),
        "degradation_rate": np.random.uniform(0.05, 0.35),  # health drop per day
        "filter_degradation_rate": np.random.uniform(0.2, 0.8),  # % per day
        "refrigerant_leak_rate": np.random.uniform(0.0, 0.15),  # PSI per day
        "vibration_growth_rate": np.random.uniform(0.001, 0.008),
        "compressor_wear_rate": np.random.uniform(0.005, 0.02),
        "set_temp": np.random.choice([22, 23, 24, 25, 26]),
        "base_airflow": np.random.uniform(8.0, 12.0),
        "base_refrigerant_pressure": np.random.uniform(115, 135),
        "base_compressor_current": np.random.uniform(6.0, 9.0),
        "base_vibration": np.random.uniform(0.1, 0.3),
        # Chance of sudden events
        "sudden_failure_day": np.random.choice([None, None, None, np.random.randint(30, 80)]),
        "maintenance_day": np.random.choice([None, None, np.random.randint(20, 70)]),
    }


def compute_health_score(
    filter_pct: float,
    refrigerant_pressure: float,
    base_refrigerant: float,
    vibration: float,
    base_vibration: float,
    compressor_current: float,
    base_compressor: float,
    temp_deviation: float,
) -> float:
    """Compute health score from component degradation factors."""
    # Filter contribution (25% weight)
    filter_score = (filter_pct / 100.0) * 25

    # Refrigerant contribution (25% weight)
    ref_ratio = refrigerant_pressure / base_refrigerant
    ref_score = np.clip(ref_ratio, 0, 1) * 25

    # Vibration contribution (20% weight) - lower is better
    vib_ratio = base_vibration / max(vibration, 0.01)
    vib_score = np.clip(vib_ratio, 0, 1) * 20

    # Compressor contribution (15% weight) - lower current is better
    comp_ratio = base_compressor / max(compressor_current, 0.01)
    comp_score = np.clip(comp_ratio, 0, 1) * 15

    # Temperature accuracy (15% weight)
    temp_score = max(0, 15 - temp_deviation * 3)

    total = filter_score + ref_score + vib_score + comp_score + temp_score
    return np.clip(total + np.random.normal(0, 2), 0, 100)


def generate_unit_data(unit_id: str, timestamps: pd.DatetimeIndex, outdoor_temps: np.ndarray) -> pd.DataFrame:
    """Generate sensor data for a single AC unit."""
    profile = generate_unit_profile()
    n = len(timestamps)
    # Convert timedelta to fractional days
    td = timestamps - timestamps[0]
    days_elapsed = np.array([t.total_seconds() / 86400.0 for t in td])

    # --- Filter status: degrades over time ---
    filter_status = np.clip(
        100 - profile["filter_degradation_rate"] * days_elapsed + np.random.normal(0, 1, n),
        5, 100,
    )

    # --- Refrigerant pressure: slowly drops ---
    refrigerant_pressure = np.clip(
        profile["base_refrigerant_pressure"] - profile["refrigerant_leak_rate"] * days_elapsed + np.random.normal(0, 1.5, n),
        40, 150,
    )

    # --- Vibration: gradually increases ---
    vibration_level = np.clip(
        profile["base_vibration"] + profile["vibration_growth_rate"] * days_elapsed + np.random.normal(0, 0.05, n),
        0.05, 5.0,
    )

    # --- Compressor current: increases with wear ---
    compressor_current = np.clip(
        profile["base_compressor_current"] + profile["compressor_wear_rate"] * days_elapsed + np.random.normal(0, 0.3, n),
        4.0, 20.0,
    )

    # --- Simulate maintenance (partial reset) ---
    if profile["maintenance_day"] is not None:
        maint_idx = int(profile["maintenance_day"] * READINGS_PER_DAY)
        if maint_idx < n:
            # After maintenance: filter replaced, refrigerant topped up
            filter_status[maint_idx:] = np.clip(
                100 - profile["filter_degradation_rate"] * 0.3 * (days_elapsed[maint_idx:] - days_elapsed[maint_idx]),
                5, 100,
            )
            refrigerant_pressure[maint_idx:] = np.clip(
                profile["base_refrigerant_pressure"] - profile["refrigerant_leak_rate"] * 0.5 * (days_elapsed[maint_idx:] - days_elapsed[maint_idx]),
                40, 150,
            )
            vibration_level[maint_idx:] *= 0.6  # reduced after service

    # --- Simulate sudden failure ---
    if profile["sudden_failure_day"] is not None:
        fail_idx = int(profile["sudden_failure_day"] * READINGS_PER_DAY)
        if fail_idx < n:
            vibration_level[fail_idx:] *= 2.5
            compressor_current[fail_idx:] *= 1.4
            refrigerant_pressure[fail_idx:] *= 0.6

    # --- Airflow: depends on filter ---
    airflow_rate = np.clip(
        profile["base_airflow"] * (filter_status / 100) + np.random.normal(0, 0.3, n),
        1.0, 15.0,
    )

    # --- Indoor temperature: depends on health of system ---
    cooling_capacity = (filter_status / 100) * (refrigerant_pressure / profile["base_refrigerant_pressure"])
    indoor_temp = np.clip(
        profile["set_temp"] + (outdoor_temps - profile["set_temp"]) * (1 - cooling_capacity * 0.7) + np.random.normal(0, 0.5, n),
        16, 40,
    )

    # --- Power consumption: compressor + fan ---
    power_consumption = np.clip(
        (compressor_current * 0.22) + (airflow_rate * 0.05) + np.random.normal(0, 0.1, n),
        0.5, 6.0,
    )

    # --- Temperature deviation ---
    temp_deviation = np.abs(indoor_temp - profile["set_temp"])

    # --- Humidity: correlated with outdoor temp ---
    humidity = np.clip(
        40 + 0.8 * (outdoor_temps - 25) + np.random.normal(0, 5, n),
        20, 95,
    )

    # --- Runtime hours: cumulative ---
    # Assume AC runs ~16 hours/day on average
    runtime_base = np.random.uniform(500, 5000)
    runtime_hours = runtime_base + days_elapsed * 16

    # --- Health score (label) ---
    health_score = np.array([
        compute_health_score(
            filter_status[i],
            refrigerant_pressure[i],
            profile["base_refrigerant_pressure"],
            vibration_level[i],
            profile["base_vibration"],
            compressor_current[i],
            profile["base_compressor_current"],
            temp_deviation[i],
        )
        for i in range(n)
    ])

    return pd.DataFrame({
        "unit_id": unit_id,
        "timestamp": timestamps,
        "indoor_temp": np.round(indoor_temp, 2),
        "outdoor_temp": np.round(outdoor_temps, 2),
        "set_temp": profile["set_temp"],
        "humidity": np.round(humidity, 2),
        "airflow_rate": np.round(airflow_rate, 2),
        "vibration_level": np.round(vibration_level, 4),
        "refrigerant_pressure": np.round(refrigerant_pressure, 2),
        "compressor_current": np.round(compressor_current, 2),
        "power_consumption": np.round(power_consumption, 2),
        "filter_status": np.round(filter_status, 2),
        "runtime_hours": np.round(runtime_hours, 1),
        "health_score": np.round(health_score, 2),
    })


def main():
    print("=" * 60)
    print("  AC Health Score - Synthetic Data Generator")
    print("=" * 60)

    # Generate timestamps
    start_date = datetime(2025, 1, 1)
    end_date = start_date + timedelta(days=NUM_DAYS)
    timestamps = pd.date_range(start=start_date, end=end_date, freq="30min")[:-1]
    print(f"\n[DATE] Time range: {start_date.date()} to {end_date.date()}")
    print(f"[DATA] Readings per unit: {len(timestamps)}")

    # Generate outdoor temperatures (shared across units in same location)
    outdoor_temps = generate_outdoor_temp(timestamps)

    # Generate data for all units
    all_data = []
    for i in range(1, NUM_UNITS + 1):
        unit_id = f"AC-{i:03d}"
        # Slight outdoor temp variation per unit (different locations/floors)
        unit_outdoor = outdoor_temps + np.random.normal(0, 1, len(timestamps))
        unit_data = generate_unit_data(unit_id, timestamps, unit_outdoor)
        all_data.append(unit_data)
        if i % 10 == 0:
            print(f"  [OK] Generated data for {i}/{NUM_UNITS} units")

    # Combine and save
    df = pd.concat(all_data, ignore_index=True)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUTPUT_FILE, index=False)

    print(f"\n[FILE] Output: {OUTPUT_FILE}")
    print(f"[SIZE] Total rows: {len(df):,}")
    print(f"[SIZE] File size: {OUTPUT_FILE.stat().st_size / 1024 / 1024:.1f} MB")

    # Quick stats
    print(f"\n[STATS] Health Score Distribution:")
    print(f"   Mean:   {df['health_score'].mean():.1f}")
    print(f"   Median: {df['health_score'].median():.1f}")
    print(f"   Min:    {df['health_score'].min():.1f}")
    print(f"   Max:    {df['health_score'].max():.1f}")

    # Distribution by alert level
    critical = (df["health_score"] < 30).sum()
    warning = ((df["health_score"] >= 30) & (df["health_score"] < 60)).sum()
    good = ((df["health_score"] >= 60) & (df["health_score"] < 80)).sum()
    excellent = (df["health_score"] >= 80).sum()
    total = len(df)
    print(f"\n[ALERTS] Alert Level Distribution:")
    print(f"   CRITICAL (<30):  {critical:>6,} ({critical/total*100:.1f}%)")
    print(f"   WARNING (30-60): {warning:>6,} ({warning/total*100:.1f}%)")
    print(f"   GOOD (60-80):    {good:>6,} ({good/total*100:.1f}%)")
    print(f"   EXCELLENT (>80): {excellent:>6,} ({excellent/total*100:.1f}%)")
    print(f"\n{'=' * 60}")


if __name__ == "__main__":
    main()
