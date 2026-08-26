import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const statusColors = {
  Reported: "bg-blue-100 text-blue-700",
  Assigned: "bg-yellow-100 text-yellow-700",
  "Collector En Route": "bg-orange-100 text-orange-700",
  "Cleanup In Progress": "bg-purple-100 text-purple-700",
  Resolved: "bg-emerald-100 text-emerald-700",
  Closed: "bg-gray-100 text-gray-700",
  Cancelled: "bg-red-100 text-red-700",
};

function AdminReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get("/reports");
        setReports(res.data.reports);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = reports.filter((r) => {
    const matchesSearch =
      r.caseReference?.toLowerCase().includes(search.toLowerCase()) ||
      r.location?.address?.toLowerCase().includes(search.toLowerCase()) ||
      r.category?.toLowerCase().includes(search.toLowerCase()) ||
      r.reportedBy?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f7faf7] text-gray-800">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            All Reports
          </h1>
          <p className="text-gray-500 mt-1.5 text-sm sm:text-base">
            All waste issue reports submitted by citizens.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 mb-6 flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by case reference, address, category, or citizen name..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            >
              <option value="All">All statuses</option>
              {Object.keys(statusColors).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray-500 pb-2.5">
            <span className="font-semibold text-gray-700">
              {filtered.length}
            </span>{" "}
            of {reports.length} reports
          </p>
        </div>

        {loading && (
          <div className="text-center py-16 text-gray-500 font-medium bg-white rounded-2xl border border-gray-100">
            Loading reports...
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 mb-4">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-500">
            <p className="text-lg font-semibold text-gray-700 mb-2">
              No reports found
            </p>
            <p className="text-sm">Try adjusting your search or filter.</p>
          </div>
        )}

        {/* Report list */}
        <div className="space-y-3">
          {filtered.map((report) => (
            <div
              key={report._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Summary row */}
              <button
                type="button"
                onClick={() => toggleExpand(report._id)}
                className="w-full text-left p-5 flex justify-between items-start hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-gray-400">
                      {report.caseReference}
                    </span>

                    {/* Priority badge — F04 escalation */}
                    {report.isPriority &&
                      !["Resolved", "Closed", "Cancelled"].includes(
                        report.status,
                      ) && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full border border-red-200">
                          🚨 Priority
                        </span>
                      )}
                  </div>

                  <h3 className="font-bold text-gray-900 mt-1">
                    {report.category}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {report.location?.address}
                  </p>
                  {report.reportedBy && (
                    <p className="text-xs text-gray-400 mt-1">
                      Reported by: {report.reportedBy.name} ·{" "}
                      {report.reportedBy.email}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[report.status] || "bg-gray-100 text-gray-600"}`}
                  >
                    {report.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(report.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </button>

              {/* Expanded detail */}
              {expanded[report._id] && (
                <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-0.5">
                      Description
                    </p>
                    <p className="text-sm text-gray-700">
                      {report.description}
                    </p>
                  </div>

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
                            onClick={() => window.open(url, "_blank")}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-gray-600">
                      Coordinates:
                    </p>
                    <p className="text-sm text-gray-700">
                      {report.location?.lat?.toFixed(5)},{" "}
                      {report.location?.lng?.toFixed(5)}
                    </p>
                  </div>

                  {report.isPriority &&
                    !["Resolved", "Closed", "Cancelled"].includes(
                      report.status,
                    ) && (
                      <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl">
                        <p className="text-sm text-red-700 font-medium">
                          🚨 This report has been escalated as part of a hotspot
                          cluster. It should be prioritised for cleanup.
                        </p>
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

export default AdminReports;
