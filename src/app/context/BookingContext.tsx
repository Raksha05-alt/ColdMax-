import { createContext, useContext, useState, ReactNode } from "react";

export type BookingStatus =
  | "confirmed"
  | "assigned"
  | "en-route"
  | "arriving"
  | "arrived"
  | "in-progress"
  | "completed";

export interface MatchedTechnician {
  id: string;
  name: string;
  skills: string[];
  specialisation: string;
  rating: number;
  jobs_completed: number;
  image: string;
  phone: string;
  years_experience: number;
}

export interface BookingDetails {
  date: string;
  dateFormatted: string;
  time: string;
  technician: string;
  service: string;
  unit: string;
  status: BookingStatus;
  scheduledDateTime?: Date;
  totalCost?: number;
  isPremiumFree?: boolean;
  // AI matching fields
  matchedTechnician?: MatchedTechnician;
  etaMinutes?: number;
  distanceLabel?: string;
  matchConfidence?: number;
}

interface BookingContextType {
  currentBooking: BookingDetails | null;
  setCurrentBooking: (booking: BookingDetails | null) => void;
  updateBookingStatus: (status: BookingStatus) => void;
  isBookingToday: () => boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [currentBooking, setCurrentBooking] = useState<BookingDetails | null>(null);

  const updateBookingStatus = (status: BookingStatus) => {
    setCurrentBooking((prev) => (prev ? { ...prev, status } : null));
  };

  const isBookingToday = () => {
    if (!currentBooking?.scheduledDateTime) return false;
    const today = new Date();
    const bookingDate = new Date(currentBooking.scheduledDateTime);
    return (
      today.getFullYear() === bookingDate.getFullYear() &&
      today.getMonth() === bookingDate.getMonth() &&
      today.getDate() === bookingDate.getDate()
    );
  };

  return (
    <BookingContext.Provider value={{ currentBooking, setCurrentBooking, updateBookingStatus, isBookingToday }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
