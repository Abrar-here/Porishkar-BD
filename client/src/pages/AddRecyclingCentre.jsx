import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import LocationPickerMap from "../components/LocationPickerMap";

const DAYS_HELPER_TEXT =
  "Applied the same every day for now — per-day hours can be added later.";

function AddRecyclingCentre() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    address: "",
    lat: "",
    lng: "",
    openTime: "9:00 AM",
    closeTime: "6:00 PM",
    phone: "",
  });

  const [acceptedMaterials, setAcceptedMaterials] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const MATERIAL_OPTIONS = [
    "Plastic",
    "Paper",
    "Metal",
    "Glass",
    "Electronic Waste",
    "Textile",
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleMaterial = (material) => {
    setAcceptedMaterials((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material],
    );
  };

  // Called by LocationPickerMap when admin clicks the map
  const handleLocationPick = (lat, lng, address) => {
    setForm((prev) => ({
      ...prev,
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
      // Auto-fill address if empty, don't overwrite if admin already typed one
      address: prev.address.trim() === "" ? address : prev.address,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.address.trim()) {
      setError("Centre name and address are required.");
      return;
    }

    if (form.lat === "" || form.lng === "") {
      setError("Please drop a pin on the map to set the location.");
      return;
    }

    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setError("Latitude and longitude must be valid numbers.");
      return;
    }

    if (acceptedMaterials.length === 0) {
      setError("Select at least one accepted material.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/centres", {
        name: form.name.trim(),
        address: form.address.trim(),
        location: { lat, lng },
        acceptedMaterials,
        hours: { open: form.openTime, close: form.closeTime },
        phone: form.phone.trim() || null,
      });

      navigate("/recycling-centres");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add recycling centre");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf7] text-gray-800">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Add Recycling Centre
            </h1>
            <p className="text-gray-500 mt-1.5 text-sm">
              Register a new drop-off centre citizens can browse and visit.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Centre Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Example: Dhanmondi Recycling Hub"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Location — click the map to drop a pin
              </label>
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <LocationPickerMap onLocationPick={handleLocationPick} />
              </div>

              {form.lat && form.lng && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Latitude (auto-filled)
                    </label>
                    <input
                      type="text"
                      value={form.lat}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Longitude (auto-filled)
                    </label>
                    <input
                      type="text"
                      value={form.lng}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-600"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Auto-filled from map pin, or type manually"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Auto-filled when you drop a pin. You can edit it to a cleaner
                address.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Accepted Materials
              </label>
              <div className="flex flex-wrap gap-2">
                {MATERIAL_OPTIONS.map((material) => {
                  const selected = acceptedMaterials.includes(material);
                  return (
                    <button
                      type="button"
                      key={material}
                      onClick={() => toggleMaterial(material)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors cursor-pointer ${
                        selected
                          ? "bg-emerald-700 text-white border-emerald-700"
                          : "bg-white text-gray-700 border-gray-200 hover:border-emerald-400"
                      }`}
                    >
                      {material}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Opening Time
                </label>
                <input
                  type="text"
                  name="openTime"
                  value={form.openTime}
                  onChange={handleChange}
                  placeholder="9:00 AM"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Closing Time
                </label>
                <input
                  type="text"
                  name="closeTime"
                  value={form.closeTime}
                  onChange={handleChange}
                  placeholder="6:00 PM"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 -mt-4">{DAYS_HELPER_TEXT}</p>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Contact Phone
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="01700000000"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-100 mt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 mt-4 bg-emerald-700 text-white font-semibold text-sm rounded-xl hover:bg-emerald-800 shadow-sm hover:shadow transition disabled:opacity-60 cursor-pointer"
              >
                {submitting ? "Adding..." : "Add Centre"}
              </button>
              <Link
                to="/recycling-centres"
                className="px-6 py-2.5 mt-4 border border-gray-200 rounded-xl text-gray-700 font-semibold text-sm hover:bg-gray-50 transition flex items-center justify-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AddRecyclingCentre;
