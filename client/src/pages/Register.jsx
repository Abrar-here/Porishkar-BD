import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "citizen",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const data = await register(form);
      setSuccess(data.message + " Redirecting to phone verification...");
      setTimeout(
        () => navigate("/verify-otp", { state: { phone: form.phone } }),
        1200,
      );
    } catch (err) {
      // 1. Log the full error to the browser console for debugging
      console.log("Registration Error details:", err.response);

      // 2. Extract error message or default to generic
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Registration failed. Please check inputs or network connection.",
      );
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
            Create Account
          </h1>
          <p className="text-gray-500 mb-6 text-sm">Join PorishkarBD</p>

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
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Full Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Phone
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="01712345678"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Account Type
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              >
                <option value="citizen">Citizen</option>
                <option value="collector">Waste Collector</option>
                <option value="recycling_company">Recycling Company</option>
              </select>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-2.5 bg-emerald-700 text-white font-semibold rounded-xl text-sm hover:bg-emerald-800 shadow-sm hover:shadow transition disabled:opacity-60 cursor-pointer"
            >
              {submitting ? "Creating..." : "Register"}
            </button>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6 pt-6 border-t border-gray-100">
            Already have an account?{" "}
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

export default Register;
