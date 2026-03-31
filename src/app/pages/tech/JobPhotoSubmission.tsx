import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Camera,
  Upload,
  X,
  CheckCircle2,
  CreditCard,
  Banknote,
  FileText,
  Smartphone,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { clsx } from "clsx";

export default function JobPhotoSubmission() {
  const navigate = useNavigate();
  const location = useLocation();
  const job = location.state?.job;
  const finalPayout = location.state?.finalPayout;
  const paymentMethod = job?.paymentMethod || "card";
  
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [showPayNowQR, setShowPayNowQR] = useState(false);
  const [payNowLoading, setPayNowLoading] = useState(false);

  // Calculate technician earnings after 20.18% commission
  const technicianEarnings = finalPayout ? finalPayout * 0.7982 : 0;

  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files) return;

    // Simulate photo upload
    setUploading(true);
    setTimeout(() => {
      const newPhotos = Array.from(files).map(
        () =>
          `https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=400&q=80`,
      );
      setPhotos([...photos, ...newPhotos]);
      setUploading(false);
    }, 1000);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (photos.length === 0) {
      alert("Please upload at least one photo");
      return;
    }

    // Different flows based on payment method
    if (paymentMethod === "cash" || paymentMethod === "cheque") {
      setShowPaymentConfirmation(true);
    } else if (paymentMethod === "card") {
      // Direct proceed to success page for credit card
      navigate("/tech/job-complete-success", {
        state: {
          job,
          finalPayout: technicianEarnings,
        },
      });
    } else if (paymentMethod === "paynow") {
      // Show PayNow QR code
      setShowPayNowQR(true);
    }
  };

  const handlePaymentConfirmed = () => {
    navigate("/tech/job-complete-success", {
      state: {
        job,
        finalPayout: technicianEarnings,
      },
    });
  };

  const handlePayNowScanned = () => {
    setPayNowLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      navigate("/tech/job-complete-success", {
        state: {
          job,
          finalPayout: technicianEarnings,
        },
      });
    }, 3000);
  };

  const getPaymentMethodIcon = () => {
    switch (paymentMethod) {
      case "cash":
        return <Banknote className="w-5 h-5" />;
      case "card":
        return <CreditCard className="w-5 h-5" />;
      case "cheque":
        return <FileText className="w-5 h-5" />;
      case "paynow":
        return <Smartphone className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getPaymentMethodLabel = () => {
    switch (paymentMethod) {
      case "cash":
        return "Cash";
      case "card":
        return "Credit/Debit Card";
      case "cheque":
        return "Cheque";
      case "paynow":
        return "PayNow";
      default:
        return "Card";
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div>
            <h1 className="font-bold text-slate-900">
              Job Completion
            </h1>
            <p className="text-xs text-slate-500">
              Upload photos for submission
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* Job Info */}
        {job && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5">
            <h3 className="font-semibold text-slate-900 mb-2">
              Job Details
            </h3>
            <div className="space-y-1 text-sm">
              <p className="text-slate-600">
                <span className="font-medium text-slate-900">
                  Customer:
                </span>{" "}
                {job.customerName || job.customer}
              </p>
              <p className="text-slate-600">
                <span className="font-medium text-slate-900">
                  Issue:
                </span>{" "}
                {job.issue}
              </p>
              <p className="text-slate-600">
                <span className="font-medium text-slate-900">
                  Location:
                </span>{" "}
                {job.location}
              </p>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200 mt-2">
                {getPaymentMethodIcon()}
                <span className="font-medium text-slate-900">
                  Payment: {getPaymentMethodLabel()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Earnings Display */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-4 mb-5 shadow-lg">
          <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
            Your Earnings
          </p>
          <p className="text-3xl font-black text-white">
            ${technicianEarnings.toFixed(2)}
          </p>
          <p className="text-xs text-white/80 mt-1">
            After 20.18% platform commission
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
          <h3 className="font-semibold text-blue-900 mb-2">
            Photo Requirements
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Take clear photos of the completed work</li>
            <li>Include before/after shots if applicable</li>
            <li>Capture any replaced parts or components</li>
            <li>Minimum 1 photo required</li>
          </ul>
        </div>

        {/* Upload Button */}
        <div className="mb-5">
          <label className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
            {uploading ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                Uploading...
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                Take / Upload Photos
              </>
            )}
          </label>
        </div>

        {/* Photos Grid */}
        {photos.length > 0 && (
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">
              Uploaded Photos ({photos.length})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {photos.map((photo, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative aspect-square rounded-xl overflow-hidden border border-slate-200"
                >
                  <img
                    src={photo}
                    alt={`Job photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {photos.length === 0 && (
          <div className="bg-slate-100 rounded-xl p-8 text-center">
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium mb-1">
              No photos uploaded yet
            </p>
            <p className="text-xs text-slate-400">
              Click the button above to start
            </p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="bg-white border-t border-slate-200 p-4">
        <button
          onClick={handleSubmit}
          disabled={photos.length === 0}
          className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors"
        >
          <CheckCircle2 className="w-5 h-5" />
          Submit Job Completion
        </button>
      </div>

      {/* Cash/Cheque Payment Confirmation Modal */}
      <AnimatePresence>
        {showPaymentConfirmation && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center mb-5">
                <div className={clsx(
                  "w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center",
                  paymentMethod === "cash" ? "bg-emerald-100" : "bg-blue-100"
                )}>
                  {paymentMethod === "cash" ? (
                    <Banknote className="w-8 h-8 text-emerald-600" />
                  ) : (
                    <FileText className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Payment Confirmation
                </h3>
                <p className="text-sm text-slate-600">
                  Have you received {paymentMethod === "cash" ? "CASH" : "CHEQUE"} payment from the customer?
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-5">
                <p className="text-xs text-slate-500 mb-1">Amount to collect</p>
                <p className="text-2xl font-bold text-slate-900">${finalPayout?.toFixed(2)}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentConfirmation(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
                >
                  No
                </button>
                <button
                  onClick={handlePaymentConfirmed}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors"
                >
                  Yes, Received
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PayNow QR Code Modal */}
      <AnimatePresence>
        {showPayNowQR && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              {!payNowLoading ? (
                <>
                  <div className="text-center mb-5">
                    <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Smartphone className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      Scan to Pay
                    </h3>
                    <p className="text-sm text-slate-600 mb-1">
                      Customer should scan this QR code
                    </p>
                    <p className="text-xs text-slate-500">
                      Amount: ${finalPayout?.toFixed(2)}
                    </p>
                  </div>

                  {/* QR Code Placeholder */}
                  <div className="bg-white border-4 border-slate-200 rounded-2xl p-6 mb-5">
                    <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center">
                      {/* Simulated QR Code Pattern */}
                      <div className="grid grid-cols-8 gap-1 p-4">
                        {Array.from({ length: 64 }).map((_, i) => (
                          <div
                            key={i}
                            className={clsx(
                              "aspect-square rounded-sm",
                              Math.random() > 0.5 ? "bg-slate-800" : "bg-slate-100"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handlePayNowScanned}
                      className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors"
                    >
                      Customer Scanned QR
                    </button>
                    <button
                      onClick={() => setShowPayNowQR(false)}
                      className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <motion.div
                    className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    Processing Payment...
                  </h3>
                  <p className="text-sm text-slate-500">
                    Waiting for payment confirmation
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}