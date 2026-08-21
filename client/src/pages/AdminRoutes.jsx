import { useEffect, useState } from "react";
import api from "../api/axios";
import MapView from "../components/MapView";

// Same Haversine formula used on the backend — recomputing it here
// locally means the distance figure updates instantly as the admin
// clicks up/down, without waiting on a server round-trip for every click.
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getTotalDistance = (stops) => {
  let total = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    total += calculateDistance(
      stops[i].location.lat,
      stops[i].location.lng,
      stops[i + 1].location.lat,
      stops[i + 1].location.lng,
    );
  }
  return parseFloat(total.toFixed(2));
};

function AdminRoutes() {
  const [collectors, setCollectors] = useState([]);
  const [selectedCollectorId, setSelectedCollectorId] = useState("");
  const [route, setRoute] = useState([]);
  const [originalDistanceKm, setOriginalDistanceKm] = useState(null);
  const [loadingCollectors, setLoadingCollectors] = useState(true);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  // Load the collector dropdown once on mount
  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        const res = await api.get("/auth/collectors");
        setCollectors(res.data.collectors);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load collectors");
      } finally {
        setLoadingCollectors(false);
      }
    };
    fetchCollectors();
  }, []);

  const fetchRoute = async () => {
    if (!selectedCollectorId) return;

    setLoadingRoute(true);
    setError("");
    setSaveMessage("");
    try {
      const res = await api.get(`/reports/route/${selectedCollectorId}`);
      setRoute(res.data.route);
      // The distance the server reports reflects whatever order it
      // just sent — captured once on load as the "before" figure,
      // so the admin can compare it against live reorder changes.
      setOriginalDistanceKm(res.data.totalDistanceKm);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load route");
    } finally {
      setLoadingRoute(false);
    }
  };

  // Load that collector's route whenever the selection changes
  useEffect(() => {
    if (!selectedCollectorId) {
      setRoute([]);
      setOriginalDistanceKm(null);
      return;
    }
    fetchRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCollectorId]);

  const moveStop = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= route.length) return;

    const updated = [...route];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setRoute(updated);
    setSaveMessage("");
  };

  const saveOrder = async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      const orderedReportIds = route.map((stop) => stop._id);
      await api.put(`/reports/route/${selectedCollectorId}/reorder`, {
        orderedReportIds,
      });
      setSaveMessage(
        "Route order saved — the collector will see this immediately.",
      );
      // Re-fetch so originalDistanceKm reflects the newly-saved order
      // as the fresh baseline for any further comparison.
      fetchRoute();
    } catch (err) {
      setSaveMessage(
        err.response?.data?.message || "Failed to save the new order",
      );
    } finally {
      setSaving(false);
    }
  };

  const resetOrder = async () => {
    const confirmed = window.confirm(
      "Reset this route to the system's suggested order? Any manual reordering will be discarded.",
    );
    if (!confirmed) return;

    setResetting(true);
    setSaveMessage("");
    try {
      await api.put(`/reports/route/${selectedCollectorId}/reset`);
      setSaveMessage("Route reset to the suggested order.");
      fetchRoute();
    } catch (err) {
      setSaveMessage(
        err.response?.data?.message || "Failed to reset the route",
      );
    } finally {
      setResetting(false);
    }
  };

  const currentDistanceKm = route.length > 1 ? getTotalDistance(route) : 0;
  const distanceChanged =
    originalDistanceKm !== null && currentDistanceKm !== originalDistanceKm;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Collector Route Management
          </h1>
          <p className="text-gray-500 mt-2">
            View any collector's daily route and manually reorder stops for
            urgent cases.
          </p>
        </div>

        {/* Collector picker */}
        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select a collector
          </label>
          {loadingCollectors ? (
            <p className="text-sm text-gray-400">Loading collectors...</p>
          ) : collectors.length === 0 ? (
            <p className="text-sm text-gray-400">
              No collectors registered yet.
            </p>
          ) : (
            <select
              value={selectedCollectorId}
              onChange={(e) => setSelectedCollectorId(e.target.value)}
              className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="">-- Choose a collector --</option>
              {collectors.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.phone || c.email})
                </option>
              ))}
            </select>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loadingRoute && (
          <p className="text-gray-500 text-center py-12">Loading route...</p>
        )}

        {!loadingRoute &&
          selectedCollectorId &&
          route.length === 0 &&
          !error && (
            <div className="text-center py-16 text-gray-400 bg-white rounded-xl shadow">
              This collector has no active stops right now.
            </div>
          )}

        {!loadingRoute && route.length > 0 && (
          <>
            {/* Route distance summary */}
            <div className="mb-6 bg-white rounded-xl shadow p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">
                  Total route distance (in current order)
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {currentDistanceKm} km
                </p>
                {distanceChanged && (
                  <p
                    className={`text-sm font-medium mt-1 ${
                      currentDistanceKm < originalDistanceKm
                        ? "text-green-600"
                        : "text-amber-600"
                    }`}
                  >
                    {currentDistanceKm < originalDistanceKm
                      ? `↓ ${(originalDistanceKm - currentDistanceKm).toFixed(2)} km shorter than the saved route`
                      : `↑ ${(currentDistanceKm - originalDistanceKm).toFixed(2)} km longer than the saved route`}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={resetOrder}
                disabled={resetting}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-60 shrink-0"
              >
                {resetting ? "Resetting..." : "↺ Reset to suggested order"}
              </button>
            </div>

            {/* Map with numbered pins */}
            <div className="mb-6 rounded-xl overflow-hidden shadow">
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

            {/* Ordered stop list with reorder controls */}
            {route.some(
              (s) =>
                s.isPriority &&
                !["Resolved", "Closed", "Cancelled"].includes(s.status),
            ) && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <span className="text-red-700 text-lg">🚨</span>
                <p className="text-sm text-red-700 font-medium">
                  This route contains priority stops from escalated hotspot
                  clusters. Consider moving them to the top using the reorder
                  controls.
                </p>
              </div>
            )}
            <div className="bg-white rounded-xl shadow divide-y divide-gray-100">
              {route.map((stop, index) => (
                <div key={stop._id} className="p-4 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-800">
                        {stop.caseReference} — {stop.category}
                      </p>
                      {stop.isPriority &&
                        !["Resolved", "Closed", "Cancelled"].includes(
                          stop.status,
                        ) && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-red-100 text-red-700 rounded-full border border-red-200 shrink-0">
                            🚨 Priority
                          </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {stop.location.address}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {stop.reportedBy?.name} · {stop.reportedBy?.phone}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveStop(index, -1)}
                      disabled={index === 0}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStop(index, 1)}
                      disabled={index === route.length - 1}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-4">
              <button
                type="button"
                onClick={saveOrder}
                disabled={saving}
                className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save new order"}
              </button>
              {saveMessage && (
                <p className="text-sm text-gray-600">{saveMessage}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminRoutes;
