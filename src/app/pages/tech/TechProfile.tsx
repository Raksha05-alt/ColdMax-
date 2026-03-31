import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LogOut, User, Shield, Bell, ChevronRight, ChevronDown, ArrowLeft,
  Star, Briefcase, Award, Clock, MapPin, Wrench, Calendar, CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router";
import { clsx } from "clsx";

export default function TechProfile() {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const reviews = [
    { id: 1, customer: "Sarah Lim", rating: 5, date: "12 Aug 2024", comment: "Excellent service! Very professional and thorough." },
    { id: 2, customer: "John Tan", rating: 5, date: "05 Jul 2024", comment: "Quick response and fixed the issue perfectly." },
    { id: 3, customer: "Mary Wong", rating: 4, date: "20 May 2024", comment: "Great work, very knowledgeable technician." },
  ];

  const certifications = [
    { name: "Certified HVAC Technician", issuer: "Singapore HVAC Board", date: "Jan 2020", status: "Active" },
    { name: "Daikin Authorized Specialist", issuer: "Daikin Singapore", date: "Mar 2021", status: "Active" },
    { name: "Mitsubishi Service Certified", issuer: "Mitsubishi Electric", date: "Jun 2022", status: "Active" },
    { name: "Chemical Wash Expert Level 2", issuer: "Cold Max Academy", date: "Sep 2023", status: "Active" },
  ];

  const specialties = [
    { name: "General Maintenance", level: "Expert", jobs: 420 },
    { name: "Chemical Wash", level: "Expert", jobs: 310 },
    { name: "Gas Top-Up", level: "Advanced", jobs: 245 },
    { name: "Repair & Diagnosis", level: "Expert", jobs: 180 },
    { name: "Installation", level: "Intermediate", jobs: 49 },
  ];

  const workHistory = [
    { period: "2021 - Present", role: "Senior Technician", company: "Cold Max Pte Ltd", note: "Top 5% performer" },
    { period: "2018 - 2021", role: "Technician", company: "Cool Air Services", note: "Promoted in 2 years" },
    { period: "2016 - 2018", role: "Junior Technician", company: "AirPro SG", note: "Training & apprenticeship" },
  ];

  const availability = {
    schedule: [
      { day: "Monday - Friday", time: "08:00 AM - 06:00 PM" },
      { day: "Saturday", time: "09:00 AM - 02:00 PM" },
      { day: "Sunday", time: "Off" },
    ],
    emergencyAvailable: true,
    maxJobsPerDay: 6,
    preferredRadius: "15 km",
  };

  const expandableSections = [
    {
      id: "certifications",
      label: "Certifications",
      icon: Award,
      color: "text-amber-600",
      bg: "bg-amber-50",
      content: (
        <div className="space-y-3 pt-3">
          {certifications.map((cert, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900 text-sm">{cert.name}</p>
                <p className="text-xs text-slate-500">{cert.issuer}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-400">{cert.date}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{cert.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "rating",
      label: "Rating & Reviews",
      icon: Star,
      color: "text-amber-600",
      bg: "bg-amber-50",
      content: (
        <div className="pt-3">
          <div className="flex items-center gap-3 mb-4 p-3 bg-amber-50 rounded-lg">
            <div className="text-center">
              <p className="text-3xl font-black text-amber-600">4.9</p>
              <div className="flex items-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3 h-3 text-amber-500 fill-amber-500" />
                ))}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">1,204 total reviews</p>
              <p className="text-xs text-slate-500">92% five-star ratings</p>
            </div>
          </div>
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="pb-3 border-b border-slate-100 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-slate-900 text-sm">{review.customer}</p>
                  <div className="flex items-center gap-0.5">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-1">{review.comment}</p>
                <p className="text-[10px] text-slate-400">{review.date}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "specialties",
      label: "Specialties",
      icon: Wrench,
      color: "text-blue-600",
      bg: "bg-blue-50",
      content: (
        <div className="space-y-2 pt-3">
          {specialties.map((spec, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900 text-sm">{spec.name}</p>
                <p className="text-xs text-slate-500">{spec.jobs} completed jobs</p>
              </div>
              <span className={clsx(
                "text-[10px] font-bold px-2 py-1 rounded-full uppercase",
                spec.level === "Expert" ? "bg-emerald-50 text-emerald-600" :
                spec.level === "Advanced" ? "bg-blue-50 text-blue-600" :
                "bg-slate-100 text-slate-600"
              )}>
                {spec.level}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "availability",
      label: "Availability",
      icon: Clock,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      content: (
        <div className="pt-3 space-y-3">
          <div className="space-y-2">
            {availability.schedule.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">{s.day}</span>
                <span className={clsx("text-sm font-semibold", s.time === "Off" ? "text-slate-400" : "text-slate-900")}>{s.time}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-50 rounded-lg p-3 text-center">
              <p className="text-xs text-emerald-600 mb-1">Emergency</p>
              <p className="font-bold text-emerald-700 text-sm">Available</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-xs text-blue-600 mb-1">Max Jobs/Day</p>
              <p className="font-bold text-blue-700 text-sm">{availability.maxJobsPerDay}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "history",
      label: "Work History",
      icon: Briefcase,
      color: "text-purple-600",
      bg: "bg-purple-50",
      content: (
        <div className="pt-3 space-y-3 relative pl-4">
          <div className="absolute top-6 bottom-3 left-[7px] w-0.5 bg-slate-200" />
          {workHistory.map((wh, i) => (
            <div key={i} className="relative">
              <div className="absolute left-[-16px] top-1.5 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-white" />
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-600 mb-0.5">{wh.period}</p>
                <p className="font-medium text-slate-900 text-sm">{wh.role}</p>
                <p className="text-xs text-slate-500">{wh.company}</p>
                <p className="text-[10px] text-emerald-600 font-medium mt-1">{wh.note}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/tech/dashboard")}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Technician Profile</h1>
            <p className="text-xs text-slate-500">Manage your profile & credentials</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* User Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-16 bg-slate-200 rounded-full overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1744853930655-52d02b83abb6?auto=format&fit=crop&w=200&q=80"
                alt="Profile"
                className="w-full h-full object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                <CheckCircle className="w-4 h-4 text-white fill-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="font-bold text-slate-900">David Tan</h2>
                <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full">
                  <Shield className="w-3 h-3 text-blue-600" />
                  <span className="text-[10px] font-bold text-blue-600">VERIFIED</span>
                </div>
              </div>
              <p className="text-sm text-slate-500">david.tan@coldmax.com</p>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-slate-500" />
                  <span className="text-xs text-slate-600 font-medium">Senior Technician</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-slate-900">4.9</span>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-slate-900">1,204</p>
              <p className="text-[10px] text-slate-500">Jobs Done</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-slate-900">5 yrs</p>
              <p className="text-[10px] text-slate-500">Experience</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-emerald-600">Top 5%</p>
              <p className="text-[10px] text-slate-500">Ranking</p>
            </div>
          </div>
        </div>

        {/* Expandable Sections */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {expandableSections.map((section, idx) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === section.id;
            return (
              <div key={section.id} className={clsx(idx > 0 && "border-t border-slate-100")}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${section.bg}`}>
                      <Icon className={`w-5 h-5 ${section.color}`} />
                    </div>
                    <span className="font-medium text-slate-900">{section.label}</span>
                  </div>
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  </motion.div>
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
                      <div className="px-4 pb-4">{section.content}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {[
            { icon: User, label: "Account Details", color: "text-blue-600", bg: "bg-blue-50" },
            { icon: Bell, label: "Notifications", color: "text-amber-600", bg: "bg-amber-50" },
            { icon: MapPin, label: "Service Area", color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((item, i) => (
            <button
              key={i}
              className="w-full flex items-center justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.bg}`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="font-medium text-slate-900">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate("/")}
          className="w-full bg-red-50 border border-red-200 text-red-600 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
