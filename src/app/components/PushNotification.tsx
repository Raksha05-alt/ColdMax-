import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface PushNotificationProps {
  show: boolean;
  title: string;
  message: string;
  icon?: string;
  appName?: string;
  time?: string;
  onDismiss?: () => void;
}

export function PushNotification({
  show,
  title,
  message,
  icon = "🔔",
  appName = "Cold Max",
  time = "now",
  onDismiss,
}: PushNotificationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="absolute top-0 left-0 right-0 z-[9999] px-2 pt-2"
          onClick={onDismiss}
        >
          {/* iOS-style notification */}
          <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-white/20 overflow-hidden mx-2">
            {/* Top bar with app info */}
            <div className="flex items-center gap-2 px-3 pt-3 pb-2">
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-700 rounded flex items-center justify-center text-white text-xs font-bold shadow-sm">
                C
              </div>
              <div className="flex-1 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">
                  {appName}
                </span>
                <span className="text-xs text-slate-500">{time}</span>
              </div>
            </div>

            {/* Notification content */}
            <div className="px-3 pb-3">
              <h4 className="font-semibold text-slate-900 text-sm mb-0.5">
                {title}
              </h4>
              <p className="text-sm text-slate-600 leading-snug">{message}</p>
            </div>

            {/* Subtle bottom indicator */}
            <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Notification manager component to show multiple notifications
export function NotificationDemo() {
  return (
    <div className="absolute top-0 left-0 right-0 pointer-events-none">
      {/* Status bar (iOS style) */}
      <div className="bg-gradient-to-b from-slate-900/90 to-slate-900/70 backdrop-blur-xl px-6 pt-2 pb-1">
        <div className="flex items-center justify-between text-white text-xs font-medium">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              <div className="w-0.5 h-2 bg-white rounded-full" />
              <div className="w-0.5 h-2.5 bg-white rounded-full" />
              <div className="w-0.5 h-3 bg-white rounded-full" />
              <div className="w-0.5 h-3.5 bg-white rounded-full" />
            </div>
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Dynamic Island / Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl" />
    </div>
  );
}
