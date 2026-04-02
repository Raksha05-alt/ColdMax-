import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin, Clock, DollarSign, Star, CheckCircle2, TrendingUp, Navigation,
  Wrench, AlertCircle, X, ChevronLeft, Target, Zap, CreditCard, Banknote, 
  Smartphone, FileText, Calendar,
} from "lucide-react";
import { useNavigate } from "react-router";
import { clsx } from "clsx";
import { PushNotification } from "../../components/PushNotification";
import { useBooking } from "../../context/BookingContext";
import TechJobView from "./TechJobView";
import { getServicePrice, calculateTechPayout } from "../../utils/pricing";

type Job = {
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
  date?: string; // Added date field
  skillsMatch?: number;
  acBrand?: string;
  numUnits?: number;
  comments?: string;
  paymentMethod?: "cash" | "card" | "paynow" | "cheque";
  distanceKm?: number; // Added for filtering
  isEmergency?: boolean; // Added to identify emergency jobs
};

export default function TechDashboard() {
  const navigate = useNavigate();
  const { currentBooking, techStats, setTechStats } = useBooking();
  const [showJobNotification, setShowJobNotification] = useState(false);
  const [activeTab, setActiveTab] = useState<"available" | "upcoming">("available");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const { acceptedJobIds } = techStats;
  
  // Get technician type from localStorage
  const techType = localStorage.getItem("coldmax_tech_type") as "freelance" | "fulltime" || "fulltime";
  
  // Get technician home location from localStorage (for distance calculation)
  const techHomeLocation = "12 Orchard Road"; // This should be from profile/settings

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowJobNotification(true);
      setTimeout(() => setShowJobNotification(false), 4000);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);



  const getSkillsMatch = (issue: string) => {
    const matches: Record<string, number> = {
      "AC Not Cooling": 95,
      "Aircon Servicing": 98,
      "Chemical Overhaul": 92,
      "General Maintenance": 96,
      "Gas Top-Up": 94,
      "Water Leaking": 93,
      "Weak Airflow": 95,
      "Not Cooling": 96,
      "Blinking": 91,
      "Temperature Inconsistent": 94,
    };
    return matches[issue] || 90;
  };

  const today = new Date();
  const todayStr = "Today";
  const tomorrow = "Tomorrow";
  const twoDay = new Date(today);
  twoDay.setDate(twoDay.getDate() + 2);
  const twoDayStr = twoDay.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  // Helper function to calculate duration based on job type and units
  const calculateDuration = (issue: string, numUnits: number = 1, isEmergency: boolean = false) => {
    if (issue.toLowerCase().includes("servicing")) {
      // 45 mins per unit
      const mins = numUnits * 45;
      return mins >= 60 ? `${(mins / 60).toFixed(1)} hrs` : `${mins} mins`;
    } else if (issue.toLowerCase().includes("chemical overhaul")) {
      // 2-3 hrs per unit
      const hrs = numUnits * 2.5;
      return `${hrs.toFixed(1)} hrs`;
    } else if (issue.toLowerCase().includes("gas top-up")) {
      return "1-1.5 hrs";
    } else if (issue.toLowerCase().includes("water leaking")) {
      return "1-1.5 hrs";
    } else if (isEmergency) {
      return "1-2 hrs";
    }
    return "1-1.5 hrs";
  };

  // All available jobs with corrected pricing and dates
  const allAvailableJobs: Job[] = [
    {
      id: 1, customer: "Sarah Lim", location: "12 Orchard Blvd, Tower B",
      issue: "Not Cooling", unitType: "Daikin 12000 BTU", time: "ASAP",
      distance: "2.4 km", distanceKm: 2.4,
      payout: `$${calculateTechPayout(getServicePrice("Not Cooling", 1, true)).toFixed(2)}`,
      priority: "urgent", duration: calculateDuration("Not Cooling", 1, true), date: todayStr, isEmergency: true,
      skillsMatch: getSkillsMatch("Not Cooling"), acBrand: "Daikin", numUnits: 1,
      comments: "AC stopped cooling suddenly. No unusual sounds.",
      paymentMethod: "card",
    },
    {
      id: 2, customer: "John Tan", location: "45 Marina Bay St",
      issue: "Aircon Servicing", unitType: "Mitsubishi 9000 BTU", time: "10:00 PM",
      distance: "5.1 km", distanceKm: 5.1,
      payout: `$${calculateTechPayout(getServicePrice("Aircon Servicing", 2, false)).toFixed(2)}`,
      priority: "normal", duration: calculateDuration("Aircon Servicing", 2, false), date: todayStr, isEmergency: false,
      skillsMatch: getSkillsMatch("Aircon Servicing"), acBrand: "Mitsubishi", numUnits: 2,
      comments: "Regular servicing for 2 units.",
      paymentMethod: "cash",
    },
    {
      id: 3, customer: "David Lee", location: "23 Raffles Place",
      issue: "Chemical Overhaul", unitType: "Panasonic 18000 BTU", time: "ASAP",
      distance: "3.2 km", distanceKm: 3.2,
      payout: `$${calculateTechPayout(getServicePrice("Chemical Overhaul", 1, false)).toFixed(2)}`,
      priority: "urgent", duration: calculateDuration("Chemical Overhaul", 1, false), date: todayStr, isEmergency: true,
      skillsMatch: getSkillsMatch("Chemical Overhaul"), acBrand: "Panasonic", numUnits: 1,
      comments: "Unit smells musty. Last serviced over 2 years ago.",
      paymentMethod: "paynow",
    },
    {
      id: 4, customer: "Lisa Wong", location: "78 Bukit Timah Rd",
      issue: "Aircon Servicing", unitType: "LG 12000 BTU", time: "10:00 AM",
      distance: "4.5 km", distanceKm: 4.5,
      payout: `$${calculateTechPayout(getServicePrice("Aircon Servicing", 1, false)).toFixed(2)}`,
      priority: "normal", duration: calculateDuration("Aircon Servicing", 1, false), date: tomorrow, isEmergency: false,
      skillsMatch: getSkillsMatch("Aircon Servicing"), acBrand: "LG", numUnits: 1,
      comments: "Standard servicing appointment.",
      paymentMethod: "card",
    },
    {
      id: 5, customer: "Michael Ng", location: "90 East Coast Rd",
      issue: "Water Leaking", unitType: "Daikin 9000 BTU", time: "11:00 AM",
      distance: "15.2 km", distanceKm: 15.2,
      payout: `$${calculateTechPayout(getServicePrice("Water Leaking", 1, true)).toFixed(2)}`,
      priority: "urgent", duration: calculateDuration("Water Leaking", 1, true), date: todayStr, isEmergency: true,
      skillsMatch: getSkillsMatch("Water Leaking"), acBrand: "Daikin", numUnits: 1,
      comments: "Water dripping from indoor unit.",
      paymentMethod: "paynow",
    },
    {
      id: 6, customer: "Rachel Tan", location: "55 Clementi Ave",
      issue: "Gas Top-Up", unitType: "Samsung 12000 BTU", time: "02:00 PM",
      distance: "18.5 km", distanceKm: 18.5,
      payout: `$${calculateTechPayout(getServicePrice("Gas Top-Up", 1, false)).toFixed(2)}`,
      priority: "normal", duration: calculateDuration("Gas Top-Up", 1, false), date: twoDayStr, isEmergency: false,
      skillsMatch: getSkillsMatch("Gas Top-Up"), acBrand: "Samsung", numUnits: 1,
      comments: "AC not cold enough, may need gas top-up.",
      paymentMethod: "cash",
    },
    {
      id: 7, customer: "Kevin Lim", location: "33 Tanjong Pagar",
      issue: "Aircon Servicing", unitType: "Mitsubishi 12000 BTU", time: "03:00 PM",
      distance: "6.8 km", distanceKm: 6.8,
      payout: `$${calculateTechPayout(getServicePrice("Aircon Servicing", 3, false)).toFixed(2)}`,
      priority: "normal", duration: calculateDuration("Aircon Servicing", 3, false), date: tomorrow, isEmergency: false,
      skillsMatch: getSkillsMatch("Aircon Servicing"), acBrand: "Mitsubishi", numUnits: 3,
      comments: "3 units need servicing.",
      paymentMethod: "cheque",
    },
  ];

  if (currentBooking) {
    const isAssignedToMe = currentBooking.matchedTechnician?.name === "David Tan" || currentBooking.technician === "David Tan";
    if (isAssignedToMe) {
      const aiJob: Job = {
        id: 999,
        customer: "Current App User",
        location: "Customer Location",
        issue: currentBooking.service,
        unitType: currentBooking.unit,
        time: currentBooking.time,
        distance: currentBooking.distanceLabel || "5.2 km",
        distanceKm: parseFloat(currentBooking.distanceLabel || "5.2"),
        payout: `$${currentBooking.totalCost || 120}`,
        priority: "urgent",
        duration: "1.5 hrs",
        date: currentBooking.date,
        isEmergency: false,
        skillsMatch: currentBooking.matchConfidence ? Math.round(currentBooking.matchConfidence) : 95,
        acBrand: "Unknown",
        numUnits: parseInt(currentBooking.unit.split(" ")[0]) || 1,
        comments: "✨ AI assigned job based on your skills, proximity, and availability.",
        paymentMethod: "card",
      };
      // Check to prevent double insertion if React re-renders, but since it's recomputed every render, it's fine.
      if (!allAvailableJobs.some(j => j.id === 999)) {
        allAvailableJobs.unshift(aiJob);
      }
    }
  }

  // Filter jobs based on technician type
  const availableJobs = allAvailableJobs.filter(job => {
    if (techType === "freelance") {
      // Freelance: Only aircon servicing
      if (!job.issue.toLowerCase().includes("servicing")) {
        return false;
      }
      // Same-day jobs: max 10km
      if (job.date === todayStr && job.distanceKm && job.distanceKm > 10) {
        return false;
      }
      // Scheduled jobs: max 10km from home
      if (job.date !== todayStr && job.distanceKm && job.distanceKm > 10) {
        return false;
      }
      return true;
    } else {
      // Full-time: All requests EXCEPT regular aircon servicing
      // But CAN get emergency servicing
      if (job.issue.toLowerCase().includes("servicing") && !job.isEmergency) {
        return false;
      }
      return true;
    }
  });

  const upcomingJobs: Job[] = [
    {
      id: 101, customer: "Alex Chen", location: "88 Tampines Ave 10",
      issue: "General Maintenance", unitType: "LG 12000 BTU", time: "02:00 PM",
      distance: "8.7 km", distanceKm: 8.7,
      payout: `$${calculateTechPayout(getServicePrice("General Maintenance", 2, false)).toFixed(2)}`,
      status: "scheduled", scheduledDate: todayStr, date: todayStr,
      skillsMatch: getSkillsMatch("General Maintenance"), acBrand: "LG", numUnits: 2,
      comments: "Routine maintenance for living room and bedroom units.",
      paymentMethod: "cheque",
    },
    {
      id: 102, customer: "Mary Wong", location: "45 Clementi Rd",
      issue: "Gas Top-Up", unitType: "Daikin 9000 BTU", time: "04:30 PM",
      distance: "12.1 km", distanceKm: 12.1,
      payout: `$${calculateTechPayout(getServicePrice("Gas Top-Up", 1, false)).toFixed(2)}`,
      status: "scheduled", scheduledDate: todayStr, date: todayStr,
      skillsMatch: getSkillsMatch("Gas Top-Up"), acBrand: "Daikin", numUnits: 1,
      comments: "AC not cold enough, may need gas top-up.",
      paymentMethod: "paynow",
    },
  ];

  const handleAcceptJob = (job: Job) => {
    setTechStats((prev) => ({
      ...prev,
      acceptedJobIds: prev.acceptedJobIds.includes(job.id) ? prev.acceptedJobIds : [...prev.acceptedJobIds, job.id],
    }));
    setActiveTab("upcoming");
    setSelectedJob(null);
  };

  // Filter out accepted jobs from available
  const filteredAvailable = availableJobs.filter(j => !acceptedJobIds.includes(j.id));
  const allUpcoming = [
    ...upcomingJobs,
    ...availableJobs.filter(j => acceptedJobIds.includes(j.id)).map(j => ({ ...j, status: "scheduled", scheduledDate: "Today" })),
  ];

  const getPaymentMethodIcon = (method?: "cash" | "card" | "paynow" | "cheque") => {
    switch (method) {
      case "cash":
        return <Banknote className="w-3.5 h-3.5 text-emerald-600" />;
      case "card":
        return <CreditCard className="w-3.5 h-3.5 text-blue-600" />;
      case "paynow":
        return <Smartphone className="w-3.5 h-3.5 text-purple-600" />;
      case "cheque":
        return <FileText className="w-3.5 h-3.5 text-orange-600" />;
      default:
        return <CreditCard className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getPaymentMethodLabel = (method?: "cash" | "card" | "paynow" | "cheque") => {
    switch (method) {
      case "cash":
        return "Cash";
      case "card":
        return "Credit Card";
      case "paynow":
        return "PayNow";
      case "cheque":
        return "Cheque";
      default:
        return "Card";
    }
  };

  // Job Details View
  if (selectedJob) {
    const isAvailable = activeTab === "available" && !acceptedJobIds.includes(selectedJob.id);
    return (
      <TechJobView
        job={selectedJob}
        isAvailable={isAvailable}
        onBack={() => setSelectedJob(null)}
        onAccept={handleAcceptJob}
        acceptedJobs={allUpcoming}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-5 pt-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-slate-500 text-xs font-medium mb-0.5">Technician Portal</p>
            <h1 className="text-slate-900 text-xl font-bold">David Tan</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-sm font-bold text-slate-900">4.9</span>
              </div>
              <p className="text-[10px] text-slate-500">Top 5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 py-4 grid grid-cols-2 gap-3 bg-slate-50">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <p className="text-xs font-medium text-slate-500">Today</p>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-1">${techStats.completedEarnings.toFixed(2)}</p>
          <div className="flex items-center gap-1 text-xs text-emerald-600">
            <TrendingUp className="w-3 h-3" />
            <span className="font-medium">+12%</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-medium text-slate-500">Jobs Done</p>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-1">{techStats.jobsCompleted}</p>
          <p className="text-xs text-slate-500">{allUpcoming.length} upcoming</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 pb-3 bg-slate-50">
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("available")}
            className={clsx(
              "flex-1 py-2 px-3 rounded-md font-medium text-sm transition-all",
              activeTab === "available" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
            )}
          >
            Available Jobs
            {filteredAvailable.length > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {filteredAvailable.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("upcoming")}
            className={clsx(
              "flex-1 py-2 px-3 rounded-md font-medium text-sm transition-all",
              activeTab === "upcoming" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
            )}
          >
            My Jobs
            {allUpcoming.length > 0 && (
              <span className="ml-2 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {allUpcoming.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <AnimatePresence mode="wait">
          {activeTab === "available" && (
            <motion.div
              key="available"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              <p className="text-xs text-slate-500 mb-3">Jobs near you waiting to be accepted</p>
              {filteredAvailable.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500">No available jobs right now</p>
                </div>
              ) : (
                filteredAvailable.map((job) => (
                  <motion.button
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedJob(job)}
                    className={clsx(
                      "w-full bg-white rounded-xl border shadow-sm p-4 text-left transition-all hover:shadow-md",
                      job.priority === "urgent" ? "border-red-200 bg-red-50/30" : "border-slate-200"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900">{job.customer}</h3>
                          {job.priority === "urgent" && (
                            <span className="flex items-center gap-1 text-[9px] font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full uppercase">
                              <AlertCircle className="w-3 h-3" /> Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{job.issue}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-600">{job.payout}</p>
                        <p className="text-[10px] text-slate-500">{job.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3 bg-slate-50 rounded-lg px-3 py-2">
                      <Wrench className="w-3.5 h-3.5 text-blue-600" />
                      <p className="text-xs font-medium text-slate-700">{job.unitType}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-600">{job.location}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <p className="text-xs text-slate-600 font-medium">{job.date}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Navigation className="w-3.5 h-3.5 text-blue-600" />
                          <p className="text-xs font-medium text-blue-600">{job.distance}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <p className="text-xs text-slate-600">{job.time}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(job.paymentMethod)}
                          <p className="text-xs font-medium text-slate-700">{getPaymentMethodLabel(job.paymentMethod)}</p>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </motion.div>
          )}

          {activeTab === "upcoming" && (
            <motion.div
              key="upcoming"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <p className="text-xs text-slate-500 mb-3">Jobs you've accepted</p>
              {allUpcoming.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500">No upcoming jobs</p>
                </div>
              ) : (
                allUpcoming.map((job) => (
                  <motion.button
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setActiveTab("upcoming");
                      setSelectedJob(job);
                    }}
                    className="w-full bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-left transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900">{job.customer}</h3>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase border border-emerald-200">
                            {job.scheduledDate}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{job.issue}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-600">{job.payout}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3 bg-slate-50 rounded-lg px-3 py-2">
                      <Wrench className="w-3.5 h-3.5 text-blue-600" />
                      <p className="text-xs font-medium text-slate-700">{job.unitType}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-600">{job.location}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <p className="text-xs text-slate-600 font-medium">{job.date}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Navigation className="w-3.5 h-3.5 text-blue-600" />
                          <p className="text-xs font-medium text-blue-600">{job.distance}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <p className="text-xs text-slate-600">{job.time}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(job.paymentMethod)}
                          <p className="text-xs font-medium text-slate-700">{getPaymentMethodLabel(job.paymentMethod)}</p>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PushNotification
        show={showJobNotification}
        title="New Job Available"
        message="Urgent job nearby - $250 payout. Check available jobs."
        onDismiss={() => setShowJobNotification(false)}
      />
    </div>
  );
}