import { useState, useEffect } from "react";
import api from "../api/axios";

const ACTIVITY_LABELS = {
  report_waste: "Report waste issue",
  complete_pickup: "Complete pickup",
  sell_recyclables: "Sell recyclables",
};

function EcoPoints() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/ecopoints/wallet")
      .then((res) => setWallet(res.data))
      .catch(() => setError("Failed to load eco points wallet"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7faf7] flex items-center justify-center">
        <p className="text-gray-500 font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faf7] text-gray-800">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">
          Your Eco Points
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Track your rewards and see how close you are to the next tier.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">
            {error}
          </div>
        )}

        {wallet && (
          <>
            {/* Balance card */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl p-6 mb-6 shadow-sm">
              <p className="text-xs opacity-80 mb-1">Eco points balance</p>
              <p className="text-3xl font-extrabold mb-3">
                {wallet.ecoPoints.toLocaleString()} pts
              </p>
              <div className="w-full bg-white/25 rounded-full h-2 mb-2">
                <div
                  className="bg-white h-2 rounded-full transition-all"
                  style={{
                    width: wallet.nextTier
                      ? `${Math.min(100, (wallet.ecoPoints / (wallet.ecoPoints + wallet.pointsToNextTier)) * 100)}%`
                      : "100%",
                  }}
                />
              </div>
              <p className="text-xs opacity-80">
                {wallet.nextTier
                  ? `${wallet.pointsToNextTier} points to ${wallet.nextTier} Tier`
                  : `You've reached the top tier (${wallet.tier})`}
              </p>
            </div>

            {/* Ways to earn */}
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Ways to Earn
            </p>
            <p className="text-xs text-gray-400 mb-3">
              Points are added automatically — file a report, have a collector
              complete your pickup, or mark a marketplace listing as sold.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
              {wallet.waysToEarn.map((way) => (
                <div
                  key={way.activityType}
                  className="bg-white border border-gray-100 shadow-xs rounded-2xl p-4 text-center"
                >
                  <p className="text-sm font-semibold text-gray-800">
                    {way.label}
                  </p>
                  <p className="text-emerald-700 text-sm font-bold mt-1">
                    +{way.points} points
                  </p>
                </div>
              ))}
            </div>

            {/* Recent activity */}
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Recent Activity
            </p>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
              {wallet.recentActivity.length === 0 && (
                <p className="text-sm text-gray-400 p-6 text-center">
                  No activity yet — go file a report, complete a pickup, or sell
                  some recyclables to start earning.
                </p>
              )}
              {wallet.recentActivity.map((activity) => (
                <div
                  key={activity._id}
                  className="flex justify-between items-center p-4"
                >
                  <span className="text-sm text-gray-700">
                    {ACTIVITY_LABELS[activity.activityType] || activity.label}
                  </span>
                  <span className="text-emerald-700 text-sm font-bold">
                    +{activity.points}
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

export default EcoPoints;
