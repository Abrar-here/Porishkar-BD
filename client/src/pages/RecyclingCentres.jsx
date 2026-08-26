import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import MapView from "../components/MapView";

const MATERIAL_OPTIONS = [
  "Plastic",
  "Paper",
  "Metal",
  "Glass",
  "Electronic Waste",
  "Textile",
];

function RecyclingCentres() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [materialFilter, setMaterialFilter] = useState("All");
  const [coords, setCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");

  const [expandedId, setExpandedId] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [commentValue, setCommentValue] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingMessage, setRatingMessage] = useState("");

  // Map state
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState([23.8103, 90.4125]);

  const fetchCentres = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (materialFilter !== "All") params.material = materialFilter;
      if (coords) {
        params.lat = coords.lat;
        params.lng = coords.lng;
      }
      const res = await api.get("/centres", { params });
      setCentres(res.data.centres);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load recycling centres",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCentres();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialFilter, coords]);

  // Update map center when user location is granted
  useEffect(() => {
    if (coords) {
      setMapCenter([coords.lat, coords.lng]);
    }
  }, [coords]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus("granted");
      },
      () => {
        setLocationStatus("denied");
      },
    );
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
    setRatingMessage("");
    setCommentValue("");
    setRatingValue(5);
  };

  const submitRating = async (centreId) => {
    setRatingSubmitting(true);
    setRatingMessage("");
    try {
      const res = await api.post(`/centres/${centreId}/rate`, {
        rating: ratingValue,
        comment: commentValue.trim(),
      });
      setRatingMessage("Thanks for your review!");
      setCommentValue("");

      // Update the centre's average/count in place, and append the new
      // review to its reviews array so it shows up immediately without
      // needing a full re-fetch.
      setCentres((prev) =>
        prev.map((c) =>
          c._id === centreId
            ? {
                ...c,
                averageRating: res.data.averageRating,
                totalRatings: res.data.totalRatings,
                reviews: [
                  {
                    rating: ratingValue,
                    comment: commentValue.trim(),
                    reviewerName: user?.name || "You",
                    createdAt: new Date().toISOString(),
                  },
                  ...(c.reviews || []),
                ],
              }
            : c,
        ),
      );
    } catch (err) {
      setRatingMessage(
        err.response?.data?.message || "Failed to submit rating",
      );
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleDelete = async (centreId, centreName) => {
    const confirmed = window.confirm(
      `Delete "${centreName}"? This will remove it from the citizen-facing list.`,
    );
    if (!confirmed) return;

    try {
      await api.delete(`/centres/${centreId}`);
      setCentres((prev) => prev.filter((c) => c._id !== centreId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete recycling centre");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf7] text-gray-800">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Nearby Recycling Centres
            </h1>
            <p className="text-gray-500 mt-1.5 text-sm sm:text-base">
              Find a drop-off point for your recyclable materials.
            </p>
          </div>
          {user?.role === "admin" && (
            <Link
              to="/recycling-centres/add"
              className="px-5 py-2.5 bg-emerald-700 text-white font-semibold text-sm rounded-xl hover:bg-emerald-800 shadow-sm hover:shadow transition inline-block text-center"
            >
              + Add Centre
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 mb-4 flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Filter by material
            </label>
            <select
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            >
              <option value="All">All materials</option>
              {MATERIAL_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locationStatus === "loading"}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 text-sm font-semibold disabled:opacity-60 transition cursor-pointer"
            >
              {locationStatus === "loading"
                ? "Getting location..."
                : coords
                  ? "📍 Sorted by distance"
                  : "📍 Sort by distance"}
            </button>
            {locationStatus === "denied" && (
              <p className="text-xs text-red-500">
                Couldn't access your location. Showing alphabetical order
                instead.
              </p>
            )}
          </div>
        </div>

        {/* Map toggle button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shadow-xs cursor-pointer"
          >
            {showMap ? "🗺️ Hide map" : "🗺️ Show map"}
          </button>
        </div>

        {/* Map view — shows all centres as pins */}
        {showMap && centres.length > 0 && (
          <div className="mb-6 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <MapView
              center={mapCenter}
              zoom={13}
              height="350px"
              markers={centres.map((centre) => ({
                lat: centre.location.lat,
                lng: centre.location.lng,
                label: centre.name,
                sublabel: centre.address,
              }))}
            />
          </div>
        )}

        {showMap && !loading && centres.length === 0 && (
          <p className="text-sm text-gray-400 mb-4 text-center">
            No centres to show on map for current filters.
          </p>
        )}

        {loading && (
          <div className="text-center py-16 text-gray-500 font-medium bg-white rounded-2xl border border-gray-100">
            Loading recycling centres...
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {!loading && !error && centres.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-500">
            <p className="text-lg font-semibold text-gray-700 mb-2">
              No recycling centres found
            </p>
            <p className="text-sm">
              {materialFilter !== "All"
                ? `No centres currently accept ${materialFilter}.`
                : "Check back soon — centres are being added."}
            </p>
          </div>
        )}

        {/* Centre list */}
        <div className="space-y-4">
          {centres.map((centre) => (
            <div
              key={centre._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Summary row */}
              <button
                type="button"
                onClick={() => toggleExpand(centre._id)}
                className="w-full text-left p-5 flex justify-between items-start hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">{centre.name}</h3>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        centre.isOpen
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {centre.isOpen ? "Open now" : "Closed"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{centre.address}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {centre.acceptedMaterials.map((m) => (
                      <span
                        key={m}
                        className="text-xs font-medium px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right shrink-0 ml-4">
                  {centre.distance !== null && (
                    <p className="text-sm font-semibold text-gray-800">
                      {centre.distance} km
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {centre.totalRatings > 0
                      ? `⭐ ${centre.averageRating} (${centre.totalRatings})`
                      : "No ratings yet"}
                  </p>
                </div>
              </button>

              {/* Detail panel */}
              {expandedId === centre._id && (
                <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-0.5">
                      Operating hours
                    </p>
                    <p className="text-sm text-gray-700">
                      {centre.hours.open} – {centre.hours.close}, every day
                    </p>
                  </div>

                  {centre.phone && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-0.5">
                        Contact
                      </p>
                      <p className="text-sm text-gray-700">{centre.phone}</p>
                    </div>
                  )}

                  {/* Mini map for this specific centre */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">
                      Location
                    </p>
                    <div className="rounded-xl overflow-hidden border border-gray-200">
                      <MapView
                        center={[centre.location.lat, centre.location.lng]}
                        zoom={15}
                        height="200px"
                        markers={[
                          {
                            lat: centre.location.lat,
                            lng: centre.location.lng,
                            label: centre.name,
                            sublabel: centre.address,
                          },
                        ]}
                      />
                    </div>
                  </div>

                  {/* Directions button */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">
                      Get directions
                    </p>

                    <a
                      href={`https://www.openstreetmap.org/directions?from=&to=${centre.location.lat},${centre.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-emerald-700 text-white text-sm font-semibold rounded-xl hover:bg-emerald-800 shadow-sm transition"
                    >
                      🧭 Get directions
                    </a>
                  </div>

                  {/* Rating — citizens only */}
                  {user?.role === "citizen" && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        Rate this centre
                      </p>
                      <div className="flex items-center gap-3 mb-2">
                        <select
                          value={ratingValue}
                          onChange={(e) =>
                            setRatingValue(Number(e.target.value))
                          }
                          className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                        >
                          {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>
                              {n} star{n > 1 ? "s" : ""}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => submitRating(centre._id)}
                          disabled={ratingSubmitting}
                          className="px-4 py-2 bg-emerald-700 text-white text-sm font-semibold rounded-xl hover:bg-emerald-800 shadow-sm transition disabled:opacity-60 cursor-pointer"
                        >
                          {ratingSubmitting ? "Submitting..." : "Submit rating"}
                        </button>
                      </div>
                      <textarea
                        value={commentValue}
                        onChange={(e) => setCommentValue(e.target.value)}
                        placeholder="Optional — share what your visit was like (max 500 characters)"
                        rows={2}
                        maxLength={500}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                      />
                      <p className="text-xs text-gray-400 mt-1 text-right">
                        {commentValue.length}/500
                      </p>
                      {ratingMessage && (
                        <p className="text-sm text-gray-600 mt-1">
                          {ratingMessage}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Reviews list — visible to everyone */}
                  {centre.reviews && centre.reviews.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        Reviews ({centre.totalRatings})
                      </p>
                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {centre.reviews.map((review, i) => (
                          <div
                            key={review._id || i}
                            className="bg-white rounded-xl p-3.5 border border-gray-100"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-gray-800">
                                {review.reviewerName || "Anonymous"}
                              </p>
                              <p className="text-xs text-amber-500">
                                {"⭐".repeat(review.rating)}
                              </p>
                            </div>
                            {review.comment && (
                              <p className="text-sm text-gray-600 mt-1">
                                {review.comment}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin controls */}
                  {user?.role === "admin" && (
                    <div className="pt-3 border-t border-gray-200 flex gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/recycling-centres/${centre._id}/edit`)
                        }
                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition cursor-pointer"
                      >
                        Edit Centre
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(centre._id, centre.name)}
                        className="px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 border border-red-100 transition cursor-pointer"
                      >
                        Delete Centre
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default RecyclingCentres;
