import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router";

export default function CustomerLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For prototype purposes, navigate to onboarding first
    navigate("/onboarding");
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div>
          <h1 className="font-semibold text-slate-900">Customer Login</h1>
          <p className="text-xs text-slate-500">
            Access your account
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
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-sm">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              Welcome back
            </h2>
            <p className="text-slate-600 text-sm">
              Sign in to manage your aircon services
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Mail className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder:text-slate-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-sm hover:bg-blue-700 transition-colors mt-6"
            >
              Sign In
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-500">OR</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Demo Login */}
          <button
            onClick={() => navigate("/customer/home")}
            className="w-full bg-slate-100 text-slate-700 py-3 rounded-lg font-medium hover:bg-slate-200 transition-colors text-sm"
          >
            Continue with Demo Account
          </button>
        </motion.div>

        {/* Sign Up Link */}
        <div className="text-center text-sm text-slate-600 mt-6">
          Don't have an account?{" "}
          <button className="font-semibold text-blue-600 hover:text-blue-700">
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}