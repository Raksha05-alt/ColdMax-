import { motion } from "motion/react";
import { CheckCircle2, Home, List } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useBooking } from "../../context/BookingContext";
import { useEffect } from "react";

export default function JobCompleteSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setTechStats } = useBooking();
  const techType = localStorage.getItem("coldmax_tech_type") as "freelance" | "fulltime" || "fulltime";
  const finalPayoutRaw = location.state?.finalPayout ?? 120;
  
  // Convert to number with proper validation
  let finalPayout: number;
  if (typeof finalPayoutRaw === 'string') {
    finalPayout = parseFloat(finalPayoutRaw);
    // If parseFloat returns NaN, use default
    if (isNaN(finalPayout)) {
      finalPayout = 120;
    }
  } else if (typeof finalPayoutRaw === 'number') {
    finalPayout = finalPayoutRaw;
  } else {
    finalPayout = 120;
  }

  useEffect(() => {
    const jobId = location.state?.job?.id;
    if (finalPayout > 0 && jobId) {
      // Check if we haven't already processed this job in this session
      const processKey = 'job_processed_' + jobId;
      if (!sessionStorage.getItem(processKey)) {
        setTechStats((prev) => ({
          ...prev,
          completedEarnings: prev.completedEarnings + finalPayout,
          jobsCompleted: prev.jobsCompleted + 1,
          acceptedJobIds: prev.acceptedJobIds.filter((id) => id !== jobId),
        }));
        sessionStorage.setItem(processKey, 'true');
      }
    }
  }, [finalPayout, location.state?.job?.id, setTechStats]);

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 15, delay: 0.2 }}
          className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-14 h-14 text-emerald-600" strokeWidth={2.5} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold text-slate-900 mb-3 text-center"
        >
          Job Completed!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-slate-500 text-center mb-8 max-w-sm"
        >
          Great work! Your job submission has been recorded. Payment will be processed shortly.
        </motion.p>

        {/* Success Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full bg-white rounded-2xl border border-slate-200 p-6 mb-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Status</p>
              <p className="font-semibold text-slate-900">Completed & Submitted</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Photos</p>
              <p className="font-semibold text-slate-900">Uploaded Successfully</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Payment</p>
              <p className="font-semibold text-slate-900">Processing</p>
            </div>
          </div>
        </motion.div>

        {/* Earnings Highlight — hidden for full-time technicians */}
        {techType === "freelance" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="w-full bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 mb-6 text-center"
          >
            <p className="text-emerald-100 text-sm font-medium mb-1">Earnings</p>
            <p className="text-4xl font-black text-white mb-1">+${finalPayout.toFixed(2)}</p>
            <p className="text-emerald-100 text-xs">Can be withdrawn by the end of today</p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full space-y-3"
        >
          <button
            onClick={() => navigate("/tech/dashboard")}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Dashboard
          </button>

          <button
            onClick={() => navigate("/tech/history")}
            className="w-full py-3.5 bg-slate-100 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
          >
            <List className="w-5 h-5" />
            View Job History
          </button>
        </motion.div>
      </div>
    </div>
  );
}