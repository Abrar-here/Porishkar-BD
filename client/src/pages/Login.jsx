import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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
            Welcome Back
          </h1>
          <p className="text-gray-500 mb-6 text-sm">Log in to PorishkarBD</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
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
                Password
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-2.5 bg-emerald-700 text-white font-semibold rounded-xl text-sm hover:bg-emerald-800 shadow-sm hover:shadow transition disabled:opacity-60 cursor-pointer"
            >
              {submitting ? "Logging in..." : "Log In"}
            </button>

            <Link
              to="/forgot-password"
              className="block text-center text-sm text-emerald-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6 pt-6 border-t border-gray-100">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-emerald-700 font-semibold hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
