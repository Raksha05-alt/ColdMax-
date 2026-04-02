import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Calendar, Clock, Lightbulb, Bell, TrendingUp, Droplets, Wind,
  Zap, AlertTriangle, DollarSign, MessageSquare, MinusCircle, PlusCircle,
  CreditCard, Smartphone, Banknote, FileText, Check, Crown, MapPin,
} from "lucide-react";
import { useNavigate } from "react-router";
import { clsx } from "clsx";
import { DayPicker } from "react-day-picker";
import { format, addYears, addDays } from "date-fns";
import { useBooking } from "../../context/BookingContext";
import { useSubscription } from "../../context/SubscriptionContext";
import { useUnits } from "../../context/UnitsContext";
import { assignTechnician } from "../../utils/aiTechnicianService";
import { 
  getServicingPrice, 
  getChemicalWashPrice, 
  getChemicalOverhaulPrice, 
  getGasTopUpPrice, 
  getRepairDiagnosisPrice 
} from "../../utils/pricing";

export default function Booking() {
  const navigate = useNavigate();
  const { setCurrentBooking } = useBooking();
  const { isPremium } = useSubscription();
  const { units } = useUnits();
  
  const [activeTab, setActiveTab] = useState<"schedule" | "tips" | "reminders">("schedule");
  const tomorrow = addDays(new Date(), 1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(tomorrow);
  const [selectedTime, setSelectedTime] = useState("morning");
  const [numberOfUnits, setNumberOfUnits] = useState(1);
  const [selectedReason, setSelectedReason] = useState("");
  const [comments, setComments] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isAssigningTech, setIsAssigningTech] = useState(false);

  // New states for aircon servicing unit selection
  const [selectedUnits, setSelectedUnits] = useState<number[]>([]);  // IDs of selected units
  const [isOtherUnit, setIsOtherUnit] = useState(false);  // "Chosen air con does not fall within subscription range"

  type UnitFreeServiceRecord = {
    excellentClaimCount: number;
    blockedUntil?: string; // ISO string
  };

  // mock per-unit premium servicing usage
  // replace with DB / context data later
  const [unitFreeServiceRecords, setUnitFreeServiceRecords] = useState<Record<number, UnitFreeServiceRecord>>({
    1: { excellentClaimCount: 0 },
    2: { excellentClaimCount: 1 },
    3: { excellentClaimCount: 2, blockedUntil: addYears(new Date(), 1).toISOString() }, // example blocked
  });

  const EXCELLENT_THRESHOLD = 80;

  const getUnitConditionLabel = (healthPercent: number) => {
    if (healthPercent >= 80) return "Excellent";
    if (healthPercent >= 60) return "Good";
    return "Fair";
  };

  const isUnitExcellent = (healthPercent: number) => healthPercent >= EXCELLENT_THRESHOLD;

  const isUnitFreeBlocked = (unitId: number, healthPercent: number) => {
    if (!isUnitExcellent(healthPercent)) return false; // Not blocked for fair/poor condition
    const record = unitFreeServiceRecords[unitId];
    if (!record?.blockedUntil) return false;
    return new Date(record.blockedUntil) > new Date();
  };

  const getRemainingExcellentClaims = (unitId: number) => {
    const used = unitFreeServiceRecords[unitId]?.excellentClaimCount ?? 0;
    return Math.max(0, 2 - used);
  };

  const tabs = [
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "tips", label: "Tips", icon: Lightbulb },
    { id: "reminders", label: "Reminders", icon: Bell },
  ] as const;

  const times = [
    { id: "morning", label: "09:00 - 12:00", slots: 3 },
    { id: "afternoon", label: "13:00 - 16:00", slots: 1 },
    { id: "evening", label: "17:00 - 20:00", slots: 5 },
  ];

  const serviceReasons = [
    {
      id: "servicing",
      label: "Aircon Servicing",
      getPriceForUnits: getServicingPrice,
      premiumFree: true
    },
    {
      id: "chemical",
      label: "Chemical Wash",
      getPriceForUnits: getChemicalWashPrice,
      premiumFree: false  // NOT free under premium
    },
    {
      id: "overhaul",
      label: "Chemical Overhaul",
      getPriceForUnits: getChemicalOverhaulPrice,
      premiumFree: false
    },
    {
      id: "gas",
      label: "Gas Top-Up",
      getPriceForUnits: getGasTopUpPrice,
      premiumFree: false
    },
    {
      id: "repair",
      label: "Repair/Diagnosis",
      getPriceForUnits: getRepairDiagnosisPrice,
      premiumFree: false
    },
  ];

  const maintenanceTips = [
    { title: "Clean filters monthly", desc: "Remove dust and debris to maintain efficiency", icon: Wind },
    { title: "Check for water leaks", desc: "Inspect drain pipes and condensate tray", icon: Droplets },
    { title: "Monitor power usage", desc: "Sudden spikes may indicate issues", icon: Zap },
  ];

  const upcomingReminders = [
    { title: "Annual Service", date: "In 2 weeks", unit: "Master Bedroom", priority: "low" },
    { title: "Chemical Wash Recommended", date: "Overdue", unit: "Living Room", priority: "high" },
  ];

  const selectedReasonData = serviceReasons.find(r => r.id === selectedReason);

  // For servicing with "Other" units, premium members still pay
  const selectedBookedUnits = units.filter((unit) => selectedUnits.includes(unit.id));

  const hasBlockedSelectedUnit = selectedBookedUnits.some((unit) => isUnitFreeBlocked(unit.id, unit.healthPercent));

  const isEligiblePremiumServicingSelection =
    isPremium &&
    selectedReason === "servicing" &&
    selectedReasonData?.premiumFree &&
    !isOtherUnit &&
    selectedUnits.length > 0;

  const isServiceFreeForPremium = isEligiblePremiumServicingSelection && !hasBlockedSelectedUnit;
  // Calculate total cost based on service type and selections
  let totalCost = 0;

  if (selectedReason === "servicing") {
    if (isOtherUnit) {
      totalCost = selectedReasonData ? selectedReasonData.getPriceForUnits(numberOfUnits) : 0;
    } else if (selectedUnits.length > 0) {
      totalCost =
        isServiceFreeForPremium
          ? 0
          : (selectedReasonData ? selectedReasonData.getPriceForUnits(selectedUnits.length) : 0);
    }
  } else {
    totalCost = isServiceFreeForPremium
      ? 0
      : (selectedReasonData ? selectedReasonData.getPriceForUnits(numberOfUnits) : 0);
  }

  const handleConfirmBooking = () => {
    // Validation checks
    if (!selectedDate || !selectedReason) return;

    // For servicing, must have unit selection (either selectedUnits or isOtherUnit)
    if (selectedReason === "servicing" && selectedUnits.length === 0 && !isOtherUnit) {
      return;
    }

    // Must have payment method unless service is free for premium
    if (!selectedPayment && !isServiceFreeForPremium) return;

    if (
      selectedReason === "servicing" &&
      isPremium &&
      !isOtherUnit &&
      selectedUnits.length > 0 &&
      hasBlockedSelectedUnit &&
      !selectedPayment
    ) {
      return;
    }

    // Show confirmation modal first
    setShowConfirmationModal(true);
  };

  const proceedWithBooking = async () => {
    setIsAssigningTech(true);
    const timeLabel = times.find((t) => t.id === selectedTime)?.label || "";
    
    // Call AI Technician matching service
    const techResponse = await assignTechnician(
      selectedReason,
      selectedTime,
      numberOfUnits
    );

    const booking = {
      date: format(selectedDate!, "MMM dd"),
      dateFormatted: format(selectedDate!, "MMM dd, yyyy"),
      time: timeLabel,
      technician: techResponse.technician.name,
      service: selectedReasonData?.label || "Service",
      unit: `${numberOfUnits} unit${numberOfUnits > 1 ? 's' : ''}`,
      status: "confirmed" as const,
      scheduledDateTime: selectedDate!,
      totalCost: totalCost,
      isPremiumFree: isServiceFreeForPremium,
      selectedUnitIds: selectedUnits,
      hasBlockedSelectedUnit,
      freeClaimType: isServiceFreeForPremium
        ? selectedBookedUnits.every((u) => isUnitExcellent(u.healthPercent))
          ? "counted_excellent_claim"
          : "non_counted_non_excellent_free_claim"
        : "paid",
      matchedTechnician: techResponse.technician,
      etaMinutes: techResponse.eta_minutes,
      distanceLabel: techResponse.distance_label,
      matchConfidence: techResponse.confidence,
    };
    if (isServiceFreeForPremium && selectedReason === "servicing") {
      setUnitFreeServiceRecords((prev) => {
        const updated = { ...prev };

        selectedBookedUnits.forEach((unit) => {
          const excellent = isUnitExcellent(unit.healthPercent);

          if (!excellent) return; // free, but does NOT count toward 2-claim cap

          const currentCount = updated[unit.id]?.excellentClaimCount ?? 0;
          const nextCount = Math.min(currentCount + 1, 2);

          updated[unit.id] = {
            excellentClaimCount: nextCount,
            blockedUntil:
              nextCount >= 2
                ? addYears(new Date(), 1).toISOString()
                : updated[unit.id]?.blockedUntil,
          };
        });

        return updated;
      });
    }
    setCurrentBooking(booking as any);
    setShowConfirmationModal(false);
    setBookingConfirmed(true);
    setIsAssigningTech(false);
  };

  // Booking Confirmed View
  if (bookingConfirmed) {
    return (
      <div className="flex flex-col min-h-full bg-slate-50">
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6"
          >
            <Check className="w-10 h-10 text-emerald-600" strokeWidth={3} />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
          <p className="text-sm text-slate-500 text-center mb-8">Your appointment has been scheduled successfully.</p>

          <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-slate-500">Date</p>
                <p className="font-semibold text-slate-900">{selectedDate ? format(selectedDate, "MMM dd, yyyy") : ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-slate-500">Time</p>
                <p className="font-semibold text-slate-900">{times.find(t => t.id === selectedTime)?.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-slate-500">Service</p>
                <p className="font-semibold text-slate-900">{selectedReasonData?.label} ({numberOfUnits} unit{numberOfUnits > 1 ? "s" : ""})</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-slate-500">Total</p>
                {isServiceFreeForPremium ? (
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-emerald-600">$0</p>
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">PREMIUM</span>
                  </div>
                ) : (
                  <p className="font-semibold text-slate-900">${totalCost}</p>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/customer/home")}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg mb-3"
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate("/customer/tracking")}
            className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold mb-3 flex items-center justify-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            Track Order
          </button>
          <button
            onClick={() => navigate("/customer/upcoming")}
            className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-medium"
          >
            View Upcoming Schedule
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/customer/home")}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div>
            <h1 className="font-bold text-slate-900">Service Booking</h1>
            <p className="text-xs text-slate-500">Schedule maintenance</p>
          </div>
        </div>

        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "flex-1 py-2 px-3 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2",
                  isActive ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-6">
        <AnimatePresence mode="wait">
          {activeTab === "schedule" && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-5 space-y-6"
            >
              {/* Premium Banner */}
              {isPremium && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                    <Crown className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-900 text-sm">Premium Member</h3>
                    <p className="text-xs text-amber-700">Maintenance services are free with your plan</p>
                  </div>
                </div>
              )}

              {/* Cost Display */}
              {selectedReason && (
                <div className={clsx(
                  "rounded-xl p-5 shadow-lg",
                  isServiceFreeForPremium
                    ? "bg-gradient-to-br from-emerald-600 to-emerald-700"
                    : "bg-gradient-to-br from-blue-600 to-blue-700"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-white/70" />
                    <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                      {isServiceFreeForPremium ? "Premium Benefit" : "Estimated Cost"}
                    </p>
                  </div>
                  {isServiceFreeForPremium ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white">$0</span>
                        <span className="text-sm text-white/70 font-medium line-through">
                          ${selectedReasonData!.getPriceForUnits(numberOfUnits)}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-100 mt-2 flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5" />
                        Maintenance fee waived under Premium Subscription
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white">${totalCost}</span>
                        <span className="text-sm text-blue-200 font-medium">
                          ({numberOfUnits} unit{numberOfUnits > 1 ? 's' : ''})
                        </span>
                      </div>
                      <p className="text-xs text-blue-100 mt-2">
                        Final cost may vary based on actual service requirements
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Unit Health Overview */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900 mb-3">Unit Health Overview</h3>
                <div className="grid grid-cols-2 gap-3">
                  {units.map((unit) => (
                    <div key={unit.id} className={clsx("rounded-lg p-3", unit.statusColor === "emerald" ? "bg-emerald-50" : "bg-amber-50")}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={clsx("w-2 h-2 rounded-full", unit.statusColor === "emerald" ? "bg-emerald-500" : "bg-amber-500 animate-pulse")} />
                        <p className={clsx("text-xs font-medium", unit.statusColor === "emerald" ? "text-emerald-700" : "text-amber-700")}>{unit.name}</p>
                      </div>
                      <div className="flex items-end gap-2">
                        <p className={clsx("text-2xl font-bold", unit.statusColor === "emerald" ? "text-emerald-600" : "text-amber-600")}>{unit.healthPercent}%</p>
                        {unit.statusColor === "emerald" ? <TrendingUp className="w-4 h-4 text-emerald-600 mb-1" /> : <AlertTriangle className="w-4 h-4 text-amber-600 mb-1" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Select Service */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Reason for Service *</h3>
                <div className="space-y-2">
                  {serviceReasons.map((reason) => {
                    const isSelected = selectedReason === reason.id;
                    const isFree = isPremium && reason.premiumFree;
                    const displayPrice = reason.getPriceForUnits(1);  // Show price for 1 unit
                    return (
                      <button
                        key={reason.id}
                        onClick={() => {
                          setSelectedReason(reason.id);
                          // Reset unit selections when service changes
                          setSelectedUnits([]);
                          setIsOtherUnit(false);
                        }}
                        className={clsx(
                          "w-full p-3 rounded-lg border transition-all flex items-center justify-between",
                          isSelected ? "bg-blue-50 border-blue-500" : "bg-white border-slate-200 hover:border-blue-300"
                        )}
                      >
                        <span className={clsx("font-medium text-sm", isSelected ? "text-blue-900" : "text-slate-700")}>{reason.label}</span>
                        <div className="flex items-center gap-2">
                          {isFree ? (
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-slate-400 line-through">${displayPrice.toFixed(2)}</span>
                              <span className="text-sm font-bold text-emerald-600">$0</span>
                            </div>
                          ) : (
                            <span className={clsx("text-sm font-bold", isSelected ? "text-blue-600" : "text-slate-500")}>
                              ${displayPrice.toFixed(2)}{reason.id === "repair" ? "" : "/unit"}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Unit Selection for Aircon Servicing */}
              {selectedReason === "servicing" && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Select Air Con Unit(s) *</h3>
                  <div className="space-y-2">
                    {units.map((unit) => {
                      const isSelected = selectedUnits.includes(unit.id);
                      const excellentHealth = isUnitExcellent(unit.healthPercent);
                      const conditionLabel = getUnitConditionLabel(unit.healthPercent);
                      const remainingClaims = getRemainingExcellentClaims(unit.id);
                      const blocked = isUnitFreeBlocked(unit.id, unit.healthPercent);
                      return (
                        <button
                          key={unit.id}
                          onClick={() => {
                            if (isOtherUnit) {
                              // If "Other" is selected, clear it first
                              setIsOtherUnit(false);
                            }
                            setSelectedUnits(prev =>
                              prev.includes(unit.id)
                                ? prev.filter(id => id !== unit.id)
                                : [...prev, unit.id]
                            );
                          }}
                          className={clsx(
                            "w-full p-3 rounded-lg border transition-all flex items-start justify-between",
                            isSelected ? "bg-blue-50 border-blue-500" : "bg-white border-slate-200 hover:border-blue-300"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={clsx(
                              "w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5",
                              isSelected ? "bg-blue-600 border-blue-600" : "border-slate-300"
                            )}>
                              {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                            </div>
                            <div className="text-left">
                              <p className={clsx("font-medium text-sm", isSelected ? "text-blue-900" : "text-slate-700")}>
                                {unit.name}
                              </p>
                              <p className="text-xs text-slate-500">{unit.model} • Health: {unit.healthPercent}%</p>
                              {isSelected && isPremium && !isOtherUnit && (
                                <div className="mt-1 space-y-1">
                                  {blocked ? (
                                    <p className="text-xs text-red-600 font-medium">
                                      Free servicing claim blocked for this unit until{" "}
                                      {format(new Date(unitFreeServiceRecords[unit.id]?.blockedUntil ?? new Date()), "MMM dd, yyyy")}
                                    </p>
                                  ) : excellentHealth ? (
                                    <p className="text-xs text-emerald-600 font-medium">
                                      Excellent condition • {remainingClaims} counted free servicing claim
                                      {remainingClaims !== 1 ? "s" : ""} remaining
                                    </p>
                                  ) : (
                                    <p className="text-xs text-blue-600 font-medium">
                                      {conditionLabel} condition • this free servicing will not count toward the 2-claim Excellent cap
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className={clsx(
                            "px-2 py-1 rounded text-[10px] font-bold",
                            excellentHealth ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          )}>
                            {conditionLabel.toUpperCase()}
                          </div>
                        </button>
                      );
                    })}

                    {/* "Other" Unit Option */}
                    <button
                      onClick={() => {
                        setIsOtherUnit(!isOtherUnit);
                        if (!isOtherUnit) {
                          // Clear other selections when selecting "Other"
                          setSelectedUnits([]);
                        }
                      }}
                      className={clsx(
                        "w-full p-3 rounded-lg border transition-all flex items-start justify-between",
                        isOtherUnit ? "bg-blue-50 border-blue-500" : "bg-white border-slate-200 hover:border-blue-300"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={clsx(
                          "w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5",
                          isOtherUnit ? "bg-blue-600 border-blue-600" : "border-slate-300"
                        )}>
                          {isOtherUnit && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                        <div className="text-left">
                          <p className={clsx("font-medium text-sm", isOtherUnit ? "text-blue-900" : "text-slate-700")}>
                            Chosen air con does not fall within subscription range
                          </p>
                          <p className="text-xs text-red-500 font-medium mt-0.5">
                            ⚠️ Will incur cost even for premium members
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Number of Units - only show for non-servicing OR when "Other" is selected */}
              {(selectedReason !== "servicing" || (selectedReason === "servicing" && isOtherUnit)) && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">
                    {selectedReason === "servicing" && isOtherUnit
                      ? "Number of 'OTHER' AC Units *"
                      : "Number of AC Units *"}
                  </h3>
                  <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-between">
                    <button onClick={() => setNumberOfUnits(Math.max(1, numberOfUnits - 1))} disabled={numberOfUnits <= 1} className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      <MinusCircle className="w-5 h-5 text-slate-700" />
                    </button>
                    <div className="text-center">
                      <p className="text-3xl font-black text-slate-900">{numberOfUnits}</p>
                      <p className="text-xs text-slate-500">unit{numberOfUnits > 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={() => setNumberOfUnits(Math.min(10, numberOfUnits + 1))} disabled={numberOfUnits >= 10} className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      <PlusCircle className="w-5 h-5 text-blue-600" />
                    </button>
                  </div>
                </div>
              )}

              {/* Select Date */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Select Date *</h3>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={{ before: addDays(new Date(), 1) }}
                    toDate={addYears(new Date(), 2)}
                    className="rdp-custom"
                    classNames={{
                      months: "flex flex-col",
                      month: "space-y-4",
                      caption: "flex justify-center pt-1 relative items-center mb-4",
                      caption_label: "text-sm font-semibold text-slate-900",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-lg hover:bg-slate-100",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse",
                      head_row: "flex",
                      head_cell: "text-slate-500 rounded-md w-9 font-medium text-[0.8rem]",
                      row: "flex w-full mt-2",
                      cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-blue-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                      day: "h-9 w-9 p-0 font-medium aria-selected:opacity-100 hover:bg-slate-100 rounded-lg",
                      day_selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white",
                      day_today: "bg-slate-100 text-slate-900",
                      day_outside: "text-slate-400 opacity-50",
                      day_disabled: "text-slate-400 opacity-50",
                      day_hidden: "invisible",
                    }}
                  />
                </div>
              </div>

              {/* Select Time */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Select Time Slot *</h3>
                <div className="space-y-2">
                  {times.map((t) => {
                    const isSelected = selectedTime === t.id;
                    return (
                      <button key={t.id} onClick={() => setSelectedTime(t.id)} className={clsx("w-full p-3 rounded-lg border transition-all flex items-center justify-between", isSelected ? "bg-blue-50 border-blue-500" : "bg-white border-slate-200 hover:border-blue-300")}>
                        <div className="flex items-center gap-3">
                          <Clock className={clsx("w-4 h-4", isSelected ? "text-blue-600" : "text-slate-500")} />
                          <span className={clsx("font-medium", isSelected ? "text-blue-900" : "text-slate-700")}>{t.label}</span>
                        </div>
                        <span className={clsx("text-xs font-medium", isSelected ? "text-blue-600" : "text-slate-500")}>{t.slots} slots</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comments */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Additional Comments (Optional)</h3>
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <MessageSquare className="w-5 h-5 text-slate-400 mt-0.5" />
                    <textarea value={comments} onChange={(e) => setComments(e.target.value)} placeholder="E.g., AC making strange noise, prefer morning slot..." className="w-full text-sm text-slate-700 placeholder:text-slate-400 outline-none resize-none" rows={3} />
                  </div>
                </div>
              </div>

              {/* Payment Method - skip if premium free */}
              {!isServiceFreeForPremium && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Payment Method *</h3>
                  <div className="space-y-2">
                    {[
                      { id: "card", label: "Credit/Debit Card", icon: CreditCard },
                      { id: "paynow", label: "PayNow", icon: Smartphone },
                      { id: "cash", label: "Cash", icon: Banknote },
                      { id: "cheque", label: "Cheque", icon: FileText },
                    ].map((method) => {
                      const Icon = method.icon;
                      const isSelected = selectedPayment === method.id;
                      return (
                        <button key={method.id} onClick={() => setSelectedPayment(method.id)} className={clsx("w-full p-3 rounded-lg border transition-all flex items-center justify-between", isSelected ? "bg-blue-50 border-blue-500" : "bg-white border-slate-200 hover:border-blue-300")}>
                          <div className="flex items-center gap-3">
                            <div className={clsx("w-9 h-9 rounded-lg flex items-center justify-center", isSelected ? "bg-blue-100" : "bg-slate-100")}>
                              <Icon className={clsx("w-4 h-4", isSelected ? "text-blue-600" : "text-slate-500")} />
                            </div>
                            <span className={clsx("font-medium text-sm", isSelected ? "text-blue-900" : "text-slate-700")}>{method.label}</span>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {isServiceFreeForPremium && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                  <Crown className="w-5 h-5 text-amber-600" />
                  <p className="text-sm text-emerald-800 font-medium">
                    No payment required - maintenance covered by your Premium subscription.
                  </p>
                </div>
              )}

              {/* Booking Summary & CTA */}
              <button
                onClick={handleConfirmBooking}
                disabled={
                  !selectedDate ||
                  !selectedReason ||
                  (selectedReason === "servicing" && selectedUnits.length === 0 && !isOtherUnit) ||
                  (!selectedPayment && !isServiceFreeForPremium)
                }
                className={clsx(
                  "w-full py-3.5 rounded-lg font-semibold shadow-sm transition-colors",
                  (selectedDate && selectedReason && (selectedReason !== "servicing" || selectedUnits.length > 0 || isOtherUnit) && (selectedPayment || isServiceFreeForPremium))
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                )}
              >
                {isServiceFreeForPremium
                  ? "Confirm Booking - Free"
                  : `Confirm Booking - $${totalCost.toFixed(2)}`}
              </button>
            </motion.div>
          )}

          {activeTab === "tips" && (
            <motion.div key="tips" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-5 space-y-3">
              <h3 className="font-semibold text-slate-900 mb-3">Maintenance Tips</h3>
              {maintenanceTips.map((tip, i) => {
                const Icon = tip.icon;
                return (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">{tip.title}</h4>
                      <p className="text-sm text-slate-600">{tip.desc}</p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {activeTab === "reminders" && (
            <motion.div key="reminders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-5 space-y-3">
              <h3 className="font-semibold text-slate-900 mb-3">Upcoming Reminders</h3>
              {upcomingReminders.map((reminder, i) => (
                <div key={i} className={clsx("bg-white rounded-xl border p-4", reminder.priority === "high" ? "border-red-200 bg-red-50/30" : reminder.priority === "medium" ? "border-amber-200 bg-amber-50/30" : "border-slate-200")}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-900">{reminder.title}</h4>
                    <span className={clsx("text-xs font-bold px-2 py-1 rounded-full", reminder.priority === "high" ? "bg-red-100 text-red-700" : reminder.priority === "medium" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700")}>{reminder.date}</span>
                  </div>
                  <p className="text-sm text-slate-600">{reminder.unit}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Confirm Booking</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                <strong>Base price confirmed.</strong> If extra work is needed, we'll quote before proceeding.
              </p>
              <p className="text-sm text-slate-700 leading-relaxed mt-2">
                {selectedReason === "repair" && (
                  <>For air-con repair/diagnosis services, the listed price is a diagnostic fee, which will be <strong>waived if you proceed with the repair</strong>.</>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={proceedWithBooking}
                disabled={isAssigningTech}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm flex justify-center items-center"
              >
                {isAssigningTech ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Proceed"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}