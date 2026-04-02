// Shared pricing functions for customer booking and emergency services
// These prices are used by both customer pages and technician dashboard

export const getServicingPrice = (units: number) => {
  const prices: Record<number, number> = { 
    1: 43.60, 
    2: 59.95, 
    3: 76.30, 
    4: 92.65, 
    5: 109.00, 
    6: 125.35 
  };
  return prices[units] || 43.60 + ((units - 1) * 16.35);
};

export const getEmergencyServicingPrice = (units: number) => {
  return getServicingPrice(units) + 10; // $10 surcharge for emergency
};

export const getChemicalWashPrice = (units: number) => {
  const prices: Record<number, number> = { 
    1: 92.65, 
    2: 174.40, 
    3: 245.25, 
    4: 305.20, 
    5: 381.50 
  };
  return prices[units] || 92.65 + ((units - 1) * 81.75);
};

export const getChemicalOverhaulPrice = (units: number) => {
  const prices: Record<number, number> = { 
    1: 163.50, 
    2: 305.20, 
    3: 425.10, 
    4: 523.20, 
    5: 654.00 
  };
  return prices[units] || 163.50 + ((units - 1) * 141.70);
};

export const getGasTopUpPrice = (units: number) => {
  const prices: Record<number, number> = { 
    1: 163.50, 
    2: 305.20, 
    3: 425.10, 
    4: 523.20, 
    5: 654.00 
  };
  return prices[units] || 163.50 + ((units - 1) * 141.70);
};

export const getRepairDiagnosisPrice = () => {
  return 60; // Fixed price
};

// Emergency issue prices (per unit)
export const emergencyIssuePrices: Record<string, number> = {
  "not_cold": 260,
  "weak_airflow": 180,
  "leaking": 100,
  "not_cooling_all": 480,
  "blinking": 300,
  "temp_inconsistent": 130,
  "cannot_turn_on": 150,
  "loud_noise": 120,    // Added
  "bad_smell": 100,     // Added
  "freezing": 160,      // Added
  "remote_problem": 80, // Added
};

// Calculate commission (20.18%)
export const calculateCommission = (amount: number) => {
  return amount * 0.2018;
};

// Calculate technician payout (after commission)
export const calculateTechPayout = (amount: number) => {
  return amount - calculateCommission(amount);
};

// Map service types to pricing functions
export const getServicePrice = (serviceType: string, units: number = 1, isEmergency: boolean = false): number => {
  const type = serviceType.toLowerCase();
  
  if (type.includes("aircon servicing") || type.includes("servicing") || type.includes("filter")) {
    return isEmergency ? getEmergencyServicingPrice(units) : getServicingPrice(units);
  }
  if (type.includes("chemical wash")) {
    return getChemicalWashPrice(units);
  }
  if (type.includes("chemical overhaul") || type.includes("overhaul")) {
    return getChemicalOverhaulPrice(units);
  }
  if (type.includes("gas") || type.includes("top-up")) {
    return getGasTopUpPrice(units);
  }
  if (type.includes("repair") || type.includes("diagnosis")) {
    return getRepairDiagnosisPrice();
  }
  if (type.includes("not cold") || type.includes("not cooling") || type.includes("weak cooling")) {
    return emergencyIssuePrices["not_cold"] * units;
  }
  if (type.includes("weak airflow") || type.includes("no airflow")) {
    return emergencyIssuePrices["weak_airflow"] * units;
  }
  if (type.includes("leaking") || type.includes("water")) {
    return emergencyIssuePrices["leaking"] * units;
  }
  if (type.includes("not cooling at all")) {
    return emergencyIssuePrices["not_cooling_all"] * units;
  }
  if (type.includes("blinking") || type.includes("not responding")) {
    return emergencyIssuePrices["blinking"] * units;
  }
  if (type.includes("temperature inconsistent") || type.includes("temp inconsistent")) {
    return emergencyIssuePrices["temp_inconsistent"] * units;
  }
  if (type.includes("cannot turn on") || type.includes("trips") || type.includes("not turning on")) {
    return emergencyIssuePrices["cannot_turn_on"] * units;
  }
  if (type.includes("noise") || type.includes("loud")) {
    return emergencyIssuePrices["loud_noise"] * units;
  }
  if (type.includes("smell") || type.includes("stink")) {
    return emergencyIssuePrices["bad_smell"] * units;
  }
  if (type.includes("freezing") || type.includes("ice") || type.includes("icing")) {
    return emergencyIssuePrices["freezing"] * units;
  }
  if (type.includes("remote")) {
    return emergencyIssuePrices["remote_problem"] * units;
  }
  if (type.includes("maintenance")) {
    return getServicingPrice(units);
  }
  
  // Default fallback
  return 80;
};
