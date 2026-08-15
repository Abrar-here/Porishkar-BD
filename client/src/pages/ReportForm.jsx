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
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
  };

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("pickupDate", new Date().toISOString());
      formData.append("category", form.category);
      formData.append("description", form.description);
      formData.append("location", JSON.stringify(form.location));
      images.forEach((img) => formData.append("images", img));

      const res = await api.post("/reports", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          Report a waste issue
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Report illegal dumping, overflowing bins, or sanitation failures. Each
          report is GPS-tagged and tracked to resolution.
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
              <option value="Water Body Pollution">Water Body Pollution</option>
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

          {/* Photo upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photos (up to 5)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {previews.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {previews.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Preview ${i + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG or WebP. Max 5MB each.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? "Uploading and submitting…" : "Submit report"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportForm;
