import { motion } from "motion/react";
import { Briefcase, UserCheck, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";

export default function TechnicianTypeSelection() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<"freelance" | "fulltime" | null>(null);

  const handleContinue = () => {
    if (selectedType) {
      // Store technician type in localStorage
      localStorage.setItem("coldmax_tech_type", selectedType);
      navigate("/tech/dashboard");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="flex-1 flex flex-col px-6 py-12">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 mb-8 bg-slate-800 rounded-full flex items-center justify-center text-white shadow-sm border border-slate-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Select Technician Type</h1>
          <p className="text-slate-400 text-sm">Choose your work arrangement</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-sm mx-auto space-y-3 flex-1"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedType("freelance")}
            className={`w-full p-5 rounded-xl transition-all border-2 ${
              selectedType === "freelance"
                ? "bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/30"
                : "bg-slate-800 border-slate-700 hover:bg-slate-700/50"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  selectedType === "freelance" ? "bg-blue-500" : "bg-slate-700"
                }`}
              >
                <UserCheck className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1 text-left">
                <div className="font-bold text-base mb-1">Freelance Technician</div>
                <div className="text-xs text-slate-300 leading-relaxed">
                  Focus on air con servicing only. Jobs within 10km for same-day, flexible scheduling.
                </div>
              </div>
            </div>
            {selectedType === "freelance" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-3 w-5 h-5 bg-white rounded-full flex items-center justify-center ml-auto"
              >
                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedType("fulltime")}
            className={`w-full p-5 rounded-xl transition-all border-2 ${
              selectedType === "fulltime"
                ? "bg-emerald-600 border-emerald-400 shadow-lg shadow-emerald-500/30"
                : "bg-slate-800 border-slate-700 hover:bg-slate-700/50"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  selectedType === "fulltime" ? "bg-emerald-500" : "bg-slate-700"
                }`}
              >
                <Briefcase className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1 text-left">
                <div className="font-bold text-base mb-1">Full-Time Technician</div>
                <div className="text-xs text-slate-300 leading-relaxed">
                  Handle all service types including emergencies. No distance restrictions.
                </div>
              </div>
            </div>
            {selectedType === "fulltime" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-3 w-5 h-5 bg-white rounded-full flex items-center justify-center ml-auto"
              >
                <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
            )}
          </motion.button>

          <div className="pt-4">
            <button
              onClick={handleContinue}
              disabled={!selectedType}
              className={`w-full py-4 rounded-xl font-bold transition-all ${
                selectedType
                  ? "bg-blue-600 text-white shadow-lg hover:bg-blue-500 active:scale-95"
                  : "bg-slate-700 text-slate-500 cursor-not-allowed"
              }`}
            >
              Continue
            </button>
          </div>
        </motion.div>
      </div>

      <div className="pb-8 text-center text-xs text-slate-500">
        © 2025 Cold Max. All rights reserved.
      </div>
    </div>
  );
}
