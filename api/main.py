"""
FastAPI Backend for AC Health Score System.
Endpoints for batch predictions, fleet summary, diagnostics, and model info.
"""

import json
import sys
from pathlib import Path
from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from api.models import (
    SensorReading,
    BatchPredictionRequest,
    BatchPredictionResponse,
    FleetSummaryResponse,
    ModelInfoResponse,
    HealthScoreResponse,
)
from ml.predict import HealthScorePredictor
from ml.diagnostics import generate_diagnosis, generate_batch_diagnosis

# Global predictor (loaded on startup)
predictor = None
model_metadata = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load ML model on startup."""
    global predictor, model_metadata

    artifacts_dir = PROJECT_ROOT / "ml" / "artifacts"
    model_path = artifacts_dir / "model.joblib"
    metadata_path = artifacts_dir / "model_metadata.json"

    if not model_path.exists():
        print("⚠️  Model not found! Run 'python ml/train_model.py' first.")
        print("   API will start but predictions will fail.")
    else:
        predictor = HealthScorePredictor(str(model_path))
        print("✅ Model loaded successfully!")

    if metadata_path.exists():
        with open(metadata_path) as f:
            model_metadata = json.load(f)

    yield

    print("👋 Shutting down AC Health Score API")


# --- App ---
app = FastAPI(
    title="ColdMax AC Health Score API",
    description="AI-powered health monitoring and diagnostics for air conditioning fleets",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Endpoints ---

@app.get("/health")
async def health_check():
    """API health check."""
    return {
        "status": "ok",
        "model_loaded": predictor is not None,
    }


@app.get("/model/info", response_model=ModelInfoResponse)
async def get_model_info():
    """Return model metadata and training metrics."""
    if model_metadata is None:
        raise HTTPException(status_code=503, detail="Model metadata not available. Train the model first.")
    return model_metadata


@app.post("/predict/batch", response_model=BatchPredictionResponse)
async def predict_batch(request: BatchPredictionRequest):
    """
    Predict health scores for a batch of AC sensor readings.
    Optionally includes AI-powered diagnostic insights.
    """
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Run 'python ml/train_model.py' first.")

    readings = [r.model_dump() for r in request.readings]
    predictions = predictor.predict(readings)

    # Add AI diagnostics if requested
    if request.include_diagnosis:
        predictions = await generate_batch_diagnosis(predictions, readings)

    scores = [p["health_score"] for p in predictions]
    avg_score = sum(scores) / len(scores) if scores else 0

    return {
        "predictions": predictions,
        "total_units": len(predictions),
        "average_score": round(avg_score, 2),
    }


@app.post("/diagnose", response_model=HealthScoreResponse)
async def diagnose_unit(reading: SensorReading):
    """
    Get a detailed GPT-powered diagnostic report for a single AC unit.
    Returns health score + AI-generated root cause analysis & recommendations.
    """
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Run 'python ml/train_model.py' first.")

    reading_dict = reading.model_dump()
    predictions = predictor.predict([reading_dict])
    pred = predictions[0]

    # Generate AI diagnosis
    diagnosis = await generate_diagnosis(
        reading=reading_dict,
        health_score=pred["health_score"],
        alert=pred["alert"],
    )
    pred["diagnosis"] = diagnosis

    return pred


@app.get("/predict/fleet-summary", response_model=FleetSummaryResponse)
async def get_fleet_summary():
    """
    Generate a health summary for the entire AC fleet.
    Uses the latest reading from each unit in the dataset.
    """
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Run 'python ml/train_model.py' first.")

    data_path = PROJECT_ROOT / "data" / "ac_sensor_data.csv"
    if not data_path.exists():
        raise HTTPException(status_code=404, detail="Sensor data not found. Run 'python data/generate_synthetic_data.py' first.")

    summary = predictor.predict_fleet_summary(str(data_path))
    return summary


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
