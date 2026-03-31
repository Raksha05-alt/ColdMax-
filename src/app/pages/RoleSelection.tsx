import { motion } from "motion/react";
import { User, Wrench } from "lucide-react";
import { useNavigate } from "react-router";

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <svg
              className="w-9 h-9 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Cold Max</h1>
          <p className="text-slate-400 text-sm">Professional Aircon Service</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-sm space-y-3"
        >
          <p className="text-slate-400 text-sm text-center mb-6">
            Continue as
          </p>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/customer/home")}
            className="w-full bg-white text-slate-900 p-4 rounded-lg flex items-center justify-between shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <div className="font-semibold">Customer</div>
                <div className="text-xs text-slate-500">
                  Book & monitor services
                </div>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/login/technician/type")}
            className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-lg flex items-center justify-between hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-slate-700 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-blue-400" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <div className="font-semibold">Technician</div>
                <div className="text-xs text-slate-400">
                  Manage jobs & earnings
                </div>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.button>
        </motion.div>
      </div>

      <div className="pb-8 text-center text-xs text-slate-500">
        © 2025 Cold Max. All rights reserved.
      </div>
    </div>
  );
}