import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyBids } from "../api/bids";
import { confirmCollection } from "../api/transactions";

function MyOffers() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const res = await getMyBids();
        setBids(res.bids);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load offers");
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, []);

  const handleConfirmCollection = async (transactionId) => {
    setConfirmingId(transactionId);

    try {
      const res = await confirmCollection(transactionId);

      setBids((prev) =>
        prev.map((bid) =>
          bid.transaction?._id === transactionId
            ? { ...bid, transaction: res.transaction }
            : bid,
        ),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to confirm collection");
    } finally {
      setConfirmingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading offers...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">My Offers</h1>

        {error && (
          <div className="mt-5 bg-red-50 text-red-600 p-4 rounded">{error}</div>
        )}

        {bids.length === 0 ? (
          <div className="bg-white mt-6 p-8 rounded-xl shadow text-center">
            No offers submitted yet.
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {bids.map((bid) => (
              <div key={bid._id} className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold">
                  {bid.listing?.title || "Listing removed"}
                </h2>

                {bid.listing && (
                  <p className="text-gray-500">
                    Material: {bid.listing.materialType}
                  </p>
                )}

                <p className="mt-3">
                  <b>Your Offer:</b> ৳{bid.amount}
                </p>

                <p>
                  <b>Your Message:</b> {bid.message}
                </p>

                <p className="mt-3">
                  <b>Status:</b>
                  <span
                    className={
                      bid.status === "Accepted"
                        ? "text-green-600 font-bold ml-2"
                        : bid.status === "Rejected"
                          ? "text-red-600 font-bold ml-2"
                          : "text-yellow-600 font-bold ml-2"
                    }
                  >
                    {bid.status}
                  </span>
                </p>

                {bid.status === "Accepted" && (
                  <div className="mt-4">
                    <p className="text-green-700 font-semibold mb-3">
                      🎉 Seller accepted your offer!
                    </p>

                    {bid.transaction?._id &&
                      (bid.transaction.paymentStatus === "Pending" ? (
                        <Link
                          to={`/payment/${bid.transaction._id}`}
                          className="inline-block px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Pay Now
                        </Link>
                      ) : bid.transaction.paymentStatus === "Held" ? (
                        bid.transaction.buyerConfirmed ? (
                          <span className="inline-flex items-center gap-2 px-5 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-200">
                            Paid — waiting for seller to confirm receipt
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              handleConfirmCollection(bid.transaction._id)
                            }
                            disabled={confirmingId === bid.transaction._id}
                            className="inline-block px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                          >
                            {confirmingId === bid.transaction._id
                              ? "Confirming..."
                              : "Confirm Collection Received"}
                          </button>
                        )
                      ) : bid.transaction.paymentStatus === "Released" ? (
                        <span className="inline-flex items-center gap-2 px-5 py-2 bg-green-50 text-green-700 rounded-lg font-medium border border-green-200">
                          ✓ Paid & released
                        </span>
                      ) : null)}
                  </div>
                )}

                {bid.status === "Pending" && (
                  <p className="mt-3 text-yellow-700">
                    Waiting for seller response.
                  </p>
                )}

                {bid.status === "Rejected" && (
                  <p className="mt-3 text-red-700">
                    Seller rejected your offer.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOffers;
