import { motion } from "motion/react";
import { AlertCircle, CalendarClock, Activity, MapPin, X, AlertTriangle, Crown, Calendar, Clock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import { useLocation } from "../../context/LocationContext";
import { useSubscription } from "../../context/SubscriptionContext";
import { units } from "../../data/units";
import { useState, useEffect } from "react";
import { PushNotification } from "../../components/PushNotification";
import { StatusBarOverlay } from "../../components/PhoneFrame";

export default function Home() {
  const navigate = useNavigate();
  const { selectedLocation } = useLocation();
  const { isPremium, isSubscribed, tier } = useSubscription();
  const [showRefrigerantAlert, setShowRefrigerantAlert] = useState(true);
  const [showPushNotification, setShowPushNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({
    title: "",
    message: "",
  });

  const totalUnits = units.length;
  const REFRIGERANT_LEVEL = 8;

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotificationData({
        title: "Low Refrigerant Alert",
        message: `Master Bedroom unit is at ${REFRIGERANT_LEVEL}%. Service recommended.`,
      });
      setShowPushNotification(true);
      setTimeout(() => {
        setShowPushNotification(false);
      }, 4000);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-700 to-blue-900 relative overflow-hidden">
      <StatusBarOverlay />

      <PushNotification
        show={showPushNotification}
        title={notificationData.title}
        message={notificationData.message}
        onDismiss={() => setShowPushNotification(false)}
      />

      {/* Background Patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400 rounded-full blur-3xl" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="relative z-10 px-5 pt-6 pb-6">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1">Good Morning</p>
              <h1 className="text-white text-2xl font-bold">Alex Chen</h1>
              {isPremium && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-amber-900 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Premium Member
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate("/customer/profile")}
              className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-lg"
            >
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </button>
          </div>

          {/* Home Location */}
          <button
            onClick={() => navigate("/customer/profile")}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-3 w-full mb-6"
          >
            <MapPin className="w-4 h-4 text-blue-200" />
            <div className="flex-1 text-left">
              <p className="text-[10px] font-semibold text-blue-200 uppercase tracking-wider">
                Home Location
              </p>
              <p className="text-white text-sm font-semibold">
                {selectedLocation}
              </p>
            </div>
            <svg className="w-4 h-4 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Low Refrigerant Alert */}
        {showRefrigerantAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 px-5 mb-6"
          >
            <div className="bg-red-500 rounded-xl p-4 shadow-lg relative">
              <button
                onClick={() => setShowRefrigerantAlert(false)}
                className="absolute top-3 right-3 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <div className="flex items-start gap-3 pr-6">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm mb-1">Low Refrigerant Alert</h3>
                  <p className="text-xs text-white/90 mb-3 leading-relaxed">
                    Your Master Bedroom unit has critically low refrigerant level ({REFRIGERANT_LEVEL}%). Immediate service recommended.
                  </p>
                  <button
                    onClick={() => navigate("/customer/units")}
                    className="bg-white text-red-600 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-white/90 transition-colors"
                  >
                    View Unit Details
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions Grid */}
        <div className="relative z-10 px-5 grid grid-cols-2 gap-3 mb-6">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/customer/urgent")}
            className="bg-white rounded-xl p-4 flex flex-col items-start shadow-lg"
          >
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mb-3">
              <AlertCircle className="w-5 h-5 text-red-600" strokeWidth={2.5} />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm mb-0.5">Emergency</h3>
            <p className="text-xs text-slate-500">Get help now</p>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/customer/booking")}
            className="bg-white rounded-xl p-4 flex flex-col items-start shadow-lg"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
              <CalendarClock className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm mb-0.5">Book Service</h3>
            <p className="text-xs text-slate-500">
              {isPremium ? "Free with plan" : "Schedule now"}
            </p>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/customer/health")}
            className="bg-slate-900 rounded-xl p-4 flex flex-col items-start shadow-lg col-span-2 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 opacity-10">
              <Activity className="w-20 h-20 text-white" />
            </div>
            <div className="relative z-10 flex items-center justify-between w-full">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-emerald-400" strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-white text-sm">Live Health Monitor</h3>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  </div>
                  <p className="text-xs text-slate-400">
                    {isSubscribed ? `${tier === "premium" ? "Premium" : "Standard"} Subscription` : "Standard & Premium"}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-1 rounded-full">
                PRO
              </span>
            </div>
          </motion.button>

          {/* Show subscription CTA only if NOT premium */}
          {!isPremium && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/customer/subscriptions")}
              className="bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl p-4 flex flex-col items-start shadow-lg col-span-2 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 opacity-20">
                <Crown className="w-24 h-24 text-amber-900" />
              </div>
              <div className="relative z-10 flex items-center justify-between w-full">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-900/20 rounded-lg flex items-center justify-center">
                    <Crown className="w-5 h-5 text-amber-900" strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-amber-900 text-sm mb-0.5">Upgrade to Premium</h3>
                    <p className="text-xs text-amber-800 font-medium">Free maintenance included</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-900" />
              </div>
            </motion.button>
          )}

          {/* Premium member badge instead of upgrade CTA */}
          {isPremium && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/customer/subscriptions")}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 flex flex-col items-start shadow-lg col-span-2 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 opacity-10">
                <Crown className="w-24 h-24 text-amber-400" />
              </div>
              <div className="relative z-10 flex items-center justify-between w-full">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <Crown className="w-5 h-5 text-amber-400" strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white text-sm mb-0.5">Premium Member</h3>
                    <p className="text-xs text-slate-400 font-medium">Free maintenance included in your plan</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            </motion.button>
          )}
        </div>

        {/* My Units Summary */}
        <div className="relative z-10 px-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">My Units</h2>
            <button onClick={() => navigate("/customer/units")} className="text-blue-200 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-3xl font-bold text-white">{totalUnits}</p>
                <p className="text-sm text-blue-200">Active units</p>
              </div>
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-white/10 rounded-lg px-3 py-2">
                <p className="text-xs text-blue-200 mb-0.5">Optimal</p>
                <p className="text-white font-semibold">{units.filter(u => u.statusColor === "emerald").length}</p>
              </div>
              <div className="flex-1 bg-amber-500/20 rounded-lg px-3 py-2">
                <p className="text-xs text-amber-200 mb-0.5">Attention</p>
                <p className="text-white font-semibold">{units.filter(u => u.statusColor === "amber").length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Appointment & Schedule */}
        <div className="relative z-10 px-5 pb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">Upcoming</h2>
            <button onClick={() => navigate("/customer/upcoming")} className="text-blue-200 text-sm font-medium">
              View All
            </button>
          </div>
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/customer/upcoming")}
            className="bg-white rounded-xl p-4 shadow-lg flex items-center gap-4"
          >
            <div className="bg-blue-50 rounded-lg px-3 py-2 text-center">
              <p className="text-[10px] font-semibold text-blue-600 uppercase">Oct</p>
              <p className="text-xl font-bold text-blue-600">24</p>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 text-sm mb-1">General Maintenance</h3>
              <p className="text-xs text-slate-500">09:00 AM - David Tan</p>
              {isPremium && (
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Free with Premium</p>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
