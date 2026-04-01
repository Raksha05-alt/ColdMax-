import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Check, Bell, Activity, Sparkles, Crown, X } from "lucide-react";
import { useNavigate } from "react-router";
import { clsx } from "clsx";
import { useSubscription } from "../../context/SubscriptionContext";

export default function Subscriptions() {
  const navigate = useNavigate();
  const { tier, setTier, isPremium, isStandard } = useSubscription();
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  const plans = [
    {
      id: "standard" as const,
      name: "Standard",
      price: "$29",
      period: "/month/unit",
      description: "Smart monitoring with AI alerts",
      icon: Bell,
      color: "blue",
      features: [
        "IoT sensors for all AC units",
        "Real-time health monitoring",
        "AI-powered predictive alerts",
        "Push notifications",
        "Monthly health reports",
      ],
      notIncluded: [
        "Free maintenance services",
        "Priority technician matching",
      ],
    },
    {
      id: "premium" as const,
      name: "Premium",
      price: "$99",
      period: "/month/unit",
      description: "Complete care with unlimited service",
      icon: Sparkles,
      color: "amber",
      isPopular: true,
      features: [
        "Everything in Standard",
        "Unlimited free maintenance scheduling",
        "Priority technician dispatch",
        "No per-service charges",
        "24/7 emergency support",
        "Annual chemical wash included",
        "Dedicated account manager",
      ],
      notIncluded: [],
    },
  ];

  const handleSubscribe = (planId: string) => {
    setShowConfirm(planId);
  };

  const confirmSubscribe = () => {
    if (showConfirm) {
      setTier(showConfirm as any);
      setShowConfirm(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-5 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/customer/home")}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="font-bold text-white text-xl">Subscriptions</h1>
            <p className="text-xs text-blue-100">Choose your care plan</p>
          </div>
        </div>

        {/* Current Plan Badge */}
        {tier !== "none" && (
          <div className={clsx(
            "rounded-xl p-4 border",
            isPremium
              ? "bg-gradient-to-r from-amber-400/20 to-orange-400/20 border-amber-400/30"
              : "bg-white/10 border-white/20"
          )}>
            <div className="flex items-center gap-3">
              <div className={clsx(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                isPremium ? "bg-amber-400/20" : "bg-white/20"
              )}>
                <Crown className={clsx("w-5 h-5", isPremium ? "text-amber-400" : "text-white")} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-blue-100 mb-0.5">Current Plan</p>
                <p className="text-white font-bold text-lg">{isPremium ? "Premium" : "Standard"} Subscription</p>
                {isPremium && (
                  <p className="text-xs text-amber-300 font-medium mt-0.5">Free maintenance included in your plan</p>
                )}
              </div>
            </div>
          </div>
        )}

        {tier === "none" && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-blue-100 mb-1">Why subscribe?</p>
                <p className="text-white font-medium text-sm leading-relaxed">
                  Our AI-powered sensors predict maintenance needs before breakdowns occur, saving you money and hassle.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Plans */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = tier === plan.id;
          return (
            <motion.div
              key={plan.id}
              whileTap={{ scale: 0.98 }}
              className={clsx(
                "bg-white rounded-2xl border-2 shadow-lg relative overflow-hidden",
                isCurrentPlan ? "border-emerald-400" :
                plan.isPopular ? "border-amber-400" : "border-slate-200"
              )}
            >
              {isCurrentPlan && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                  Current Plan
                </div>
              )}
              {!isCurrentPlan && plan.isPopular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-orange-400 text-amber-900 text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      plan.color === "amber" ? "bg-amber-50" : "bg-blue-50"
                    )}>
                      <Icon className={clsx(
                        "w-6 h-6",
                        plan.color === "amber" ? "text-amber-600" : "text-blue-600"
                      )} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{plan.name}</h3>
                      <p className="text-xs text-slate-500">{plan.description}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                    <span className="text-sm text-slate-500 font-medium">{plan.period}</span>
                  </div>
                  {plan.id === "premium" && (
                    <p className="text-xs text-emerald-600 font-semibold mt-1">
                      Save $500+ annually on maintenance
                    </p>
                  )}
                </div>

                <div className="space-y-2.5 mb-6">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className={clsx(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        plan.color === "amber" ? "bg-amber-100" : "bg-blue-100"
                      )}>
                        <Check className={clsx(
                          "w-3.5 h-3.5",
                          plan.color === "amber" ? "text-amber-600" : "text-blue-600"
                        )} strokeWidth={3} />
                      </div>
                      <span className="text-sm text-slate-700 leading-relaxed">{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature, idx) => (
                    <div key={`not-${idx}`} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-slate-100">
                        <X className="w-3.5 h-3.5 text-slate-400" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-slate-400 leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>

                {isCurrentPlan ? (
                  <div className="w-full py-3.5 rounded-xl font-bold text-center bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Your Current Plan
                  </div>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    className={clsx(
                      "w-full py-3.5 rounded-xl font-bold shadow-md transition-all active:scale-98",
                      plan.isPopular
                        ? "bg-gradient-to-r from-amber-400 to-orange-400 text-amber-900 hover:shadow-amber-200"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    )}
                  >
                    {tier === "none" ? `Subscribe to ${plan.name}` :
                     tier === "standard" && plan.id === "premium" ? "Upgrade to Premium" :
                     tier === "premium" && plan.id === "standard" ? "Downgrade to Standard" :
                     `Subscribe to ${plan.name}`}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Cancel subscription option */}
        {tier !== "none" && (
          <button
            onClick={() => setTier("none")}
            className="w-full py-3 text-center text-red-500 text-sm font-medium"
          >
            Cancel Subscription
          </button>
        )}
      </div>

      {/* Bottom Info */}
      <div className="px-5 py-4 border-t border-slate-200 bg-white">
        <p className="text-xs text-slate-500 text-center leading-relaxed">
          All plans include 14-day free trial. Cancel anytime. No hidden fees.
        </p>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Confirm Subscription</h3>
              <p className="text-sm text-slate-600">
                Subscribe to {showConfirm === "premium" ? "Premium" : "Standard"} plan at {showConfirm === "premium" ? "$99" : "$29"}/month/unit?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubscribe}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
