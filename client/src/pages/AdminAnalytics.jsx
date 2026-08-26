import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const MATERIAL_COLORS = {
  Plastic: "#3b82f6",
  Paper: "#f59e0b",
  Metal: "#6b7280",
  Glass: "#10b981",
  "Electronic Waste": "#8b5cf6",
  Textile: "#ec4899",
};

const ACTIVITY_LABELS = {
  report_waste: "Reporting Waste",
  complete_pickup: "Completing Pickups",
  sell_recyclables: "Selling Recyclables",
};

// Turns a MongoDB grouped _id ({year, month, day} or {year, week}) into
// a readable label for the chart's x-axis.
const formatBucketLabel = (bucket, granularity) => {
  if (granularity === "week") {
    return `Wk ${bucket.week}, ${bucket.year}`;
  }
  if (granularity === "month") {
    const date = new Date(bucket.year, bucket.month - 1, 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
  }
  const date = new Date(bucket.year, bucket.month - 1, bucket.day);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const [granularity, setGranularity] = useState("day");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { granularity };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get("/analytics/summary", { params });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [granularity, startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await api.get(`/analytics/export?${params.toString()}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `analytics-summary-${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  const clearDateRange = () => {
    setStartDate("");
    setEndDate("");
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#f7faf7] flex items-center justify-center">
        <p className="text-gray-500 font-medium">Loading analytics...</p>
      </div>
    );
  }

  const reportsChartData =
    data?.reportsOverTime.map((b) => ({
      label: formatBucketLabel(b._id, granularity),
      count: b.count,
    })) || [];

  const completionChartData =
    data?.completionOverTime.map((b) => ({
      label: formatBucketLabel(b._id, granularity),
      rate:
        b.total > 0 ? parseFloat(((b.resolved / b.total) * 100).toFixed(1)) : 0,
    })) || [];

  const materialChartData =
    data?.listingsByMaterial.map((m) => ({
      name: m._id,
      value: m.count,
    })) || [];

  const pointsChartData =
    data?.pointsByActivity.map((p) => ({
      name: ACTIVITY_LABELS[p._id] || p._id,
      points: p.totalPoints,
    })) || [];

  return (
    <div className="min-h-screen bg-[#f7faf7] text-gray-800">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Operational Analytics
          </h1>
          <p className="text-gray-500 mt-1.5 text-sm sm:text-base">
            Platform-wide metrics across reports, recycling, and rewards.
          </p>
        </div>

        {/* Date range filter + export — the two real actions on this page */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 mb-6 flex flex-col md:flex-row md:items-end gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              From
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              To
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Group by
            </label>
            <select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>

          {(startDate || endDate) && (
            <button
              type="button"
              onClick={clearDateRange}
              className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition cursor-pointer"
            >
              Clear dates
            </button>
          )}

          <div className="flex-1" />

          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="px-5 py-2.5 bg-emerald-700 text-white font-semibold text-sm rounded-xl hover:bg-emerald-800 shadow-sm hover:shadow transition disabled:opacity-60 cursor-pointer"
          >
            {exporting ? "Exporting..." : "⬇ Export CSV"}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Stat summary row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Total Reports"
                value={data.summary.totalReports}
              />
              <StatCard
                label="Resolved Reports"
                value={data.summary.resolvedReports}
              />
              <StatCard
                label="Active Listings"
                value={data.summary.activeListings}
              />
              <StatCard
                label="Eco Points Issued"
                value={data.summary.totalPointsIssued}
              />
            </div>

            {/* Charts grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reports over time — bar chart */}
              <ChartCard title="Reports Submitted Over Time">
                {reportsChartData.length === 0 ? (
                  <EmptyChartMessage />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={reportsChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        fill="#059669"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              {/* Completion rate — line chart */}
              <ChartCard title="Collection Completion Rate (%)">
                {completionChartData.length === 0 ? (
                  <EmptyChartMessage />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={completionChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v) => `${v}%`} />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              {/* Listings by material — doughnut chart */}
              <ChartCard title="Recycling Listings by Material">
                {materialChartData.length === 0 ? (
                  <EmptyChartMessage />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={materialChartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                      >
                        {materialChartData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={MATERIAL_COLORS[entry.name] || "#9ca3af"}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              {/* Eco points by activity — bar chart, honestly labeled */}
              <ChartCard
                title="Eco Points Issued by Activity"
                subtitle="Redemption isn't tracked yet — this shows what's being earned, not issued vs. redeemed."
              >
                {pointsChartData.length === 0 ? (
                  <EmptyChartMessage />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={pointsChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        type="number"
                        allowDecimals={false}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={140}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="points"
                        fill="#f59e0b"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-bold text-gray-900">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function EmptyChartMessage() {
  return (
    <div className="h-70 flex items-center justify-center text-sm text-gray-400">
      No data for this period.
    </div>
  );
}

export default AdminAnalytics;
