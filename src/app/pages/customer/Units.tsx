import { ArrowLeft, Plus, Fan, BatteryWarning } from "lucide-react";
import { useNavigate } from "react-router";
import { units } from "../../data/units";

export default function Units() {
  const navigate = useNavigate();

  const unitIcons = [Fan, BatteryWarning];

  return (
    <div className="flex flex-col min-h-full bg-slate-50 pb-6">
      <div className="bg-white border-b border-slate-200 px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => navigate("/customer/home")}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Units</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {units.length} aircon {units.length === 1 ? "unit" : "units"} registered
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        {units.map((unit, index) => {
          const Icon = unitIcons[index] || Fan;
          return (
            <button
              key={unit.id}
              onClick={() => navigate(`/customer/health/${unit.id}`)}
              className="w-full bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className={`w-12 h-12 ${
                    unit.statusColor === "emerald"
                      ? "bg-blue-50"
                      : "bg-amber-50"
                  } rounded-lg flex items-center justify-center shrink-0`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      unit.statusColor === "emerald"
                        ? "text-blue-600"
                        : "text-amber-600"
                    }`}
                    strokeWidth={2}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 mb-0.5">
                    {unit.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {unit.model} • {unit.btu}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900">
                    {unit.temp}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      unit.statusColor === "emerald"
                        ? "bg-emerald-500"
                        : "bg-amber-500 animate-pulse"
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      unit.statusColor === "emerald"
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {unit.status}
                  </span>
                </div>
                <span className="text-xs font-semibold text-blue-600">
                  View Health →
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Add Unit CTA */}
      <div className="px-5 mt-4">
        <button className="w-full bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
          <Plus className="w-6 h-6 text-slate-500" />
          <span className="text-sm font-semibold text-slate-600">
            Add New Unit
          </span>
        </button>
      </div>
    </div>
  );
}
