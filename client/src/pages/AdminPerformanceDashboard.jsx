import { useState, useEffect } from "react";
import api from "../api/axios"; // 👈 same one Dashboard.jsx uses
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { generateCollectorPDF } from "../utils/generatePDF";

export default function PerformanceDashboard() {
  const [data, setData] = useState([]);
  const [dates, setDates] = useState({ start: "", end: "" });
  const [sortField, setSortField] = useState("compositeScore");

  const fetchData = async () => {
    try {
      const res = await api.get(`/admin/collector-performance`, {
        // ✅ use `api`, not `axios`
        params: { startDate: dates.start, endDate: dates.end },
      });
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch performance data:", err);
      setData([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dates]);

  // Leaderboard lists
  const sortedData = [...data].sort((a, b) => b[sortField] - a[sortField]);
  const topFive = [...data]
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .slice(0, 5);
  const bottomFive = [...data]
    .sort((a, b) => a.compositeScore - b.compositeScore)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f7faf7] text-gray-800">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Collector Performance Dashboard
        </h1>

        {/* Date Range Filter */}
        <div className="flex flex-wrap gap-4 items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              From
            </label>
            <input
              type="date"
              value={dates.start}
              onChange={(e) => setDates({ ...dates, start: e.target.value })}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>
          <span className="text-gray-400 text-sm mt-5">to</span>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              To
            </label>
            <input
              type="date"
              value={dates.end}
              onChange={(e) => setDates({ ...dates, end: e.target.value })}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Top 5 / Bottom 5 Leaderboards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
            <h3 className="font-bold text-emerald-800 mb-3">
              Top 5 Performers
            </h3>
            <div className="space-y-2">
              {topFive.map((c) => (
                <div
                  key={c.collectorId}
                  className="flex justify-between text-sm text-emerald-900"
                >
                  <span className="font-medium">{c.name}</span>
                  <span className="font-bold">{c.compositeScore} pts</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
            <h3 className="font-bold text-red-800 mb-3">
              Needs Support (Bottom 5)
            </h3>
            <div className="space-y-2">
              {bottomFive.map((c) => (
                <div
                  key={c.collectorId}
                  className="flex justify-between text-sm text-red-900"
                >
                  <span className="font-medium">{c.name}</span>
                  <span className="font-bold">{c.compositeScore} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar
                dataKey="totalCompleted"
                fill="#059669"
                name="Completed"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="disputedCount"
                fill="#F59E0B"
                name="Disputed"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sortable Table with PDF Download */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th
                  onClick={() => setSortField("name")}
                  className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 transition"
                >
                  Name
                </th>
                <th
                  onClick={() => setSortField("totalCompleted")}
                  className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 transition"
                >
                  Pickups
                </th>
                <th
                  onClick={() => setSortField("disputedCount")}
                  className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 transition"
                >
                  Disputes
                </th>
                <th
                  onClick={() => setSortField("compositeScore")}
                  className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 transition"
                >
                  Score
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedData.map((row) => (
                <tr
                  key={row.collectorId}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 text-sm font-medium text-gray-800">
                    {row.name}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {row.totalCompleted}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {row.disputedCount}
                  </td>
                  <td className="p-4 text-sm font-bold text-gray-900">
                    {row.compositeScore}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => generateCollectorPDF(row, dates)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition cursor-pointer"
                    >
                      Export PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
