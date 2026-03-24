"""Quick test script for the API endpoints."""
import urllib.request
import json

BASE = "http://localhost:8000"

# 1. Test /predict/batch
print("=" * 50)
print("TEST: POST /predict/batch")
print("=" * 50)

payload = {
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
        "runtime_hours": 5000,
    }],
    "include_diagnosis": True,
}

data = json.dumps(payload).encode()
req = urllib.request.Request(
    f"{BASE}/predict/batch",
    data=data,
    headers={"Content-Type": "application/json"},
)
resp = urllib.request.urlopen(req)
result = json.loads(resp.read())
print(json.dumps(result, indent=2))

# 2. Test /diagnose
print("\n" + "=" * 50)
print("TEST: POST /diagnose")
print("=" * 50)

diag_payload = {
    "unit_id": "AC-007",
    "indoor_temp": 30,
    "outdoor_temp": 35,
    "set_temp": 24,
    "humidity": 75,
    "airflow_rate": 4,
    "vibration_level": 1.5,
    "refrigerant_pressure": 70,
    "compressor_current": 14,
    "power_consumption": 3.0,
    "filter_status": 25,
    "runtime_hours": 6000,
}

data = json.dumps(diag_payload).encode()
req = urllib.request.Request(
    f"{BASE}/diagnose",
    data=data,
    headers={"Content-Type": "application/json"},
)
resp = urllib.request.urlopen(req)
result = json.loads(resp.read())
print(json.dumps(result, indent=2))

print("\n[ALL TESTS PASSED]")
