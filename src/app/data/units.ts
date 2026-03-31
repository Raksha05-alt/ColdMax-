export interface AirconUnit {
  id: number;
  name: string;
  model: string;
  btu: string;
  temp: string;
  status: string;
  statusColor: "emerald" | "amber";
  healthPercent: number;
  evaporatorTemp: string;
  humidity: string;
  airflow: string;
  fanSpeed: string;
  filterHealth: number;
  freeClaimsUsed: number;
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
    filterHealth: 12,
    freeClaimsUsed: 0,
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
    filterHealth: 35,
    freeClaimsUsed: 1,
  },
  {
    id: 3,
    name: "Kids Room",
    model: "Panasonic",
    btu: "9000 BTU",
    temp: "23°C",
    status: "Optimal",
    statusColor: "emerald",
    healthPercent: 92,
    evaporatorTemp: "15.0°C",
    humidity: "40%",
    airflow: "700 CFM",
    fanSpeed: "Auto (Mid)",
    filterHealth: 8,
    freeClaimsUsed: 2, // Maxed out cap
  },
];
