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
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">
            Verify Your Phone
          </h1>
          <p className="text-gray-500 mb-6 text-sm">
            Enter the 6-digit code sent to{" "}
            <span className="font-semibold text-gray-700">{phone}</span>
          </p>

          {demoOtp && (
            <div className="mb-4 p-3 bg-amber-50 text-amber-800 rounded-lg text-sm border border-amber-100">
              Your verification code: <strong>{demoOtp}</strong>
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

            <button
              onClick={handleVerify}
              disabled={submitting || otp.length !== 6}
              className="w-full py-2.5 bg-emerald-700 text-white font-semibold rounded-xl text-sm hover:bg-emerald-800 shadow-sm hover:shadow transition disabled:opacity-60 cursor-pointer"
            >
              {submitting ? "Verifying..." : "Verify"}
            </button>

            <button
              onClick={handleSendOtp}
              className="w-full py-2 text-emerald-700 font-semibold hover:underline text-sm cursor-pointer"
            >
              Resend code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;
