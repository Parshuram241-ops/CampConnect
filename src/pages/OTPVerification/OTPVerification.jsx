import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Mail, RefreshCw, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api, { storeAuthSession } from "../../services/api";

// Format timer to MM:SS
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();

  const [userId] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("userId") || location.state?.userId || "";
  });
  const [email] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("email") || location.state?.email || "";
  });
  const [userName] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("name") || location.state?.name || "";
  });
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(300);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleAutoSubmit = useCallback(async () => {
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }

    if (!userId) {
      setError("Invalid session. Please try logging in again.");
      return;
    }

    setIsVerifying(true);
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/verify-otp", {
        userId,
        otpCode,
      });

      if (response.data.success) {
        setVerificationSuccess(true);
        setSuccess("OTP verified successfully!");
        
        // Store auth token and user data
        if (response.data.data.token) {
          storeAuthSession(response.data.data.user, response.data.data.token);
        }

        // Redirect to home after success animation
        setTimeout(() => {
          navigate("/");
        }, 2500);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to verify OTP");
      setIsVerifying(false);
    } finally {
      setLoading(false);
    }
  }, [otp, userId, navigate]);

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (otp.every(digit => digit !== "")) {
      const timerId = setTimeout(() => {
        handleAutoSubmit();
      }, 500);
      return () => clearTimeout(timerId);
    }
  }, [otp, handleAutoSubmit]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Only allow digits or empty

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    setError("");
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return; // Only paste digits

    const otpArray = pasteData.split("");
    const newOtp = [...otp];
    
    otpArray.forEach((digit, index) => {
      if (index < 6) newOtp[index] = digit;
    });
    
    setOtp(newOtp);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    handleAutoSubmit();
  };

  const handleResendOtp = async () => {
    if (!userId || !email) {
      setError("Cannot resend OTP. Please try logging in again.");
      return;
    }

    setResendLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/resend-otp", {
        userId,
        email,
      });

      if (response.data.success) {
        setSuccess("New OTP sent to your email!");
        setTimer(300); // Reset timer to 5 minutes
        setOtp(["", "", "", "", "", ""]); // Clear OTP fields
        
        // Focus first input
        const firstInput = document.getElementById("otp-0");
        if (firstInput) firstInput.focus();
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate("/login");
  };

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  const boxVariants = {
    initial: { y: 0, x: 0 },
    verifying: (i) => ({
      x: Math.cos((i / 6) * Math.PI * 2) * 60,
      y: Math.sin((i / 6) * Math.PI * 2) * 60,
      opacity: 0.8,
      scale: 0.9,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }),
    error: {
      x: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.5,
      },
    },
    success: {
      scale: 1.1,
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={containerVariants}
          className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-xl shadow-slate-200/40"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <motion.button
              onClick={handleGoBack}
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </motion.button>
            
            <motion.div
              animate={{ rotate: isVerifying ? 360 : 0 }}
              transition={{ duration: isVerifying ? 1.5 : 0, repeat: isVerifying ? Infinity : 0 }}
              className="flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-50 text-blue-600"
            >
              <Mail className="h-7 w-7" />
            </motion.div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Verify Your Email</h1>
            <p className="mt-2 text-sm text-slate-500">
              Enter the 6-digit OTP sent to{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>
            </p>
            
            {userName && (
              <p className="mt-1 text-sm text-slate-500">
                Welcome, <span className="font-semibold text-blue-600">{userName}</span>
              </p>
            )}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600 flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timer */}
          <div className="mb-8 text-center">
            <div className="text-sm text-slate-500">
              OTP expires in{" "}
              <span className={`font-bold ${timer < 60 ? "text-red-600" : "text-blue-600"}`}>
                {formatTime(timer)}
              </span>
            </div>
          </div>

          {/* OTP Verification Section */}
          <form onSubmit={handleManualSubmit}>
            {/* OTP Inputs with Circular Animation */}
            <div className="mb-8">
              <div className="relative h-40 flex items-center justify-center">
                {/* Central Verifying Text */}
                <AnimatePresence>
                  {isVerifying && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 flex flex-col items-center justify-center z-10"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="mb-3"
                      >
                        <div className="h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full" />
                      </motion.div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Verifying...</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* OTP Boxes - Circular Layout */}
                <div className="relative w-full h-full">
                  <motion.div
                    animate={verificationSuccess ? "success" : isVerifying ? "verifying" : error ? "error" : "initial"}
                    className="flex justify-center items-center h-full"
                  >
                    <div className="flex justify-center items-center gap-3 relative">
                      {otp.map((digit, index) => (
                        <motion.div
                          key={index}
                          custom={index}
                          variants={boxVariants}
                          animate={
                            verificationSuccess
                              ? "success"
                              : isVerifying
                              ? "verifying"
                              : error
                              ? "error"
                              : "initial"
                          }
                          className="relative"
                        >
                          <input
                            id={`otp-${index}`}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            disabled={isVerifying || verificationSuccess}
                            className="h-14 w-14 text-center text-2xl font-bold rounded-xl border-2 border-slate-300 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-800"
                          />
                          
                          {/* Success Checkmark */}
                          <AnimatePresence>
                            {verificationSuccess && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.4, type: "spring" }}
                                className="absolute inset-0 flex items-center justify-center bg-green-500 rounded-xl text-white"
                              >
                                <CheckCircle className="h-8 w-8" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Verify Button */}
            <motion.button
              type="submit"
              disabled={loading || isVerifying || otp.join("").length !== 6 || timer === 0 || verificationSuccess}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? "Verifying..." : loading ? "Processing..." : "Verify OTP"}
            </motion.button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <motion.button
              onClick={handleResendOtp}
              disabled={resendLoading || timer > 240}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${resendLoading ? "animate-spin" : ""}`} />
              {resendLoading ? "Sending..." : "Resend OTP"}
            </motion.button>
            
            {timer > 240 && (
              <p className="mt-1 text-xs text-slate-500">
                You can resend OTP in {formatTime(timer - 240)}
              </p>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 rounded-lg bg-slate-50 dark:bg-slate-800 p-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Instructions:</h3>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <li>• Check your college email inbox for the OTP</li>
              <li>• The OTP is valid for 5 minutes</li>
              <li>• If you don't see the email, check your spam folder</li>
              <li>• You can resend OTP after 1 minute</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default OTPVerification;