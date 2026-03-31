import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate, PanInfo } from "motion/react";
import {
  ArrowLeft, MapPin, Navigation, Phone, MessageSquare, Clock,
  Wrench, User, FileText, Car, CheckCircle2, AlertCircle, X,
  ChevronLeft, Zap, Fan, MessageSquareText, Home, Navigation2, ChevronDown, ChevronUp,
  Route,
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
}

interface TechJobViewProps {
  job: JobData;
  isAvailable: boolean;
  onBack: () => void;
  onAccept?: (job: JobData) => void;
  acceptedJobs?: JobData[];
}

// Route points for technician -> customer path
const ROUTE_POINTS = [
  { x: 20, y: 78 },
  { x: 24, y: 68 },
  { x: 30, y: 58 },
  { x: 37, y: 50 },
  { x: 42, y: 43 },
  { x: 50, y: 36 },
  { x: 56, y: 30 },
  { x: 61, y: 25 },
  { x: 66, y: 22 },
];

const TECH_START = { x: 20, y: 78 };
const CUSTOMER_LOC = { x: 72, y: 20 };

// Snap points for technician bottom sheet
const SNAP_PEEK = 14;  // Minimal bar with customer name + action
const SNAP_MID = 45;   // Default with job info
const SNAP_FULL = 80;  // Full details

// Status labels
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dotColor: string }> = {
  "idle":        { label: "New Job",     color: "text-slate-600",   bg: "bg-slate-100",   dotColor: "bg-slate-400" },
  "accepted":    { label: "Accepted",    color: "text-indigo-600",  bg: "bg-indigo-50",   dotColor: "bg-indigo-500" },
  "on-way":      { label: "En Route",    color: "text-blue-600",    bg: "bg-blue-50",     dotColor: "bg-blue-500" },
  "arrived":     { label: "On Site",     color: "text-emerald-600", bg: "bg-emerald-50",  dotColor: "bg-emerald-500" },
  "in-progress": { label: "In Progress", color: "text-purple-600",  bg: "bg-purple-50",   dotColor: "bg-purple-500" },
  "completed":   { label: "Completed",   color: "text-emerald-600", bg: "bg-emerald-50",  dotColor: "bg-emerald-500" },
};

export default function TechJobView({ job, isAvailable, onBack, onAccept, acceptedJobs = [] }: TechJobViewProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [jobStatus, setJobStatus] = useState<"idle" | "accepted" | "on-way" | "arrived" | "in-progress" | "completed">(
    isAvailable ? "idle" : "accepted"
  );
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [techPos, setTechPos] = useState(0);
  const [eta, setEta] = useState(12);

  const [sheetSnap, setSheetSnap] = useState<number>(SNAP_PEEK);
  const sheetHeight = useMotionValue(SNAP_PEEK);
  const sheetHeightStyle = useTransform(sheetHeight, (v) => `${v}%`);

  // Check for time conflicts
  const hasTimeConflict = () => {
    if (!isAvailable) return false;
    return acceptedJobs.some((aj) => {
      if (aj.time === "ASAP" || job.time === "ASAP") return false;
      return aj.time === job.time && aj.scheduledDate === job.scheduledDate;
    });
  };

  const getContainerHeight = () => {
    return containerRef.current?.clientHeight || 700;
  };

  const snapTo = (pct: number) => {
    setSheetSnap(pct);
    animate(sheetHeight, pct, { type: "spring", damping: 30, stiffness: 350 });
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const velocity = info.velocity.y;
    const currentPct = sheetHeight.get();

    if (velocity > 300) {
      if (currentPct <= SNAP_MID) snapTo(SNAP_PEEK);
      else snapTo(SNAP_MID);
    } else if (velocity < -300) {
      if (currentPct >= SNAP_MID) snapTo(SNAP_FULL);
      else snapTo(SNAP_MID);
    } else {
      const snaps = [SNAP_PEEK, SNAP_MID, SNAP_FULL];
      const nearest = snaps.reduce((a, b) =>
        Math.abs(b - currentPct) < Math.abs(a - currentPct) ? b : a
      );
      snapTo(nearest);
    }
  };

  const handleDrag = (_: any, info: PanInfo) => {
    const h = getContainerHeight();
    const deltaPct = -(info.delta.y / h) * 100;
    const newVal = Math.max(SNAP_PEEK - 2, Math.min(SNAP_FULL + 5, sheetHeight.get() + deltaPct));
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
  };

  const handleOnMyWay = () => {
    setJobStatus("on-way");
    snapTo(SNAP_PEEK);
  };

  const handleArrived = () => setJobStatus("arrived");
  const handleStartService = () => setJobStatus("in-progress");

  // Animate technician along route when on-way
  useEffect(() => {
    if (jobStatus !== "on-way") return;
    const timer = setInterval(() => {
      setTechPos((p) => (p >= ROUTE_POINTS.length - 1 ? p : p + 1));
    }, 2200);
    return () => clearInterval(timer);
  }, [jobStatus]);

  // ETA countdown
  useEffect(() => {
    if (jobStatus === "arrived" || jobStatus === "in-progress" || jobStatus === "completed") {
      setEta(0);
      return;
    }
    if (jobStatus !== "on-way") return;
    const t = setInterval(() => setEta((e) => Math.max(0, e - 1)), 60000 / 4);
    return () => clearInterval(t);
  }, [jobStatus]);

  const currentTechPos = jobStatus === "on-way"
    ? ROUTE_POINTS[Math.min(techPos, ROUTE_POINTS.length - 1)]
    : (jobStatus === "arrived" || jobStatus === "in-progress") ? CUSTOMER_LOC : TECH_START;

  const customerDetails = {
    name: job.customer,
    phone: job.phone || "+65 9123 4567",
    address: job.location,
    acBrand: job.acBrand || (job.unitType?.split(" ")[0] || "Daikin"),
    numUnits: job.numUnits || 1,
    issue: job.issue,
    comments: job.comments || "AC stopped cooling suddenly. No unusual sounds. Unit is about 3 years old.",
  };

  const routePath = ROUTE_POINTS.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + ` L ${CUSTOMER_LOC.x} ${CUSTOMER_LOC.y}`;

  const showRoute = jobStatus === "accepted" || jobStatus === "on-way";

  // Direction arrow positions along the route
  const arrowPositions = [
    { x: 27, y: 63, angle: -55 },
    { x: 44, y: 40, angle: -45 },
    { x: 58, y: 28, angle: -35 },
  ];

  const statusConf = STATUS_CONFIG[jobStatus] || STATUS_CONFIG["idle"];

  return (
    <div ref={containerRef} className="absolute -top-14 -bottom-20 left-0 right-0 z-40 flex flex-col bg-slate-50 overflow-hidden">
      {/* === FULL-SCREEN MAP === */}
      <div
        className="absolute inset-0 z-0"
        onClick={() => {
          if (!isAvailable && sheetSnap > SNAP_PEEK) snapTo(SNAP_PEEK);
        }}
      >
        {/* Map background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-slate-50 to-emerald-50/60" />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.06]">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={`h${i}`} className="absolute w-full border-b border-slate-400" style={{ top: `${i * 4}%` }} />
          ))}
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={`v${i}`} className="absolute h-full border-r border-slate-400" style={{ left: `${i * 4}%` }} />
          ))}
        </div>

        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Buildings / blocks */}
          <rect x="8" y="15" width="18" height="12" fill="#e2e8f0" rx="2" opacity="0.4" />
          <rect x="32" y="8" width="22" height="20" fill="#e2e8f0" rx="3" opacity="0.4" />
          <rect x="72" y="28" width="22" height="18" fill="#dcfce7" rx="4" opacity="0.5" />
          <rect x="15" y="55" width="25" height="18" fill="#e2e8f0" rx="2" opacity="0.4" />
          <rect x="60" y="65" width="25" height="15" fill="#e2e8f0" rx="2" opacity="0.4" />
          <rect x="5" y="35" width="10" height="12" fill="#dbeafe" rx="2" opacity="0.4" />
          <rect x="82" y="8" width="12" height="14" fill="#e2e8f0" rx="2" opacity="0.35" />
          <rect x="48" y="70" width="10" height="10" fill="#dcfce7" rx="2" opacity="0.4" />

          {/* Background roads */}
          <path d="M 0 30 Q 30 25, 60 35 T 100 28" stroke="#cbd5e1" strokeWidth="2.5" fill="none" />
          <path d="M 10 0 Q 15 30, 20 50 T 25 100" stroke="#cbd5e1" strokeWidth="2" fill="none" />
          <path d="M 50 0 Q 55 20, 52 50 T 58 100" stroke="#cbd5e1" strokeWidth="3" fill="none" />
          <path d="M 0 65 Q 40 60, 70 70 T 100 62" stroke="#cbd5e1" strokeWidth="2" fill="none" />
          <path d="M 80 0 Q 75 30, 78 60 T 82 100" stroke="#cbd5e1" strokeWidth="2.5" fill="none" />
          <path d="M 0 50 Q 20 48, 40 52 T 100 48" stroke="#cbd5e1" strokeWidth="1.5" fill="none" />

          {/* Route line to customer */}
          {showRoute && (
            <>
              {/* Route shadow */}
              <motion.path
                d={routePath}
                stroke="#93c5fd"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
                opacity="0.3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
              {/* Route base line */}
              <motion.path
                d={routePath}
                stroke="#3b82f6"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              {/* Animated dashes for direction */}
              <motion.path
                d={routePath}
                stroke="#60a5fa"
                strokeWidth="2"
                fill="none"
                strokeDasharray="3 8"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              {/* Traveled route */}
              {jobStatus === "on-way" && techPos > 0 && (
                <path
                  d={ROUTE_POINTS.slice(0, techPos + 1).map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")}
                  stroke="#1d4ed8"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              )}
              {/* Direction arrows */}
              {arrowPositions.map((pos, i) => (
                <g key={`arrow-${i}`} transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.angle})`}>
                  <motion.polygon
                    points="-1.5,2 0,-2 1.5,2"
                    fill="#2563eb"
                    opacity="0.7"
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                  />
                </g>
              ))}
            </>
          )}
        </svg>

        {/* Area labels */}
        {[
          { label: "Novena", x: "10%", y: "18%" },
          { label: "Newton", x: "36%", y: "46%" },
          { label: "Orchard Rd", x: "62%", y: "38%" },
          { label: "River Valley", x: "20%", y: "62%" },
          { label: "Marina Bay", x: "68%", y: "58%" },
        ].map((l) => (
          <div key={l.label} className="absolute text-[8px] font-medium text-slate-400/60 pointer-events-none select-none" style={{ left: l.x, top: l.y }}>
            {l.label}
          </div>
        ))}

        {/* ===== TECHNICIAN POSITION (YOU) - Moving when on-way ===== */}
        {jobStatus === "on-way" && (
          <motion.div
            animate={{
              left: `${currentTechPos.x}%`,
              top: `${currentTechPos.y}%`,
            }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute z-20"
            style={{ transform: "translate(-50%, -50%)" }}
          >
            <div className="relative">
              {/* Pulse rings */}
              <motion.div
                className="absolute -inset-5 bg-blue-500 rounded-full"
                animate={{ scale: [1, 2, 1], opacity: [0.25, 0, 0.25] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute -inset-3 bg-blue-400 rounded-full"
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              />
              {/* Vehicle icon */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-xl border-[3px] border-white">
                <Car className="w-6 h-6 text-white" />
              </div>
              {/* Label */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap shadow-lg flex items-center gap-1">
                <Car className="w-3 h-3" />
                You
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-blue-600 rotate-45 rounded-sm" />
              </div>
            </div>
          </motion.div>
        )}

        {/* ===== TECHNICIAN STATIC (idle/accepted) ===== */}
        {(jobStatus === "accepted" || jobStatus === "idle") && (
          <div className="absolute z-20" style={{ left: `${TECH_START.x}%`, top: `${TECH_START.y}%`, transform: "translate(-50%, -50%)" }}>
            <div className="relative">
              <motion.div
                className="absolute -inset-4 bg-blue-400 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-xl border-[3px] border-white">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap shadow-lg flex items-center gap-1">
                📍 You
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-blue-600 rotate-45 rounded-sm" />
              </div>
            </div>
          </div>
        )}

        {/* ===== TECHNICIAN AT CUSTOMER (arrived/in-progress) ===== */}
        {(jobStatus === "arrived" || jobStatus === "in-progress") && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute z-20"
            style={{ left: `${CUSTOMER_LOC.x}%`, top: `${CUSTOMER_LOC.y}%`, transform: "translate(-50%, -50%)" }}
          >
            <div className="relative">
              <motion.div
                className="absolute -inset-5 bg-emerald-500 rounded-full"
                animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center shadow-xl border-[3px] border-white">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap shadow-lg flex items-center gap-1">
                <Wrench className="w-3 h-3" />
                {jobStatus === "arrived" ? "On Site" : "Working"}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-emerald-600 rotate-45 rounded-sm" />
              </div>
            </div>
          </motion.div>
        )}

        {/* ===== CUSTOMER HOME LOCATION ===== */}
        <div className="absolute z-10" style={{ left: `${CUSTOMER_LOC.x}%`, top: `${CUSTOMER_LOC.y}%`, transform: "translate(-50%, -100%)" }}>
          <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <div className="relative">
              <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-gradient-to-r from-rose-500 to-red-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap shadow-lg flex items-center gap-1.5">
                <Home className="w-3 h-3" />
                {customerDetails.name}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-red-600 rotate-45 rounded-sm" />
              </div>
              <MapPin className="w-9 h-9 text-red-500 fill-red-500 drop-shadow-lg" />
            </div>
          </motion.div>
        </div>

        {/* ===== FLOATING DISTANCE / ETA BADGE ON MAP ===== */}
        {jobStatus === "on-way" && eta > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute z-15 pointer-events-none"
            style={{ left: "42%", top: "52%", transform: "translate(-50%, -50%)" }}
          >
            <div className="bg-white/90 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg border border-blue-200">
              <p className="text-[10px] font-bold text-blue-700 flex items-center gap-1">
                <Route className="w-3 h-3" />
                {job.distance} · {eta} min
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* === FLOATING HEADER === */}
      <header className="px-5 pt-16 pb-2 flex flex-col gap-3 relative z-30 pointer-events-none">
        <div className="flex items-center justify-between w-full pointer-events-auto">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white/95 rounded-full flex items-center justify-center shadow-md border border-slate-200/80 backdrop-blur-md active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>

          <button className="w-10 h-10 bg-white/95 rounded-full flex items-center justify-center shadow-md border border-slate-200/80 backdrop-blur-md active:scale-95 transition-transform text-slate-700">
            <Navigation2 className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Navigation Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 p-3.5 pointer-events-auto"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-50 rounded-full flex items-center justify-center relative shrink-0">
                <Navigation2 className="w-5 h-5 text-blue-600" />
                {(jobStatus === "on-way" || jobStatus === "accepted") && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full animate-pulse border-2 border-white" />
                )}
              </div>

              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-sm leading-tight truncate">
                  To: {customerDetails.name}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[140px]">
                  {customerDetails.address}
                </p>
              </div>
            </div>

            <div className="text-right pl-3 border-l border-slate-200/80 shrink-0">
              {jobStatus === "on-way" && eta > 0 ? (
                <>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">ETA</p>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xl font-black text-blue-600 leading-none tabular-nums">{eta}</span>
                    <span className="text-[10px] font-bold text-blue-500">min</span>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Dist</p>
                  <p className="text-lg font-black text-blue-600 leading-tight">{job.distance}</p>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </header>

      {/* === DRAGGABLE BOTTOM SHEET === */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.1)] flex flex-col"
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
            else if (sheetSnap >= SNAP_MID) snapTo(SNAP_PEEK);
          }}
        >
          <div className="flex flex-col items-center pt-2.5 pb-1">
            <div className="w-10 h-1 bg-slate-300 rounded-full" />
          </div>

          {/* Peek bar: Status + Customer name + payout */}
          <div className="px-4 pb-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-base font-bold text-slate-900 truncate">
                  {customerDetails.name}
                </p>
                {jobStatus !== "idle" && (
                  <span className={clsx("text-[9px] font-bold px-2 py-0.5 rounded-full", statusConf.color, statusConf.bg)}>
                    {statusConf.label}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate">{job.issue} · {job.unitType}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-black text-emerald-600">{job.payout}</p>
              {job.duration && <p className="text-[10px] text-slate-500">{job.duration}</p>}
            </div>
            <ChevronUp className={clsx("w-5 h-5 text-slate-400 shrink-0 transition-transform", sheetSnap >= SNAP_MID && "rotate-180")} />
          </div>
        </motion.div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-24 no-scrollbar">
          {/* Priority + Status badges */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {job.priority === "urgent" && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-full uppercase">
                <AlertCircle className="w-3 h-3" /> Urgent
              </span>
            )}
          </div>

          {/* Contact Buttons */}
          {!isAvailable && (
            <div className="flex gap-3 mb-5">
              <button className="flex-1 bg-blue-50 text-blue-600 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm active:scale-[0.98] transition-transform border border-blue-100">
                <Phone className="w-4 h-4" /> Call
              </button>
              <button className="flex-1 bg-blue-50 text-blue-600 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm active:scale-[0.98] transition-transform border border-blue-100">
                <MessageSquare className="w-4 h-4" /> Message
              </button>
            </div>
          )}

          {/* Job Details */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Job Details</h3>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Location</p>
                <p className="text-sm font-medium text-slate-900">{customerDetails.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Time</p>
                <p className="text-sm font-medium text-slate-900">{job.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <Zap className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Issue</p>
                <p className="text-sm font-medium text-slate-900">{customerDetails.issue}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <Fan className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">AC Details</p>
                <p className="text-sm font-medium text-slate-900">{customerDetails.acBrand} - {customerDetails.numUnits} unit{customerDetails.numUnits > 1 ? "s" : ""}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <Wrench className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Unit Type</p>
                <p className="text-sm font-medium text-slate-900">{job.unitType}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <MessageSquareText className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Customer Notes</p>
                <p className="text-sm text-slate-700 leading-relaxed">{customerDetails.comments}</p>
              </div>
            </div>

            {/* === ACTION BUTTONS === */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              {isAvailable && jobStatus === "idle" ? (
                <div className="flex gap-3">
                  <button onClick={onBack} className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-semibold active:scale-[0.98] transition-transform">
                    Decline
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
                  <button onClick={onBack} className="py-3.5 px-5 bg-red-50 text-red-600 rounded-xl font-semibold border border-red-200 active:scale-[0.98] transition-transform">
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
                  <CheckCircle2 className="w-5 h-5" /> I Have Arrived
                </button>
              ) : jobStatus === "arrived" ? (
                <button
                  onClick={handleStartService}
                  className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  <CheckCircle2 className="w-5 h-5" /> Start Service
                </button>
              ) : jobStatus === "completed" ? (
                <button
                  onClick={onBack}
                  className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  Back to Dashboard
                </button>
              ) : (
                <button
                  onClick={() => setShowCompleteConfirm(true)}
                  className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  <CheckCircle2 className="w-5 h-5" /> Complete Job
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

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
            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Schedule Conflict</h3>
            <p className="text-sm text-slate-600 text-center mb-6">
              You already have a job booked at this time. Accepting this job would create an overlapping schedule.
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
                }}
                className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-semibold text-sm"
              >
                Accept Anyway
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Complete Job Confirmation Modal */}
      {showCompleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Complete Job</h3>
            <p className="text-sm text-slate-600 text-center mb-6">
              Are you sure you want to mark this job as completed?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCompleteConfirm(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCompleteConfirm(false);
                  setJobStatus("completed");
                }}
                className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold text-sm"
              >
                Complete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
