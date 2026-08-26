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
      <div className="min-h-screen bg-[#f7faf7] flex items-center justify-center">
        <p className="text-gray-500 font-medium">Loading queue...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faf7] text-gray-800">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">
          Report Priority Queue
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Critical reports appear first. Override a priority if you disagree
          with the system's suggestion.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {reports.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400 text-sm">
              No reports yet.
            </div>
          )}

          {reports.map((report) => (
            <div
              key={report._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => toggleExpand(report._id)}
                >
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
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

                  <p className="text-sm font-bold text-gray-900">
                    {report.category} — {report.estimatedVolume} volume
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {report.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1.5">
                    📍 {report.location?.address} · Reported by{" "}
                    {report.reportedBy?.name || "Unknown"} · Status:{" "}
                    {report.status}
                  </p>
                  <p className="text-xs text-emerald-700 font-semibold mt-1.5">
                    {expandedId === report._id
                      ? "▲ Hide details"
                      : "▼ View details"}
                  </p>
                </div>

                <button
                  onClick={() => openOverride(report)}
                  className="shrink-0 px-3.5 py-1.5 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                >
                  Override
                </button>
              </div>

              {expandedId === report._id && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                  {/* Photos */}
                  {report.images && report.images.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        Photos
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {report.images.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt={`Report photo ${i + 1}`}
                            className="w-20 h-20 object-cover rounded-xl border border-gray-200 cursor-pointer hover:opacity-90 transition"
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
                    <p className="text-xs font-semibold text-gray-600 mb-0.5">
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
                      <p className="text-xs font-semibold text-gray-600 mb-0.5">
                        Scheduled pickup
                      </p>
                      <p className="text-sm text-gray-700">
                        {new Date(report.pickupDate).toLocaleDateString()}
                        {report.pickupTime ? ` at ${report.pickupTime}` : ""}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-0.5">
                      Exact coordinates
                    </p>
                    <p className="text-sm text-gray-700">
                      {report.location?.lat}, {report.location?.lng}
                    </p>
                  </div>

                  {/* Priority activity log */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1.5">
                      Priority history
                    </p>
                    <div className="space-y-1.5">
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
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    {PRIORITY_OPTIONS.map((p) => (
                      <button
                        key={p}
                        onClick={() => setOverrideChoice(p)}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition cursor-pointer ${
                          overrideChoice === p
                            ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
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
                    className="w-full px-3.5 py-2.5 bg-white text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => submitOverride(report._id)}
                      className="px-4 py-2 bg-emerald-700 text-white text-sm font-semibold rounded-xl hover:bg-emerald-800 shadow-sm transition cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setOverridingId(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default AdminReportQueue;
