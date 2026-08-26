import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function MyListings() {
  const [listings, setListings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        const res = await api.get("/listings/my");

        setListings(res.data.listings);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load your listings");
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this listing?",
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/listings/${id}`);

      setListings((currentListings) =>
        currentListings.filter((listing) => listing._id !== id),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete listing");
    }
  };

  // Mark Sold + Eco Points

  const handleMarkSold = async (id) => {
    const confirmSold = window.confirm(
      "Mark this listing as sold? This can't be undone.",
    );

    if (!confirmSold) return;

    try {
      const res = await api.patch(`/listings/${id}/sold`);

      setListings((currentListings) =>
        currentListings.map((listing) =>
          listing._id === id
            ? {
                ...listing,
                status: "Sold",
              }
            : listing,
        ),
      );

      if (res.data.ecoPoints) {
        alert(
          `Listing marked as sold! You earned ${res.data.ecoPoints.pointsEarned} eco points (new balance: ${res.data.ecoPoints.newBalance}).`,
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark listing as sold");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7faf7] flex items-center justify-center">
        <p className="text-gray-500 font-medium">Loading your listings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faf7] text-gray-800">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              My Listings
            </h1>

            <p className="text-gray-500 mt-1.5 text-sm">
              Manage all recyclable listings created by you.
            </p>
          </div>

          <Link
            to="/marketplace/create"
            className="px-5 py-2.5 bg-emerald-700 text-white font-semibold text-sm rounded-xl hover:bg-emerald-800 shadow-sm hover:shadow transition inline-block text-center"
          >
            + Create Listing
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {!error && listings.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <h2 className="text-xl font-bold text-gray-800">No Listings Yet</h2>

            <p className="text-gray-500 mt-2 text-sm">
              You have not created any marketplace listings yet.
            </p>

            <Link
              to="/marketplace/create"
              className="inline-block mt-5 px-5 py-2.5 bg-emerald-700 text-white font-semibold text-sm rounded-xl hover:bg-emerald-800 shadow-sm transition"
            >
              Create Your First Listing
            </Link>
          </div>
        )}

        {listings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div
                key={listing._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {listing.materialType}
                  </span>

                  <span className="text-xs font-medium text-gray-500">
                    {listing.status}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-gray-900">
                  {listing.title}
                </h2>

                <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                  {listing.description || "No description provided."}
                </p>

                <div className="mt-4 space-y-1.5 text-sm text-gray-700 bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  <p>
                    <span className="font-semibold">Quantity:</span>{" "}
                    {listing.quantity?.value} {listing.quantity?.unit}
                  </p>

                  <p>
                    <span className="font-semibold">Condition:</span>{" "}
                    {listing.condition}
                  </p>

                  <p>
                    <span className="font-semibold">Price:</span>{" "}
                    {listing.listingType === "Donation"
                      ? "Free / Donation"
                      : `৳${listing.askingPrice}`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-5">
                  <Link
                    to={`/marketplace/${listing._id}`}
                    className="text-center py-2 border border-emerald-600 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-50 transition"
                  >
                    View
                  </Link>

                  <Link
                    to={`/my-listings/${listing._id}/edit`}
                    className="text-center py-2 bg-emerald-700 text-white text-xs font-semibold rounded-lg hover:bg-emerald-800 transition"
                  >
                    Edit
                  </Link>

                  <Link
                    to={`/my-listings/${listing._id}/offers`}
                    className={`text-center py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition ${
                      listing.status !== "Active" ? "col-span-2" : ""
                    }`}
                  >
                    Offers
                  </Link>

                  {listing.status === "Active" && (
                    <button
                      onClick={() => handleMarkSold(listing._id)}
                      className="py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition cursor-pointer"
                    >
                      Mark Sold
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(listing._id)}
                    className="col-span-2 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyListings;
