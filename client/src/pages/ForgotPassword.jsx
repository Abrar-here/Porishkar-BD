import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ForgotPassword() {
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSendOtp = async () => {
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const data = await forgotPassword(phone);
      setDemoOtp(data.otp || "");
      setSuccess("A reset code has been sent.");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Could not send reset code.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const data = await resetPassword(phone, otp, newPassword);
      setSuccess(data.message + " Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-[#f7faf7] px-4 py-10">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-lg">
            ♻
          </span>
          <span className="text-xl font-bold text-emerald-700">
            PorishkarBD
          </span>
        </div>

        <div className="w-full bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-5">
            <div
              className={`h-1.5 flex-1 rounded-full ${
                step >= 1 ? "bg-emerald-600" : "bg-gray-200"
              }`}
            />
            <div
              className={`h-1.5 flex-1 rounded-full ${
                step >= 2 ? "bg-emerald-600" : "bg-gray-200"
              }`}
            />
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">
            Reset Password
          </h1>
          <p className="text-gray-500 mb-6 text-sm">
            {step === 1
              ? "Enter your phone number to receive a reset code"
              : `Enter the code sent to ${phone} and choose a new password`}
          </p>

          {demoOtp && (
            <div className="mb-4 p-3 bg-amber-50 text-amber-800 rounded-lg text-sm border border-amber-100">
              Your reset code: <strong>{demoOtp}</strong>
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm border border-emerald-100">
              {success}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Phone Number
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01712345678"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
              <button
                onClick={handleSendOtp}
                disabled={submitting || !phone}
                className="w-full py-2.5 bg-emerald-700 text-white font-semibold rounded-xl text-sm hover:bg-emerald-800 shadow-sm hover:shadow transition disabled:opacity-60 cursor-pointer"
              >
                {submitting ? "Sending..." : "Send Reset Code"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 text-center">
                  Verification Code
                </label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-center tracking-[0.5em] text-lg font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>

              <button
                onClick={handleReset}
                disabled={
                  submitting || otp.length !== 6 || newPassword.length < 6
                }
                className="w-full py-2.5 bg-emerald-700 text-white font-semibold rounded-xl text-sm hover:bg-emerald-800 shadow-sm hover:shadow transition disabled:opacity-60 cursor-pointer"
              >
                {submitting ? "Resetting..." : "Reset Password"}
              </button>
              <button
                onClick={handleSendOtp}
                className="w-full py-2 text-emerald-700 font-semibold hover:underline text-sm cursor-pointer"
              >
                Resend code
              </button>
            </div>
          )}

          <p className="text-center text-gray-500 text-sm mt-6 pt-6 border-t border-gray-100">
            Remembered your password?{" "}
            <Link
              to="/login"
              className="text-emerald-700 font-semibold hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
