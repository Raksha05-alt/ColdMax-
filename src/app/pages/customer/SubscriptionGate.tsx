import { motion } from "motion/react";
import { ArrowLeft, Activity, TrendingUp, Bell, Crown, Check } from "lucide-react";
import { useNavigate } from "react-router";

export default function SubscriptionGate() {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 z-50 flex flex-col h-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 right-10 w-64 h-64 bg-blue-400 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-emerald-400 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="px-5 pt-4 pb-4 flex items-center justify-between relative z-20">
        <button
          onClick={() => navigate("/customer/home")}
          className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-white text-sm">
          Health Monitoring
        </span>
        <div className="w-10 h-10" />
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-20 pb-20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 relative"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-emerald-400 rounded-full"
          />
          <Activity className="w-10 h-10 text-emerald-400 relative z-10" strokeWidth={2.5} />
        </motion.div>

        <h1 className="text-2xl font-bold text-white mb-3 text-center">
          This is a Subscription Feature!
        </h1>
        
        <p className="text-blue-200 text-center mb-8 max-w-sm">
          Learn more about your air con health with us today via your profile.
        </p>

        {/* Feature List */}
        <div className="w-full max-w-sm space-y-3 mb-8">
          {[
            {
              icon: Activity,
              title: "Real-time Health Monitoring",
              desc: "Track all your AC units in one dashboard"
            },
            {
              icon: TrendingUp,
              title: "Performance Insights",
              desc: "Refrigerant levels, temperature, efficiency"
            },
            {
              icon: Bell,
              title: "Smart Alerts",
              desc: "Get notified before issues become problems"
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-start gap-3"
            >
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center shrink-0">
                <feature.icon className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm mb-0.5">
                  {feature.title}
                </h3>
                <p className="text-xs text-blue-200">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={() => navigate("/customer/subscriptions")}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Crown className="w-5 h-5" />
            View Subscription Plans
          </button>
          
          <button
            onClick={() => navigate("/customer/home")}
            className="w-full py-3 bg-white/10 backdrop-blur-md text-white rounded-xl font-semibold border border-white/20 active:scale-95 transition-transform"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
