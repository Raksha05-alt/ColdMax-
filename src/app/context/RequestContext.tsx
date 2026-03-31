import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface ServiceRequest {
  id: string;
  customerId: string;
  customerName: string;
  location: string;
  issue: string;
  issueType: string;
  time: string;
  distance: string;
  payout: string;
  priority: "urgent" | "normal";
  status: "pending" | "accepted" | "in-progress" | "completed";
  technicianId?: string;
  technicianName?: string;
  technicianRating?: number;
  technicianJobsCount?: number;
  technicianETA?: string;
  createdAt: number;
}

interface RequestContextType {
  requests: ServiceRequest[];
  addRequest: (request: Omit<ServiceRequest, "id" | "createdAt">) => ServiceRequest;
  updateRequest: (id: string, updates: Partial<ServiceRequest>) => void;
  getRequestById: (id: string) => ServiceRequest | undefined;
  getPendingRequests: () => ServiceRequest[];
  getRequestsByTechnician: (techId: string) => ServiceRequest[];
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

const STORAGE_KEY = "coldmax_service_requests";

export function RequestProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<ServiceRequest[]>(() => {
    // Load from localStorage on init
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Sync to localStorage whenever requests change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("requests-updated", { detail: requests }));
  }, [requests]);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setRequests(JSON.parse(e.newValue));
        } catch (err) {
          console.error("Failed to parse requests from storage", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const addRequest = (request: Omit<ServiceRequest, "id" | "createdAt">) => {
    const newRequest: ServiceRequest = {
      ...request,
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };

    setRequests((prev) => [newRequest, ...prev]);
    return newRequest;
  };

  const updateRequest = (id: string, updates: Partial<ServiceRequest>) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, ...updates } : req))
    );
  };

  const getRequestById = (id: string) => {
    return requests.find((req) => req.id === id);
  };

  const getPendingRequests = () => {
    return requests.filter((req) => req.status === "pending");
  };

  const getRequestsByTechnician = (techId: string) => {
    return requests.filter((req) => req.technicianId === techId);
  };

  return (
    <RequestContext.Provider
      value={{
        requests,
        addRequest,
        updateRequest,
        getRequestById,
        getPendingRequests,
        getRequestsByTechnician,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
}

export function useRequests() {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error("useRequests must be used within a RequestProvider");
  }
  return context;
}
