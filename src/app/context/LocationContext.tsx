import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface LocationContextType {
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const STORAGE_KEY = "coldmax_user_location";
const DEFAULT_LOCATION = "12 Orchard Blvd, Tower B";

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedLocation, setSelectedLocationState] = useState<string>(() => {
    // Load from localStorage on init
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored || DEFAULT_LOCATION;
  });

  const setSelectedLocation = (location: string) => {
    setSelectedLocationState(location);
    localStorage.setItem(STORAGE_KEY, location);
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent("location-updated", { detail: location }));
  };

  // Sync to localStorage whenever location changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedLocation);
  }, [selectedLocation]);

  return (
    <LocationContext.Provider value={{ selectedLocation, setSelectedLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
