import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Settings, Activity, Thermometer, Droplets, Wind, Fan, Info, AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import clsx from "clsx";
import { useSubscription } from "../../context/SubscriptionContext";
import { useUnits } from "../../context/UnitsContext";

export default function HealthMonitor() {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const { tier } = useSubscription();
  const { units, getDiagnostic, isLoading } = useUnits();
  
  const initialIndex = unitId ? units.findIndex((u: any) => u.id === Number(unitId)) : 0;
  const [selectedIndex, setSelectedIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  
  const unit = units[selectedIndex];
  const healthData = getDiagnostic(unit?.id);

  useEffect(() => {
    if (unitId) {
      const idx = units.findIndex((u: any) => u.id === Number(unitId));
      if (idx >= 0) setSelectedIndex(idx);
    }
  }, [unitId, units]);

  const displayHealthPercent = unit?.healthPercent || 0;
  const healthPercent = displayHealthPercent / 100;
  const circumference = 2 * Math.PI * 110;

  // Sensor data with descriptions
  const sensorData = [
    {
      icon: Thermometer,
      color: "blue",
      label: "Room Temperature",
      value: unit.temp,
      description: "Current ambient temperature in the room",
      info: "Optimal range: 20-24°C for comfort and efficiency"
    },
    {
      icon: Thermometer,
      color: "cyan",
      label: "Evaporator Temp",
      value: unit.evaporatorTemp,
      description: "Temperature of evaporator coil (refrigerant intake)",
      info: "Should be 10-15°C lower than room temp for proper cooling"
    },
    {
      icon: Droplets,
      color: "purple",
      label: "Humidity",
      value: unit.humidity,
      description: "Relative humidity level in the room",
      info: "Optimal range: 40-60% for comfort and mold prevention"
    },
    {
      icon: Wind,
      color: "emerald",
      label: "Airflow Rate",
      value: unit.airflow,
      description: "Volume of air moved per minute (CFM)",
      info: "Higher CFM indicates better circulation and faster cooling"
    },
    {
      icon: Fan,
      color: "amber",
      label: "Fan Speed",
      value: unit.fanSpeed,
      description: "Current fan motor speed setting",
      info: "Auto mode adjusts speed based on temperature difference"
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 text-white font-sans pb-6">
      {/* Header */}
      <header className="px-6 pt-2 pb-4 flex items-center justify-between sticky top-0 bg-neutral-900/80 backdrop-blur-md z-50">
        <button 
          onClick={() => navigate('/customer/units')} 
          className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-white shadow-sm border border-neutral-700 backdrop-blur-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg tracking-tight">Health Monitor</span>
          <span className="bg-gradient-to-r from-emerald-400 to-teal-400 text-transparent bg-clip-text text-[10px] font-black uppercase tracking-widest border border-emerald-500/30 px-2 py-0.5 rounded-full">Pro</span>
        </div>
        <button className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-white shadow-sm border border-neutral-700 backdrop-blur-md">
           <Settings className="w-5 h-5" />
        </button>
      </header>

      <div className="px-6 py-6 space-y-6">
        
        {/* AI Explanation Banner */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-4 border border-blue-500/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-1">AI-Powered Health Score</h3>
              <p className="text-xs text-blue-200 leading-relaxed">
                Our regression model analyzes sensor data in real-time to predict maintenance needs and assign a health score. Weighted factors include temperature differentials, airflow efficiency, and filter condition.
              </p>
            </div>
          </div>
        </div>

        {/* Unit Selector */}
        <div className="flex gap-3 overflow-x-auto snap-x pb-2 -mx-6 px-6" style={{ scrollbarWidth: 'none' }}>
          {units.map((u, i) => (
            <button
              key={u.id}
              onClick={() => {
                setSelectedIndex(i);
                navigate(`/customer/health/${u.id}`, { replace: true });
              }}
              className={clsx(
                "snap-center shrink-0 px-5 py-2.5 rounded-full font-semibold text-sm transition-all",
                selectedIndex === i
                  ? "bg-emerald-500 text-neutral-900 font-bold shadow-lg shadow-emerald-500/20"
                  : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:border-neutral-500"
              )}
            >
              {u.name}
            </button>
          ))}
        </div>

        {/* Main Circular Gauge - AIR CON HEALTH */}
        <div className="relative flex flex-col items-center justify-center py-8">
           <div className="relative w-64 h-64 flex items-center justify-center">
             {/* Background Ring */}
             <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="128" cy="128" r="110" stroke="rgba(255,255,255,0.05)" strokeWidth="16" fill="none" strokeLinecap="round" />
                <motion.circle 
                  key={`${unit.id}-${displayHealthPercent}`}
                  cx="128" cy="128" r="110" 
                  stroke="url(#gradient)" 
                  strokeWidth="16" 
                  fill="none" 
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: circumference - (circumference * healthPercent) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={displayHealthPercent >= 70 ? "#10b981" : "#f59e0b"} />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
             </svg>
             
             {/* Inner Info - AC HEALTH SCORE */}
             <div className="text-center flex flex-col items-center justify-center z-10">
                <div className={clsx(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 border",
                  displayHealthPercent >= 70 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                )}>
                   <Activity className="w-3.5 h-3.5" /> AI Health Score
                </div>
                <div className="text-6xl font-black tabular-nums tracking-tighter">
                   {isLoading ? (
                     <Loader2 className="w-10 h-10 animate-spin text-neutral-500 mx-auto" />
                   ) : (
                     <>{displayHealthPercent}<span className="text-3xl font-bold text-neutral-500">%</span></>
                   )}
                </div>
                <div className="text-sm font-medium text-neutral-400 mt-1">
                  {isLoading ? "Analyzing..." : (healthData?.alert.label || unit.status)}
                </div>
                <div className="text-xs text-neutral-500 mt-1">{unit.name} • {unit.model}</div>
             </div>

             {/* Glow */}
             <div className={clsx(
               "absolute inset-0 blur-3xl rounded-full pointer-events-none",
               displayHealthPercent >= 70 ? "bg-emerald-500/5" : "bg-amber-500/5"
             )} />
           </div>
        </div>

        {/* Health Score Interpretation */}
        <div className="bg-neutral-800 rounded-2xl border border-neutral-700 p-5">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4">
            Health Score Ranges
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-8 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-emerald-400">80+</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-400 mb-0.5">Excellent</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Unit is operating optimally. Continue regular maintenance schedule.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-12 h-8 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-blue-400">60-79</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-blue-400 mb-0.5">Good</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Minor efficiency loss. Consider scheduling maintenance within 2-4 weeks.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-12 h-8 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-amber-400">40-59</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-400 mb-0.5">Fair</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Noticeable issues detected. Book service within 1-2 weeks to prevent breakdown.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-12 h-8 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-red-400">&lt;40</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-400 mb-0.5">Critical</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Immediate attention required. Unit at risk of failure. Book emergency service now.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Unit Status */}
        <div className={clsx(
          "rounded-2xl border p-5 transition-colors",
          displayHealthPercent >= 80 
            ? "bg-emerald-500/10 border-emerald-500/30"
            : displayHealthPercent >= 60
            ? "bg-blue-500/10 border-blue-500/30"
            : displayHealthPercent >= 40
            ? "bg-amber-500/10 border-amber-500/30"
            : "bg-red-500/10 border-red-500/30"
        )}>
          <h3 className="text-sm font-bold text-white mb-2">Current Assessment</h3>
          {isLoading ? (
            <div className="flex items-center gap-2 text-neutral-400 text-sm py-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Fetching AI diagnostic report...
            </div>
          ) : (
            <>
              <p className="text-sm text-neutral-300 leading-relaxed mb-4">
                {healthData?.diagnosis?.root_cause_analysis || "Diagnosis unavailable."}
              </p>
              
              {healthData?.diagnosis?.recommendations && healthData.diagnosis.recommendations.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Recommended Actions</h4>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-sm text-blue-100 leading-relaxed">
                      {healthData.diagnosis.recommendations.map((rec: any) => {
                        const issue = rec.issue || Object.keys(rec)[0];
                        const resolution = rec.resolution || Object.values(rec)[0];
                        return `${issue}: ${resolution}`;
                      }).join(". ")}.
                      <span className="block mt-2 font-semibold text-emerald-400">
                        ✨ Next Schedule: Based on your current usage and health score, we recommend a {displayHealthPercent < 60 ? "Chemical Overhaul" : "General Servicing"} in {displayHealthPercent < 60 ? "1 month" : displayHealthPercent < 80 ? "3 months" : "6 months"}.
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Free servicing eligibility note */}
          {displayHealthPercent >= 80 ? (
            <div className="mt-3 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-xs text-blue-200 leading-relaxed">
                ℹ️ Your unit is performing excellently. You are entitled to a <strong>maximum of 2 free servicing appointments</strong> annually at this health level.
              </p>
            </div>
          ) : displayHealthPercent < 80 && (
            <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
              <p className="text-xs text-emerald-200 leading-relaxed">
                ℹ️ Your unit's health score qualifies for <strong>unlimited free servicing visits</strong> to restore optimal performance.
              </p>
            </div>
          )}

          <button
            onClick={() => navigate('/customer/booking')}
            className={clsx(
              "w-full mt-4 py-3 rounded-xl font-bold shadow-lg transition-all",
              displayHealthPercent < 40
                ? "bg-red-500 text-white hover:bg-red-600"
                : displayHealthPercent < 80
                ? "bg-amber-500 text-amber-950 hover:bg-amber-600"
                : "bg-white text-neutral-900 hover:bg-neutral-100"
            )}
          >
            {displayHealthPercent < 40 ? "Book Emergency Service" : "Schedule Servicing"}
          </button>
        </div>

        {/* Sensor Readings with Descriptions */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
            <Info className="w-4 h-4" /> Live Sensor Data
          </h3>
          
          {sensorData.map((sensor, idx) => {
            const Icon = sensor.icon;
            const colorClasses = {
              blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
              cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
              purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
              emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
              amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
            };
            
            return (
              <div key={idx} className="bg-neutral-800 rounded-2xl border border-neutral-700/50 overflow-hidden hover:bg-neutral-800/80 transition-colors">
                <div className="p-4 flex items-start gap-4">
                  <div className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                    colorClasses[sensor.color as keyof typeof colorClasses]
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1">
                      <div className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                        {sensor.label}
                      </div>
                      <div className="text-xl font-bold">{sensor.value}</div>
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed mb-1">{sensor.description}</p>
                    <p className="text-[10px] text-neutral-600 leading-relaxed">{sensor.info}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter Health Alert */}
        <div className="bg-gradient-to-r from-neutral-800 to-neutral-800 p-5 rounded-3xl border border-neutral-700 flex items-center gap-4 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <AlertTriangle className="w-24 h-24" />
           </div>
           
           <div className={clsx(
             "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
             unit.filterHealth <= 20 ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
           )}>
             <AlertTriangle className="w-6 h-6" />
           </div>
           <div className="flex-1 min-w-0 z-10">
             <h3 className="font-bold text-white mb-1">Filter Health at {unit.filterHealth}%</h3>
             <div className="w-full bg-neutral-700 rounded-full h-1.5 mb-2">
               <div 
                 className={clsx(
                   "h-1.5 rounded-full transition-all duration-500",
                   unit.filterHealth <= 20 ? "bg-amber-500" : "bg-emerald-500"
                 )} 
                 style={{ width: `${unit.filterHealth}%` }} 
               />
             </div>
             <p className="text-xs text-neutral-400 font-medium truncate">
               {unit.filterHealth <= 20 ? "Consider booking a cleaning soon." : "Filter is in good condition."}
             </p>
           </div>
        </div>

      </div>
    </div>
  );
}