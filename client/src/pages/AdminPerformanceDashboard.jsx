import { useState, useEffect } from "react";
import api from "../api/axios"; // 👈 same one Dashboard.jsx uses
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { generateCollectorPDF } from "../utils/generatePDF";

export default function PerformanceDashboard() {
  const [data, setData] = useState([]);
  const [dates, setDates] = useState({ start: "", end: "" });
  const [sortField, setSortField] = useState("compositeScore");

  const fetchData = async () => {
  try {
    const res = await api.get(`/admin/collector-performance`, { // ✅ use `api`, not `axios`
      params: { startDate: dates.start, endDate: dates.end },
    });
    setData(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error("Failed to fetch performance data:", err);
    setData([]);
  }
};

  useEffect(() => { fetchData(); }, [dates]);

  // Leaderboard lists
  const sortedData = [...data].sort((a, b) => b[sortField] - a[sortField]);
  const topFive = [...data].sort((a, b) => b.compositeScore - a.compositeScore).slice(0, 5);
  const bottomFive = [...data].sort((a, b) => a.compositeScore - b.compositeScore).slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Collector Performance Dashboard</h1>

      {/* Date Range Filter */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow">
        <input type="date" value={dates.start} onChange={(e) => setDates({ ...dates, start: e.target.value })} className="border p-2 rounded" />
        <span>to</span>
        <input type="date" value={dates.end} onChange={(e) => setDates({ ...dates, end: e.target.value })} className="border p-2 rounded" />
      </div>

      {/* Top 5 / Bottom 5 Leaderboards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <h3 className="font-bold text-green-800 mb-2">Top 5 Performers</h3>
          {topFive.map((c) => <div key={c.collectorId}>{c.name} — {c.compositeScore} pts</div>)}
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
          <h3 className="font-bold text-red-800 mb-2">Needs Support (Bottom 5)</h3>
          {bottomFive.map((c) => <div key={c.collectorId}>{c.name} — {c.compositeScore} pts</div>)}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white p-4 rounded-xl shadow h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalCompleted" fill="#10B981" name="Completed" />
            <Bar dataKey="disputedCount" fill="#F59E0B" name="Disputed" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sortable Table with PDF Download */}
      <table className="w-full text-left bg-white rounded-xl shadow">
        <thead>
          <tr className="border-b">
            <th onClick={() => setSortField("name")} className="p-3 cursor-pointer">Name</th>
            <th onClick={() => setSortField("totalCompleted")} className="p-3 cursor-pointer">Pickups</th>
            <th onClick={() => setSortField("disputedCount")} className="p-3 cursor-pointer">Disputes</th>
            <th onClick={() => setSortField("compositeScore")} className="p-3 cursor-pointer">Score</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row) => (
            <tr key={row.collectorId} className="border-b">
              <td className="p-3">{row.name}</td>
              <td className="p-3">{row.totalCompleted}</td>
              <td className="p-3">{row.disputedCount}</td>
              <td className="p-3 font-bold">{row.compositeScore}</td>
              <td className="p-3">
                <button onClick={() => generateCollectorPDF(row, dates)} className="bg-blue-600 text-white px-3 py-1 rounded">
                  Export PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}