import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import MapView from "../components/MapView";

// Auto-recalculation: how often the route re-fetches on its own,
// matching the doc's "recalculated... without requiring any manual
// intervention" as new bookings are confirmed or cancelled elsewhere.
const AUTO_REFRESH_MS = 30000; // 30 seconds

function CollectorRoute() {
  const { user } = useAuth();

  const [route, setRoute] = useState([]);
  const [totalDistanceKm, setTotalDistanceKm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");

  // Silently capture the collector's current location once, on load,
  // and report it to the server — no button, no extra step. This is
  // what lets the route start from where the collector actually is,
  // rather than an arbitrary stop.
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await api.put("/auth/location", {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationStatus("shared");
        } catch {
          setLocationStatus("error");
        }
      },
      () => {
        setLocationStatus("denied");
      },
    );
  }, []);

  const fetchRoute = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await api.get(`/reports/route/${user._id}`);
      setRoute(res.data.route);
      setTotalDistanceKm(res.data.totalDistanceKm);
      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your route");
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  // Initial load
  useEffect(() => {
    fetchRoute();
  }, [fetchRoute]);

  // Auto-recalculation: silently re-fetch on an interval, so if a
  // supervisor reorders the route, or a new pickup gets assigned, or
  // one gets cancelled elsewhere, the collector's screen updates on
  // its own without them needing to refresh the page.
  useEffect(() => {
    const interval = setInterval(fetchRoute, AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchRoute]);

  return (
    <div className="min-h-screen bg-[#f7faf7] px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Route Today</h1>
          <p className="text-gray-600 mt-1">
            Your daily work plan, grouped by proximity to minimise travel.
          </p>
          {locationStatus === "denied" && (
            <p className="text-xs text-amber-600 mt-2">
              Location access was declined — your route is ordered by proximity
              between stops, but not starting from your exact current position.
            </p>
          )}
        </div>

        {loading && (
          <p className="text-gray-500 text-center py-12">
            Loading your route...
          </p>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-6">
            {error}
          </div>
        )}

        {!loading && !error && route.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-500">
            You have no active stops right now. New assignments will appear here
            automatically.
          </div>
        )}

        {!loading && route.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
              <p>Total distance: {totalDistanceKm} km</p>
              {lastUpdated && (
                <p>
                  Updated{" "}
                  {lastUpdated.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>

            <div className="mb-6 rounded-2xl overflow-hidden shadow">
              <MapView
                center={[route[0].location.lat, route[0].location.lng]}
                zoom={12}
                height="350px"
                markers={route.map((stop, i) => ({
                  lat: stop.location.lat,
                  lng: stop.location.lng,
                  label: `Stop ${i + 1}: ${stop.caseReference}`,
                  sublabel: stop.location.address,
                }))}
              />
            </div>

            <div className="bg-white rounded-2xl shadow divide-y divide-gray-100">
              {route.map((stop, index) => (
                <div key={stop._id} className="p-4 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">
                      {stop.caseReference} — {stop.category}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {stop.location.address}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {stop.reportedBy?.name} · {stop.reportedBy?.phone}
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 shrink-0">
                    {stop.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CollectorRoute;
