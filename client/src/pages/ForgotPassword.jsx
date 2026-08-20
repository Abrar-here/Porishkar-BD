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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Reset Password
        </h1>
        <p className="text-gray-500 mb-6">
          {step === 1
            ? "Enter your phone number to receive a reset code"
            : `Enter the code sent to ${phone} and choose a new password`}
        </p>

        {demoOtp && (
          <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
            Your reset code: <strong>{demoOtp}</strong>
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-4">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (e.g. 01712345678)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleSendOtp}
              disabled={submitting || !phone}
              className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send Reset Code"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit code"
              maxLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center tracking-widest text-lg"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 6 characters)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleReset}
              disabled={submitting || otp.length !== 6 || newPassword.length < 6}
              className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-60"
            >
              {submitting ? "Resetting..." : "Reset Password"}
            </button>
            <button
              onClick={handleSendOtp}
              className="w-full py-2 text-green-600 font-medium hover:underline text-sm"
            >
              Resend code
            </button>
          </div>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          Remembered your password?{" "}
          <Link to="/login" className="text-green-600 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;