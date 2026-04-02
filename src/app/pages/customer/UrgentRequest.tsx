import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  X,
  ArrowRight,
  UserCheck,
  PhoneCall,
  MessageSquare,
  Flame,
  Search,
  DollarSign,
  MessageSquareText,
  MinusCircle,
  PlusCircle,
  CreditCard,
  Smartphone,
  Banknote,
  FileText,
  Check,
  Camera,
  Crown,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router";
import { clsx } from "clsx";
import { useLocation } from "../../context/LocationContext";
import { useSubscription } from "../../context/SubscriptionContext";
import { useRequests } from "../../context/RequestContext";

export default function UrgentRequest() {
  const navigate = useNavigate();
  const { selectedLocation } = useLocation();
  const { isPremium } = useSubscription();
  const { addRequest } = useRequests();
  const [step, setStep] = useState<
    "details" | "searching" | "found"
  >("details");

  const [issue, setIssue] = useState("");
  const [otherIssue, setOtherIssue] = useState("");
  const [acBrand, setAcBrand] = useState("");
  const [numberOfUnits, setNumberOfUnits] = useState(1);
  const [comments, setComments] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [photoPreview, setPhotoPreview] = useState<
    string | null
  >(null);

  // Emergency service issues with pricing (AC Emergency is NOT a premium benefit)
  // Emergency pricing includes $10 surcharge for urgent service
  const getEmergencyServicingPrice = (units: number) => {
    const basePrices: Record<number, number> = {
      1: 43.60,
      2: 59.95,
      3: 76.30,
      4: 92.65,
      5: 109.00,
      6: 125.35,
    };
    const basePrice = basePrices[units] || 43.60 + ((units - 1) * 16.35);
    return basePrice + 10; // $10 surcharge for emergency
  };

  const emergencyIssues = [
    {
      id: "servicing",
      label: "Air con servicing (urgent)",
      getPriceForUnits: getEmergencyServicingPrice,
      isPerUnit: true,
    },
    {
      id: "not_cold",
      label: "Not cold / weak cooling",
      price: 260,
      pricePerUnit: 260,
      isPerUnit: true,
    },
    {
      id: "weak_airflow",
      label: "Weak or no airflow",
      price: 180,
      pricePerUnit: 180,
      isPerUnit: true,
    },
    {
      id: "leaking",
      label: "Water leaking",
      price: 100,
      pricePerUnit: 100,
      isPerUnit: true,
    },
    {
      id: "not_cooling_all",
      label: "Not cooling at all",
      price: 480,
      pricePerUnit: 480,
      isPerUnit: true,
    },
    {
      id: "blinking",
      label: "Blinking / not responding",
      price: 300,
      pricePerUnit: 300,
      isPerUnit: true,
    },
    {
      id: "temp_inconsistent",
      label: "Temperature inconsistent",
      price: 130,
      pricePerUnit: 130,
      isPerUnit: true,
    },
    {
      id: "cannot_turn_on",
      label: "Cannot turn on / trips",
      price: 150,
      pricePerUnit: 150,
      isPerUnit: true,
    },
  ];

  const selectedIssueData = emergencyIssues.find(
    (i) => i.id === issue,
  );
  const totalCost = selectedIssueData
    ? selectedIssueData.getPriceForUnits
      ? selectedIssueData.getPriceForUnits(numberOfUnits)
      : selectedIssueData.pricePerUnit
        ? selectedIssueData.pricePerUnit * numberOfUnits
        : selectedIssueData.price
    : 0;

  const acBrands = [
    "Daikin",
    "Mitsubishi",
    "Panasonic",
    "LG",
    "Samsung",
    "Toshiba",
    "Carrier",
    "Other",
  ];

  const technicians = [
    {
      id: "tech_001",
      name: "David Tan",
      rating: 4.9,
      jobsCompleted: 1204,
      distanceKm: 2.4,
      etaMins: 12,
      image:
        "https://images.unsplash.com/photo-1744853930655-52d02b83abb6?auto=format&fit=crop&w=150&q=80",
      brands: ["Daikin", "Panasonic", "LG"],
      skills: [
        "not_cold",
        "not_cooling_all",
        "weak_airflow",
        "temp_inconsistent",
      ],
    },
    {
      id: "tech_002",
      name: "Marcus Lee",
      rating: 4.8,
      jobsCompleted: 892,
      distanceKm: 1.8,
      etaMins: 10,
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      brands: ["Mitsubishi", "Daikin", "Carrier"],
      skills: [
        "leaking",
        "weak_airflow",
        "blinking",
        "cannot_turn_on",
      ],
    },
    {
      id: "tech_003",
      name: "Ravi Kumar",
      rating: 4.7,
      jobsCompleted: 731,
      distanceKm: 3.1,
      etaMins: 15,
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
      brands: ["Samsung", "LG", "Toshiba"],
      skills: [
        "not_cold",
        "leaking",
        "temp_inconsistent",
        "cannot_turn_on",
      ],
    },
    {
      id: "tech_004",
      name: "Ben Wong",
      rating: 4.9,
      jobsCompleted: 1408,
      distanceKm: 4.2,
      etaMins: 18,
      image:
        "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=150&q=80",
      brands: ["Panasonic", "Mitsubishi", "Carrier", "Other"],
      skills: [
        "not_cooling_all",
        "blinking",
        "cannot_turn_on",
        "weak_airflow",
      ],
    },
  ];

  const matchedTechnician = useMemo(() => {
    if (!issue) return null;

    const brandFiltered = technicians.filter((tech) =>
      !acBrand || acBrand === "Other"
        ? true
        : tech.brands.includes(acBrand),
    );

    const skillMatched = brandFiltered.filter((tech) =>
      tech.skills.includes(issue),
    );

    const rankedPool = (
      skillMatched.length > 0 ? skillMatched : brandFiltered
    ).sort((a, b) => {
      const aSkillScore = a.skills.includes(issue) ? 1 : 0;
      const bSkillScore = b.skills.includes(issue) ? 1 : 0;

      if (bSkillScore !== aSkillScore)
        return bSkillScore - aSkillScore;
      return a.distanceKm - b.distanceKm;
    });

    return rankedPool[0] ?? null;
  }, [issue, acBrand]);
  const handlePhotoUpload = () => {
    setPhotoPreview(
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=300&q=80",
    );
  };

  const handleRequest = () => {
    const issueLabel = selectedIssueData?.label || "Emergency";

    addRequest({
      customerId: "cust_001",
      customerName: "Alex Chen",
      location: selectedLocation,
      issue: issueLabel,
      issueType: issue,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      distance: matchedTechnician
        ? `${matchedTechnician.distanceKm.toFixed(1)} km`
        : "2.4 km",
      payout: `$${totalCost}`,
      priority: "urgent",
      status: "pending",
      paymentMethod: selectedPayment as "cash" | "card" | "paynow" | "cheque",
    });

    setStep("searching");
    setTimeout(() => setStep("found"), 3000);
  };

  const isFormValid = issue && acBrand && selectedPayment;

  return (<div className="min-h-[100dvh] bg-slate-50 font-sans relative flex flex-col">
  
      <AnimatePresence>
        {(step === "searching" || step === "found") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-0 bg-gradient-to-br from-blue-100 via-slate-100 to-green-50"
          />
        )}
      </AnimatePresence>

      <header className="px-5 pt-6 pb-4 flex items-center justify-between relative z-20 shrink-0">
        <button
          onClick={() => navigate("/customer/home")}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-neutral-800 shadow-sm border border-neutral-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-neutral-900 bg-white/80 px-4 py-1.5 rounded-full text-sm backdrop-blur-md border border-neutral-100">
          AC Emergency
        </span>
        <div className="w-10 h-10" />
      </header>

      <div className="flex-1 px-5 pb-5 pt-2 relative z-20 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white rounded-3xl p-5 shadow-2xl border border-neutral-100 space-y-5 relative"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-orange-500" />
              <div>
                <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2 mb-1">
                  <Flame className="w-5 h-5 text-red-500" /> AC
                  Emergency
                </h2>
                <p className="text-sm text-neutral-500 font-medium">
                  Get a technician within 2 hours.
                </p>
              </div>

              {/* Cost Display */}
              <div className="rounded-2xl p-4 shadow-lg bg-gradient-to-br from-red-600 to-orange-600">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-white/70" />
                  <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">
                    Emergency Cost
                  </p>
                </div>
                {selectedIssueData ? (
                  <>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-black text-white">
                        ${totalCost.toFixed(2)}
                      </span>
                      {selectedIssueData.isPerUnit && (
                        <span className="text-sm text-white/70 font-medium">
                          ({numberOfUnits} unit{numberOfUnits > 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                    {selectedIssueData.id === "servicing" && (
                      <p className="text-xs text-white/80">
                        Includes $10 surcharge for urgent service
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-white/80">
                    Select an issue to see estimate
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Location */}
                <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Home Location
                  </label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-neutral-800" />
                    <span className="font-semibold text-sm">
                      {selectedLocation}
                    </span>
                  </div>
                </div>

                {/* Issue */}
                <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    What's the issue? *
                  </label>
                  <select
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    className="w-full bg-transparent font-semibold text-sm outline-none cursor-pointer"
                  >
                    <option value="" disabled>
                      Select a problem
                    </option>
                    {emergencyIssues.map((emergencyIssue) => (
                      <option
                        key={emergencyIssue.id}
                        value={emergencyIssue.id}
                      >
                        {emergencyIssue.label}
                      </option>
                    ))}
                  </select>
                </div>

                {issue === "other" && (
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                      Describe the issue *
                    </label>
                    <input
                      type="text"
                      value={otherIssue}
                      onChange={(e) =>
                        setOtherIssue(e.target.value)
                      }
                      placeholder="Describe your AC emergency..."
                      className="w-full bg-transparent font-semibold text-sm outline-none"
                    />
                  </div>
                )}

                {/* AC Brand */}
                <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    AC Brand *
                  </label>
                  <select
                    value={acBrand}
                    onChange={(e) => setAcBrand(e.target.value)}
                    className="w-full bg-transparent font-semibold text-sm outline-none cursor-pointer"
                  >
                    <option value="" disabled>
                      Select AC brand
                    </option>
                    {acBrands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Number of Units */}
                <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                    Number of AC Units *
                  </label>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() =>
                        setNumberOfUnits(
                          Math.max(1, numberOfUnits - 1),
                        )
                      }
                      disabled={numberOfUnits <= 1}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-white hover:bg-neutral-100 disabled:opacity-50 transition-colors border border-neutral-200"
                    >
                      <MinusCircle className="w-4 h-4 text-neutral-700" />
                    </button>
                    <div className="text-center">
                      <p className="text-2xl font-black text-neutral-900">
                        {numberOfUnits}
                      </p>
                      <p className="text-[10px] text-neutral-500">
                        unit{numberOfUnits > 1 ? "s" : ""}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setNumberOfUnits(
                          Math.min(10, numberOfUnits + 1),
                        )
                      }
                      disabled={numberOfUnits >= 10}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 disabled:opacity-50 transition-colors border border-red-200"
                    >
                      <PlusCircle className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                    Photo of Issue (Optional)
                  </label>
                  {photoPreview ? (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Issue"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setPhotoPreview(null)}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handlePhotoUpload}
                      className="w-full py-3 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center gap-2 text-neutral-500 text-sm font-medium hover:bg-white transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      Upload Photo
                    </button>
                  )}
                </div>

                {/* Comments */}
                <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Additional Notes (Optional)
                  </label>
                  <div className="flex items-start gap-2">
                    <MessageSquareText className="w-4 h-4 text-neutral-400 mt-1 shrink-0" />
                    <textarea
                      value={comments}
                      onChange={(e) =>
                        setComments(e.target.value)
                      }
                      placeholder="E.g., Water pooling on floor, unit stopped suddenly..."
                      className="flex-1 bg-transparent text-sm text-neutral-700 placeholder:text-neutral-400 outline-none resize-none"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Payment Method - Always required since AC Emergency is NOT a premium benefit */}
                <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Payment Method *
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        id: "card",
                        label: "Credit/Debit Card",
                        icon: CreditCard,
                      },
                      {
                        id: "paynow",
                        label: "PayNow",
                        icon: Smartphone,
                      },
                      {
                        id: "cash",
                        label: "Cash",
                        icon: Banknote,
                      },
                      {
                        id: "cheque",
                        label: "Cheque",
                        icon: FileText,
                      },
                    ].map((method) => {
                      const Icon = method.icon;
                      const isSelected =
                        selectedPayment === method.id;
                      return (
                        <button
                          key={method.id}
                          onClick={() =>
                            setSelectedPayment(method.id)
                          }
                          className={clsx(
                            "w-full p-2.5 rounded-lg border transition-all flex items-center justify-between",
                            isSelected
                              ? "bg-red-50 border-red-400"
                              : "bg-white border-neutral-200",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Icon
                              className={clsx(
                                "w-4 h-4",
                                isSelected
                                  ? "text-red-600"
                                  : "text-neutral-500",
                              )}
                            />
                            <span
                              className={clsx(
                                "font-medium text-sm",
                                isSelected
                                  ? "text-red-900"
                                  : "text-neutral-700",
                              )}
                            >
                              {method.label}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <Check
                                className="w-2.5 h-2.5 text-white"
                                strokeWidth={3}
                              />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                disabled={!isFormValid}
                onClick={handleRequest}
                className={clsx(
                  "w-full py-4 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all",
                  isFormValid
                    ? "bg-gradient-to-r from-red-500 to-orange-500 active:scale-95 cursor-pointer shadow-red-500/30"
                    : "bg-neutral-300 cursor-not-allowed opacity-70 shadow-none",
                )}
              >
                Find Technician Now - ${totalCost}{" "}
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === "searching" && (
            <motion.div
              key="searching"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex-1 flex flex-col items-center justify-center pb-20"
            >
              <div className="relative flex items-center justify-center mb-8">
                <motion.div
                  animate={{
                    scale: [1, 2.5],
                    opacity: [0.8, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                  className="absolute w-24 h-24 rounded-full border-4 border-blue-500"
                />
                <motion.div
                  animate={{
                    scale: [1, 3.5],
                    opacity: [0.5, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: 0.5,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                  className="absolute w-24 h-24 rounded-full border-2 border-blue-400"
                />
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/40 relative z-10">
                  <Search className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl shadow-xl text-center">
                <h3 className="text-xl font-bold text-neutral-900 mb-1">
                  Matching Nearby Techs
                </h3>
                <p className="text-sm font-semibold text-blue-600 animate-pulse mb-2">
                  Matching by distance + required service...
                </p>
                <p className="text-xs text-neutral-500">
                  Prioritizing technicians with the right skills
                  for this issue
                </p>
              </div>
              <button
                onClick={() => {
                  setStep("details");
                  navigate("/customer/home");
                }}
                className="mt-8 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full text-sm font-bold text-neutral-600 shadow-sm"
              >
                Cancel Request
              </button>
            </motion.div>
          )}

          {step === "found" && (
            <motion.div
              key="found"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 shadow-2xl border border-neutral-100 space-y-5"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                    Tech Matched
                  </span>
                </div>
                <span className="text-sm font-bold text-neutral-900">
                  Arriving in{" "}
                  <span className="text-blue-600">
                    {matchedTechnician?.etaMins ?? 12} mins
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                  <div className="relative">
                    <img
                      src={
                        matchedTechnician?.image ||
                        "https://images.unsplash.com/photo-1744853930655-52d02b83abb6?auto=format&fit=crop&w=150&q=80"
                      }
                      alt="Tech"
                      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-neutral-100">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-neutral-900">
                      {matchedTechnician?.name ||
                        "Available Technician"}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 flex-wrap">
                      <span className="flex items-center text-amber-500">
                        &#9733;{" "}
                        {matchedTechnician?.rating ?? 4.9}
                      </span>
                      <span>-</span>
                      <span>
                        {matchedTechnician?.jobsCompleted?.toLocaleString() ??
                          "1,204"}{" "}
                        jobs
                      </span>
                      <span>-</span>
                      <span className="text-blue-600">
                        {matchedTechnician
                          ? `${matchedTechnician.distanceKm.toFixed(1)} km away`
                          : "2.4 km away"}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-emerald-700 mt-1">
                      Matched for{" "}
                      {selectedIssueData?.label ||
                        "this service request"}
                      {acBrand ? ` • ${acBrand}` : ""}
                    </p>
                  </div>
                </div>

              {isPremium && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-600" />
                  <p className="text-xs text-emerald-800 font-medium">
                    $0 due to Premium Membership
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button className="flex-1 bg-blue-50 text-blue-600 py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm active:scale-95 transition-transform">
                  <PhoneCall className="w-5 h-5" /> Call
                </button>
                <button className="flex-1 bg-blue-50 text-blue-600 py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm active:scale-95 transition-transform">
                  <MessageSquare className="w-5 h-5" /> Message
                </button>
              </div>

              <button
  onClick={() =>
    navigate("/customer/tracking", {
      state: {
        matchedTechnician,
        issueLabel: selectedIssueData?.label || "Emergency Service",
        acBrand,
        distance: matchedTechnician
          ? `${matchedTechnician.distanceKm.toFixed(1)} km away`
          : "2.4 km away",
        etaMins: matchedTechnician?.etaMins ?? 12,
        totalCost: totalCost,
      },
    })
  }
  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
>
  Track Live Location{" "}
  <ArrowRight className="w-5 h-5" />
</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}