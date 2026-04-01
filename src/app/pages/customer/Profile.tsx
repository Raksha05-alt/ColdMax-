import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LogOut, User, Shield, CreditCard, Bell, ChevronRight, MapPin, X, ArrowLeft, Crown,
  Mail, Phone, Calendar, Edit2, Check, Eye, EyeOff, Lock, Fingerprint, Smartphone,
  Trash2, Plus, BellRing, BellOff, MessageSquare, AlertTriangle, Info,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useLocation } from "../../context/LocationContext";
import { useSubscription } from "../../context/SubscriptionContext";

type ModalType = null | "account" | "payment" | "privacy" | "notifications";

export default function Profile() {
  const navigate = useNavigate();
  const { selectedLocation, setSelectedLocation } = useLocation();
  const { isPremium, tier } = useSubscription();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Account state
  const [accountName, setAccountName] = useState("Alex Chen");
  const [accountEmail, setAccountEmail] = useState("alex@email.com");
  const [accountPhone, setAccountPhone] = useState("+65 9123 4567");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [accountSaved, setAccountSaved] = useState(false);

  // Payment state
  const [paymentMethods, setPaymentMethods] = useState([
    { id: "1", type: "visa", last4: "4242", expiry: "12/27", isDefault: true },
    { id: "2", type: "mastercard", last4: "8888", expiry: "06/26", isDefault: false },
  ]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardExpiry, setNewCardExpiry] = useState("");
  const [newCardCvv, setNewCardCvv] = useState("");

  // Privacy state
  const [showPassword, setShowPassword] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Notification state
  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);
  const [notifBooking, setNotifBooking] = useState(true);
  const [notifHealth, setNotifHealth] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const locations = [
    "12 Orchard Blvd, Tower B",
    "45 Marina Bay Street, #05-12",
    "88 Tampines Avenue 10",
    "23 Raffles Place, Singapore",
  ];

  const handleLocationChange = (loc: string) => {
    setSelectedLocation(loc);
    setShowLocationModal(false);
  };

  const startEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const saveEdit = (field: string) => {
    if (field === "name") setAccountName(editValue);
    if (field === "email") setAccountEmail(editValue);
    if (field === "phone") setAccountPhone(editValue);
    setEditingField(null);
    setAccountSaved(true);
    setTimeout(() => setAccountSaved(false), 2000);
  };

  const setDefaultPayment = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((p) => ({ ...p, isDefault: p.id === id }))
    );
  };

  const removePayment = (id: string) => {
    setPaymentMethods((prev) => prev.filter((p) => p.id !== id));
  };

  const addCard = () => {
    if (newCardNumber.length >= 4) {
      const newId = String(Date.now());
      setPaymentMethods((prev) => [
        ...prev,
        {
          id: newId,
          type: newCardNumber.startsWith("4") ? "visa" : "mastercard",
          last4: newCardNumber.slice(-4),
          expiry: newCardExpiry || "12/28",
          isDefault: prev.length === 0,
        },
      ]);
      setNewCardNumber("");
      setNewCardExpiry("");
      setNewCardCvv("");
      setShowAddCard(false);
    }
  };

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-blue-600" : "bg-slate-300"}`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? "left-[22px]" : "left-0.5"}`}
      />
    </button>
  );

  const BottomSheet = ({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) => (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl w-full p-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">{title}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

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
            <h1 className="text-xl font-bold text-slate-900">Profile</h1>
            <p className="text-xs text-slate-500">Manage your account settings</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* User Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-slate-200 rounded-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-slate-900">{accountName}</h2>
              <p className="text-sm text-slate-500">{accountEmail}</p>
            </div>
          </div>
          {tier !== "none" ? (
            <button
              onClick={() => navigate("/customer/subscriptions")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold ${
                isPremium
                  ? "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-800"
                  : "bg-blue-50 border border-blue-200 text-blue-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Crown className={`w-4 h-4 ${isPremium ? "text-amber-600" : "text-blue-600"}`} />
                <span>{isPremium ? "Premium Member" : "Standard Subscriber"}</span>
                {isPremium && (
                  <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">FREE SERVICING</span>
                )}
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => navigate("/customer/subscriptions")}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" />
              Subscribe Now
            </button>
          )}
        </div>

        {/* Home Location */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <button
            onClick={() => setShowLocationModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-900">Home Location</p>
                <p className="text-xs text-slate-500">{selectedLocation}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {([
            { icon: User, label: "Account Details", color: "text-blue-600", bg: "bg-blue-50", modal: "account" as ModalType },
            { icon: CreditCard, label: "Payment Methods", color: "text-emerald-600", bg: "bg-emerald-50", modal: "payment" as ModalType },
            { icon: Shield, label: "Privacy & Security", color: "text-purple-600", bg: "bg-purple-50", modal: "privacy" as ModalType },
            { icon: Bell, label: "Notifications", color: "text-amber-600", bg: "bg-amber-50", modal: "notifications" as ModalType },
          ]).map((item, i) => (
            <button
              key={i}
              onClick={() => setActiveModal(item.modal)}
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
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full bg-red-50 border border-red-200 text-red-600 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>

      {/* Location Modal */}
      <BottomSheet open={showLocationModal} onClose={() => setShowLocationModal(false)} title="Change Home Location">
        <div className="space-y-2">
          {locations.map((loc, i) => (
            <button
              key={i}
              onClick={() => handleLocationChange(loc)}
              className={`w-full p-4 rounded-lg border transition-all flex items-center gap-3 ${
                selectedLocation === loc
                  ? "bg-blue-50 border-blue-500"
                  : "bg-white border-slate-200 hover:border-blue-300"
              }`}
            >
              <MapPin className={`w-5 h-5 ${selectedLocation === loc ? "text-blue-600" : "text-slate-400"}`} />
              <span className={`font-medium ${selectedLocation === loc ? "text-blue-900" : "text-slate-700"}`}>
                {loc}
              </span>
            </button>
          ))}
        </div>
        <button className="w-full mt-4 bg-slate-100 border-2 border-dashed border-slate-300 text-slate-600 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
          <MapPin className="w-5 h-5" />
          Add New Location
        </button>
      </BottomSheet>

      {/* Account Details Modal */}
      <BottomSheet open={activeModal === "account"} onClose={() => { setActiveModal(null); setEditingField(null); }} title="Account Details">
        <div className="space-y-4">
          <AnimatePresence>
            {accountSaved && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Changes saved successfully
              </motion.div>
            )}
          </AnimatePresence>

          {[
            { key: "name", label: "Full Name", value: accountName, icon: User },
            { key: "email", label: "Email Address", value: accountEmail, icon: Mail },
            { key: "phone", label: "Phone Number", value: accountPhone, icon: Phone },
          ].map((field) => (
            <div key={field.key} className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <field.icon className="w-3.5 h-3.5" />
                  {field.label}
                </div>
                {editingField === field.key ? (
                  <button onClick={() => saveEdit(field.key)} className="text-blue-600 text-xs font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Save
                  </button>
                ) : (
                  <button onClick={() => startEdit(field.key, field.value)} className="text-blue-600 text-xs font-semibold flex items-center gap-1">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
              </div>
              {editingField === field.key ? (
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full bg-white border border-blue-300 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(field.key)}
                />
              ) : (
                <p className="text-sm font-medium text-slate-900">{field.value}</p>
              )}
            </div>
          ))}

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              Member Since
            </div>
            <p className="text-sm font-medium text-slate-900">January 2025</p>
          </div>
        </div>
      </BottomSheet>

      {/* Payment Methods Modal */}
      <BottomSheet open={activeModal === "payment"} onClose={() => { setActiveModal(null); setShowAddCard(false); }} title="Payment Methods">
        <div className="space-y-3">
          {paymentMethods.map((pm) => (
            <div key={pm.id} className={`p-4 rounded-lg border transition-all ${pm.isDefault ? "bg-blue-50 border-blue-300" : "bg-white border-slate-200"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-7 rounded flex items-center justify-center text-[10px] font-bold text-white ${pm.type === "visa" ? "bg-blue-700" : "bg-orange-600"}`}>
                    {pm.type === "visa" ? "VISA" : "MC"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">•••• {pm.last4}</p>
                    <p className="text-xs text-slate-500">Expires {pm.expiry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {pm.isDefault ? (
                    <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">DEFAULT</span>
                  ) : (
                    <button
                      onClick={() => setDefaultPayment(pm.id)}
                      className="text-[10px] font-semibold text-blue-600 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-50"
                    >
                      Set Default
                    </button>
                  )}
                  {!pm.isDefault && (
                    <button onClick={() => removePayment(pm.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {paymentMethods.length === 0 && (
            <div className="text-center py-6 text-slate-400">
              <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No payment methods added</p>
            </div>
          )}

          <AnimatePresence>
            {showAddCard && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-200">
                  <p className="text-sm font-semibold text-slate-700">Add New Card</p>
                  <input
                    value={newCardNumber}
                    onChange={(e) => setNewCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                    placeholder="Card Number"
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-3">
                    <input
                      value={newCardExpiry}
                      onChange={(e) => setNewCardExpiry(e.target.value.slice(0, 5))}
                      placeholder="MM/YY"
                      className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      value={newCardCvv}
                      onChange={(e) => setNewCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="CVV"
                      className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddCard(false)}
                      className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-600 text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addCard}
                      className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold"
                    >
                      Add Card
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!showAddCard && (
            <button
              onClick={() => setShowAddCard(true)}
              className="w-full bg-slate-100 border-2 border-dashed border-slate-300 text-slate-600 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Payment Method
            </button>
          )}
        </div>
      </BottomSheet>

      {/* Privacy & Security Modal */}
      <BottomSheet open={activeModal === "privacy"} onClose={() => { setActiveModal(null); setShowDeleteConfirm(false); }} title="Privacy & Security">
        <div className="space-y-4">
          {/* Change Password */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Lock className="w-3.5 h-3.5" />
              Password
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900">
                {showPassword ? "MyP@ssw0rd123" : "••••••••••••"}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button className="text-blue-600 text-xs font-semibold">Change</button>
              </div>
            </div>
          </div>

          {/* Biometric */}
          <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Fingerprint className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-slate-900">Biometric Login</p>
                <p className="text-xs text-slate-500">Face ID / Fingerprint</p>
              </div>
            </div>
            <ToggleSwitch enabled={biometricEnabled} onToggle={() => setBiometricEnabled(!biometricEnabled)} />
          </div>

          {/* 2FA */}
          <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-900">Two-Factor Auth</p>
                <p className="text-xs text-slate-500">SMS verification</p>
              </div>
            </div>
            <ToggleSwitch enabled={twoFactorEnabled} onToggle={() => setTwoFactorEnabled(!twoFactorEnabled)} />
          </div>

          {/* Active Sessions */}
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-2">Active Sessions</p>
            <div className="space-y-2">
              {["iPhone 15 Pro — Singapore", "Chrome — MacBook Pro"].map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <p className="text-sm text-slate-700">{s}</p>
                  {i === 0 ? (
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">THIS DEVICE</span>
                  ) : (
                    <button className="text-xs text-red-500 font-semibold">Revoke</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Delete Account */}
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full text-red-500 text-sm font-medium py-3 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <p className="text-sm font-semibold">Are you sure?</p>
              </div>
              <p className="text-xs text-red-600 mb-3">This action is permanent and cannot be undone. All your data will be lost.</p>
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm font-medium">
                  Cancel
                </button>
                <button onClick={() => navigate("/")} className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold">
                  Delete
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </BottomSheet>

      {/* Notifications Modal */}
      <BottomSheet open={activeModal === "notifications"} onClose={() => setActiveModal(null)} title="Notifications">
        <div className="space-y-4">
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Channels</p>
            <div className="bg-slate-50 rounded-lg overflow-hidden">
              {[
                { icon: BellRing, label: "Push Notifications", enabled: notifPush, toggle: () => setNotifPush(!notifPush) },
                { icon: Mail, label: "Email Notifications", enabled: notifEmail, toggle: () => setNotifEmail(!notifEmail) },
                { icon: MessageSquare, label: "SMS Notifications", enabled: notifSMS, toggle: () => setNotifSMS(!notifSMS) },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b border-slate-200 last:border-0">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-slate-600" />
                    <span className="text-sm font-medium text-slate-900">{item.label}</span>
                  </div>
                  <ToggleSwitch enabled={item.enabled} onToggle={item.toggle} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Categories</p>
            <div className="bg-slate-50 rounded-lg overflow-hidden">
              {[
                { label: "Booking Updates", desc: "Confirmation, technician arrival", enabled: notifBooking, toggle: () => setNotifBooking(!notifBooking) },
                { label: "AC Health Alerts", desc: "Sensor warnings, maintenance due", enabled: notifHealth, toggle: () => setNotifHealth(!notifHealth) },
                { label: "Promotions", desc: "Deals, new features, offers", enabled: notifPromo, toggle: () => setNotifPromo(!notifPromo) },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b border-slate-200 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <ToggleSwitch enabled={item.enabled} onToggle={item.toggle} />
                </div>
              ))}
            </div>
          </div>

          {!notifPush && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">Push notifications are disabled. You may miss important booking and AC health alerts.</p>
            </div>
          )}
        </div>
      </BottomSheet>

      {/* Logout Confirmation */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-8"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <LogOut className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Sign Out?</h3>
                <p className="text-sm text-slate-500">You'll need to log in again to access your account.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-semibold"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}