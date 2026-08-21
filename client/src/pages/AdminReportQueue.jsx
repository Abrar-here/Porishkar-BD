import { useState, useEffect } from "react";
import api from "../api/axios";

const PRIORITY_STYLES = {
  Critical: "bg-red-600 text-white",
  High: "bg-orange-500 text-white",
  Medium: "bg-yellow-400 text-gray-900",
  Low: "bg-gray-200 text-gray-700",
};

const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"];

function AdminReportQueue() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // tracks which report's override dropdown is open, and its pending reason text
  const [overridingId, setOverridingId] = useState(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [overrideChoice, setOverrideChoice] = useState("Low");
  // which report's full details are currently expanded, if any
  const [expandedId, setExpandedId] = useState(null);

  const loadQueue = () => {
    setLoading(true);
    api
      .get("/reports/priority-queue")
      .then((res) => setReports(res.data.reports))
      .catch(() => setError("Failed to load the report queue"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const openOverride = (report) => {
    setOverridingId(report._id);
    setOverrideChoice(report.priority);
    setOverrideReason("");
  };

  const toggleExpand = (id) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const submitOverride = async (id) => {
    try {
      await api.put(`/reports/${id}/priority`, {
        priority: overrideChoice,
        reason: overrideReason,
      });
      setOverridingId(null);
      loadQueue();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update priority");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <p className="text-gray-500 text-center py-12">Loading queue...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">
        Report Priority Queue
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Critical reports appear first. Override a priority if you disagree
        with the system's suggestion.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {reports.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-12">
            No reports yet.
          </p>
        )}

        {reports.map((report) => (
          <div
            key={report._id}
            className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div
                className="flex-1 cursor-pointer"
                onClick={() => toggleExpand(report._id)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${PRIORITY_STYLES[report.priority]}`}
                  >
                    {report.priority}
                  </span>
                  {report.priorityOverridden && (
                    <span className="text-xs text-gray-400 italic">
                      manually overridden
                    </span>
                  )}
                  <span className="text-xs font-mono text-gray-400">
                    {report.caseReference}
                  </span>
                </div>

                <p className="text-sm font-semibold text-gray-800">
                  {report.category} — {report.estimatedVolume} volume
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {report.description}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  📍 {report.location?.address} · Reported by{" "}
                  {report.reportedBy?.name || "Unknown"} · Status:{" "}
                  {report.status}
                </p>
                <p className="text-xs text-green-600 font-medium mt-1">
                  {expandedId === report._id ? "▲ Hide details" : "▼ View details"}
                </p>
              </div>

              <button
                onClick={() => openOverride(report)}
                className="shrink-0 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Override
              </button>
            </div>

            {expandedId === report._id && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                {/* Photos */}
                {report.images && report.images.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                      Photos
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {report.images.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`Report photo ${i + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(url, "_blank");
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact & scheduling */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    Reporter contact
                  </p>
                  <p className="text-sm text-gray-700">
                    {report.reportedBy?.email || "No email on file"}
                    {report.reportedBy?.phone
                      ? ` · ${report.reportedBy.phone}`
                      : ""}
                  </p>
                </div>

                {report.pickupDate && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">
                      Scheduled pickup
                    </p>
                    <p className="text-sm text-gray-700">
                      {new Date(report.pickupDate).toLocaleDateString()}
                      {report.pickupTime ? ` at ${report.pickupTime}` : ""}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    Exact coordinates
                  </p>
                  <p className="text-sm text-gray-700">
                    {report.location?.lat}, {report.location?.lng}
                  </p>
                </div>

                {/* Priority activity log */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    Priority history
                  </p>
                  <div className="space-y-1">
                    {(report.priorityHistory || []).map((entry, i) => (
                      <p key={i} className="text-xs text-gray-600">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mr-2 ${PRIORITY_STYLES[entry.priority]}`}
                        >
                          {entry.priority}
                        </span>
                        {entry.changedBy === "system"
                          ? "Set automatically by the system"
                          : "Manually overridden by an admin"}
                        {entry.reason ? ` — "${entry.reason}"` : ""}
                        {entry.changedAt
                          ? ` · ${new Date(entry.changedAt).toLocaleString()}`
                          : ""}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {overridingId === report._id && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                <div className="flex gap-2">
                  {PRIORITY_OPTIONS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setOverrideChoice(p)}
                      className={`px-3 py-1 text-xs rounded-full border ${
                        overrideChoice === p
                          ? "border-gray-800 font-semibold"
                          : "border-gray-300 text-gray-500"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <input
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Reason for override (optional)"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => submitOverride(report._id)}
                    className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setOverridingId(null)}
                    className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminReportQueue;