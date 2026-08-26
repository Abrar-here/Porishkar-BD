import { useEffect, useState } from "react";
import axios from "axios";

function RewardCentre() {
  const [rewards, setRewards] = useState([]);

  const [message, setMessage] = useState("");

  const [voucher, setVoucher] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/api/rewards", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRewards(res.data.rewards);
    } catch (error) {
      console.log(error);
    }
  };

  const redeemReward = async (rewardId) => {
    try {
      setLoading(true);

      setMessage("");

      setVoucher("");

      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/redemptions/redeem",

        {
          rewardId,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMessage(res.data.message);

      setVoucher(res.data.redemption.voucherCode);

      // refresh reward stock

      fetchRewards();
    } catch (error) {
      setMessage(error.response?.data?.message || "Redemption failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf7] text-gray-800">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Reward Centre
        </h1>

        {message && (
          <div className="mb-6 bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-xl">
            <p className="text-sm">{message}</p>

            {voucher && (
              <p className="mt-2 font-bold text-sm">Voucher Code: {voucher}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {rewards.map((reward) => (
            <div
              key={reward._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col"
            >
              <h2 className="text-lg font-bold text-gray-900">
                {reward.title}
              </h2>

              <span className="inline-block mt-2 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full w-fit">
                {reward.type}
              </span>

              <p className="text-emerald-700 font-extrabold mt-3 text-lg">
                {reward.pointsRequired} Points
              </p>

              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-semibold text-gray-700">Value:</span>{" "}
                  {reward.value}
                </p>

                {reward.merchant && (
                  <p>
                    <span className="font-semibold text-gray-700">
                      Merchant:
                    </span>{" "}
                    {reward.merchant.name}
                  </p>
                )}

                <p>
                  <span className="font-semibold text-gray-700">Stock:</span>{" "}
                  {reward.stock}
                </p>
              </div>

              <button
                onClick={() => redeemReward(reward._id)}
                disabled={loading}
                className="mt-4 bg-emerald-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-emerald-800 shadow-sm hover:shadow transition disabled:bg-gray-400 disabled:shadow-none cursor-pointer"
              >
                {loading ? "Processing..." : "Redeem"}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default RewardCentre;
