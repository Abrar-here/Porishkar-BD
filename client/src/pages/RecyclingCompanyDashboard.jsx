import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyBids } from "../api/bids";
import {
  getMyTransactions,
  getMyIntakeStats,
  confirmCollection,
} from "../api/transactions";

const BID_STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-700",
  Accepted: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
};

const COLLECTION_STATUS_STYLES = {
  Waiting: "bg-amber-100 text-amber-700",
  Collected: "bg-blue-100 text-blue-700",
  Confirmed: "bg-emerald-100 text-emerald-700",
};

function StatCard({ label, value, sublabel }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <p className="text-2xl font-extrabold text-gray-900 mt-1">{value}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
    </div>
  );
}

function RecyclingCompanyDashboard() {
  const [bids, setBids] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ byMaterial: [], totals: {} });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);
  const [bidTab, setBidTab] = useState("Pending");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [bidsRes, txRes, statsRes] = await Promise.all([
        getMyBids(),
        getMyTransactions(),
        getMyIntakeStats(),
      ]);
      setBids(bidsRes.bids || []);
      setTransactions(txRes.transactions || []);
      setStats(statsRes || { byMaterial: [], totals: {} });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleConfirmCollection = async (transactionId) => {
    setConfirmingId(transactionId);
    try {
      await confirmCollection(transactionId);
      loadDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to confirm collection");
    } finally {
      setConfirmingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7faf7] flex items-center justify-center">
        <p className="text-gray-500 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  // Transactions still waiting on this company to confirm they've
  // physically picked up the materials — the main "needs action" item.
  const pendingCollections = transactions.filter(
    (t) => t.collectionStatus === "Waiting",
  );

  const acceptedBidsCount = bids.filter((b) => b.status === "Accepted").length;
  const pendingBidsCount = bids.filter((b) => b.status === "Pending").length;

  const filteredBids = bids.filter((b) => b.status === bidTab);

  return (
    <div className="min-h-screen bg-[#f7faf7] text-gray-800">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Recycling Company Dashboard
            </h1>
            <p className="text-gray-500 mt-1.5 text-sm sm:text-base">
              Track your bids, confirm collections, and see your recycling
              intake.
            </p>
          </div>
          <Link
            to="/marketplace"
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition whitespace-nowrap inline-block text-center"
          >
            Browse Marketplace
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Materials Collected"
            value={stats.totals?.totalTransactions || 0}
            sublabel="completed transactions"
          />
          <StatCard
            label="Pending Bids"
            value={pendingBidsCount}
            sublabel="awaiting seller response"
          />
          <StatCard
            label="Pending Collections"
            value={pendingCollections.length}
            sublabel="need your confirmation"
          />
          <StatCard
            label="Total Spent"
            value={`৳${(stats.totals?.totalSpent || 0).toLocaleString()}`}
            sublabel="on confirmed transactions"
          />
        </div>

        {/* Needs Action */}
        {(pendingCollections.length > 0 || acceptedBidsCount > 0) && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Needs Your Action
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
              {pendingCollections.map((t) => (
                <div
                  key={t._id}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-bold text-gray-900">
                      {t.listing?.title || "Listing"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t.listing?.materialType} · {t.listing?.quantity?.value}{" "}
                      {t.listing?.quantity?.unit} · Seller: {t.seller?.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      📍 {t.listing?.pickupAddress?.fullAddress}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleConfirmCollection(t._id)}
                    disabled={confirmingId === t._id}
                    className="shrink-0 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition disabled:opacity-60 cursor-pointer"
                  >
                    {confirmingId === t._id
                      ? "Confirming..."
                      : "Confirm Collection"}
                  </button>
                </div>
              ))}

              {acceptedBidsCount > 0 && pendingCollections.length === 0 && (
                <div className="p-4 flex items-center justify-between gap-3">
                  <p className="text-sm text-gray-600">
                    You have {acceptedBidsCount} accepted bid
                    {acceptedBidsCount > 1 ? "s" : ""} — complete payment to
                    move forward with collection.
                  </p>
                  <Link
                    to="/my-offers"
                    className="shrink-0 text-sm text-emerald-700 hover:text-emerald-800 font-semibold"
                  >
                    Go to My Offers →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Bids */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3">My Bids</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-100">
              {["Pending", "Accepted", "Rejected"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setBidTab(tab)}
                  className={`px-4 py-3 text-sm font-semibold transition cursor-pointer ${
                    bidTab === tab
                      ? "text-emerald-700 border-b-2 border-emerald-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {filteredBids.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">
                No {bidTab.toLowerCase()} bids.
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredBids.map((bid) => (
                  <div
                    key={bid._id}
                    className="p-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            BID_STATUS_STYLES[bid.status] ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {bid.status}
                        </span>
                        <p className="font-bold text-gray-900">
                          {bid.listing?.title}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {bid.listing?.materialType} · Your bid: ৳
                        {bid.amount?.toLocaleString()}
                      </p>
                    </div>
                    <Link
                      to={`/marketplace/${bid.listing?._id}`}
                      className="shrink-0 text-sm text-emerald-700 hover:text-emerald-800 font-semibold"
                    >
                      View listing →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Intake Statistics */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            Recycling Intake Statistics
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {stats.byMaterial?.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">
                No completed collections yet — stats will appear here once
                you've confirmed a collection and the seller has confirmed
                payment.
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {stats.byMaterial?.map((row, i) => (
                  <div
                    key={i}
                    className="p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-gray-900">
                        {row.materialType}
                      </p>
                      <p className="text-sm text-gray-500">
                        {row.transactionCount} transaction
                        {row.transactionCount > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {row.totalQuantity} {row.unit}
                      </p>
                      <p className="text-sm text-gray-500">
                        ৳{row.totalSpent?.toLocaleString()} spent
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Transaction history */}
        {transactions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Transaction History
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
              {transactions.map((t) => (
                <div
                  key={t._id}
                  className="p-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-bold text-gray-900">
                      {t.listing?.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      Seller: {t.seller?.name} · ৳{t.amount?.toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      COLLECTION_STATUS_STYLES[t.collectionStatus] ||
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {t.collectionStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default RecyclingCompanyDashboard;
