import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { createBid } from "../api/bids";

function ListingDetails() {
  const { id } = useParams();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Bid states
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [bidLoading, setBidLoading] = useState(false);
  const [bidSuccess, setBidSuccess] = useState("");
  const [bidError, setBidError] = useState("");

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get(`/listings/${id}`);

        setListing(res.data.listing);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load listing");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  // Submit Bid
  const handleBidSubmit = async (e) => {
    e.preventDefault();

    try {
      setBidLoading(true);
      setBidError("");
      setBidSuccess("");

      await createBid({
        listingId: listing._id,
        amount: Number(bidAmount),
        message: bidMessage,
      });

      setBidSuccess("Bid submitted successfully!");

      setBidAmount("");
      setBidMessage("");
    } catch (err) {
      setBidError(err.response?.data?.message || "Failed to submit bid");
    } finally {
      setBidLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7faf7] flex items-center justify-center">
        <p className="text-gray-500 font-medium">Loading listing...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7faf7] px-4 sm:px-6 py-10">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-red-600 font-medium">{error}</p>

          <Link
            to="/marketplace"
            className="inline-block mt-4 text-emerald-700 font-semibold hover:underline"
          >
            ← Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faf7] text-gray-800">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link
          to="/marketplace"
          className="inline-block mb-4 text-sm text-emerald-700 font-semibold hover:underline"
        >
          ← Back to Marketplace
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Images */}
          <div className="p-4 sm:p-6 pb-0">
            {listing.images && listing.images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {listing.images.map((image, index) => (
                  <img
                    key={image.publicId || index}
                    src={image.url}
                    alt={`${listing.title} ${index + 1}`}
                    className="w-full h-72 object-cover rounded-xl border border-gray-200"
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-72 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
                No Images Available
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8">
            {/* Material + Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                {listing.materialType}
              </span>

              <span className="text-xs font-medium text-gray-500">
                {listing.status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3 tracking-tight">
              {listing.title}
            </h1>

            <p className="text-gray-500 mt-3 text-sm sm:text-base">
              {listing.description || "No description provided."}
            </p>

            {/* Information */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 rounded-xl p-5 border border-gray-100 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Quantity:</span>{" "}
                {listing.quantity?.value} {listing.quantity?.unit}
              </div>

              <div>
                <span className="font-semibold text-gray-700">Condition:</span>{" "}
                {listing.condition}
              </div>

              <div>
                <span className="font-semibold text-gray-700">
                  Listing Type:
                </span>{" "}
                {listing.listingType}
              </div>

              <div>
                <span className="font-semibold text-gray-700">Price:</span>{" "}
                {listing.listingType === "Donation"
                  ? "Free / Donation"
                  : `৳${listing.askingPrice}`}
              </div>

              <div>
                <span className="font-semibold text-gray-700">
                  Pickup Address:
                </span>{" "}
                {listing.pickupAddress?.fullAddress}
              </div>

              <div>
                <span className="font-semibold text-gray-700">District:</span>{" "}
                {listing.pickupAddress?.district}
              </div>

              <div>
                <span className="font-semibold text-gray-700">Division:</span>{" "}
                {listing.pickupAddress?.division}
              </div>

              <div>
                <span className="font-semibold text-gray-700">Seller:</span>{" "}
                {listing.seller?.name || "Unknown"}
              </div>

              <div className="md:col-span-2">
                <span className="font-semibold text-gray-700">Posted:</span>{" "}
                {new Date(listing.createdAt).toLocaleString()}
              </div>
            </div>

            {/* ================= BID SECTION ================= */}
            {listing.status === "Active" && listing.listingType === "Sale" && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">
                  Make an Offer
                </h2>

                <form onSubmit={handleBidSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Offer Amount (৳)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="Enter your offer amount"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Message to Seller
                    </label>
                    <textarea
                      required
                      placeholder="Message to seller"
                      value={bidMessage}
                      onChange={(e) => setBidMessage(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={bidLoading}
                    className="bg-emerald-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-emerald-800 shadow-sm hover:shadow transition disabled:opacity-60 cursor-pointer"
                  >
                    {bidLoading ? "Submitting..." : "Submit Bid"}
                  </button>
                </form>

                {bidSuccess && (
                  <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-sm">
                    {bidSuccess}
                  </div>
                )}

                {bidError && (
                  <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">
                    {bidError}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ListingDetails;
