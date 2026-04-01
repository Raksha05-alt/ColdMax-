"""
Train the AI Technician Matching model (Random Forest Classifier).
Run: python ml/train_technician_model.py
Output: ml/artifacts/technician_model.joblib + technician_label_encoder.joblib
"""

import json
import sys
import subprocess
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score

PROJECT_ROOT = Path(__file__).parent.parent
DATA_PATH = PROJECT_ROOT / "ml" / "data" / "technician_assignments.csv"
ARTIFACTS_DIR = PROJECT_ROOT / "ml" / "artifacts"


def encode_features(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    """One-hot encode categoricals and return the feature matrix."""
    service_dummies = pd.get_dummies(df["service_type"], prefix="svc")
    urgency_dummies = pd.get_dummies(df["urgency"], prefix="urg")
    slot_dummies = pd.get_dummies(df["time_slot"], prefix="slot")

    features = pd.concat([
        df[["customer_lat", "customer_lon", "num_units"]],
        service_dummies,
        urgency_dummies,
        slot_dummies,
    ], axis=1)

    # Store column list so predict-time can reindex correctly
    feature_cols = list(features.columns)
    return features, feature_cols


def train():
    # ── 1. Generate data if not available ──────────────────────────────────
    if not DATA_PATH.exists():
        print("⚙️  Training data not found. Generating...")
        subprocess.run([sys.executable, str(PROJECT_ROOT / "ml" / "generate_technician_data.py")], check=True)

    df = pd.read_csv(DATA_PATH)
    print(f"📊 Loaded {len(df)} training samples.")

    # ── 2. Feature engineering ─────────────────────────────────────────────
    X, feature_cols = encode_features(df)
    y_raw = df["assigned_technician_id"]

    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(y_raw)

    # ── 3. Train/test split ────────────────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # ── 4. Fit model ───────────────────────────────────────────────────────
    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        min_samples_leaf=3,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    clf.fit(X_train, y_train)

    # ── 5. Evaluate ────────────────────────────────────────────────────────
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    cv_scores = cross_val_score(clf, X, y, cv=5, scoring="accuracy")
    print(f"\n✅ Test Accuracy : {acc:.2%}")
    print(f"   CV Accuracy   : {cv_scores.mean():.2%} ± {cv_scores.std():.2%}")
    print("\n" + classification_report(y_test, y_pred, target_names=label_encoder.classes_))

    # ── 6. Save artefacts ──────────────────────────────────────────────────
    ARTIFACTS_DIR.mkdir(exist_ok=True)

    model_path   = ARTIFACTS_DIR / "technician_model.joblib"
    encoder_path = ARTIFACTS_DIR / "technician_label_encoder.joblib"
    meta_path    = ARTIFACTS_DIR / "technician_model_metadata.json"

    joblib.dump(clf, model_path)
    joblib.dump(label_encoder, encoder_path)

    metadata = {
        "model_type": "RandomForestClassifier",
        "feature_columns": feature_cols,
        "classes": list(label_encoder.classes_),
        "accuracy": round(acc, 4),
        "cv_accuracy_mean": round(float(cv_scores.mean()), 4),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
    }
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\n💾 Model saved → {model_path}")
    print(f"💾 Encoder saved → {encoder_path}")
    print(f"💾 Metadata saved → {meta_path}")


if __name__ == "__main__":
    train()
