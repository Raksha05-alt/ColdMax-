import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  Calendar,
  ChevronDown,
  User,
  MapPin,
  DollarSign,
  FileText,
  ArrowLeft,
  Download,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";

// Mock history data - In a real app, this would come from an API/database
const allHistory = [
  {
    id: 1,
    date: "12 Aug 2024",
    service: "General Maintenance",
    tech: "David Tan",
    techId: "tech_001",
    status: "Completed",
    amount: "$120",
    location: "Living Room, Unit #12-34",
    duration: "2 hours",
    notes:
      "Filter cleaned and chemical wash performed. All components checked and working properly.",
    parts: "Air filter, cleaning solution",
  },
  {
    id: 2,
    date: "05 Jul 2024",
    service: "Chemical Overhaul",
    tech: "John Lim",
    techId: "tech_002",
    status: "Completed",
    amount: "$250",
    location: "Master Bedroom, Unit #12-34",
    duration: "3 hours",
    notes:
      "Full chemical overhaul completed. Compressor serviced and tested. Cooling performance restored.",
    parts: "Chemical cleaner, refrigerant top-up",
  },
  {
    id: 3,
    date: "20 May 2024",
    service: "Filter Replacement",
    tech: "David Tan",
    techId: "tech_001",
    status: "Completed",
    amount: "$45",
    location: "Living Room, Unit #12-34",
    duration: "30 minutes",
    notes: "Old filter replaced with new high-efficiency filter.",
    parts: "Premium air filter",
  },
];

export default function History() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isTech = location.pathname.startsWith("/tech");

  // Filter history for technician view - only show jobs by current technician
  const currentTechId = "tech_001"; // In real app, this would come from auth context
  const history = isTech
    ? allHistory.filter(job => job.techId === currentTechId)
    : allHistory;

  const handleDownloadReceipt = (job: typeof allHistory[0]) => {
    // Create receipt content
    const receiptContent = `
COLD MAX AIR-CONDITIONING
Service Receipt
================================

Date: ${job.date}
Service: ${job.service}
Technician: ${job.tech}
Location: ${job.location}

Duration: ${job.duration}
Amount: ${job.amount}

Parts Used:
${job.parts}

Service Notes:
${job.notes}

================================
Thank you for choosing Cold Max!
    `.trim();

    // Create and download text file
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ColdMax_Receipt_${job.date.replace(/ /g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleBookAgain = (job: typeof allHistory[0]) => {
    // Navigate to booking page - in a real app, could pre-fill with service details
    navigate('/customer/booking');
    
    // Could also set booking context with pre-filled data
    // For now, just navigate to booking page
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              navigate(isTech ? "/tech/dashboard" : "/customer/home")
            }
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Service History</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {history.length} completed {history.length === 1 ? "service" : "services"}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-3 pb-6">
        {history.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">No completed jobs yet</h3>
            <p className="text-sm text-slate-500">Your service history will appear here</p>
          </div>
        ) : (
          history.map((job) => {
            const isExpanded = expandedId === job.id;
            return (
              <div
                key={job.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : job.id)
                  }
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {job.service}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        <span>{job.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900">{job.amount}</p>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      </motion.div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-emerald-50 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span className="text-xs font-medium text-emerald-600">
                        {job.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      Tap for details
                    </span>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3">
                        {/* Technician */}
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">
                              Technician
                            </p>
                            <p className="font-medium text-slate-900 text-sm">
                              {job.tech}
                            </p>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-slate-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Location</p>
                            <p className="font-medium text-slate-900 text-sm">
                              {job.location}
                            </p>
                          </div>
                        </div>

                        {/* Duration & Cost */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-slate-500 mb-1">
                              Duration
                            </p>
                            <p className="font-semibold text-slate-900 text-sm">
                              {job.duration}
                            </p>
                          </div>
                          <div className="bg-emerald-50 rounded-lg p-3">
                            <p className="text-xs text-emerald-600 mb-1">
                              Total Cost
                            </p>
                            <p className="font-semibold text-emerald-700 text-sm">
                              {job.amount}
                            </p>
                          </div>
                        </div>

                        {/* Parts Used */}
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs text-slate-500 mb-1">
                            Parts Used
                          </p>
                          <p className="text-sm text-slate-700">{job.parts}</p>
                        </div>

                        {/* Notes */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-slate-500" />
                            <p className="text-xs font-medium text-slate-500">
                              Service Notes
                            </p>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {job.notes}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadReceipt(job);
                            }}
                            className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download Receipt
                          </button>
                          {!isTech && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBookAgain(job);
                              }}
                              className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                            >
                              Book Again
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}