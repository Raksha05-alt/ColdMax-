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
import { units } from "../../data/units";
import { useBooking } from "../../context/BookingContext";
import { useSubscription } from "../../context/SubscriptionContext";

export default function Booking() {
  const navigate = useNavigate();
  const { setCurrentBooking } = useBooking();
  const { isPremium } = useSubscription();
  const [activeTab, setActiveTab] = useState<"schedule" | "tips" | "reminders">("schedule");
  const tomorrow = addDays(new Date(), 1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(tomorrow);
  const [selectedTime, setSelectedTime] = useState("morning");
  const [numberOfUnits, setNumberOfUnits] = useState(1);
  const [selectedReason, setSelectedReason] = useState("");
  const [comments, setComments] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

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
    { id: "maintenance", label: "General Maintenance", cost: 45, premiumFree: true },
    { id: "cleaning", label: "Filter Cleaning", cost: 30, premiumFree: true },
    { id: "chemical", label: "Chemical Wash", cost: 120, premiumFree: true },
    { id: "gas", label: "Gas Top-Up", cost: 80, premiumFree: false },
    { id: "repair", label: "Repair/Diagnosis", cost: 60, premiumFree: false },
  ];

  const maintenanceTips = [
    { title: "Clean filters monthly", desc: "Remove dust and debris to maintain efficiency", icon: Wind },
    { title: "Check for water leaks", desc: "Inspect drain pipes and condensate tray", icon: Droplets },
    { title: "Monitor power usage", desc: "Sudden spikes may indicate issues", icon: Zap },
  ];

  const upcomingReminders = [
    { title: "Filter Cleaning Due", date: "In 5 days", unit: "Living Room", priority: "medium" },
    { title: "Annual Service", date: "In 2 weeks", unit: "Master Bedroom", priority: "low" },
    { title: "Chemical Wash Recommended", date: "Overdue", unit: "Living Room", priority: "high" },
  ];

  const selectedReasonData = serviceReasons.find(r => r.id === selectedReason);
  const isServiceFreeForPremium = isPremium && selectedReasonData?.premiumFree;
  const totalCost = isServiceFreeForPremium ? 0 : (selectedReasonData ? selectedReasonData.cost * numberOfUnits : 0);

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedReason || (!selectedPayment && !isServiceFreeForPremium)) return;

    const timeLabel = times.find((t) => t.id === selectedTime)?.label || "";
    const booking = {
      date: format(selectedDate, "MMM dd"),
      dateFormatted: format(selectedDate, "MMM dd, yyyy"),
      time: timeLabel,
      technician: "David Tan",
      service: selectedReasonData?.label || "Service",
      unit: `${numberOfUnits} unit${numberOfUnits > 1 ? 's' : ''}`,
      status: "confirmed" as const,
      scheduledDateTime: selectedDate,
      totalCost: totalCost,
      isPremiumFree: isServiceFreeForPremium,
    };

    setCurrentBooking(booking);
    setBookingConfirmed(true);
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
                          ${selectedReasonData!.cost * numberOfUnits}
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
                    return (
                      <button
                        key={reason.id}
                        onClick={() => setSelectedReason(reason.id)}
                        className={clsx(
                          "w-full p-3 rounded-lg border transition-all flex items-center justify-between",
                          isSelected ? "bg-blue-50 border-blue-500" : "bg-white border-slate-200 hover:border-blue-300"
                        )}
                      >
                        <span className={clsx("font-medium text-sm", isSelected ? "text-blue-900" : "text-slate-700")}>{reason.label}</span>
                        <div className="flex items-center gap-2">
                          {isFree ? (
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-slate-400 line-through">${reason.cost}</span>
                              <span className="text-sm font-bold text-emerald-600">$0</span>
                            </div>
                          ) : (
                            <span className={clsx("text-sm font-bold", isSelected ? "text-blue-600" : "text-slate-500")}>${reason.cost}/unit</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Number of Units */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Number of AC Units *</h3>
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
                disabled={!selectedDate || !selectedReason || (!selectedPayment && !isServiceFreeForPremium)}
                className={clsx(
                  "w-full py-3.5 rounded-lg font-semibold shadow-sm transition-colors",
                  (selectedDate && selectedReason && (selectedPayment || isServiceFreeForPremium))
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                )}
              >
                {isServiceFreeForPremium
                  ? "Confirm Booking - Free"
                  : `Confirm Booking - $${totalCost}`}
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
    </div>
  );
}