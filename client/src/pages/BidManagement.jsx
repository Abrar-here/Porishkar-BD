import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { getListingBids, acceptBid, rejectBid } from "../api/bids";
import { confirmReceipt } from "../api/transactions";

function BidManagement() {
  const { id } = useParams();

  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);

  useEffect(() => {
    fetchBids();
  }, [id]);

  const fetchBids = async () => {
    try {
      const res = await getListingBids(id);
      setBids(res.bids);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bids");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bidId) => {
    try {
      await acceptBid(bidId);
      alert("Bid accepted successfully. Waiting for buyer payment.");
      fetchBids();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept bid");
    }
  };

  const handleReject = async (bidId) => {
    try {
      await rejectBid(bidId);
      fetchBids();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject bid");
    }
  };

  const handleConfirmReceipt = async (transactionId) => {
    setConfirmingId(transactionId);
    try {
      await confirmReceipt(transactionId);
      fetchBids();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to confirm receipt");
    } finally {
      setConfirmingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7faf7] flex items-center justify-center">
        <p className="text-gray-500 font-medium">Loading offers...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faf7] text-gray-800">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link
          to="/my-listings"
          className="inline-block text-sm text-emerald-700 font-semibold hover:underline"
        >
          ← Back to My Listings
        </Link>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-4 tracking-tight">
          Incoming Offers
        </h1>

        {error && (
          <div className="mt-5 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {bids.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 mt-6 text-center">
            <h2 className="text-xl font-bold text-gray-800">No Offers Yet</h2>
            <p className="text-gray-500 mt-2 text-sm">
              Buyers have not submitted any offers.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mt-6">
            {bids.map((bid) => (
              <div
                key={bid._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {bid.bidder?.name || "Unknown Buyer"}
                    </h2>
                    <p className="text-gray-500 text-sm mt-0.5">
                      {bid.bidder?.email}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                    {bid.status}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-sm text-gray-700 bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  <p>
                    <span className="font-semibold">Offer Amount:</span> ৳
                    {bid.amount}
                  </p>

                  <p>
                    <span className="font-semibold">Message:</span>{" "}
                    {bid.message}
                  </p>
                </div>

                {bid.status === "Pending" && (
                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => handleAccept(bid._id)}
                      className="px-5 py-2.5 bg-emerald-700 text-white font-semibold text-sm rounded-xl hover:bg-emerald-800 shadow-sm hover:shadow transition cursor-pointer"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => handleReject(bid._id)}
                      className="px-5 py-2.5 bg-red-600 text-white font-semibold text-sm rounded-xl hover:bg-red-700 transition cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {bid.status === "Accepted" && bid.transaction && (
                  <div className="mt-5">
                    {bid.transaction.paymentStatus === "Pending" && (
                      <span className="inline-block px-4 py-2 bg-amber-50 text-amber-700 text-sm font-medium rounded-xl border border-amber-100">
                        Waiting for buyer to pay
                      </span>
                    )}

                    {bid.transaction.paymentStatus === "Held" &&
                      (bid.transaction.sellerConfirmed ? (
                        <span className="inline-block px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-xl border border-blue-100">
                          Confirmed — waiting for buyer to confirm collection
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            handleConfirmReceipt(bid.transaction._id)
                          }
                          disabled={confirmingId === bid.transaction._id}
                          className="px-5 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 shadow-sm hover:shadow transition disabled:opacity-60 cursor-pointer"
                        >
                          {confirmingId === bid.transaction._id
                            ? "Confirming..."
                            : "Confirm Payment Received"}
                        </button>
                      ))}

                    {bid.transaction.paymentStatus === "Released" && (
                      <span className="inline-block px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-xl border border-emerald-100">
                        ✓ Payment released
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default BidManagement;
