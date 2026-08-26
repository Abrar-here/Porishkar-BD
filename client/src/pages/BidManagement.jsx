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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading offers...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <Link to="/my-listings" className="text-green-600 hover:underline">
          ← Back to My Listings
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mt-6">
          Incoming Offers
        </h1>

        {error && (
          <div className="mt-5 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {bids.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 mt-6 text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              No Offers Yet
            </h2>
            <p className="text-gray-500 mt-2">
              Buyers have not submitted any offers.
            </p>
          </div>
        ) : (
          <div className="space-y-5 mt-6">
            {bids.map((bid) => (
              <div key={bid._id} className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {bid.bidder?.name || "Unknown Buyer"}
                </h2>

                <p className="text-gray-600 mt-2">Email: {bid.bidder?.email}</p>

                <p className="mt-3">
                  <span className="font-semibold">Offer Amount:</span> ৳
                  {bid.amount}
                </p>

                <p className="mt-2 text-gray-600">
                  <span className="font-semibold">Message:</span> {bid.message}
                </p>

                <p className="mt-2">
                  <span className="font-semibold">Status:</span> {bid.status}
                </p>

                {bid.status === "Pending" && (
                  <div className="flex gap-4 mt-5">
                    <button
                      onClick={() => handleAccept(bid._id)}
                      className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => handleReject(bid._id)}
                      className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {bid.status === "Accepted" && bid.transaction && (
                  <div className="mt-5">
                    {bid.transaction.paymentStatus === "Pending" && (
                      <span className="inline-block px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
                        Waiting for buyer to pay
                      </span>
                    )}

                    {bid.transaction.paymentStatus === "Held" &&
                      (bid.transaction.sellerConfirmed ? (
                        <span className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                          Confirmed — waiting for buyer to confirm collection
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            handleConfirmReceipt(bid.transaction._id)
                          }
                          disabled={confirmingId === bid.transaction._id}
                          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                        >
                          {confirmingId === bid.transaction._id
                            ? "Confirming..."
                            : "Confirm Payment Received"}
                        </button>
                      ))}

                    {bid.transaction.paymentStatus === "Released" && (
                      <span className="inline-block px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                        ✓ Payment released
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BidManagement;
