import { motion, AnimatePresence, useMotionValue, useTransform, animate, PanInfo } from "motion/react";
import {
  ArrowLeft, Navigation, Phone, MessageCircle, MapPin, CheckCircle2,
  Wrench, Calendar, Clock, Car, Shield, Star, ChevronUp, ChevronDown,
  Package, UserCheck, CircleDot, Home, GripHorizontal, Navigation2,
  Bike, Route,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { clsx } from "clsx";
import { useBooking, BookingStatus } from "../../context/BookingContext";
import { PushNotification } from "../../components/PushNotification";

const STATUS_FLOW: BookingStatus[] = [
  "confirmed",
  "assigned",
  "en-route",
  "arriving",
  "arrived",
  "in-progress",
  "completed",
];

const STATUS_META: Record<BookingStatus, { label: string; desc: string; color: string; bg: string; dotColor: string }> = {
  confirmed: { label: "Booking Confirmed", desc: "Looking for the best technician nearby", color: "text-blue-600", bg: "bg-blue-500", dotColor: "bg-blue-500" },
  assigned: { label: "Technician Assigned", desc: "David Tan accepted your job", color: "text-indigo-600", bg: "bg-indigo-500", dotColor: "bg-indigo-500" },
  "en-route": { label: "On the Way", desc: "Technician is heading to your location", color: "text-blue-600", bg: "bg-blue-500", dotColor: "bg-blue-500" },
  arriving: { label: "Almost There", desc: "Arriving in under 2 minutes", color: "text-amber-600", bg: "bg-amber-500", dotColor: "bg-amber-500" },
  arrived: { label: "Technician Arrived", desc: "David is at your doorstep", color: "text-emerald-600", bg: "bg-emerald-500", dotColor: "bg-emerald-600" },
  "in-progress": { label: "Service In Progress", desc: "Working on your AC units", color: "text-purple-600", bg: "bg-purple-500", dotColor: "bg-purple-500" },
  completed: { label: "Service Completed", desc: "All done! Your AC is running great", color: "text-emerald-600", bg: "bg-emerald-500", dotColor: "bg-emerald-500" },
};

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

const DEST = { x: 72, y: 20 };
const START = { x: 20, y: 78 };

// Sheet snap points as percentage of container height (from bottom)
const SNAP_PEEK = 12;  // Just handle + status + ETA
const SNAP_MID = 42;   // Tech card + progress
const SNAP_FULL = 78;  // Full details

export default function JobTracking() {
  const navigate = useNavigate();
  const { currentBooking, updateBookingStatus } = useBooking();
  const [status, setStatus] = useState<BookingStatus>(currentBooking?.status || "confirmed");
  const [techPosition, setTechPosition] = useState(0);
  const [eta, setEta] = useState(15);
  const [distance, setDistance] = useState("4.2");
  const [notification, setNotification] = useState<{ show: boolean; title: string; message: string }>({ show: false, title: "", message: "" });
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const isMoving = status === "en-route" || status === "arriving";
  const showMap = status !== "completed";
  const canComplete = status === "arrived" || status === "in-progress";
  const [customerConfirmed, setCustomerConfirmed] = useState(false);

  // Simulate technician confirming after customer confirms
  useEffect(() => {
    if (!customerConfirmed) return;
    const timer = setTimeout(() => {
      setStatus("completed");
      updateBookingStatus("completed");
      setNotification({ show: true, title: "Service Completed!", message: "Both you and the technician have confirmed. Rate your experience." });
      setTimeout(() => setNotification((n) => ({ ...n, show: false })), 4000);
    }, 3000);
    return () => clearTimeout(timer);
  }, [customerConfirmed]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sheet height
  const [sheetSnap, setSheetSnap] = useState<number>(SNAP_PEEK);
  const sheetHeight = useMotionValue(SNAP_PEEK);
  const sheetHeightStyle = useTransform(sheetHeight, (v) => `${v}%`);

  const getContainerHeight = useCallback(() => {
    return containerRef.current?.clientHeight || 700;
  }, []);

  const snapTo = useCallback((pct: number) => {
    setSheetSnap(pct);
    animate(sheetHeight, pct, { type: "spring", damping: 30, stiffness: 350 });
  }, [sheetHeight]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
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
  }, [sheetHeight, snapTo]);

  const handleDrag = useCallback((_: any, info: PanInfo) => {
    const h = getContainerHeight();
    const deltaPct = -(info.delta.y / h) * 100;
    const newVal = Math.max(SNAP_PEEK - 2, Math.min(SNAP_FULL + 5, sheetHeight.get() + deltaPct));
    sheetHeight.set(newVal);
  }, [getContainerHeight, sheetHeight]);

  // Auto-progress through statuses for demo
  useEffect(() => {
    const schedule: { delay: number; status: BookingStatus; notif?: { title: string; message: string } }[] = [
      { delay: 3000, status: "assigned", notif: { title: "Technician Assigned", message: "David Tan has accepted your booking" } },
      { delay: 7000, status: "en-route", notif: { title: "On the Way!", message: "David is heading to your location. ETA 12 min." } },
      { delay: 22000, status: "arriving", notif: { title: "Almost There", message: "David will arrive in less than 2 minutes" } },
      { delay: 28000, status: "arrived", notif: { title: "Technician Arrived", message: "David is at your doorstep. Please open the door." } },
      { delay: 33000, status: "in-progress" },
    ];

    const timers = schedule.map((s) =>
      setTimeout(() => {
        setStatus(s.status);
        updateBookingStatus(s.status);
        if (s.notif) {
          setNotification({ show: true, ...s.notif });
          setTimeout(() => setNotification((n) => ({ ...n, show: false })), 4000);
        }
      }, s.delay)
    );

    return () => timers.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Animate technician movement along route
  useEffect(() => {
    if (!isMoving) return;
    timerRef.current = setInterval(() => {
      setTechPosition((p) => (p >= ROUTE_POINTS.length - 1 ? p : p + 1));
    }, 2000);
    return () => clearInterval(timerRef.current);
  }, [isMoving]);

  // ETA countdown
  useEffect(() => {
    if (status === "arrived" || status === "in-progress" || status === "completed") {
      setEta(0);
      setDistance("0");
      return;
    }
    const t = setInterval(() => {
      setEta((e) => Math.max(0, e - 1));
      setDistance((d) => {
        const val = parseFloat(d);
        return Math.max(0, val - 0.3).toFixed(1);
      });
    }, 60000 / 4);
    return () => clearInterval(t);
  }, [status]);

  const currentPos = ROUTE_POINTS[Math.min(techPosition, ROUTE_POINTS.length - 1)];
  const statusIndex = STATUS_FLOW.indexOf(status);
  const routePath = ROUTE_POINTS.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + ` L ${DEST.x} ${DEST.y}`;

  // Direction arrow positions along the route
  const arrowPositions = [
    { x: 27, y: 63, angle: -55 },
    { x: 44, y: 40, angle: -45 },
    { x: 58, y: 28, angle: -35 },
  ];

  // Completed view
  if (status === "completed") {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        <PushNotification show={notification.show} title={notification.title} message={notification.message} onDismiss={() => setNotification((n) => ({ ...n, show: false }))} />
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }} className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Service Complete!</h2>
          <p className="text-sm text-slate-500 text-center mb-8">Your AC maintenance has been completed successfully.</p>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 w-full mb-6">
            <p className="text-sm font-semibold text-slate-700 mb-3 text-center">Rate your experience</p>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} className="text-amber-400 hover:scale-110 transition-transform">
                  <Star className="w-8 h-8 fill-amber-400" />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
              <img src="https://images.unsplash.com/photo-1744853930655-52d02b83abb6?auto=format&fit=crop&w=150&q=80" alt="Tech" className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1">
                <p className="font-bold text-slate-900 text-sm">{currentBooking?.technician || "David Tan"}</p>
                <p className="text-xs text-slate-500">{currentBooking?.service || "General Maintenance"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">{currentBooking?.dateFormatted}</p>
                <p className="text-xs text-slate-500">{currentBooking?.time}</p>
              </div>
            </div>
          </div>

          <button onClick={() => navigate("/customer/home")} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg mb-3">
            Back to Home
          </button>
          <button onClick={() => navigate("/customer/history")} className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-medium">
            View History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      <PushNotification show={notification.show} title={notification.title} message={notification.message} onDismiss={() => setNotification((n) => ({ ...n, show: false }))} />

      {/* === FULL-SCREEN MAP === */}
      {showMap && (
        <div
          className="absolute inset-0 z-0"
          onClick={() => {
            if (sheetSnap > SNAP_PEEK) snapTo(SNAP_PEEK);
          }}
        >
          {/* Map background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-blue-50/40 to-slate-100" />

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

            {/* Route shadow (wide soft) */}
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

            {/* Route base (solid blue) */}
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

            {/* Animated moving dashes (direction indicator) */}
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

            {/* Traveled route (darker blue) */}
            {techPosition > 0 && (
              <path
                d={ROUTE_POINTS.slice(0, techPosition + 1).map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")}
                stroke="#1d4ed8"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {/* Direction arrows along route */}
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

          {/* ===== TECHNICIAN LIVE MARKER (Moving) ===== */}
          {(status === "en-route" || status === "arriving" || status === "assigned") && (
            <motion.div
              className="absolute z-20"
              animate={{ left: `${currentPos.x}%`, top: `${currentPos.y}%` }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              style={{ transform: "translate(-50%, -50%)" }}
            >
              <div className="relative">
                {/* Outer pulse ring */}
                <motion.div
                  className="absolute -inset-5 bg-blue-500 rounded-full"
                  animate={{ scale: [1, 2, 1], opacity: [0.25, 0, 0.25] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                {/* Inner pulse */}
                <motion.div
                  className="absolute -inset-3 bg-blue-400 rounded-full"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                />
                {/* Vehicle icon */}
                <div className="relative w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-xl border-[3px] border-white">
                  <Car className="w-5 h-5 text-white" />
                </div>
                {/* Tech name label */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap shadow-lg flex items-center gap-1">
                  <Car className="w-3 h-3" />
                  {currentBooking?.technician || "David"}
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-blue-600 rotate-45 rounded-sm" />
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== TECHNICIAN AT CUSTOMER (Arrived/In Progress) ===== */}
          {(status === "arrived" || status === "in-progress") && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute z-20"
              style={{ left: `${DEST.x}%`, top: `${DEST.y}%`, transform: "translate(-50%, -50%)" }}
            >
              <div className="relative">
                <motion.div className="absolute -inset-5 bg-emerald-500 rounded-full" animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0, 0.2] }} transition={{ duration: 2, repeat: Infinity }} />
                <div className="relative w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center shadow-xl border-[3px] border-white">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap shadow-lg flex items-center gap-1">
                  <Wrench className="w-3 h-3" />
                  {status === "arrived" ? "Arrived" : "Working"}
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-emerald-600 rotate-45 rounded-sm" />
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== CUSTOMER HOME MARKER ===== */}
          <div className="absolute z-10" style={{ left: `${DEST.x}%`, top: `${DEST.y}%`, transform: "translate(-50%, -100%)" }}>
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
              <div className="relative">
                {/* Label above */}
                <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-gradient-to-r from-rose-500 to-red-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap shadow-lg flex items-center gap-1.5">
                  <Home className="w-3 h-3" />
                  Your Home
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-red-600 rotate-45 rounded-sm" />
                </div>
                <MapPin className="w-9 h-9 text-red-500 fill-red-500 drop-shadow-lg" />
              </div>
            </motion.div>
          </div>

          {/* ===== START POINT MARKER ===== */}
          <div className="absolute z-10" style={{ left: `${START.x}%`, top: `${START.y}%`, transform: "translate(-50%, -50%)" }}>
            <div className="relative">
              <div className="w-4 h-4 bg-blue-400 rounded-full border-[2.5px] border-white shadow-md" />
            </div>
          </div>

          {/* ===== FLOATING DISTANCE BADGE ON MAP ===== */}
          {isMoving && parseFloat(distance) > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute z-15 pointer-events-none"
              style={{ left: "42%", top: "52%", transform: "translate(-50%, -50%)" }}
            >
              <div className="bg-white/90 backdrop-blur-md rounded-xl px-3 py-1.5 shadow-lg border border-blue-200">
                <p className="text-[10px] font-bold text-blue-700 flex items-center gap-1">
                  <Route className="w-3 h-3" />
                  {distance} km
                </p>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* === FLOATING HEADER === */}
      <header className="px-4 pt-14 pb-2 flex flex-col gap-3 relative z-30 pointer-events-none">
        <div className="flex items-center justify-between w-full pointer-events-auto">
          <button
            onClick={() => navigate("/customer/home")}
            className="w-10 h-10 bg-white/95 rounded-full flex items-center justify-center shadow-md border border-slate-200/80 backdrop-blur-md active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>

          <button className="w-10 h-10 bg-white/95 rounded-full flex items-center justify-center shadow-md border border-slate-200/80 backdrop-blur-md active:scale-95 transition-transform text-slate-700">
            <Navigation2 className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Status & ETA Card */}
        {showMap && status !== "completed" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 p-3.5 pointer-events-auto"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {statusIndex >= 1 ? (
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1744853930655-52d02b83abb6?auto=format&fit=crop&w=150&q=80"
                      alt="Technician"
                      className="w-11 h-11 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow">
                      <div className={clsx("w-3 h-3 rounded-full", STATUS_META[status].dotColor)} />
                    </div>
                  </div>
                ) : (
                  <div className="w-11 h-11 bg-slate-100 rounded-full flex items-center justify-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full" />
                  </div>
                )}

                <div>
                  <p className="font-bold text-slate-900 text-sm leading-tight">
                    {statusIndex >= 1 ? (currentBooking?.technician || "David Tan") : "Finding Tech..."}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className={clsx("w-1.5 h-1.5 rounded-full", STATUS_META[status].dotColor, isMoving && "animate-pulse")} />
                    <p className={clsx("text-[11px] font-semibold", STATUS_META[status].color)}>
                      {STATUS_META[status].label}
                    </p>
                  </div>
                </div>
              </div>

              {eta > 0 && isMoving && (
                <div className="text-right pl-3 border-l border-slate-200/80">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">ETA</p>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-2xl font-black text-blue-600 leading-none tabular-nums">{eta}</span>
                    <span className="text-[10px] font-bold text-blue-500">min</span>
                  </div>
                </div>
              )}

              {(status === "arrived" || status === "in-progress") && (
                <div className="pl-3 border-l border-slate-200/80">
                  <div className={clsx("px-2.5 py-1 rounded-lg text-[10px] font-bold", status === "arrived" ? "bg-emerald-50 text-emerald-700" : "bg-purple-50 text-purple-700")}>
                    {status === "arrived" ? "At Door" : "Working"}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </header>

      {/* === DRAGGABLE BOTTOM SHEET === */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.1)] flex flex-col"
        style={{ height: sheetHeightStyle }}
      >
        {/* Drag Handle Area */}
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

          {/* Compact peek bar */}
          <div className="px-4 pb-2.5 flex items-center gap-3">
            {statusIndex >= 1 && (
              <img
                src="https://images.unsplash.com/photo-1744853930655-52d02b83abb6?auto=format&fit=crop&w=150&q=80"
                alt="Tech"
                className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <motion.p
                key={status}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className={clsx("text-sm font-bold truncate", STATUS_META[status].color)}
              >
                {statusIndex >= 1
                  ? `${currentBooking?.technician || "David Tan"} · ${STATUS_META[status].label}`
                  : STATUS_META[status].label}
              </motion.p>
            </div>
            {eta > 0 && isMoving && (
              <div className="flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg shrink-0">
                <Clock className="w-3 h-3 text-blue-600" />
                <span className="text-sm font-black text-blue-600 tabular-nums">{eta}m</span>
              </div>
            )}
            {canComplete && !customerConfirmed && (
              <div className={clsx("w-2 h-2 rounded-full shrink-0 animate-pulse", status === "arrived" ? "bg-emerald-500" : "bg-purple-500")} />
            )}
            <ChevronUp className={clsx("w-4 h-4 text-slate-400 shrink-0 transition-transform", sheetSnap >= SNAP_MID && "rotate-180")} />
          </div>
        </motion.div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">
          {/* Status progress bar */}
          <div className="mb-4">
            <div className="flex items-center gap-1">
              {STATUS_FLOW.map((s, i) => {
                const isPast = i <= statusIndex;
                const isCurrent = i === statusIndex;
                return (
                  <div key={s} className="flex-1">
                    <motion.div
                      className={clsx(
                        "h-1.5 w-full rounded-full transition-colors",
                        isPast ? STATUS_META[status].bg : "bg-slate-200",
                        isCurrent && "animate-pulse"
                      )}
                      initial={false}
                      animate={{ opacity: isPast ? 1 : 0.4 }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[7px] text-slate-400">Confirmed</span>
              <span className="text-[7px] text-slate-400">En Route</span>
              <span className="text-[7px] text-slate-400">Arrived</span>
              <span className="text-[7px] text-slate-400">Done</span>
            </div>
          </div>

          {/* Technician Card */}
          {statusIndex >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-4"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1744853930655-52d02b83abb6?auto=format&fit=crop&w=150&q=80"
                    alt="David Tan"
                    className="w-11 h-11 rounded-full object-cover shadow-sm"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 fill-emerald-100" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm">{currentBooking?.technician || "David Tan"}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="flex items-center gap-0.5"><Wrench className="w-3 h-3" />Senior Tech</span>
                    <span className="text-amber-500 font-semibold">★ 4.9</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5"><Shield className="w-3 h-3" />Verified</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 active:scale-95 transition-transform">
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 active:scale-95 transition-transform">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {isMoving && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-200 flex items-center gap-3">
                  <Car className="w-3.5 h-3.5 text-slate-500" />
                  <p className="text-[11px] text-slate-600">White Toyota HiAce • <span className="font-semibold">SGP 4521 K</span></p>
                </div>
              )}
            </motion.div>
          )}

          {/* Searching animation */}
          {status === "confirmed" && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 flex items-center gap-3">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Finding a technician...</p>
                <p className="text-xs text-blue-600">Matching you with the best available tech</p>
              </div>
            </div>
          )}

          {/* Status-specific banners */}
          {status === "arrived" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-center mb-4">
              <UserCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
              <p className="text-sm font-semibold text-emerald-800">David has arrived!</p>
              <p className="text-[11px] text-emerald-600 mt-0.5">Please open your door to let the technician in.</p>
            </motion.div>
          )}

          {status === "in-progress" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-purple-50 border border-purple-200 rounded-xl p-3.5 text-center mb-4">
              <Wrench className="w-5 h-5 text-purple-600 mx-auto mb-1.5" />
              <p className="text-sm font-semibold text-purple-800">Service in progress</p>
              <p className="text-[11px] text-purple-600 mt-0.5">David is working on your AC units. ~30–45 min.</p>
            </motion.div>
          )}

          {/* Booking Details */}
          <div className="space-y-2.5 mb-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Booking Details</p>
            {[
              { icon: Calendar, label: "Date", value: currentBooking?.dateFormatted || "Mar 30, 2026" },
              { icon: Clock, label: "Time", value: currentBooking?.time || "09:00 - 12:00" },
              { icon: Package, label: "Service", value: `${currentBooking?.service || "General Maintenance"} (${currentBooking?.unit || "1 unit"})` },
              { icon: Home, label: "Location", value: "12 Orchard Blvd, Tower B" },
            ].map((d) => (
              <div key={d.label} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg">
                <d.icon className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-[9px] text-slate-400 uppercase">{d.label}</p>
                  <p className="text-xs font-medium text-slate-800">{d.value}</p>
                </div>
              </div>
            ))}
            {currentBooking?.isPremiumFree && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center gap-2 text-[11px] text-amber-800 font-semibold">
                <Shield className="w-4 h-4 text-amber-600" />
                Service fee waived — Premium Member
              </div>
            )}
          </div>

          {/* Live Updates Timeline */}
          <div className="mb-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Live Updates</p>
            <div className="space-y-0">
              {STATUS_FLOW.slice(0, statusIndex + 1).reverse().map((s, i) => (
                <div key={s} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={clsx("w-5 h-5 rounded-full flex items-center justify-center shrink-0", i === 0 ? STATUS_META[s].bg : "bg-slate-200")}>
                      {i === 0 ? (
                        <CircleDot className="w-3 h-3 text-white" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      )}
                    </div>
                    {i < statusIndex && <div className="w-0.5 h-5 bg-slate-200" />}
                  </div>
                  <div className="pb-3">
                    <p className={clsx("text-xs font-semibold", i === 0 ? STATUS_META[s].color : "text-slate-400")}>{STATUS_META[s].label}</p>
                    <p className="text-[10px] text-slate-400">{STATUS_META[s].desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mark as Complete Button */}
          {canComplete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              {!customerConfirmed ? (
                <button
                  onClick={() => setCustomerConfirmed(true)}
                  className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Mark Service as Complete
                </button>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-emerald-800">You've confirmed completion</p>
                  <p className="text-[11px] text-emerald-600 mt-1">Waiting for technician to confirm on their end...</p>
                  <motion.div
                    className="mt-3 mx-auto w-5 h-5 border-2 border-emerald-300 border-t-emerald-600 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}