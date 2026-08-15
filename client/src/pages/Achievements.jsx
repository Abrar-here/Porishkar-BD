import { useState, useEffect } from "react";
import api from "../api/axios";

function Achievements() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/badges")
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load achievements"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-gray-500 text-center py-12">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Achievements</h2>
      {data && (
        <p className="text-gray-500 text-sm mb-6">
          {data.unlockedCount} of {data.totalBadges} badges unlocked
        </p>
      )}

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {data.badges.map((badge) => (
              <div
                key={badge.key}
                className={`bg-white rounded-xl border p-4 text-center ${
                  badge.unlocked ? "border-green-200" : "border-gray-100 opacity-60"
                }`}
                title={badge.description}
              >
                <div
                  className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl mb-2 ${
                    badge.unlocked ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  {badge.unlocked ? badge.icon : "🔒"}
                </div>
                <p className="text-xs font-medium text-gray-700">{badge.name}</p>
              </div>
            ))}
          </div>

          {data.inProgress.length > 0 && (
            <>
              <p className="text-sm font-medium text-gray-700 mb-3">In Progress</p>
              <div className="space-y-3">
                {data.inProgress.map((badge) => (
                  <div key={badge.key} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl shrink-0">
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{badge.name}</p>
                      <p className="text-xs text-gray-400 mb-1">{badge.description}</p>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, (badge.progress / badge.target) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {badge.progress} of {badge.target}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Achievements;