export interface AirconUnit {
  id: number;
  name: string;
  model: string;
  btu: string;
  temp: string;
  status: string;
  statusColor: "emerald" | "amber" | "red";
  healthPercent: number;
  evaporatorTemp: string;
  humidity: string;
  airflow: string;
  fanSpeed: string;
  filterHealth: number;

  // AI Sensor Telemetry
  indoorTemp: number;
  outdoorTemp: number;
  setTemp: number;
  humidityPercent: number;
  airflowRate: number;
  vibrationLevel: number;
  refrigerantPressure: number;
  compressorCurrent: number;
  powerConsumption: number;
  runtimeHours: number;
}

export const units: AirconUnit[] = [
  {
    id: 1,
    name: "Living Room",
    model: "Daikin Inverter",
    btu: "12000 BTU",
    temp: "22°C",
    status: "Optimal",
    statusColor: "emerald",
    healthPercent: 85,
    evaporatorTemp: "14.2°C",
    humidity: "45%",
    airflow: "820 CFM",
    fanSpeed: "Auto (Mid)",
    filterHealth: 78,

    // AI Sensor Telemetry (Good Unit)
    indoorTemp: 22.5,
    outdoorTemp: 32.0,
    setTemp: 22.0,
    humidityPercent: 45.0,
    airflowRate: 8.5,
    vibrationLevel: 0.1,
    refrigerantPressure: 110.0,
    compressorCurrent: 7.5,
    powerConsumption: 1.2,
    runtimeHours: 1200.0,
  },
  {
    id: 2,
    name: "Master Bedroom",
    model: "Mitsubishi",
    btu: "9000 BTU",
    temp: "24°C",
    status: "Needs Filter",
    statusColor: "amber",
    healthPercent: 68,
    evaporatorTemp: "16.8°C",
    humidity: "52%",
    airflow: "640 CFM",
    fanSpeed: "Auto (Low)",
    filterHealth: 55,

    // AI Sensor Telemetry (Degraded Unit)
    indoorTemp: 24.5,
    outdoorTemp: 33.0,
    setTemp: 22.0,
    humidityPercent: 52.0,
    airflowRate: 6.0,
    vibrationLevel: 0.4,
    refrigerantPressure: 95.0,
    compressorCurrent: 9.0,
    powerConsumption: 1.6,
    runtimeHours: 3500.0,
  },
    {
    id: 3,
    name: "Study Room",
    model: "Panasonic Inverter",
    btu: "9000 BTU",
    temp: "27°C",
    status: "Critical",
    statusColor: "red",
    healthPercent: 29,
    evaporatorTemp: "19.6°C",
    humidity: "68%",
    airflow: "410 CFM",
    fanSpeed: "High",
    filterHealth: 24,

    // AI Sensor Telemetry (Critical Unit)
    indoorTemp: 27.3,
    outdoorTemp: 33.8,
    setTemp: 22.0,
    humidityPercent: 68.0,
    airflowRate: 3.8,
    vibrationLevel: 1.0,
    refrigerantPressure: 74.0,
    compressorCurrent: 12.1,
    powerConsumption: 2.1,
    runtimeHours: 5400.0,
  },
];