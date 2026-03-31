import { motion, AnimatePresence } from "motion/react";
import { MapPin, Bell, AlertTriangle } from "lucide-react";

interface PermissionDialogProps {
  show: boolean;
  type: "location" | "notification";
  onAllow: () => void;
  onDeny: () => void;
  onAlways?: () => void; // For location permission
}

export function PermissionDialog({
  show,
  type,
  onAllow,
  onDeny,
  onAlways,
}: PermissionDialogProps) {
  const isLocation = type === "location";
  const appName = "Cold Max";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center px-6"
        >
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* iOS-style Permission Dialog */}
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl w-full max-w-[280px] overflow-hidden"
          >
            {/* Icon and Title */}
            <div className="pt-5 pb-4 text-center px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-3">
                {isLocation ? (
                  <MapPin className="w-8 h-8 text-blue-600" />
                ) : (
                  <Bell className="w-8 h-8 text-blue-600" />
                )}
              </div>

              <h3 className="font-semibold text-slate-900 text-base mb-2 px-2">
                "{appName}" Would Like to{" "}
                {isLocation ? "Access Your Location" : "Send You Notifications"}
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed px-2">
                {isLocation ? (
                  <>
                    We need your location to show nearby technicians, track
                    service progress, and provide accurate arrival times.
                  </>
                ) : (
                  <>
                    Get alerts when your technician is on the way, service
                    reminders, and important updates about your aircon units.
                  </>
                )}
              </p>

              {isLocation && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed text-left">
                    Background location is used to track technician arrival even
                    when the app is closed.
                  </p>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="border-t border-slate-200/80">
              {isLocation && onAlways ? (
                <>
                  <button
                    onClick={onAlways}
                    className="w-full py-3.5 text-blue-600 font-semibold text-base border-b border-slate-200/80 hover:bg-slate-50/50 transition-colors"
                  >
                    Allow While Using App
                  </button>
                  <button
                    onClick={onAllow}
                    className="w-full py-3.5 text-blue-600 font-medium text-base border-b border-slate-200/80 hover:bg-slate-50/50 transition-colors"
                  >
                    Allow Once
                  </button>
                  <button
                    onClick={onDeny}
                    className="w-full py-3.5 text-slate-600 font-medium text-base hover:bg-slate-50/50 transition-colors"
                  >
                    Don't Allow
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onAllow}
                    className="w-full py-3.5 text-blue-600 font-semibold text-base border-b border-slate-200/80 hover:bg-slate-50/50 transition-colors"
                  >
                    Allow
                  </button>
                  <button
                    onClick={onDeny}
                    className="w-full py-3.5 text-slate-600 font-medium text-base hover:bg-slate-50/50 transition-colors"
                  >
                    Don't Allow
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Android-style Permission Dialog (alternative design)
export function AndroidPermissionDialog({
  show,
  type,
  onAllow,
  onDeny,
}: Omit<PermissionDialogProps, "onAlways">) {
  const isLocation = type === "location";
  const appName = "Cold Max";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center px-6"
        >
          <div className="absolute inset-0 bg-black/60" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-lg shadow-2xl w-full max-w-[320px] overflow-hidden"
          >
            <div className="p-6">
              <h3 className="font-semibold text-slate-900 text-lg mb-3">
                {isLocation
                  ? "Allow Cold Max to access this device's location?"
                  : "Allow Cold Max to send you notifications?"}
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                {isLocation ? (
                  <>
                    Cold Max uses location to track technician arrivals and show
                    nearby service providers.
                  </>
                ) : (
                  <>
                    You'll receive important alerts about your service
                    appointments and aircon unit health.
                  </>
                )}
              </p>
            </div>

            <div className="flex justify-end gap-2 px-6 pb-4">
              <button
                onClick={onDeny}
                className="px-4 py-2 text-blue-600 font-medium text-sm rounded hover:bg-blue-50 transition-colors uppercase"
              >
                Deny
              </button>
              <button
                onClick={onAllow}
                className="px-4 py-2 text-blue-600 font-semibold text-sm rounded hover:bg-blue-50 transition-colors uppercase"
              >
                Allow
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
