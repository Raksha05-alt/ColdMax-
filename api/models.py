"""
Pydantic schemas for the AC Health Score API.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


# ── Technician Matching Models ─────────────────────────────────────────────────

class TechnicianAssignRequest(BaseModel):
    """Request body for AI technician matching."""
    service_type: str = Field(..., description="servicing | chemical | overhaul | gas | repair", examples=["servicing"])
    urgency: str = Field(default="medium", description="low | medium | high | emergency")
    customer_lat: float = Field(..., description="Customer latitude", examples=[1.3521])
    customer_lon: float = Field(..., description="Customer longitude", examples=[103.8198])
    time_slot: str = Field(default="morning", description="morning | afternoon | evening")
    num_units: int = Field(default=1, ge=1, le=10)


class TechnicianProfile(BaseModel):
    id: str
    name: str
    skills: List[str]
    specialisation: str
    rating: float
    jobs_completed: int
    image: str
    phone: str
    years_experience: int


class TechnicianAssignResponse(BaseModel):
    technician: TechnicianProfile
    confidence: float = Field(..., description="Match confidence percentage")
    distance_km: float
    eta_minutes: int
    distance_label: str
    model_accuracy: float


class SensorReading(BaseModel):
    """A single sensor reading from an AC unit."""
    unit_id: str = Field(..., description="AC unit identifier", examples=["AC-001"])
    indoor_temp: float = Field(..., description="Indoor temperature in °C", examples=[28.0])
    outdoor_temp: float = Field(..., description="Outdoor temperature in °C", examples=[35.0])
    set_temp: float = Field(..., description="User-set target temperature in °C", examples=[24.0])
    humidity: float = Field(..., description="Relative humidity in %", examples=[70.0])
    airflow_rate: float = Field(..., description="Airflow rate in m³/min", examples=[8.0])
    vibration_level: float = Field(..., description="Vibration level in mm/s", examples=[0.3])
    refrigerant_pressure: float = Field(..., description="Refrigerant pressure in PSI", examples=[120.0])
    compressor_current: float = Field(..., description="Compressor current in Amps", examples=[8.0])
    power_consumption: float = Field(..., description="Power consumption in kW", examples=[1.8])
    filter_status: float = Field(..., description="Filter status 0-100%", examples=[85.0])
    runtime_hours: float = Field(..., description="Cumulative runtime hours", examples=[3200.0])


class AlertInfo(BaseModel):
    """Alert information for a health score."""
    level: str = Field(..., description="Alert level: critical, warning, good, excellent")
    emoji: str
    label: str
    action: str


class DiagnosisInfo(BaseModel):
    """AI-generated diagnostic insights."""
    root_cause_analysis: str
    recommendations: List[Dict[str, str]]
    estimated_savings: str
    predicted_failure_risk: str
    source: str = Field(..., description="'gpt' or 'rule-based'")


class HealthScoreResponse(BaseModel):
    """Response for a single unit's health score prediction."""
    unit_id: str
    health_score: float
    alert: AlertInfo
    sensor_summary: Dict[str, Any]
    diagnosis: Optional[DiagnosisInfo] = None


class BatchPredictionRequest(BaseModel):
    """Request body for batch predictions."""
    readings: List[SensorReading]
    include_diagnosis: bool = Field(
        default=True,
        description="Whether to include AI diagnostic insights (requires OpenAI API key)",
    )


class BatchPredictionResponse(BaseModel):
    """Response for batch predictions."""
    predictions: List[HealthScoreResponse]
    total_units: int
    average_score: float


class FleetSummaryResponse(BaseModel):
    """Fleet-wide health summary response."""
    total_units: int
    average_score: float
    min_score: float
    max_score: float
    critical_count: int
    warning_count: int
    good_count: int
    excellent_count: int
    units: List[Dict[str, Any]]


class ModelInfoResponse(BaseModel):
    """Model metadata response."""
    model_type: str
    feature_names: List[str]
    metrics: Dict[str, float]
    training_date: str
    train_samples: int
    test_samples: int
    best_params: Dict[str, Any]
