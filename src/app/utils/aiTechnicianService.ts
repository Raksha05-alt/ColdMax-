import { BookingDetails, MatchedTechnician } from "../context/BookingContext";

const API_URL = "http://localhost:8000";

interface TechnicianAssignRequest {
  service_type: string;
  urgency: string;
  customer_lat: number;
  customer_lon: number;
  time_slot: string;
  num_units: number;
}

interface TechnicianAssignResponse {
  technician: MatchedTechnician;
  confidence: number;
  distance_km: number;
  eta_minutes: number;
  distance_label: string;
  model_accuracy: number;
}

// Fallback logic if the FastAPI goes down.
const FALLBACK_TECHNICIANS: MatchedTechnician[] = [
  {
    id: "TECH-001",
    name: "David Tan",
    skills: ["General Servicing", "Chemical Wash"],
    specialisation: "Residential Cooling",
    rating: 4.8,
    jobs_completed: 342,
    image: "https://i.pravatar.cc/150?u=david",
    phone: "+65 9123 4567",
    years_experience: 5
  },
  {
    id: "TECH-002",
    name: "Sarah Lee",
    skills: ["Repairs", "Chemical Overhaul", "Gas Top-Up"],
    specialisation: "Complex Diagnostics",
    rating: 4.9,
    jobs_completed: 410,
    image: "https://i.pravatar.cc/150?u=sarah",
    phone: "+65 9234 5678",
    years_experience: 7
  }
];

export async function assignTechnician(
  serviceType: string,
  timeSlot: string,
  numUnits: number
): Promise<TechnicianAssignResponse> {
  // Map our frontend serviceType reasoning string to backend API expectations if necessary
  let backendServiceType = serviceType;
  if (!backendServiceType) backendServiceType = "servicing";

  // Simulate customer location (e.g. somewhere in central Singapore)
  const customerLat = 1.3521;
  const customerLon = 103.8198;

  const payload: TechnicianAssignRequest = {
    service_type: backendServiceType,
    urgency: "medium", // We can enhance this later
    customer_lat: customerLat,
    customer_lon: customerLon,
    time_slot: timeSlot,
    num_units: numUnits
  };

  try {
    const response = await fetch(`${API_URL}/assign_technician`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: TechnicianAssignResponse = await response.json();
    return data;
  } catch (error) {
    console.warn("FastAPI ML backend unavailable. Using rule-based fallback.", error);
    
    // Choose appropriate fallback technician based on service type
    const isComplex = ["overhaul", "repair", "gas"].includes(backendServiceType);
    const tech = isComplex ? FALLBACK_TECHNICIANS[1] : FALLBACK_TECHNICIANS[0];

    return {
      technician: tech,
      confidence: 85.0,
      distance_km: 5.2,
      eta_minutes: 25,
      distance_label: "5.2 km away",
      model_accuracy: 90.0
    };
  }
}
