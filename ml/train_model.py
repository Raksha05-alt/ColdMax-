"""
ML Model Training Pipeline for AC Health Score Prediction.
Trains a Random Forest Regressor with hyperparameter tuning.
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

import json
import joblib
import numpy as np
import matplotlib
matplotlib.use("Agg")  # non-interactive backend
import matplotlib.pyplot as plt
from pathlib import Path
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import GridSearchCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

sys.path.insert(0, str(Path(__file__).parent.parent))
from ml.preprocessing import load_data, prepare_splits, fit_scaler

# Paths
ARTIFACTS_DIR = Path(__file__).parent / "artifacts"


def train_model():
    """Train and evaluate the health score prediction model."""
    print("=" * 60)
    print("  AC Health Score - Model Training Pipeline")
    print("=" * 60)

    # 1. Load & split data
    print("\n[LOAD] Loading and preprocessing data...")
    df = load_data()
    X_train, X_test, y_train, y_test, feature_names = prepare_splits(df)

    # 2. Fit scaler
    scaler = fit_scaler(X_train)
    X_train_scaled = scaler.transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 3. Hyperparameter tuning (compact grid for speed)
    print("\n[TRAIN] Training Random Forest with GridSearchCV...")
    param_grid = {
        "n_estimators": [150],
        "max_depth": [20, None],
        "min_samples_split": [5],
        "min_samples_leaf": [3],
    }

    rf = RandomForestRegressor(random_state=42, n_jobs=-1)
    grid_search = GridSearchCV(
        rf,
        param_grid,
        cv=3,
        scoring="neg_mean_absolute_error",
        n_jobs=-1,
        verbose=1,
    )
    grid_search.fit(X_train_scaled, y_train)

    best_model = grid_search.best_estimator_
    print(f"\n[OK] Best parameters: {grid_search.best_params_}")

    # 4. Evaluate on test set
    print("\n[EVAL] Evaluating on test set...")
    y_pred = best_model.predict(X_test_scaled)

    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    print(f"   MAE:  {mae:.4f}")
    print(f"   RMSE: {rmse:.4f}")
    print(f"   R2:   {r2:.4f}")

    # 5. Save artifacts
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

    model_path = ARTIFACTS_DIR / "model.joblib"
    scaler_path = ARTIFACTS_DIR / "scaler.joblib"
    metadata_path = ARTIFACTS_DIR / "model_metadata.json"

    joblib.dump(best_model, model_path)
    joblib.dump(scaler, scaler_path)

    metadata = {
        "model_type": "RandomForestRegressor",
        "best_params": {k: v for k, v in grid_search.best_params_.items()},
        "feature_names": feature_names,
        "metrics": {
            "mae": round(mae, 4),
            "rmse": round(rmse, 4),
            "r2": round(r2, 4),
        },
        "training_date": datetime.now().isoformat(),
        "train_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
    }
    # Ensure best_params values are JSON-serializable (convert numpy types)
    for k, v in metadata["best_params"].items():
        if isinstance(v, (np.integer,)):
            metadata["best_params"][k] = int(v)
        elif isinstance(v, (np.floating,)):
            metadata["best_params"][k] = float(v)

    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\n[SAVE] Model saved to:    {model_path}")
    print(f"[SAVE] Scaler saved to:   {scaler_path}")
    print(f"[SAVE] Metadata saved to: {metadata_path}")

    # 6. Feature importance plot
    importances = best_model.feature_importances_
    indices = np.argsort(importances)[::-1]

    plt.figure(figsize=(12, 6))
    plt.title("Feature Importance - AC Health Score Model", fontsize=14, fontweight="bold")
    plt.bar(range(len(feature_names)), importances[indices], color="#2196F3", edgecolor="#1565C0")
    plt.xticks(range(len(feature_names)), [feature_names[i] for i in indices], rotation=45, ha="right")
    plt.ylabel("Importance")
    plt.tight_layout()

    plot_path = ARTIFACTS_DIR / "feature_importance.png"
    plt.savefig(plot_path, dpi=150)
    print(f"[PLOT] Feature importance plot: {plot_path}")

    # Print feature ranking
    print(f"\n[RANK] Feature Ranking:")
    for rank, idx in enumerate(indices, 1):
        print(f"   {rank:>2}. {feature_names[idx]:<30s} {importances[idx]:.4f}")

    print(f"\n{'=' * 60}")
    return best_model, scaler, metadata


if __name__ == "__main__":
    train_model()
