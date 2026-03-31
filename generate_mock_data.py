import csv
import random
from datetime import datetime, timedelta

def generate_mock_ac_data(filename="ac_sensor_data_mock.csv", num_records=2000):
    """
    Generates mock IoT sensor data for an Air Conditioner over time.
    Simulates a gradual degradation in performance to train a predictive model.
    """
    headers = [
        "timestamp", "device_id", "indoor_temp_c", "outdoor_temp_c",
        "target_temp_c", "indoor_humidity_percent", "compressor_power_watts",
        "refrigerant_pressure_psi", "airflow_cfm", "health_score", "status_label"
    ]
    
    device_id = "AC_UNIT_001"
    start_time = datetime.now() - timedelta(days=60) # Start 60 days ago
    
    data = []
    
    # Track evolving state for gradual degradation
    current_health = 100.0
    degradation_factor = 0.0 # Starts completely normal
    
    for i in range(num_records):
        # Data logged every hour
        current_time = start_time + timedelta(hours=i)
        
        # Simulate day/night temperature cycles
        hour = current_time.hour
        is_day = 8 <= hour <= 19
        outdoor_temp = random.uniform(28.0, 34.0) if is_day else random.uniform(24.0, 27.0)
        
        target_temp = random.choice([22, 23, 24]) # User target setting
        
        # Introduce gradual degradation halfway through the dataset (e.g., filter clogging, slight leak)
        if i > num_records * 0.4:
             degradation_factor += random.uniform(0, 0.08)
             current_health = max(0.0, 100.0 - (degradation_factor * 1.5))
             
        # Determine strict labels based on actual health score
        status_label = "Normal"
        if current_health < 50:
            status_label = "Critical Maintenance Required"
        elif current_health < 75:
            status_label = "Warning - Efficiency Dropped"
            
        # --- Simulate Sensor Readings Affected by Degradation ---
        
        # When AC is failing, it struggles to cool, so indoor temp stays slightly higher than target
        indoor_temp_offset = random.uniform(-0.5, 0.5) + (degradation_factor * 0.1)
        indoor_temp = target_temp + max(0, indoor_temp_offset)
        
        # Humidity rises slightly as cooling efficiency drops
        indoor_humidity = random.uniform(40.0, 55.0) + (degradation_factor * 0.4)
        
        # Power increases as the compressor struggles harder to reach target temp
        base_power = random.uniform(1000.0, 1400.0) if is_day else random.uniform(800.0, 1100.0)
        compressor_power = base_power + (degradation_factor * 25.0)
        
        # Pressure drops if refrigerant is slowly leaking
        refrigerant_pressure = random.uniform(65.0, 75.0) - (degradation_factor * 0.6)
        
        # Airflow drops if the air filter is getting clogged with dust
        airflow = random.uniform(350.0, 420.0) - (degradation_factor * 2.0)
        
        data.append([
            current_time.strftime("%Y-%m-%d %H:%M:%S"),
            device_id,
            round(indoor_temp, 2),
            round(outdoor_temp, 2),
            target_temp,
            round(indoor_humidity, 2),
            round(compressor_power, 2),
            round(max(0, refrigerant_pressure), 2),
            round(max(0, airflow), 2),
            round(current_health, 2),
            status_label
        ])
        
    with open(filename, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(headers)
        writer.writerows(data)
        
    print(f"Successfully generated {num_records} records in '{filename}'")
    print("Snapshot of status progression:")
    print(f"Start (Record 1): Health = {data[0][9]}, Status = {data[0][10]}")
    print(f"End (Record {num_records}): Health = {data[-1][9]}, Status = {data[-1][10]}")

if __name__ == "__main__":
    generate_mock_ac_data()
