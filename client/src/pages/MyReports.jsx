import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";

const statusColors = {
  Reported: "bg-blue-100 text-blue-700",
  Assigned: "bg-yellow-100 text-yellow-700",
  "Collector En Route": "bg-orange-100 text-orange-700",
  "Cleanup In Progress": "bg-purple-100 text-purple-700",
  Resolved: "bg-emerald-100 text-emerald-700",
  Closed: "bg-gray-100 text-gray-700",
};

function MyReports() {
  const navigate = useNavigate();
  const location = useLocation();
  const newReference = location.state?.caseReference;

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    api
      .get("/reports/my")
      .then((res) => setReports(res.data.reports))
      .catch(() => setError("Failed to load reports"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f7faf7] text-gray-800">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Success banner — shows when redirected from a new report */}
        {newReference && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <p className="text-emerald-700 font-semibold">
              ✓ Report submitted successfully
            </p>
            <p className="text-emerald-600 text-sm mt-1">
              Case reference: <span className="font-bold">{newReference}</span>
            </p>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            My Reports
          </h2>
          <button
            onClick={() => navigate("/report")}
            className="px-4 py-2.5 bg-emerald-700 text-white text-sm font-semibold rounded-xl hover:bg-emerald-800 shadow-sm hover:shadow transition cursor-pointer"
          >
            + New Report
          </button>
        </div>

        {loading && (
          <div className="text-center py-16 text-gray-500 font-medium bg-white rounded-2xl border border-gray-100">
            Loading reports…
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-500">
            <p className="text-lg font-semibold text-gray-700 mb-2">
              No reports yet
            </p>
            <p className="text-sm">
              Spotted a waste issue?{" "}
              <button
                onClick={() => navigate("/report")}
                className="text-emerald-700 font-medium hover:underline cursor-pointer"
              >
                Report it now
              </button>
            </p>
          </div>
        )}

        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs font-mono text-gray-400">
                    {report.caseReference}
                  </span>
                  <h3 className="font-bold text-gray-900 mt-1">
                    {report.category}
                  </h3>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    statusColors[report.status]
                  }`}
                >
                  {report.status}
                </span>
              </div>

              {/* Description with read more / show less */}
              <div className="mb-3">
                <p
                  className={`text-sm text-gray-600 ${
                    expanded[report._id] ? "" : "line-clamp-2"
                  }`}
                >
                  {report.description}
                </p>
                {report.description.length > 120 && (
                  <button
                    onClick={() => toggleExpand(report._id)}
                    className="text-xs text-emerald-700 font-medium hover:underline mt-1 cursor-pointer"
                  >
                    {expanded[report._id] ? "Show less" : "Read more"}
                  </button>
                )}
              </div>
              {/* Image gallery — only shows if the report has photos */}
              {report.images && report.images.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
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
              )}
              <div className="flex justify-between items-center text-xs text-gray-400 pt-3 border-t border-gray-50">
                <span>📍 {report.location.address}</span>
                <span>
                  {new Date(report.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default MyReports;
