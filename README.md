# ColdMax — AI-Powered AC Health Score System

An ML pipeline + REST API that monitors air conditioner fleet health using IoT sensor data, predicts health scores with a Random Forest model, and generates diagnostic insights powered by OpenAI GPT.

## Architecture

```
ColdMax-/
├── data/
│   └── generate_synthetic_data.py   # Synthetic IoT data generator (50 units × 90 days)
├── ml/
│   ├── preprocessing.py             # Feature engineering & data splitting
│   ├── train_model.py               # Model training with GridSearchCV
│   ├── predict.py                   # Health score prediction & fleet summary
│   ├── diagnostics.py               # OpenAI GPT diagnostic insights
│   └── artifacts/                   # Saved model, scaler, metadata (auto-generated)
├── api/
│   ├── main.py                      # FastAPI endpoints
│   └── models.py                    # Pydantic schemas
├── requirements.txt
├── .env.example                     # API key template
└── README.md
```

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Generate Synthetic Data

```bash
python data/generate_synthetic_data.py
```

This creates `data/ac_sensor_data.csv` with ~216K rows of realistic sensor data.

### 3. Train the Model

```bash
python ml/train_model.py
```

Trains a Random Forest Regressor and saves artifacts to `ml/artifacts/`.

### 4. Configure OpenAI (Optional)

Copy `.env.example` to `.env` and add your API key:

```bash
cp .env.example .env
# Edit .env and replace sk-your-api-key-here with your actual key
```

Without an API key, the system falls back to rule-based diagnostic insights.

### 5. Start the API

```bash
uvicorn api.main:app --reload
```

API docs available at: **http://localhost:8000/docs**

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | API health check |
| `POST` | `/predict/batch` | Batch health score predictions with AI diagnostics |
| `POST` | `/diagnose` | Detailed GPT-powered diagnostic for a single unit |
| `GET` | `/predict/fleet-summary` | Fleet-wide health summary |
| `GET` | `/model/info` | Model metadata and training metrics |

### Example: Predict Health Score

```bash
curl -X POST http://localhost:8000/predict/batch \
  -H "Content-Type: application/json" \
  -d '{
    "readings": [{
      "unit_id": "AC-001",
      "indoor_temp": 28,
      "outdoor_temp": 35,
      "set_temp": 24,
      "humidity": 70,
      "airflow_rate": 5,
      "vibration_level": 1.2,
      "refrigerant_pressure": 80,
      "compressor_current": 12,
      "power_consumption": 2.5,
      "filter_status": 40,
      "runtime_hours": 5000
    }],
    "include_diagnosis": true
  }'
```

## Alert Levels

| Score | Level | Action |
|-------|-------|--------|
| 80–100 | ✅ Excellent | No action needed |
| 60–80 | 🟢 Good | Monitor trends |
| 30–60 | 🟡 Warning | Preventive maintenance recommended |
| 0–30 | 🔴 Critical | Schedule immediate maintenance |