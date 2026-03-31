import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Calendar, Clock, MapPin, Wrench, User, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import { clsx } from "clsx";
import { useBooking } from "../../context/BookingContext";

const mockUpcoming = [
  {
    id: 1,
    date: "Oct 24, 2026",
    dayLabel: "Oct",
    dayNumber: "24",
    time: "09:00 - 12:00",
    service: "General Maintenance",
    technician: "David Tan",
    location: "Living Room",
    units: 2,
    status: "confirmed",
  },
  {
    id: 2,
    date: "Nov 05, 2026",
    dayLabel: "Nov",
    dayNumber: "05",
    time: "13:00 - 16:00",
    service: "Chemical Wash",
    technician: "John Lim",
    location: "Master Bedroom",
    units: 1,
    status: "confirmed",
  },
  {
    id: 3,
    date: "Nov 20, 2026",
    dayLabel: "Nov",
    dayNumber: "20",
    time: "09:00 - 12:00",
    service: "Filter Cleaning",
    technician: "David Tan",
    location: "Living Room",
    units: 1,
    status: "pending",
  },
];

export default function UpcomingSchedule() {
  const navigate = useNavigate();
  const { currentBooking } = useBooking();

  const allUpcoming = currentBooking
    ? [
        {
          id: 0,
          date: currentBooking.dateFormatted,
          dayLabel: currentBooking.date.split(" ")[0],
          dayNumber: currentBooking.date.split(" ")[1],
          time: currentBooking.time,
          service: currentBooking.service,
          technician: currentBooking.technician,
          location: currentBooking.unit,
          units: 1,
          status: currentBooking.status,
        },
        ...mockUpcoming,
      ]
    : mockUpcoming;

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/customer/home")}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Upcoming Schedule</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {allUpcoming.length} upcoming appointment{allUpcoming.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-3 pb-6">
        {allUpcoming.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">No upcoming appointments</h3>
            <p className="text-sm text-slate-500 mb-4">Schedule a service to get started</p>
            <button
              onClick={() => navigate("/customer/booking")}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Book Service
            </button>
          </div>
        ) : (
          allUpcoming.map((apt) => (
            <motion.button
              key={apt.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/customer/tracking")}
              className="w-full bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-left"
            >
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 rounded-lg px-3 py-2 text-center shrink-0">
                  <p className="text-[10px] font-semibold text-blue-600 uppercase">
                    {apt.dayLabel}
                  </p>
                  <p className="text-xl font-bold text-blue-600">{apt.dayNumber}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 text-sm">{apt.service}</h3>
                    <span
                      className={clsx(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                        apt.status === "confirmed"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : "bg-amber-50 text-amber-600 border border-amber-200"
                      )}
                    >
                      {apt.status}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{apt.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <User className="w-3 h-3" />
                      <span>{apt.technician}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="w-3 h-3" />
                      <span>{apt.location}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 mt-2" />
              </div>
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
}
