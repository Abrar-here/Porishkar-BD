import { useState, useEffect } from "react";
import api from "../api/axios";

function Leaderboard() {
  const [period, setPeriod] = useState("weekly");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get(`/leaderboard?period=${period}`)
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load leaderboard"))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Leaderboard</h2>
          <p className="text-gray-500 text-sm">See how you rank among other citizens.</p>
        </div>
        <div className="flex gap-2">
          {["weekly", "monthly", "alltime"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium ${
                period === p ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p === "alltime" ? "All-Time" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
      {loading && <p className="text-gray-500 text-center py-12">Loading...</p>}

      {data && !loading && (
        <>
          {data.myRank && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              Your rank: <strong>#{data.myRank}</strong> with <strong>{data.myPoints} pts</strong>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
            {data.leaderboard.length === 0 && (
              <p className="text-sm text-gray-400 p-4 text-center">No activity yet for this period.</p>
            )}
            {data.leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className={`flex justify-between items-center p-4 ${data.myRank === entry.rank ? "bg-green-50" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-sm font-bold text-gray-500">{entry.rank}</span>
                  <span className="text-sm text-gray-800">{entry.name}</span>
                </div>
                <span className="text-sm font-semibold text-green-600">{entry.points.toLocaleString()} pts</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Leaderboard;