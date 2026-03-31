import { createContext, useContext, useState, ReactNode } from "react";

export type SubscriptionTier = "none" | "standard" | "premium";

interface SubscriptionContextType {
  tier: SubscriptionTier;
  setTier: (tier: SubscriptionTier) => void;
  isPremium: boolean;
  isStandard: boolean;
  isSubscribed: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<SubscriptionTier>(() => {
    const stored = localStorage.getItem("coldmax_subscription");
    return (stored as SubscriptionTier) || "premium"; // Default to premium for demo
  });

  const handleSetTier = (newTier: SubscriptionTier) => {
    setTier(newTier);
    localStorage.setItem("coldmax_subscription", newTier);
  };

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        setTier: handleSetTier,
        isPremium: tier === "premium",
        isStandard: tier === "standard",
        isSubscribed: tier !== "none",
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
