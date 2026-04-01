import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AirconUnit, units as defaultUnits } from "../data/units";
import { getUnitDiagnosis, AIHealthDiagnosis } from "../utils/aiHealthService";

interface UnitsContextType {
  units: AirconUnit[];
  isLoading: boolean;
  refreshUnits: () => Promise<void>;
  getDiagnostic: (unitId: number) => AIHealthDiagnosis | undefined;
}

const UnitsContext = createContext<UnitsContextType | undefined>(undefined);

export function UnitsProvider({ children }: { children: ReactNode }) {
  const [syncedUnits, setSyncedUnits] = useState<AirconUnit[]>(defaultUnits);
  const [diagnostics, setDiagnostics] = useState<Record<number, AIHealthDiagnosis>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchAiData = async () => {
    setIsLoading(true);
    try {
      const updatedUnits = [...defaultUnits];
      const newDiagnostics: Record<number, AIHealthDiagnosis> = {};

      await Promise.all(
        updatedUnits.map(async (unit) => {
          try {
            const data = await getUnitDiagnosis(unit);
            newDiagnostics[unit.id] = data;

            // Sync the shared fields
            unit.healthPercent = data.health_score;
            if (data.alert.level === "critical") {
              unit.statusColor = "red";
              unit.status = "Critical";
            } else if (data.alert.level === "warning") {
              unit.statusColor = "amber";
              unit.status = "Warning";
            } else if (data.alert.level === "good") {
              unit.statusColor = "emerald";
              unit.status = "Good";
            } else {
              unit.statusColor = "emerald";
              unit.status = "Excellent";
            }
          } catch (err) {
            console.error(`Failed to fetch AI data for unit ${unit.id}`, err);
          }
        })
      );

      setDiagnostics(newDiagnostics);
      setSyncedUnits(updatedUnits);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAiData();
  }, []);

  return (
    <UnitsContext.Provider
      value={{
        units: syncedUnits,
        isLoading,
        refreshUnits: fetchAiData,
        getDiagnostic: (id) => diagnostics[id],
      }}
    >
      {children}
    </UnitsContext.Provider>
  );
}

export function useUnits() {
  const context = useContext(UnitsContext);
  if (context === undefined) {
    throw new Error("useUnits must be used within a UnitsProvider");
  }
  return context;
}
