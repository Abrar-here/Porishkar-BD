import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function VerifyOtp() {
  const { sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const phone = location.state?.phone || "";

  const [otp, setOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!phone) {
      navigate("/register");
    }
  }, [phone, navigate]);

  const handleSendOtp = async () => {
    setError("");
    setSuccess("");
    try {
      const data = await sendOtp(phone);
      setDemoOtp(data.otp || "");
      setSuccess("A verification code has been sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not send OTP.");
    }
  };

  useEffect(() => {
    if (phone) handleSendOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  const handleVerify = async () => {
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const data = await verifyOtp(phone, otp);
      setSuccess(data.message + " Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Verify Your Phone
        </h1>
        <p className="text-gray-500 mb-6">
          Enter the 6-digit code sent to {phone}
        </p>

        {demoOtp && (
          <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
            Your verification code: <strong>{demoOtp}</strong>
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

        <div className="space-y-4">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="6-digit code"
            maxLength={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center tracking-widest text-lg"
          />

          <button
            onClick={handleVerify}
            disabled={submitting || otp.length !== 6}
            className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-60"
          >
            {submitting ? "Verifying..." : "Verify"}
          </button>

          <button
            onClick={handleSendOtp}
            className="w-full py-2 text-green-600 font-medium hover:underline text-sm"
          >
            Resend code
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;