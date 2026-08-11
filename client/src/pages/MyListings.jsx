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
        setError(
          err.response?.data?.message || "Failed to load your listings"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this listing?",
      "Are you sure you want to delete this listing?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`/listings/${id}`);

      setListings((currentListings) =>
        currentListings.filter((listing) => listing._id !== id),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete listing");
        currentListings.filter(
          (listing) => listing._id !== id
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete listing"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading your listings...</p>
        <p className="text-gray-500">
          Loading your listings...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Listings</h1>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              My Listings
            </h1>

            <p className="text-gray-500 mt-2">
              Manage all recyclable listings created by you.
            </p>
          </div>

          <Link
            to="/marketplace/create"
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Create Listing
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!error && listings.length === 0 && (
          <div className="bg-white rounded-xl shadow p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              No Listings Yet
            </h2>

            <p className="text-gray-500 mt-2">
              You have not created any marketplace listings yet.
            </p>

            <Link
              to="/marketplace/create"
              className="inline-block mt-5 px-5 py-2 bg-green-600 text-white rounded-lg"
            >
              Create Your First Listing
            </Link>
          </div>
        )}

        {/* Listings */}
        {listings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing._id} className="bg-white rounded-xl shadow p-6">
              <div
                key={listing._id}
                className="bg-white rounded-xl shadow p-6"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-green-600 font-medium">
                    {listing.materialType}
                  </span>

                  <span className="text-sm text-gray-500">
                    {listing.status}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-800">
                  {listing.title}
                </h2>

                <p className="text-gray-500 mt-2">
                  {listing.description || "No description provided."}
                </p>

                <div className="mt-4 space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="font-semibold">Quantity:</span>{" "}
                    {listing.quantity?.value} {listing.quantity?.unit}
                  </p>

                  <p>
                    <span className="font-semibold">Condition:</span>{" "}
                    <span className="font-semibold">
                      Quantity:
                    </span>{" "}
                    {listing.quantity?.value}{" "}
                    {listing.quantity?.unit}
                  </p>

                  <p>
                    <span className="font-semibold">
                      Condition:
                    </span>{" "}
                    {listing.condition}
                  </p>

                  <p>
                    <span className="font-semibold">Price:</span>{" "}
                    <span className="font-semibold">
                      Price:
                    </span>{" "}
                    {listing.listingType === "Donation"
                      ? "Free / Donation"
                      : `৳${listing.askingPrice}`}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6">

                  <Link
                    to={`/marketplace/${listing._id}`}
                    className="text-center py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50"
                  >
                    View
                  </Link>

                  <Link
                    to={`/my-listings/${listing._id}/edit`}
                    className="text-center py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(listing._id)}
                    className="py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default MyListings;
export default MyListings;
