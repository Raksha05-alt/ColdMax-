import pandas as pd
import numpy as np
from pathlib import Path

def generate():
    np.random.seed(42)
    n = 2000
    df = pd.DataFrame({
        "timestamp": pd.date_range("2023-01-01", periods=n, freq="H"),
        "unit_id": np.random.choice(["AC_1", "AC_2", "AC_3"], n),
        "indoor_temp": np.random.normal(24, 2, n),
        "outdoor_temp": np.random.normal(30, 3, n),
        "set_temp": np.random.choice([22, 23, 24, 25], n),
        "humidity": np.random.normal(50, 10, n),
        "airflow_rate": np.random.normal(400, 50, n),
        "vibration_level": np.random.normal(5, 2, n),
        "refrigerant_pressure": np.random.normal(120, 10, n),
        "compressor_current": np.random.normal(8, 1, n),
        "power_consumption": np.random.normal(1200, 200, n),
        "filter_status": np.random.uniform(0, 100, n),
        "runtime_hours": np.random.randint(100, 5000, n),
    })
    
    # Simple target variable logic for training the Random Forest Model
    df["health_score"] = 100 - (
        df["vibration_level"] * 2 + 
        (100 - df["filter_status"]) * 0.2 + 
        np.abs(df["refrigerant_pressure"] - 120) * 0.5
    )
    df["health_score"] = np.clip(df["health_score"], 0, 100)
    
    out = Path("data")
    out.mkdir(exist_ok=True)
    df.to_csv(out / "ac_sensor_data.csv", index=False)
    print("Generated valid mock training data for health model at data/ac_sensor_data.csv")

if __name__ == "__main__":
    generate()
