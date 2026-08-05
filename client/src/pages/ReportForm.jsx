import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function ReportForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    category: "",
    description: "",
    location: {
      lat: 23.8103,
      lng: 90.4125,
      address: "",
    },
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (e) => {
    setForm({
      ...form,
      location: { ...form.location, address: e.target.value },
    });
  };

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post("/reports", form);
      navigate("/my-reports", {
        state: { caseReference: res.data.report.caseReference },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-700">PorishkarBD</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to dashboard
        </button>
      </nav>

      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Report a waste issue
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Report illegal dumping, overflowing bins, or sanitation failures.
            Each report is GPS-tagged and tracked to resolution.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="">Select category</option>
                <option value="Household">Household</option>
                <option value="Industrial">Industrial</option>
                <option value="Medical">Medical</option>
                <option value="Construction">Construction</option>
                <option value="Water Body Pollution">
                  Water Body Pollution
                </option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the issue — what you see, how severe it is, how long it's been there…"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location address
              </label>
              <input
                type="text"
                value={form.location.address}
                onChange={handleLocationChange}
                placeholder="e.g. Mirpur 10, Dhaka"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                GPS coordinates are set automatically. Google Maps integration
                coming soon.
              </p>
            </div>

            {/* Photo upload placeholder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photos (up to 5)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-400 text-sm">
                📷 Photo upload coming soon (Cloudinary integration)
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {submitting ? "Submitting…" : "Submit report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportForm;
