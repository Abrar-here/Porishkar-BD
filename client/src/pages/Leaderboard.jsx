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
    <div className="min-h-screen bg-[#f7faf7] text-gray-800">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Leaderboard
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              See how you rank among other citizens.
            </p>
          </div>
          <div className="flex gap-2">
            {["weekly", "monthly", "alltime"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3.5 py-2 text-sm rounded-xl font-semibold transition cursor-pointer ${
                  period === p
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {p === "alltime"
                  ? "All-Time"
                  : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">
            {error}
          </div>
        )}
        {loading && (
          <div className="text-center py-16 text-gray-500 font-medium bg-white rounded-2xl border border-gray-100">
            Loading...
          </div>
        )}

        {data && !loading && (
          <>
            {data.myRank && (
              <div className="mb-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700">
                Your rank: <strong>#{data.myRank}</strong> with{" "}
                <strong>{data.myPoints} pts</strong>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
              {data.leaderboard.length === 0 && (
                <p className="text-sm text-gray-400 p-8 text-center">
                  No activity yet for this period.
                </p>
              )}
              {data.leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex justify-between items-center p-4 ${
                    data.myRank === entry.rank ? "bg-emerald-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${
                        entry.rank === 1
                          ? "bg-amber-100 text-amber-700"
                          : entry.rank === 2
                            ? "bg-gray-200 text-gray-600"
                            : entry.rank === 3
                              ? "bg-orange-100 text-orange-700"
                              : "text-gray-500"
                      }`}
                    >
                      {entry.rank}
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {entry.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-emerald-700">
                    {entry.points.toLocaleString()} pts
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Leaderboard;
