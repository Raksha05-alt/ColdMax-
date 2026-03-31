import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin, Clock, DollarSign, Star, CheckCircle2, TrendingUp, Navigation,
  Wrench, AlertCircle, X, ChevronLeft, Target, Zap,
} from "lucide-react";
import { useNavigate } from "react-router";
import { clsx } from "clsx";
import { useRequests } from "../../context/RequestContext";
import { PushNotification } from "../../components/PushNotification";
import TechJobView from "./TechJobView";

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
  skillsMatch?: number;
  acBrand?: string;
  numUnits?: number;
  comments?: string;
};

export default function TechDashboard() {
  const navigate = useNavigate();
  const { getPendingRequests } = useRequests();
  const [showJobNotification, setShowJobNotification] = useState(false);
  const [activeTab, setActiveTab] = useState<"available" | "upcoming">("available");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [acceptedJobIds, setAcceptedJobIds] = useState<number[]>([]);

  const pendingRequests = getPendingRequests();

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
      "Filter Replacement": 98,
      "Chemical Overhaul": 92,
      "General Maintenance": 96,
      "Gas Top-Up": 94,
    };
    return matches[issue] || 90;
  };

  const availableJobs: Job[] = [
    {
      id: 1, customer: "Sarah Lim", location: "12 Orchard Blvd, Tower B",
      issue: "AC Not Cooling", unitType: "Daikin 12000 BTU", time: "09:00 AM",
      distance: "2.4 km", payout: "$85", priority: "urgent", duration: "1.5 hrs",
      skillsMatch: getSkillsMatch("AC Not Cooling"), acBrand: "Daikin", numUnits: 1,
      comments: "AC stopped cooling suddenly. No unusual sounds.",
    },
    {
      id: 2, customer: "John Tan", location: "45 Marina Bay St",
      issue: "Filter Replacement", unitType: "Mitsubishi 9000 BTU", time: "11:30 AM",
      distance: "5.1 km", payout: "$45", priority: "normal", duration: "45 mins",
      skillsMatch: getSkillsMatch("Filter Replacement"), acBrand: "Mitsubishi", numUnits: 2,
      comments: "Filter has not been changed in over a year.",
    },
    {
      id: 3, customer: "David Lee", location: "23 Raffles Place",
      issue: "Chemical Overhaul", unitType: "Panasonic 18000 BTU", time: "ASAP",
      distance: "3.2 km", payout: "$250", priority: "urgent", duration: "3 hrs",
      skillsMatch: getSkillsMatch("Chemical Overhaul"), acBrand: "Panasonic", numUnits: 1,
      comments: "Unit smells musty. Last serviced over 2 years ago.",
    },
  ];

  const upcomingJobs: Job[] = [
    {
      id: 101, customer: "Alex Chen", location: "88 Tampines Ave 10",
      issue: "General Maintenance", unitType: "LG 12000 BTU", time: "02:00 PM",
      distance: "8.7 km", payout: "$120", status: "scheduled", scheduledDate: "Today",
      skillsMatch: getSkillsMatch("General Maintenance"), acBrand: "LG", numUnits: 2,
      comments: "Routine maintenance for living room and bedroom units.",
    },
    {
      id: 102, customer: "Mary Wong", location: "45 Clementi Rd",
      issue: "Gas Top-Up", unitType: "Daikin 9000 BTU", time: "04:30 PM",
      distance: "12.1 km", payout: "$80", status: "scheduled", scheduledDate: "Today",
      skillsMatch: getSkillsMatch("Gas Top-Up"), acBrand: "Daikin", numUnits: 1,
      comments: "AC not cooling as well. May need gas top-up.",
    },
  ];

  const handleAcceptJob = (job: Job) => {
    setAcceptedJobIds(prev => [...prev, job.id]);
  };

  // Filter out accepted jobs from available
  const filteredAvailable = availableJobs.filter(j => !acceptedJobIds.includes(j.id));
  const allUpcoming = [
    ...upcomingJobs,
    ...availableJobs.filter(j => acceptedJobIds.includes(j.id)).map(j => ({ ...j, status: "scheduled", scheduledDate: "Today" })),
  ];

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
    <div className="flex flex-col min-h-full bg-slate-50">
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
      <div className="px-5 py-4 grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <p className="text-xs font-medium text-slate-500">Today</p>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-1">$145</p>
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
          <p className="text-2xl font-bold text-slate-900 mb-1">2</p>
          <p className="text-xs text-slate-500">{allUpcoming.length} upcoming</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 pb-3">
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
      <div className="px-5 py-2 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === "available" && (
            <motion.div
              key="available"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3 pb-4"
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
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <p className="text-xs text-slate-600">{job.time}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Navigation className="w-3.5 h-3.5 text-blue-600" />
                          <p className="text-xs font-medium text-blue-600">{job.distance}</p>
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
              className="space-y-3 pb-4"
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
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <p className="text-xs text-slate-600">{job.time}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Navigation className="w-3.5 h-3.5 text-blue-600" />
                          <p className="text-xs font-medium text-blue-600">{job.distance}</p>
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
