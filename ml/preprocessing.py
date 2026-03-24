"""
Data Preprocessing & Feature Engineering for AC Health Score Model.
Loads raw sensor data, engineers features, and prepares train/test splits.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GroupShuffleSplit
from pathlib import Path
from typing import Tuple

# Features used by the model (order matters for prediction)
RAW_FEATURES = [
    "indoor_temp",
    "outdoor_temp",
    "set_temp",
    "humidity",
    "airflow_rate",
    "vibration_level",
    "refrigerant_pressure",
    "compressor_current",
    "power_consumption",
    "filter_status",
    "runtime_hours",
]

ENGINEERED_FEATURES = [
    "temp_deviation",
    "cooling_efficiency",
    "pressure_ratio",
    "vibration_airflow_ratio",
    "power_per_degree",
]

ALL_FEATURES = RAW_FEATURES + ENGINEERED_FEATURES
TARGET = "health_score"


def load_data(data_path: str | Path = None) -> pd.DataFrame:
    """Load raw sensor data from CSV."""
    if data_path is None:
        data_path = Path(__file__).parent.parent / "data" / "ac_sensor_data.csv"
    df = pd.read_csv(data_path, parse_dates=["timestamp"])
    print(f"📂 Loaded {len(df):,} rows from {data_path}")
    return df


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create derived features from raw sensor data."""
    df = df.copy()

    # Temperature deviation from setpoint
    df["temp_deviation"] = np.abs(df["indoor_temp"] - df["set_temp"])

    # Cooling efficiency: how well the AC cools per unit of power
    df["cooling_efficiency"] = np.where(
        df["power_consumption"] > 0,
        (df["outdoor_temp"] - df["indoor_temp"]) / df["power_consumption"],
        0,
    )

    # Refrigerant pressure ratio (vs typical healthy range of ~125 PSI)
    df["pressure_ratio"] = df["refrigerant_pressure"] / 125.0

    # Vibration-to-airflow ratio (high vibration + low airflow = bad)
    df["vibration_airflow_ratio"] = np.where(
        df["airflow_rate"] > 0,
        df["vibration_level"] / df["airflow_rate"],
        df["vibration_level"],
    )

    # Power per degree of cooling
    temp_diff = df["outdoor_temp"] - df["indoor_temp"]
    df["power_per_degree"] = np.where(
        temp_diff > 0,
        df["power_consumption"] / temp_diff,
        df["power_consumption"],
    )

    # Clean up infinities and NaN
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.fillna(0, inplace=True)

    return df


def prepare_splits(
    df: pd.DataFrame,
    test_size: float = 0.2,
    random_state: int = 42,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, list]:
    """
    Split data into train/test sets grouped by unit_id to prevent data leakage.
    Returns: X_train, X_test, y_train, y_test, feature_names
    """
    df = engineer_features(df)

    X = df[ALL_FEATURES]
    y = df[TARGET]
    groups = df["unit_id"]

    # Group split: entire units go into train or test, not individual readings
    gss = GroupShuffleSplit(n_splits=1, test_size=test_size, random_state=random_state)
    train_idx, test_idx = next(gss.split(X, y, groups))

    X_train = X.iloc[train_idx]
    X_test = X.iloc[test_idx]
    y_train = y.iloc[train_idx]
    y_test = y.iloc[test_idx]

    train_units = groups.iloc[train_idx].nunique()
    test_units = groups.iloc[test_idx].nunique()

    print(f"📊 Train: {len(X_train):,} rows ({train_units} units)")
    print(f"📊 Test:  {len(X_test):,} rows ({test_units} units)")

    return X_train, X_test, y_train, y_test, ALL_FEATURES


def fit_scaler(X_train: pd.DataFrame) -> StandardScaler:
    """Fit a StandardScaler on training data."""
    scaler = StandardScaler()
    scaler.fit(X_train)
    return scaler


def preprocess_input(df: pd.DataFrame, scaler: StandardScaler) -> np.ndarray:
    """Preprocess a raw DataFrame for prediction (engineer features + scale)."""
    df = engineer_features(df)
    X = df[ALL_FEATURES].values
    return scaler.transform(X)
