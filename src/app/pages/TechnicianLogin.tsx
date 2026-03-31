import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router";

export default function TechnicianLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For prototype purposes, directly navigate
    navigate("/tech/dashboard");
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div>
          <h1 className="font-semibold text-white">Technician Portal</h1>
          <p className="text-xs text-slate-400">
            Access your dashboard
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1"
        >
          <div className="mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Technician Login
            </h2>
            <p className="text-slate-400 text-sm">
              Sign in to manage your jobs and earnings
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Mail className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="technician@coldmax.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder:text-slate-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors mt-6"
            >
              Sign In
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-xs text-slate-500">OR</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          {/* Demo Login */}
          <button
            onClick={() => navigate("/tech/dashboard")}
            className="w-full bg-slate-800 border border-slate-700 text-slate-300 py-3 rounded-lg font-medium hover:bg-slate-700 transition-colors text-sm"
          >
            Continue with Demo Account
          </button>
        </motion.div>

        {/* Support Link */}
        <div className="text-center text-sm text-slate-500 mt-6">
          Need help?{" "}
          <button className="font-semibold text-blue-400 hover:text-blue-300">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
