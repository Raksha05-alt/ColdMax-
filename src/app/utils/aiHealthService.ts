import { AirconUnit } from "../data/units";

const API_URL = "http://localhost:8000";

export interface AIHealthDiagnosis {
  health_score: number;
  alert: {
    level: string;
    emoji: string;
    label: string;
    action: string;
  };
  sensor_summary: any;
  diagnosis?: {
    root_cause_analysis: string;
    recommendations: { [key: string]: string }[] | { issue: string; resolution: string }[];
    estimated_savings: string;
    predicted_failure_risk: string;
    source: string;
  };
}

export async function getUnitDiagnosis(unit: AirconUnit): Promise<AIHealthDiagnosis> {
  const payload = {
    unit_id: `AC-00${unit.id}`,
    indoor_temp: unit.indoorTemp,
    outdoor_temp: unit.outdoorTemp,
    set_temp: unit.setTemp,
    humidity: unit.humidityPercent,
    airflow_rate: unit.airflowRate,
    vibration_level: unit.vibrationLevel,
    refrigerant_pressure: unit.refrigerantPressure,
    compressor_current: unit.compressorCurrent,
    power_consumption: unit.powerConsumption,
    filter_status: unit.filterHealth,
    runtime_hours: unit.runtimeHours,
  };

  try {
    const response = await fetch(`${API_URL}/diagnose`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("AI Backend unavailable, falling back to rule-based diagnosis", error);
    return getFallbackDiagnosis(payload);
  }
}

function getFallbackDiagnosis(reading: any): AIHealthDiagnosis {
  // Simple rule-based logic predicting the score
  const filterFactor = reading.filter_status / 100;
  const runtimeFactor = Math.max(0, 1 - reading.runtime_hours / 10000);
  
  let score = 90 * filterFactor * runtimeFactor;
  if (reading.refrigerant_pressure < 100) score -= 15;
  if (reading.vibration_level > 0.2) score -= 10;
  if (reading.compressor_current > 8.0) score -= 10;
  
  score = Math.max(0, Math.min(100, score));

  let alertLevel = "excellent";
  if (score < 40) alertLevel = "critical";
  else if (score < 60) alertLevel = "warning";
  else if (score < 80) alertLevel = "good";

  const rootCause = score >= 80 
    ? "System is operating normally. No immediate issues detected."
    : score >= 60
    ? "Minor efficiency degradation observed, likely due to filter restriction or normal wear."
    : "Multiple indicators suggest poor health. Review component strain (pressure, current, vibration).";

  const recs = [];
  if (reading.filter_status < 60) recs.push({ "Filter restriction": "Clean or replace air filter." });
  if (reading.vibration_level > 0.2) recs.push({ "Abnormal vibration": "Inspect motor mounts and fan balance." });
  if (reading.refrigerant_pressure < 100) recs.push({ "Low pressure": "Check for refrigerant leaks and recharge." });
  if (reading.compressor_current > 8.0) recs.push({ "High compressor current": "Test capacitor and ensure adequate airflow." });
  
  if (recs.length === 0) recs.push({ "Routine maintenance": "Continue regular maintenance schedule." });

  return {
    health_score: Math.round(score),
    alert: {
      level: alertLevel,
      emoji: "🤖",
      label: alertLevel.charAt(0).toUpperCase() + alertLevel.slice(1),
      action: score < 60 ? "Schedule Service" : "Monitor"
    },
    sensor_summary: {},
    diagnosis: {
      root_cause_analysis: rootCause,
      recommendations: recs as any,
      estimated_savings: "$0/mo",
      predicted_failure_risk: score < 40 ? "High" : score < 60 ? "Medium" : "Low",
      source: "rule-based",
    }
  };
}
