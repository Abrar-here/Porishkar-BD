import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import LocationPickerMap from "../components/LocationPickerMap";

const MATERIAL_OPTIONS = [
  "Plastic",
  "Paper",
  "Metal",
  "Glass",
  "Electronic Waste",
  "Textile",
];

function EditRecyclingCentre() {
  const { id: paramId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Admins navigate here with a centre ID in the URL. Recycling
  // companies reach this page via "/my-centre" with no ID — for them,
  // we resolve their own centre by owner instead.
  const [resolvedId, setResolvedId] = useState(paramId || null);

  const [form, setForm] = useState({
    name: "",
    address: "",
    lat: "",
    lng: "",
    openTime: "",
    closeTime: "",
    phone: "",
  });

  const [acceptedMaterials, setAcceptedMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCentre = async () => {
      try {
        let centreId = paramId;

        if (!centreId && user?.role === "recycling_company") {
          const res = await api.get("/centres", {
            params: { owner: user.id },
          });
          const ownCentre = res.data.centres?.[0];

          if (!ownCentre) {
            setError(
              "No recycling centre is linked to your account yet. Contact an admin.",
            );
            setLoading(false);
            return;
          }

          centreId = ownCentre._id;
          setResolvedId(centreId);
        }

        const res = await api.get(`/centres/${centreId}`);
        const centre = res.data.centre;

        setForm({
          name: centre.name || "",
          address: centre.address || "",
          lat: centre.location?.lat ?? "",
          lng: centre.location?.lng ?? "",
          openTime: centre.hours?.open || "9:00 AM",
          closeTime: centre.hours?.close || "6:00 PM",
          phone: centre.phone || "",
        });
        setAcceptedMaterials(centre.acceptedMaterials || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load recycling centre",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCentre();
  }, [paramId, user]);

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

  const handleLocationPick = (lat, lng, address) => {
    setForm((prev) => ({
      ...prev,
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
      address: address,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.address.trim()) {
      setError("Centre name and address are required.");
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
      await api.put(`/centres/${resolvedId}`, {
        name: form.name.trim(),
        address: form.address.trim(),
        location: { lat, lng },
        acceptedMaterials,
        hours: { open: form.openTime, close: form.closeTime },
        phone: form.phone.trim() || null,
      });

      navigate(
        user?.role === "recycling_company"
          ? "/dashboard"
          : "/recycling-centres",
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update recycling centre",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading centre...</p>
      </div>
    );
  }

  if (error && !resolvedId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Edit Recycling Centre
          </h1>
          <p className="text-gray-500 mt-2">Update this centre's details.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Centre Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Location — click the map to move the pin
            </label>
            <LocationPickerMap
              onLocationPick={handleLocationPick}
              initialPosition={
                form.lat && form.lng
                  ? [parseFloat(form.lat), parseFloat(form.lng)]
                  : null
              }
            />

            {form.lat && form.lng && (
              <div className="mt-2 grid grid-cols-2 gap-3">
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
            <label className="block font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-400 mt-1">
              Auto-filled when you move the pin. You can edit it to a cleaner
              address.
            </p>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">
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
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      selected
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-green-400"
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
              <label className="block font-medium text-gray-700 mb-2">
                Opening Time
              </label>
              <input
                type="text"
                name="openTime"
                value={form.openTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Closing Time
              </label>
              <input
                type="text"
                name="closeTime"
                value={form.closeTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Contact Phone
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>

            <Link
              to={
                user?.role === "recycling_company"
                  ? "/dashboard"
                  : "/recycling-centres"
              }
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditRecyclingCentre;
