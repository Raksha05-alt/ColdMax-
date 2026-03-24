"""
OpenAI-Powered Diagnostic Insights Module.
Generates natural-language root cause analysis & maintenance recommendations.
Falls back to rule-based insights if OpenAI API is unavailable.
"""

import os
import json
from typing import Dict, List, Optional
from pathlib import Path

# Load .env if present
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")


def _get_openai_client():
    """Get OpenAI client if API key is available."""
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key or api_key.startswith("sk-your"):
        return None
    try:
        from openai import OpenAI
        return OpenAI(api_key=api_key)
    except Exception:
        return None


def _build_prompt(reading: Dict, health_score: float, alert: Dict) -> str:
    """Build a structured prompt for GPT analysis."""
    return f"""You are an expert HVAC diagnostic AI. Analyze the following air conditioner sensor data and provide a concise diagnostic report.

## AC Unit: {reading.get("unit_id", "Unknown")}

### Sensor Readings:
- Indoor Temperature: {reading.get("indoor_temp", "N/A")}°C (Set: {reading.get("set_temp", "N/A")}°C)
- Outdoor Temperature: {reading.get("outdoor_temp", "N/A")}°C
- Humidity: {reading.get("humidity", "N/A")}%
- Airflow Rate: {reading.get("airflow_rate", "N/A")} m³/min
- Vibration Level: {reading.get("vibration_level", "N/A")} mm/s
- Refrigerant Pressure: {reading.get("refrigerant_pressure", "N/A")} PSI (healthy: 115-135 PSI)
- Compressor Current: {reading.get("compressor_current", "N/A")} A (healthy: 6-9 A)
- Power Consumption: {reading.get("power_consumption", "N/A")} kW
- Filter Status: {reading.get("filter_status", "N/A")}% (100% = new)
- Runtime Hours: {reading.get("runtime_hours", "N/A")}

### Health Score: {health_score}/100 ({alert.get("label", "Unknown")} - {alert.get("emoji", "")})

Respond in this exact JSON format:
{{
    "root_cause_analysis": "2-3 sentences identifying the most likely issues based on the sensor values",
    "recommendations": [
        {{"priority": "high/medium/low", "action": "specific maintenance action", "reason": "why this is needed"}},
    ],
    "estimated_savings": "estimated energy cost savings if issues are addressed",
    "predicted_failure_risk": "low/medium/high - risk of component failure within 30 days"
}}

Be specific and reference actual sensor values in your analysis. Keep it concise."""


def _rule_based_insights(reading: Dict, health_score: float, alert: Dict) -> Dict:
    """Generate rule-based diagnostic insights as a fallback."""
    issues = []
    recommendations = []

    # Check filter
    filter_status = reading.get("filter_status", 100)
    if filter_status < 30:
        issues.append(f"filter is severely clogged ({filter_status:.0f}% remaining)")
        recommendations.append({
            "priority": "high",
            "action": "Replace air filter immediately",
            "reason": f"Filter at {filter_status:.0f}% capacity, significantly reducing airflow and efficiency",
        })
    elif filter_status < 60:
        issues.append(f"filter is degrading ({filter_status:.0f}% remaining)")
        recommendations.append({
            "priority": "medium",
            "action": "Schedule filter replacement within 1 week",
            "reason": f"Filter at {filter_status:.0f}% capacity",
        })

    # Check refrigerant
    ref_pressure = reading.get("refrigerant_pressure", 125)
    if ref_pressure < 80:
        issues.append(f"refrigerant pressure critically low ({ref_pressure:.0f} PSI)")
        recommendations.append({
            "priority": "high",
            "action": "Check for refrigerant leak and recharge system",
            "reason": f"Pressure at {ref_pressure:.0f} PSI (healthy range: 115-135 PSI)",
        })
    elif ref_pressure < 100:
        issues.append(f"refrigerant pressure below optimal ({ref_pressure:.0f} PSI)")
        recommendations.append({
            "priority": "medium",
            "action": "Schedule refrigerant level inspection",
            "reason": f"Pressure at {ref_pressure:.0f} PSI, may indicate slow leak",
        })

    # Check vibration
    vibration = reading.get("vibration_level", 0.2)
    if vibration > 1.0:
        issues.append(f"excessive vibration detected ({vibration:.2f} mm/s)")
        recommendations.append({
            "priority": "high",
            "action": "Inspect compressor and fan motor bearings",
            "reason": f"Vibration at {vibration:.2f} mm/s exceeds safe threshold",
        })
    elif vibration > 0.5:
        issues.append(f"elevated vibration ({vibration:.2f} mm/s)")
        recommendations.append({
            "priority": "medium",
            "action": "Monitor vibration trend; schedule inspection if increasing",
            "reason": f"Vibration at {vibration:.2f} mm/s is above normal baseline",
        })

    # Check compressor current
    comp_current = reading.get("compressor_current", 7)
    if comp_current > 14:
        issues.append(f"compressor drawing excessive current ({comp_current:.1f} A)")
        recommendations.append({
            "priority": "high",
            "action": "Inspect compressor for mechanical issues",
            "reason": f"Current at {comp_current:.1f} A (healthy: 6-9 A) indicates potential failure",
        })
    elif comp_current > 11:
        issues.append(f"compressor current elevated ({comp_current:.1f} A)")
        recommendations.append({
            "priority": "medium",
            "action": "Check compressor capacitor and clean condenser coils",
            "reason": f"Current at {comp_current:.1f} A, higher than optimal range",
        })

    # Check temperature deviation
    temp_dev = abs(reading.get("indoor_temp", 24) - reading.get("set_temp", 24))
    if temp_dev > 4:
        issues.append(f"significant temperature deviation ({temp_dev:.1f}°C from setpoint)")
        recommendations.append({
            "priority": "high",
            "action": "Investigate cooling capacity - check refrigerant, airflow, and compressor",
            "reason": f"Indoor temp is {temp_dev:.1f}°C above setpoint, indicating reduced cooling",
        })

    # Build analysis
    if not issues:
        root_cause = "All sensor readings are within normal operating parameters. The AC unit is performing well."
        failure_risk = "low"
        savings = "Unit is already operating efficiently. No significant savings available."
    else:
        root_cause = f"Analysis indicates the following concerns: {'; '.join(issues)}."
        failure_risk = "high" if health_score < 30 else "medium" if health_score < 60 else "low"
        savings = f"Addressing these issues could improve energy efficiency by approximately {min(40, int(100 - health_score))}%."

    if not recommendations:
        recommendations.append({
            "priority": "low",
            "action": "Continue regular maintenance schedule",
            "reason": "All systems operating normally",
        })

    return {
        "root_cause_analysis": root_cause,
        "recommendations": recommendations,
        "estimated_savings": savings,
        "predicted_failure_risk": failure_risk,
    }


async def generate_diagnosis(
    reading: Dict,
    health_score: float,
    alert: Dict,
) -> Dict:
    """
    Generate diagnostic insights using OpenAI GPT or rule-based fallback.

    Returns dict with: root_cause_analysis, recommendations, estimated_savings,
    predicted_failure_risk, and source (gpt/rule-based).
    """
    client = _get_openai_client()

    if client is not None:
        try:
            prompt = _build_prompt(reading, health_score, alert)

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert HVAC diagnostic AI. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                max_tokens=600,
                response_format={"type": "json_object"},
            )

            result = json.loads(response.choices[0].message.content)
            result["source"] = "gpt"
            return result

        except Exception as e:
            print(f"⚠️ OpenAI API error: {e}. Falling back to rule-based insights.")

    # Fallback to rule-based
    result = _rule_based_insights(reading, health_score, alert)
    result["source"] = "rule-based"
    return result


async def generate_batch_diagnosis(
    predictions: List[Dict],
    readings: List[Dict],
) -> List[Dict]:
    """Generate diagnostic insights for a batch of predictions."""
    results = []
    for pred, reading in zip(predictions, readings):
        diagnosis = await generate_diagnosis(
            reading=reading,
            health_score=pred["health_score"],
            alert=pred["alert"],
        )
        results.append({
            **pred,
            "diagnosis": diagnosis,
        })
    return results
