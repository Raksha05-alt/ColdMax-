import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  PanInfo,
} from "motion/react";
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Phone,
  MessageSquare,
  Clock,
  Wrench,
  User,
  FileText,
  Car,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  Zap,
  Fan,
  MessageSquareText,
  Home,
  Navigation2,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Send,
  Camera,
} from "lucide-react";
import { useNavigate } from "react-router";
import { clsx } from "clsx";

interface JobData {
  id: number;
  customer: string;
  location: string;
  issue: string;
  unitType: string;
  time: string;
  distance: string;
  payout: string;
  priority?: string;
  duration?: string;
  status?: string;
  scheduledDate?: string;
  skillsMatch?: number;
  acBrand?: string;
  numUnits?: number;
  comments?: string;
  phone?: string;
  paymentMethod?: "cash" | "card" | "paynow" | "cheque";
}

interface TechJobViewProps {
  job: JobData;
  isAvailable: boolean;
  onBack: () => void;
  onAccept?: (job: JobData) => void;
  acceptedJobs?: JobData[];
}

interface LineItem {
  id: string;
  service: string;
  price: number;
  units: number;
}

// Service pricing
const getServicingPrice = (units: number) => {
  const prices: Record<number, number> = {
    1: 43.6,
    2: 59.95,
    3: 76.3,
    4: 92.65,
    5: 109.0,
    6: 125.35,
  };
  return prices[units] || 43.6;
};

const getChemicalWashPrice = (units: number) => {
  const prices: Record<number, number> = {
    1: 92.65,
    2: 174.4,
    3: 245.25,
    4: 305.2,
    5: 381.5,
  };
  return prices[units] || 92.65;
};

const getChemicalOverhaulPrice = (units: number) => {
  const prices: Record<number, number> = {
    1: 163.5,
    2: 305.2,
    3: 425.1,
    4: 523.2,
    5: 654.0,
  };
  return prices[units] || 163.5;
};

const getGasTopUpPrice = (units: number) => {
  const prices: Record<number, number> = {
    1: 163.5,
    2: 305.2,
    3: 425.1,
    4: 523.2,
    5: 654.0,
  };
  return prices[units] || 163.5;
};

// All available services
const serviceOptions = [
  {
    id: "servicing",
    label: "Aircon Servicing",
    getPriceForUnits: getServicingPrice,
  },
  {
    id: "chemical",
    label: "Chemical Wash",
    getPriceForUnits: getChemicalWashPrice,
  },
  {
    id: "overhaul",
    label: "Chemical Overhaul",
    getPriceForUnits: getChemicalOverhaulPrice,
  },
  {
    id: "gas",
    label: "Gas Top-Up",
    getPriceForUnits: getGasTopUpPrice,
  },
  {
    id: "repair",
    label: "Repair/Diagnosis",
    getPriceForUnits: () => 60,
  },
  {
    id: "not_cooling",
    label: "AC Not Cooling",
    getPriceForUnits: () => 180,
  },
  {
    id: "water_leak",
    label: "Water Leaking",
    getPriceForUnits: () => 150,
  },
  {
    id: "loud_noise",
    label: "Loud/Strange Noise",
    getPriceForUnits: () => 120,
  },
  {
    id: "bad_smell",
    label: "Bad Smell",
    getPriceForUnits: () => 100,
  },
  {
    id: "not_turning_on",
    label: "Not Turning On",
    getPriceForUnits: () => 200,
  },
  {
    id: "freezing",
    label: "Freezing/Icing Up",
    getPriceForUnits: () => 160,
  },
  {
    id: "remote_not_working",
    label: "Remote Not Working",
    getPriceForUnits: () => 80,
  },
];

// Snap points for technician bottom sheet (percentage from bottom)
const SNAP_PEEK = 15; // Minimal bar showing status
const SNAP_MID = 55; // Default with job info
const SNAP_FULL = 85; // Full details

export default function TechJobView({
  job,
  isAvailable,
  onBack,
  onAccept,
  acceptedJobs = [],
}: TechJobViewProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [jobStatus, setJobStatus] = useState<
    "idle" | "accepted" | "on-way" | "arrived" | "in-progress"
  >(isAvailable ? "idle" : "accepted");
  const [showConflictWarning, setShowConflictWarning] =
    useState(false);
  const [showAddLineItem, setShowAddLineItem] = useState(false);
  const [showQuotationConfirm, setShowQuotationConfirm] =
    useState(false);
  const [quotationSent, setQuotationSent] = useState(false);
  const [quotationAccepted, setQuotationAccepted] =
    useState(false);
  const [quotationRejected, setQuotationRejected] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [
    showQuotationAcceptedNotification,
    setShowQuotationAcceptedNotification,
  ] = useState(false);
  const [
    showQuotationRejectedNotification,
    setShowQuotationRejectedNotification,
  ] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedUnits, setSelectedUnits] = useState(1);

  // Start at SNAP_FULL for better visibility
  const [sheetSnap, setSheetSnap] = useState<number>(SNAP_FULL);
  const sheetHeight = useMotionValue(SNAP_FULL);
  const sheetHeightStyle = useTransform(
    sheetHeight,
    (v) => `${v}%`,
  );

  // Check for time conflicts
  const hasTimeConflict = () => {
    if (!isAvailable) return false;
    return acceptedJobs.some((aj) => {
      if (aj.time === "ASAP" || job.time === "ASAP")
        return false;
      return (
        aj.time === job.time &&
        aj.scheduledDate === job.scheduledDate
      );
    });
  };

  const getContainerHeight = () => {
    return containerRef.current?.clientHeight || 700;
  };

  const snapTo = (pct: number) => {
    setSheetSnap(pct);
    animate(sheetHeight, pct, {
      type: "spring",
      damping: 30,
      stiffness: 350,
    });
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const velocity = info.velocity.y;
    const currentPct = sheetHeight.get();

    if (velocity > 300) {
      // Flick down
      if (currentPct <= SNAP_MID) snapTo(SNAP_PEEK);
      else snapTo(SNAP_MID);
    } else if (velocity < -300) {
      // Flick up
      if (currentPct >= SNAP_MID) snapTo(SNAP_FULL);
      else snapTo(SNAP_MID);
    } else {
      // Snap to nearest
      const snaps = [SNAP_PEEK, SNAP_MID, SNAP_FULL];
      const nearest = snaps.reduce((a, b) =>
        Math.abs(b - currentPct) < Math.abs(a - currentPct)
          ? b
          : a,
      );
      snapTo(nearest);
    }
  };

  const handleDrag = (_: any, info: PanInfo) => {
    const h = getContainerHeight();
    const deltaPct = -(info.delta.y / h) * 100;
    const newVal = Math.max(
      SNAP_PEEK,
      Math.min(SNAP_FULL + 5, sheetHeight.get() + deltaPct),
    );
    sheetHeight.set(newVal);
  };

  const handleAccept = () => {
    if (hasTimeConflict()) {
      setShowConflictWarning(true);
      return;
    }
    if (onAccept) {
      onAccept(job);
    }
    setJobStatus("accepted");
    onBack();
  };

  const handleOnMyWay = () => {
    setJobStatus("on-way");
    snapTo(SNAP_PEEK);
  };

  const handleArrived = () => setJobStatus("arrived");
  const handleStartService = () => setJobStatus("in-progress");

  const handleAddLineItem = () => {
    if (!selectedService) return;
    const service = serviceOptions.find(
      (s) => s.id === selectedService,
    );
    if (!service) return;

    const newItem: LineItem = {
      id: Date.now().toString(),
      service: service.label,
      price: service.getPriceForUnits(selectedUnits),
      units: selectedUnits,
    };

    setLineItems([...lineItems, newItem]);
    setSelectedService("");
    setSelectedUnits(1);
    setShowAddLineItem(false);
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const totalQuotation = lineItems.reduce(
    (sum, item) => sum + item.price,
    0,
  );
  const basePayout = Number(job.payout.replace(/[^0-9.]/g, "")) || 0;
  const displayedPayout = quotationAccepted
    ? basePayout + totalQuotation
    : basePayout;

  const handleJobComplete = () => {
    navigate("/tech/job-photo-submission", {
      state: {
        job,
        finalPayout: displayedPayout,
      },
    });
  };

  useEffect(() => {
    if (!quotationSent || quotationAccepted) return;

    // Predefined rejection reasons
    const rejectionReasons = [
      "Price is too high for the proposed services",
      "Would like to get a second opinion first",
      "Only need basic servicing, not additional services",
      "Budget constraints at the moment",
      "Timeline doesn't work for me right now"
    ];

    // 70% chance customer accepts, 30% chance they reject
    const willAccept = Math.random() < 0.7;
    
    const responseTimer = setTimeout(() => {
      if (willAccept) {
        setQuotationAccepted(true);
        setShowQuotationAcceptedNotification(true);
      } else {
        // Customer rejected
        const randomReason = rejectionReasons[Math.floor(Math.random() * rejectionReasons.length)];
        setQuotationAccepted(false);
        setShowQuotationAcceptedNotification(false);
        setQuotationRejected(true);
        setRejectionReason(randomReason);
        setShowQuotationRejectedNotification(true);
      }
    }, 2000);

    const hideTimer = setTimeout(() => {
      setShowQuotationAcceptedNotification(false);
      setShowQuotationRejectedNotification(false);
    }, 5500);

    return () => {
      clearTimeout(responseTimer);
      clearTimeout(hideTimer);
    };
  }, [quotationSent, quotationAccepted]);

  // Enhanced job details
  const customerDetails = {
    name: job.customer,
    phone: job.phone || "+65 9123 4567",
    address: job.location,
    acBrand:
      job.acBrand || job.unitType?.split(" ")[0] || "Daikin",
    numUnits: job.numUnits || 1,
    issue: job.issue,
    comments:
      job.comments ||
      "AC stopped cooling suddenly. No unusual sounds. Unit is about 3 years old.",
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col h-[100dvh] bg-slate-50 overflow-hidden"
    >
      {/* === FULL-SCREEN MAP === */}
      <div
        className="absolute inset-0 z-0"
        onClick={() => {
          if (!isAvailable && sheetSnap > SNAP_PEEK)
            snapTo(SNAP_PEEK);
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-100 to-emerald-50" />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.08]">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`h${i}`}
              className="absolute w-full border-b border-slate-500"
              style={{ top: `${i * 5}%` }}
            />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`v${i}`}
              className="absolute h-full border-r border-slate-500"
              style={{ left: `${i * 5}%` }}
            />
          ))}
        </div>

        {/* Road paths */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M 0 30 Q 30 25, 60 35 T 100 28"
            stroke="#cbd5e1"
            strokeWidth="0.8"
            fill="none"
          />
          <path
            d="M 10 0 Q 15 30, 20 50 T 25 100"
            stroke="#cbd5e1"
            strokeWidth="0.6"
            fill="none"
          />
          <path
            d="M 50 0 Q 55 20, 52 50 T 58 100"
            stroke="#cbd5e1"
            strokeWidth="0.7"
            fill="none"
          />
          <path
            d="M 0 65 Q 40 60, 70 70 T 100 62"
            stroke="#cbd5e1"
            strokeWidth="0.6"
            fill="none"
          />
          <path
            d="M 80 0 Q 75 30, 78 60 T 82 100"
            stroke="#cbd5e1"
            strokeWidth="0.5"
            fill="none"
          />

          {/* Route line to customer */}
          {(jobStatus === "on-way" ||
            jobStatus === "accepted") && (
            <motion.path
              d="M 18 82 Q 40 70, 60 60 T 68 18"
              stroke="#3b82f6"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="4 2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          )}
        </svg>

        {/* Area labels */}
        {[
          { label: "Novena", x: "12%", y: "22%" },
          { label: "Newton", x: "38%", y: "48%" },
          { label: "Orchard Rd", x: "60%", y: "35%" },
          { label: "River Valley", x: "25%", y: "68%" },
          { label: "Marina Bay", x: "72%", y: "60%" },
        ].map((l) => (
          <div
            key={l.label}
            className="absolute text-[8px] font-medium text-slate-500/70 pointer-events-none"
            style={{ left: l.x, top: l.y }}
          >
            {l.label}
          </div>
        ))}

        {/* TECHNICIAN POSITION (YOU) - Moving when on-way */}
        {jobStatus === "on-way" && (
          <motion.div
            animate={{
              left: ["18%", "30%", "45%", "60%", "68%"],
              top: ["82%", "75%", "60%", "35%", "22%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute z-20"
            style={{ transform: "translate(-50%, -50%)" }}
          >
            <div className="relative">
              <motion.div
                className="absolute -inset-4 bg-blue-500 rounded-full opacity-30"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-xl border-3 border-white">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap shadow-lg">
                🚗 You
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-600 rotate-45" />
              </div>
            </div>
          </motion.div>
        )}

        {/* TECHNICIAN STATIC POSITION when accepted/idle */}
        {(jobStatus === "accepted" || jobStatus === "idle") && (
          <div
            className="absolute left-[18%] top-[82%] z-20"
            style={{ transform: "translate(-50%, -50%)" }}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-xl border-3 border-white">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap shadow-lg">
                📍 You
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-600 rotate-45" />
              </div>
            </div>
          </div>
        )}

        {/* TECHNICIAN AT CUSTOMER (arrived/in-progress) */}
        {(jobStatus === "arrived" ||
          jobStatus === "in-progress") && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute left-[68%] top-[18%] z-20"
            style={{ transform: "translate(-50%, -50%)" }}
          >
            <div className="relative">
              <motion.div
                className="absolute -inset-5 bg-emerald-500 rounded-full"
                animate={{
                  scale: [1, 1.6, 1],
                  opacity: [0.2, 0, 0.2],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center shadow-xl border-3 border-white">
                <Wrench className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        )}

        {/* CUSTOMER HOME LOCATION */}
        <div
          className="absolute left-[68%] top-[18%] z-10"
          style={{ transform: "translate(-50%, -100%)" }}
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="relative">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap shadow-lg flex items-center gap-1">
                <Home className="w-3 h-3" />
                {customerDetails.name}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rotate-45" />
              </div>
              <MapPin className="w-8 h-8 text-red-500 fill-red-500 drop-shadow-lg" />
            </div>
          </motion.div>
        </div>
      </div>

      {showQuotationAcceptedNotification && (
        <div className="absolute top-[calc(env(safe-area-inset-top)+5.5rem)] left-4 right-4 z-40">
          <div className="bg-emerald-600 text-white rounded-2xl shadow-xl px-4 py-3 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold">
                Customer accepted your quotation
              </p>
              <p className="text-xs text-emerald-50">
                Job payout updated to $
                {displayedPayout.toFixed(2)}.
              </p>
            </div>
          </div>
        </div>
      )}
      {showQuotationRejectedNotification && (
        <div className="absolute top-[calc(env(safe-area-inset-top)+5.5rem)] left-4 right-4 z-40">
          <div className="bg-red-600 text-white rounded-2xl shadow-xl px-4 py-3 flex items-start gap-3">
            <X className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold">
                Customer declined your quotation
              </p>
              <p className="text-xs text-red-50">
                {rejectionReason}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* === FLOATING HEADER === */}
      <header className="px-4 pt-[calc(env(safe-area-inset-top)+2.25rem)] pb-2 flex items-center justify-between relative z-30">
        <button
          onClick={onBack}
          className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md border border-slate-200 backdrop-blur-md"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>

        {/* Distance/ETA Badge */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg px-4 py-2 flex items-center gap-2.5 border border-slate-200">
          <Navigation2 className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider">
              Distance
            </p>
            <p className="text-sm font-black text-slate-900 leading-none">
              {job.distance}
            </p>
          </div>
        </div>

        <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md border border-slate-200 backdrop-blur-md">
          <Navigation2 className="w-5 h-5 text-slate-700" />
        </button>
      </header>

      {/* === DRAGGABLE BOTTOM SHEET === */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.12)] flex flex-col"
        style={{ height: sheetHeightStyle }}
      >
        {/* Drag Handle */}
        <motion.div
          className="cursor-grab active:cursor-grabbing touch-none select-none"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0}
          dragMomentum={false}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onClick={() => {
            if (sheetSnap <= SNAP_PEEK) snapTo(SNAP_MID);
          }}
        >
          <div className="flex flex-col items-center pt-2 pb-1">
            <div className="w-10 h-1 bg-slate-300 rounded-full mb-2" />
          </div>

          {/* Peek bar: Status + Customer name */}
          <div className="px-4 pb-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-slate-900 truncate">
                {customerDetails.name}
              </p>
              <p className="text-xs text-slate-500">
                {job.issue}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-black text-emerald-600">
                ${displayedPayout.toFixed(2)}
              </p>
              {job.duration && (
                <p className="text-[10px] text-slate-500">
                  {job.duration}
                </p>
              )}
            </div>
            <ChevronUp
              className={clsx(
                "w-5 h-5 text-slate-400 shrink-0 transition-transform",
                sheetSnap >= SNAP_MID && "rotate-180",
              )}
            />
          </div>
        </motion.div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-24 no-scrollbar overscroll-contain">
          {/* Status badges */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {job.priority === "urgent" && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-full uppercase">
                <AlertCircle className="w-3 h-3" /> Urgent
              </span>
            )}
            {jobStatus !== "idle" && (
              <span
                className={clsx(
                  "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase",
                  jobStatus === "on-way"
                    ? "text-blue-600 bg-blue-50"
                    : jobStatus === "arrived"
                      ? "text-emerald-600 bg-emerald-50"
                      : jobStatus === "in-progress"
                        ? "text-purple-600 bg-purple-50"
                        : "text-slate-600 bg-slate-100",
                )}
              >
                {jobStatus === "accepted"
                  ? "Accepted"
                  : jobStatus === "on-way"
                    ? "En Route"
                    : jobStatus === "arrived"
                      ? "On Site"
                      : "In Progress"}
              </span>
            )}
          </div>

          {/* Contact Buttons */}
          {!isAvailable && (
            <div className="flex gap-3 mb-5">
              <button className="flex-1 bg-blue-50 text-blue-600 py-3.5 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm active:scale-[0.98] transition-transform">
                <Phone className="w-4 h-4" /> Call
              </button>
              <button className="flex-1 bg-blue-50 text-blue-600 py-3.5 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm active:scale-[0.98] transition-transform">
                <MessageSquare className="w-4 h-4" /> Message
              </button>
            </div>
          )}

          {/* Job Details */}
          <div className="space-y-3 mb-5">
            <h3 className="font-bold text-slate-900 text-sm mb-3">
              Job Details
            </h3>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  Location
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {customerDetails.address}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  Time
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {job.time}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <Zap className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  Issue
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {customerDetails.issue}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <Fan className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  AC Details
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {customerDetails.acBrand} -{" "}
                  {customerDetails.numUnits} unit
                  {customerDetails.numUnits > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <Wrench className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  Unit Type
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {job.unitType}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <MessageSquareText className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  Customer Notes
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {customerDetails.comments}
                </p>
              </div>
            </div>
          </div>

          {/* Line Items Section - Only after service starts */}
          {!isAvailable && jobStatus === "in-progress" && (
            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 text-sm">
                  Quotation Line Items
                </h3>
                <button
                  onClick={() => setShowAddLineItem(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Line Item
                </button>
              </div>

              {lineItems.length === 0 ? (
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-slate-500">
                    No line items added yet. Click "Add Line
                    Item" to start building a quotation.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pb-24">
                  {lineItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {item.service}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.units} unit
                          {item.units > 1 ? "s" : ""}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        ${item.price.toFixed(2)}
                      </p>
                      <button
                        onClick={() =>
                          handleRemoveLineItem(item.id)
                        }
                        className="w-7 h-7 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
                    <p className="text-sm font-bold text-slate-900">
                      Total
                    </p>
                    <p className="text-lg font-black text-blue-600">
                      ${totalQuotation.toFixed(2)}
                    </p>
                  </div>

                  {quotationAccepted ? (
                    <button
                      disabled
                      className="w-full py-3 bg-emerald-100 text-emerald-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <CheckCircle2 className="w-4 h-4" />{" "}
                      Quotation Accepted
                    </button>
                  ) : quotationRejected ? (
                    <>
                      <button
                        disabled
                        className="w-full py-3 bg-red-100 text-red-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        <X className="w-4 h-4" />{" "}
                        Quotation Rejected
                      </button>
                      <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-xs font-semibold text-red-900 mb-1">Customer's Reason:</p>
                        <p className="text-xs text-red-700">{rejectionReason}</p>
                      </div>
                    </>
                  ) : quotationSent ? (
                    <button
                      disabled
                      className="w-full py-3 bg-slate-300 text-slate-600 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <CheckCircle2 className="w-4 h-4" />{" "}
                      Quotation Sent
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        setShowQuotationConfirm(true)
                      }
                      className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                      <Send className="w-4 h-4" /> Send
                      Quotation to Customer
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          {/* === ACTION BUTTONS === */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            {isAvailable && jobStatus === "idle" ? (
              <div className="flex gap-3">
                <button
                  onClick={onBack}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-semibold active:scale-[0.98] transition-transform"
                >
                  Reject
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold shadow-lg active:scale-[0.98] transition-transform"
                >
                  Accept Job
                </button>
              </div>
            ) : jobStatus === "accepted" ? (
              <div className="flex gap-3">
                <button
                  onClick={onBack}
                  className="py-3.5 px-5 bg-red-50 text-red-600 rounded-xl font-semibold border border-red-200 active:scale-[0.98] transition-transform"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={handleOnMyWay}
                  className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  <Car className="w-5 h-5" /> On My Way
                </button>
              </div>
            ) : jobStatus === "on-way" ? (
              <button
                onClick={handleArrived}
                className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <CheckCircle2 className="w-5 h-5" /> I Have
                Arrived
              </button>
            ) : jobStatus === "arrived" ? (
              <button
                onClick={handleStartService}
                className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <CheckCircle2 className="w-5 h-5" /> Start
                Service
              </button>
            ) : jobStatus === "in-progress" ? (
              <button
                onClick={handleJobComplete}
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <CheckCircle2 className="w-5 h-5" /> Complete
                Job
              </button>
            ) : null}
          </div>
        </div>
      </motion.div>

      {/* Add Line Item Modal */}
      {showAddLineItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Add Line Item
            </h3>

            <div className="mb-4">
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                Select Service
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {serviceOptions.map((service) => (
                  <button
                    key={service.id}
                    onClick={() =>
                      setSelectedService(service.id)
                    }
                    className={clsx(
                      "w-full p-3 rounded-lg border transition-all flex items-center justify-between text-left",
                      selectedService === service.id
                        ? "bg-blue-50 border-blue-500"
                        : "bg-white border-slate-200 hover:border-blue-300",
                    )}
                  >
                    <span
                      className={clsx(
                        "font-medium text-sm",
                        selectedService === service.id
                          ? "text-blue-900"
                          : "text-slate-700",
                      )}
                    >
                      {service.label}
                    </span>
                    <span
                      className={clsx(
                        "text-sm font-bold",
                        selectedService === service.id
                          ? "text-blue-600"
                          : "text-slate-500",
                      )}
                    >
                      ${service.getPriceForUnits(1).toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                Number of Units
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setSelectedUnits(
                      Math.max(1, selectedUnits - 1),
                    )
                  }
                  disabled={selectedUnits <= 1}
                  className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center disabled:opacity-50"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedUnits}
                  </p>
                  <p className="text-xs text-slate-500">
                    unit{selectedUnits > 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setSelectedUnits(
                      Math.min(10, selectedUnits + 1),
                    )
                  }
                  disabled={selectedUnits >= 10}
                  className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddLineItem(false);
                  setSelectedService("");
                  setSelectedUnits(1);
                }}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLineItem}
                disabled={!selectedService}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Item
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Quotation Confirmation Modal */}
      {showQuotationConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
              Send Quotation
            </h3>
            <p className="text-sm text-slate-600 text-center mb-6">
              Request will be sent to customer for review. Are
              you sure?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowQuotationConfirm(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm"
              >
                No, cancel
              </button>
              <button
                onClick={() => {
                  setShowQuotationConfirm(false);
                  setQuotationSent(true);
                }}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm"
              >
                Yes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Conflict Warning Modal */}
      {showConflictWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
              Schedule Conflict
            </h3>
            <p className="text-sm text-slate-600 text-center mb-6">
              You already have a job booked at this time.
              Accepting this job would create an overlapping
              schedule.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConflictWarning(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  setShowConflictWarning(false);
                  if (onAccept) onAccept(job);
                  setJobStatus("accepted");
                  onBack();
                }}
                className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-semibold text-sm"
              >
                Accept Anyway
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}