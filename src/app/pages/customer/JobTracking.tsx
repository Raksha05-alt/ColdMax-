import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
  PanInfo,
} from "motion/react";
import {
  ArrowLeft,
  Navigation,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  Wrench,
  Calendar,
  Clock,
  Car,
  Shield,
  Star,
  ChevronUp,
  ChevronDown,
  Package,
  UserCheck,
  CircleDot,
  Home,
  GripHorizontal,
  Navigation2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { clsx } from "clsx";
import {
  useBooking,
  BookingStatus,
} from "../../context/BookingContext";
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

const STATUS_META: Record<
  BookingStatus,
  { label: string; desc: string; color: string; bg: string }
> = {
  confirmed: {
    label: "Booking Confirmed",
    desc: "Looking for the best technician nearby",
    color: "text-blue-600",
    bg: "bg-blue-500",
  },
  assigned: {
    label: "Technician Assigned",
    desc: "Your technician has accepted the booking",
    color: "text-indigo-600",
    bg: "bg-indigo-500",
  },
  "en-route": {
    label: "On the Way",
    desc: "Technician is heading to your location",
    color: "text-blue-600",
    bg: "bg-blue-500",
  },
  arriving: {
    label: "Almost There",
    desc: "Will arrive in less than 2 minutes",
    color: "text-cyan-600",
    bg: "bg-cyan-500",
  },
  arrived: {
    label: "Technician Arrived",
    desc: "Your technician is at your doorstep",
    color: "text-emerald-600",
    bg: "bg-emerald-500",
  },
  "in-progress": {
    label: "Service In Progress",
    desc: "Working on your AC units",
    color: "text-purple-600",
    bg: "bg-purple-500",
  },
  completed: {
    label: "Service Completed",
    desc: "All done! Your AC is running great",
    color: "text-emerald-600",
    bg: "bg-emerald-500",
  },
};

const ROUTE_POINTS = [
  { x: 18, y: 82 },
  { x: 22, y: 72 },
  { x: 28, y: 62 },
  { x: 35, y: 52 },
  { x: 40, y: 45 },
  { x: 48, y: 38 },
  { x: 55, y: 30 },
  { x: 60, y: 24 },
  { x: 65, y: 20 },
];

const DEST = { x: 68, y: 18 };

// Sheet snap points as percentage of container height (from bottom)
// "peek" = minimal bar, "mid" = default, "full" = expanded details
const SNAP_PEEK = 10; // ~10% - just handle + tech name + ETA in one line
const SNAP_MID = 48; // ~48% - default with tech card
const SNAP_FULL = 78; // ~78% - full details

export default function JobTracking() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentBooking, updateBookingStatus, quotation, setQuotation } = useBooking();
  const trackingTechnician = location.state?.matchedTechnician || currentBooking?.matchedTechnician;
  const technicianName =
    trackingTechnician?.name ||
    currentBooking?.technician ||
    "David Tan";
  const technicianImage =
    trackingTechnician?.image ||
    "https://images.unsplash.com/photo-1744853930655-52d02b83abb6?auto=format&fit=crop&w=150&q=80";
  const technicianRating = trackingTechnician?.rating ?? 4.9;
  const technicianJobs =
    trackingTechnician?.jobs_completed ?? trackingTechnician?.jobsCompleted ?? 1204;
  const technicianDistance =
    currentBooking?.distanceLabel || location.state?.distance || "2.4 km away";
  const technicianEta = currentBooking?.etaMinutes ?? location.state?.etaMins ?? 15;
  const trackedService =
    location.state?.issueLabel ||
    currentBooking?.service ||
    "General Maintenance";
    
  const trackingDate = location.state?.dateFormatted || currentBooking?.dateFormatted || location.state?.date || currentBooking?.date || "Today";
  const trackingTime = location.state?.time || currentBooking?.time || "ASAP";
  const isEmergency = location.state?.isEmergency || false;
  const isToday = isEmergency || trackingDate.toLowerCase() === "today" || trackingDate.includes("Today") || (new Date(trackingDate).toDateString() === new Date().toDateString() && !isNaN(new Date(trackingDate).getTime()));

  const [status, setStatus] = useState<BookingStatus>(
    // If coming from urgent request with matched technician, start at "assigned"
    trackingTechnician ? "assigned" : (!isToday ? "confirmed" : (currentBooking?.status || "confirmed")),
  );
  const [techPosition, setTechPosition] = useState(0);
  const [eta, setEta] = useState(technicianEta);
  const [notification, setNotification] = useState<{
    show: boolean;
    title: string;
    message: string;
  }>({ show: false, title: "", message: "" });
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMoving =
    status === "en-route" || status === "arriving";
  const showMap = status !== "completed";
  const canComplete =
    status === "arrived" || status === "in-progress";
  const [customerConfirmed, setCustomerConfirmed] =
    useState(false);

  // Simulate technician confirming after customer confirms
  // OR technician completes independently (50% chance after 35 seconds in-progress)
  useEffect(() => {
    if (status !== "in-progress" && !customerConfirmed) return;
    
    // If customer already confirmed, wait 3 seconds for technician to confirm
    if (customerConfirmed) {
      const timer = setTimeout(() => {
        setStatus("completed");
        updateBookingStatus("completed");
        setNotification({
          show: true,
          title: "Service Completed!",
          message:
            "Both you and the technician have confirmed. Rate your experience.",
        });
        setTimeout(
          () => setNotification((n) => ({ ...n, show: false })),
          4000,
        );
      }, 3000);
      return () => clearTimeout(timer);
    }
    
    // 50% chance technician completes service independently after 35 seconds
    const shouldTechnicianComplete = Math.random() > 0.5;
    if (shouldTechnicianComplete && status === "in-progress") {
      const timer = setTimeout(() => {
        setStatus("completed");
        updateBookingStatus("completed");
        setNotification({
          show: true,
          title: "Service Completed!",
          message: `${technicianName} has marked the service as complete. Rate your experience.`,
        });
        setTimeout(
          () => setNotification((n) => ({ ...n, show: false })),
          4000,
        );
      }, 35000); // 35 seconds after entering in-progress
      return () => clearTimeout(timer);
    }
  }, [customerConfirmed, status, technicianName, updateBookingStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sheet height as percentage
  const [sheetSnap, setSheetSnap] = useState<number>(SNAP_MID);
  const [serviceCompleted, setServiceCompleted] =
    useState(false);
  const [showExtraQuotationPopup, setShowExtraQuotationPopup] =
    useState(false);
  const [extraQuotationHandled, setExtraQuotationHandled] =
    useState(false);
  const [extraQuotationAccepted, setExtraQuotationAccepted] =
    useState(false);
  const [extraQuotationReason, setExtraQuotationReason] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionInput, setShowRejectionInput] = useState(false);

  const [extraQuotationAmount, setExtraQuotationAmount] = useState(0);
  const rawCost = location.state?.totalCost ?? currentBooking?.totalCost ?? 120;
  const baseCost = Number(
    String(rawCost).replace(/[^0-9.]/g, ""),
  );
  const finalCustomerCost = extraQuotationAccepted
    ? baseCost + extraQuotationAmount
    : baseCost;
  const handleAcceptExtraQuotation = () => {
    setExtraQuotationAccepted(true);
    setExtraQuotationHandled(true);
    setShowExtraQuotationPopup(false);
    if (quotation) {
      setQuotation({ ...quotation, status: "accepted" });
    }
    setNotification({
      show: true,
      title: "Quotation Accepted",
      message: `Your total has been updated to $${(baseCost + extraQuotationAmount).toFixed(2)}.`,
    });
    setTimeout(
      () => setNotification((n) => ({ ...n, show: false })),
      4000,
    );
  };

  const handleRejectExtraQuotation = () => {
    setExtraQuotationAccepted(false);
    setExtraQuotationHandled(true);
    setShowExtraQuotationPopup(false);
    if (quotation) {
      setQuotation({ ...quotation, status: "rejected" });
    }
    setNotification({
      show: true,
      title: "Quotation Rejected",
      message: `Your total remains $${baseCost.toFixed(2)}.`,
    });
    setTimeout(
      () => setNotification((n) => ({ ...n, show: false })),
      4000,
    );
  };
  const sheetHeight = useMotionValue(SNAP_MID);
  const sheetHeightStyle = useTransform(
    sheetHeight,
    (v) => `${v}%`,
  );

  // Convert percentage to actual pixel for drag constraints
  const getContainerHeight = useCallback(() => {
    return containerRef.current?.clientHeight || 700;
  }, []);

  const snapTo = useCallback(
    (pct: number) => {
      setSheetSnap(pct);
      animate(sheetHeight, pct, {
        type: "spring",
        damping: 30,
        stiffness: 350,
      });
    },
    [sheetHeight],
  );

  const handleDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      const velocity = info.velocity.y;
      const h = getContainerHeight();
      const currentPct = sheetHeight.get();

      // Determine snap based on velocity and position
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
    },
    [getContainerHeight, sheetHeight, snapTo],
  );

  const handleDrag = useCallback(
    (_: any, info: PanInfo) => {
      const h = getContainerHeight();
      const deltaPct = -(info.delta.y / h) * 100;
      const newVal = Math.max(
        SNAP_PEEK - 2,
        Math.min(SNAP_FULL + 5, sheetHeight.get() + deltaPct),
      );
      sheetHeight.set(newVal);
    },
    [getContainerHeight, sheetHeight],
  );

  // Determine visibility based on sheet height
  const sheetPct = sheetSnap;
  const showDetails = sheetPct >= SNAP_MID;
  const showExpanded = sheetPct >= SNAP_FULL;

  // Auto-progress through statuses for demo (starting from assigned when technician is matched)
  useEffect(() => {
    if (!isToday) return; // Do not auto-progress for future bookings
    
    const schedule: { delay: number; status: BookingStatus; notif?: { title: string; message: string } }[] = [
      { delay: 2000, status: "en-route", notif: { title: "On the Way!", message: `${technicianName} is heading to your location. ETA ${technicianEta} min.` } },
      { delay: 17000, status: "arriving", notif: { title: "Almost There", message: `${technicianName} will arrive in less than 2 minutes` } },
      { delay: 23000, status: "arrived", notif: { title: "Technician Arrived", message: `${technicianName} is at your doorstep. Please open the door.` } },
      { delay: 28000, status: "in-progress" },
      // No auto-complete: customer must press "Mark as Complete"
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
  }, [isToday, technicianName, technicianEta, updateBookingStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // Trigger extra quotation popup when quotation appear in context
  useEffect(() => {
    if (quotation?.status === "pending" && !extraQuotationHandled) {
      setExtraQuotationReason(quotation.reason);
      setExtraQuotationAmount(quotation.amount);
      
      const timer = setTimeout(() => {
        setShowExtraQuotationPopup(true);
        setNotification({
          show: true,
          title: "Additional Work Found",
          message: `${technicianName} has sent you a quotation request.`,
        });
        setTimeout(() => setNotification((n) => ({ ...n, show: false })), 4000);
      }, 1000); // Slight delay for smoother UI
      
      return () => clearTimeout(timer);
    }
  }, [quotation, extraQuotationHandled, technicianName]);

  // Animate technician movement along route
  useEffect(() => {
    if (!isMoving) return;
    timerRef.current = setInterval(() => {
      setTechPosition((p) =>
        p >= ROUTE_POINTS.length - 1 ? p : p + 1,
      );
    }, 2000);
    return () => clearInterval(timerRef.current);
  }, [isMoving]);

  // ETA countdown
  useEffect(() => {
    if (
      status === "arrived" ||
      status === "in-progress" ||
      status === "completed"
    ) {
      setEta(0);
      return;
    }
    const t = setInterval(
      () => setEta((e: number) => Math.max(0, e - 1)),
      60000 / 4,
    );
    return () => clearInterval(t);
  }, [status]);

  const currentPos =
    ROUTE_POINTS[
      Math.min(techPosition, ROUTE_POINTS.length - 1)
    ];
  const statusIndex = STATUS_FLOW.indexOf(status);
  const routePath =
    ROUTE_POINTS.map(
      (p, i) => `${i === 0 ? "M" : "L"} ${p.x}% ${p.y}%`,
    ).join(" ") + ` L ${DEST.x}% ${DEST.y}%`;

  // Completed view
  if (status === "completed") {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        <PushNotification
          show={notification.show}
          title={notification.title}
          message={notification.message}
          onDismiss={() =>
            setNotification((n) => ({ ...n, show: false }))
          }
        />
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12 }}
            className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Service Complete!
          </h2>
          <p className="text-sm text-slate-500 text-center mb-8">
            Your AC maintenance has been completed successfully.
          </p>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 w-full mb-6">
            <p className="text-sm font-semibold text-slate-700 mb-3 text-center">
              Rate your experience
            </p>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  className="text-amber-400 hover:scale-110 transition-transform"
                >
                  <Star className="w-8 h-8 fill-amber-400" />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
              <img
                src={technicianImage}
                alt="Tech"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-bold text-slate-900 text-sm">
                  {technicianName}
                </p>
                <p className="text-xs text-slate-500">
                  {trackedService}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">
                  {trackingDate}
                </p>
                <p className="text-xs text-slate-500">
                  {trackingTime}
                </p>
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
            onClick={() => navigate("/customer/history")}
            className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-medium"
          >
            View History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-30 flex flex-col h-full bg-slate-50 overflow-hidden"
    >
      <PushNotification
        show={notification.show}
        title={notification.title}
        message={notification.message}
        onDismiss={() =>
          setNotification((n) => ({ ...n, show: false }))
        }
      />

      {/* === FULL-SCREEN MAP === */}
      {showMap && (
        <div
          className="absolute inset-0 z-0"
          onClick={() => {
            // Tapping the map collapses sheet to peek
            if (sheetSnap > SNAP_PEEK) snapTo(SNAP_PEEK);
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-slate-100 to-blue-50" />

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

          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Background roads */}
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

            {/* Planned route (light blue dashed) */}
            <motion.path
              d={routePath}
              stroke="#93c5fd"
              strokeWidth="0.8"
              fill="none"
              strokeDasharray="2 1"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            {/* Traveled route (solid blue) */}
            {techPosition > 0 && (
              <path
                d={ROUTE_POINTS.slice(0, techPosition + 1)
                  .map(
                    (p, i) =>
                      `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`,
                  )
                  .join(" ")}
                stroke="#2563eb"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
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

          {/* TECHNICIAN LIVE POSITION (Moving vehicle icon) */}
          {(status === "en-route" ||
            status === "arriving" ||
            status === "assigned") && (
            <motion.div
              className="absolute z-20"
              animate={{
                left: `${currentPos.x}%`,
                top: `${currentPos.y}%`,
              }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              style={{ transform: "translate(-50%, -50%)" }}
            >
              <div className="relative">
                {/* Pulse animation */}
                <motion.div
                  className="absolute -inset-4 bg-blue-500 rounded-full"
                  animate={{
                    scale: [1, 1.8, 1],
                    opacity: [0.3, 0, 0.3],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                {/* Vehicle icon */}
                <div className="relative bg-blue-600 p-2.5 rounded-full shadow-xl border-3 border-white">
                  <Car className="w-5 h-5 text-white" />
                </div>
                {/* Tech name label */}
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap shadow-lg">
                  🚗 {technicianName}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-600 rotate-45" />
                </div>
              </div>
            </motion.div>
          )}

          {/* TECHNICIAN AT CUSTOMER LOCATION (Arrived/In Progress) */}
          {(status === "arrived" ||
            status === "in-progress") && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute z-20"
              style={{
                left: `${DEST.x}%`,
                top: `${DEST.y}%`,
                transform: "translate(-50%, -50%)",
              }}
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
                <div className="relative bg-emerald-600 p-2.5 rounded-full shadow-xl border-3 border-white">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          )}

          {/* CUSTOMER HOME LOCATION (Your location) */}
          <div
            className="absolute z-10"
            style={{
              left: `${DEST.x}%`,
              top: `${DEST.y}%`,
              transform: "translate(-50%, -100%)",
            }}
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
                {/* Home icon background */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap shadow-lg flex items-center gap-1">
                  <Home className="w-3 h-3" />
                  Your Home
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rotate-45" />
                </div>
                <MapPin className="w-8 h-8 text-red-500 fill-red-500 drop-shadow-lg" />
              </div>
            </motion.div>
          </div>

          {/* Starting point marker */}
          <div
            className="absolute z-10"
            style={{
              left: `${ROUTE_POINTS[0].x}%`,
              top: `${ROUTE_POINTS[0].y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="relative">
              <div className="w-3 h-3 bg-blue-400 rounded-full border-2 border-white shadow" />
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-700 text-white px-2 py-0.5 rounded text-[8px] font-semibold whitespace-nowrap shadow">
                Start
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === FLOATING HEADER === */}
      <header className="px-4 pt-2 pb-2 flex items-center justify-between relative z-30">
        <button
          onClick={() => navigate("/customer/home")}
          className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md border border-slate-200 backdrop-blur-md"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>

        {eta > 0 && isMoving && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg px-4 py-2 flex items-center gap-2.5 border border-slate-200"
          >
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider">
                ETA
              </p>
              <p className="text-lg font-black text-slate-900 leading-none">
                {eta} min
              </p>
            </div>
          </motion.div>
        )}

        {!isMoving && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg px-3 py-2 border border-slate-200">
            <p
              className={clsx(
                "text-xs font-bold",
                STATUS_META[status].color,
              )}
            >
              {STATUS_META[status].label}
            </p>
          </div>
        )}

        <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md border border-slate-200 backdrop-blur-md">
          <Navigation2 className="w-5 h-5 text-slate-700" />
        </button>
      </header>

      {/* === DRAGGABLE BOTTOM SHEET === */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.12)] flex flex-col"
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
            // Tapping the handle toggles between peek and mid
            if (sheetSnap <= SNAP_PEEK) snapTo(SNAP_MID);
          }}
        >
          <div className="flex flex-col items-center pt-2 pb-1">
            <div className="w-10 h-1 bg-slate-300 rounded-full" />
          </div>

          {/* Compact peek bar: tech avatar + name + status + ETA */}
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
                className={clsx(
                  "text-sm font-bold truncate",
                  STATUS_META[status].color,
                )}
              >
                {statusIndex >= 1
                  ? `${technicianName} · ${STATUS_META[status].label}`
                  : STATUS_META[status].label}
              </motion.p>
            </div>
            {eta > 0 && isMoving && (
              <div className="flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg shrink-0">
                <Clock className="w-3 h-3 text-blue-600" />
                <span className="text-sm font-black text-blue-600 tabular-nums">
                  {eta}m
                </span>
              </div>
            )}
            {canComplete && !customerConfirmed && (
              <div
                className={clsx(
                  "w-2 h-2 rounded-full shrink-0",
                  status === "arrived"
                    ? "bg-emerald-500"
                    : "bg-purple-500",
                )}
              />
            )}
            <ChevronUp
              className={clsx(
                "w-4 h-4 text-slate-400 shrink-0 transition-transform",
                sheetSnap >= SNAP_MID && "rotate-180",
              )}
            />
          </div>
        </motion.div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-8 no-scrollbar overscroll-contain">
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
                        isPast
                          ? STATUS_META[status].bg
                          : "bg-slate-200",
                        isCurrent && "animate-pulse",
                      )}
                      initial={false}
                      animate={{ opacity: isPast ? 1 : 0.4 }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[7px] text-slate-400">
                Confirmed
              </span>
              <span className="text-[7px] text-slate-400">
                En Route
              </span>
              <span className="text-[7px] text-slate-400">
                Arrived
              </span>
              <span className="text-[7px] text-slate-400">
                Done
              </span>
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
                  <h3 className="font-bold text-slate-900 text-sm">
                    {technicianName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="flex items-center gap-0.5">
                      <Wrench className="w-3 h-3" />
                      Senior Tech
                    </span>
                    <span className="text-amber-500 font-semibold">
                      ★ 4.9
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Shield className="w-3 h-3" />
                      Verified
                    </span>
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
                  <p className="text-[11px] text-slate-600">
                    White Toyota HiAce •{" "}
                    <span className="font-semibold">
                      SGP 4521 K
                    </span>
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Searching animation */}
          {status === "confirmed" && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full shrink-0"
              />
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Finding a technician...
                </p>
                <p className="text-xs text-blue-600">
                  Matching you with the best available tech
                </p>
              </div>
            </div>
          )}

          {/* Status-specific banners */}
          {status === "arrived" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-center mb-4"
            >
              <UserCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
              <p className="text-sm font-semibold text-emerald-800">
                {technicianName} has arrived!
              </p>
              <p className="text-[11px] text-emerald-600 mt-0.5">
                Please open your door to let the technician in.
              </p>
            </motion.div>
          )}

          {status === "in-progress" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-purple-50 border border-purple-200 rounded-xl p-3.5 text-center mb-4"
            >
              <Wrench className="w-5 h-5 text-purple-600 mx-auto mb-1.5" />
              <p className="text-sm font-semibold text-purple-800">
                Service in progress
              </p>
              <p className="text-[11px] text-purple-600 mt-0.5">
                {technicianName} is working on your AC units.
                ~30–45 min.
              </p>
            </motion.div>
          )}

          {/* Booking Details (always in scroll, visible when sheet is pulled up) */}
          <div className="space-y-2.5 mb-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Booking Details
            </p>
            {[
              {
                icon: Calendar,
                label: "Date",
                value: trackingDate,
              },
              {
                icon: Clock,
                label: "Time",
                value: trackingTime,
              },
              {
                icon: Package,
                label: "Service",
                value: `${trackedService} (${currentBooking?.unit || "1 unit"})`,
              },
              {
                icon: Home,
                label: "Location",
                value: "12 Orchard Blvd, Tower B",
              },
              {
                icon: CheckCircle2,
                label: "Cost",
                value: `$${finalCustomerCost.toFixed(2)}`,
              },
            ].map((d) => (
              <div
                key={d.label}
                className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg"
              >
                <d.icon className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-[9px] text-slate-400 uppercase">
                    {d.label}
                  </p>
                  <p className="text-xs font-medium text-slate-800">
                    {d.value}
                  </p>
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
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Live Updates
            </p>
            <div className="space-y-0">
              {STATUS_FLOW.slice(0, statusIndex + 1)
                .reverse()
                .map((s, i) => (
                  <div key={s} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={clsx(
                          "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                          i === 0
                            ? STATUS_META[s].bg
                            : "bg-slate-200",
                        )}
                      >
                        {i === 0 ? (
                          <CircleDot className="w-3 h-3 text-white" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        )}
                      </div>
                      {i < statusIndex && (
                        <div className="w-0.5 h-5 bg-slate-200" />
                      )}
                    </div>
                    <div className="pb-3">
                      <p
                        className={clsx(
                          "text-xs font-semibold",
                          i === 0
                            ? STATUS_META[s].color
                            : "text-slate-400",
                        )}
                      >
                        {STATUS_META[s].label}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {STATUS_META[s].desc}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Mark as Complete Button */}
          {canComplete && !showExtraQuotationPopup && (
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
                  <p className="text-sm font-bold text-emerald-800">
                    You've confirmed completion
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-1">
                    Waiting for technician to confirm on their
                    end...
                  </p>
                  <motion.div
                    className="mt-3 mx-auto w-5 h-5 border-2 border-emerald-300 border-t-emerald-600 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {showExtraQuotationPopup && (
        <div className="absolute inset-0 z-50 bg-black/40 flex items-end justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Additional quotation
              </p>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {technicianName} found extra work needed
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                The technician has requested an additional
                quotation of{" "}
                <span className="font-bold text-slate-900">
                  ${extraQuotationAmount.toFixed(2)}
                </span>
                .
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Reason: {extraQuotationReason}
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Original cost
                </span>
                <span className="font-semibold text-slate-900">
                  ${baseCost.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Additional quotation
                </span>
                <span className="font-semibold text-slate-900">
                  +${extraQuotationAmount.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  New total
                </span>
                <span className="font-black text-blue-600">
                  $
                  {(baseCost + extraQuotationAmount).toFixed(2)}
                </span>
              </div>
            </div>

            {showRejectionInput && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Reason for rejection (required)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="E.g., Price too high, want second opinion..."
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-blue-500"
                  rows={3}
                />
              </div>
            )}

            <div className="flex gap-3">
              {!showRejectionInput ? (
                <>
                  <button
                    onClick={() => setShowRejectionInput(true)}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-700 font-semibold"
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleAcceptExtraQuotation}
                    className="flex-1 py-3 rounded-2xl bg-blue-600 text-white font-bold"
                  >
                    Accept
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowRejectionInput(false);
                      setRejectionReason("");
                    }}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectExtraQuotation}
                    disabled={!rejectionReason.trim()}
                    className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}