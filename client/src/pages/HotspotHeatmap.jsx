import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import HeatmapLayer from "../components/HeatmapLayer";

const DHAKA_CENTER = [23.8103, 90.4125];

const TIME_WINDOWS = [
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
  { label: "All time", value: "" },
];

function HotspotHeatmap() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [points, setPoints] = useState([]);
  const [availableDivisions, setAvailableDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [division, setDivision] = useState("");
  const [days, setDays] = useState("30");

  const [hotspots, setHotspots] = useState([]);
  const [loadingHotspots, setLoadingHotspots] = useState(false);
  const [escalatingIndex, setEscalatingIndex] = useState(null);
  const [escalatedIndexes, setEscalatedIndexes] = useState(new Set());

  const fetchPoints = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      // Filters are only meaningfully applied for admins on this page —
      // the underlying endpoint is public either way, but citizens see
      // the unfiltered view since they have no filter controls to set.
      if (isAdmin) {
        if (division) params.division = division;
        if (days) params.days = days;
      }
      const res = await api.get("/heatmap/points", { params });
      setPoints(res.data.points);
      setAvailableDivisions(res.data.availableDivisions);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load heatmap data");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, division, days]);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  const fetchHotspots = async () => {
    setLoadingHotspots(true);
    try {
      const res = await api.get("/heatmap/hotspots");
      setHotspots(res.data.hotspots);
    } catch {
      // Non-critical — the map still works without this
    } finally {
      setLoadingHotspots(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchHotspots();
  }, [isAdmin]);

  const handleEscalate = async (hotspot, index) => {
    setEscalatingIndex(index);
    try {
      await api.put("/heatmap/escalate", {
        caseReferences: hotspot.caseReferences,
      });
      setEscalatedIndexes((prev) => new Set(prev).add(index));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to escalate cluster");
    } finally {
      setEscalatingIndex(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Waste Hotspot Map
          </h1>
          <p className="text-gray-500 mt-2">
            Complaint density across the city — green for low activity, red for
            high-density zones.
          </p>
        </div>

        {/* Filter controls — admin only, per the requirement */}
        {isAdmin && (
          <div className="bg-white rounded-xl shadow p-5 mb-6 flex flex-col md:flex-row md:items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Division
              </label>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="">All divisions</option>
                {availableDivisions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time window
              </label>
              <select
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                {TIME_WINDOWS.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-sm text-gray-400">
              {points.length} reports shown
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-center py-12">Loading heatmap...</p>
        ) : (
          <div className="rounded-xl overflow-hidden shadow mb-6">
            <MapContainer
              center={DHAKA_CENTER}
              zoom={12}
              style={{ height: "500px", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <HeatmapLayer points={points} />
            </MapContainer>
          </div>
        )}

        {/* Hotspot escalation info — admin only */}
        {isAdmin && (
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-semibold text-gray-800 mb-1">
              Escalation Alerts
            </h3>
            <p className="text-xs text-gray-400 mb-3">
              Clusters with more than 5 unresolved reports within 500m over the
              last 30 days.
            </p>

            {loadingHotspots ? (
              <p className="text-sm text-gray-400">Checking for hotspots...</p>
            ) : hotspots.length === 0 ? (
              <p className="text-sm text-gray-500">
                No clusters currently meet the escalation threshold.
              </p>
            ) : (
              <div className="space-y-2">
                {hotspots.map((h, i) => (
                  <div
                    key={i}
                    className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-medium text-red-700">
                        {h.reportCount} unresolved reports clustered near{" "}
                        {h.centerLat.toFixed(4)}, {h.centerLng.toFixed(4)}
                      </p>
                      <p className="text-xs text-red-500 mt-1">
                        Cases: {h.caseReferences.join(", ")}
                      </p>
                    </div>

                    {escalatedIndexes.has(i) ? (
                      <span className="text-xs font-medium text-green-700 bg-green-100 px-3 py-1.5 rounded-lg shrink-0">
                        ✓ Escalated
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleEscalate(h, i)}
                        disabled={escalatingIndex === i}
                        className="text-xs font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg shrink-0 disabled:opacity-60"
                      >
                        {escalatingIndex === i
                          ? "Escalating..."
                          : "Escalate cluster"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HotspotHeatmap;
