import requests

def test_values(unit_name, payload):
    try:
        res = requests.post("http://localhost:8000/diagnose", json=payload)
        score = res.json().get('health_score')
        print(f"{unit_name}: {score}%")
    except Exception as e:
        print(f"Error: {e}")

master = {"unit_id": "AC-002", "indoor_temp": 24.5, "outdoor_temp": 33.0, "set_temp": 22.0, "humidity": 52.0, "airflow_rate": 6.0, "vibration_level": 0.4, "refrigerant_pressure": 95.0, "compressor_current": 9.0, "power_consumption": 1.6, "filter_status": 55.0, "runtime_hours": 3500.0}
study = {"unit_id": "AC-003", "indoor_temp": 27.3, "outdoor_temp": 33.8, "set_temp": 22.0, "humidity": 68.0, "airflow_rate": 3.8, "vibration_level": 1.0, "refrigerant_pressure": 74.0, "compressor_current": 12.1, "power_consumption": 2.1, "filter_status": 24.0, "runtime_hours": 5400.0}

print("Current:")
test_values("Master", master)
test_values("Study", study)

# Trying to fix Master to ~68%
master_fix = master.copy()
master_fix.update({
    "indoor_temp": 23.5,
    "vibration_level": 0.2, 
    "refrigerant_pressure": 105.0,
    "compressor_current": 8.0,
    "filter_status": 70.0,
})

# Trying to fix Study to ~25% (critical but not 0)
study_fix = study.copy()
study_fix.update({
    "indoor_temp": 24.5,
    "set_temp": 23.0,
    "airflow_rate": 5.0,
    "vibration_level": 0.5,
    "refrigerant_pressure": 85.0,
    "compressor_current": 9.5,
    "filter_status": 40.0,
})

print("\nFixed:")
test_values("Master Fix", master_fix)
test_values("Study Fix", study_fix)
