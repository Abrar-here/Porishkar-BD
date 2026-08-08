import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function Marketplace() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [materialFilter, setMaterialFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [conditionFilter, setConditionFilter] = useState("All");

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await api.get("/listings");

        setListings(res.data.listings);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load marketplace listings"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Search and filter listings
  const filteredListings = listings.filter((listing) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      listing.title?.toLowerCase().includes(searchText) ||
      listing.description?.toLowerCase().includes(searchText) ||
      listing.materialType?.toLowerCase().includes(searchText) ||
      listing.pickupAddress?.district
        ?.toLowerCase()
        .includes(searchText) ||
      listing.pickupAddress?.division
        ?.toLowerCase()
        .includes(searchText);

    const matchesMaterial =
      materialFilter === "All" ||
      listing.materialType === materialFilter;

    const matchesType =
      typeFilter === "All" ||
      listing.listingType === typeFilter;

    const matchesCondition =
      conditionFilter === "All" ||
      listing.condition === conditionFilter;

    return (
      matchesSearch &&
      matchesMaterial &&
      matchesType &&
      matchesCondition
    );
  });

  const clearFilters = () => {
    setSearch("");
    setMaterialFilter("All");
    setTypeFilter("All");
    setConditionFilter("All");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Recycling Marketplace
            </h1>

            <p className="text-gray-500 mt-2">
              Browse recyclable materials available for sale or donation.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/my-listings"
              className="px-5 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition"
            >
              My Listings
            </Link>

            <Link
              to="/marketplace/create"
              className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              + Create Listing
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, material or location..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

          <select
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="All">All Materials</option>
            <option value="Plastic">Plastic</option>
            <option value="Paper">Paper</option>
            <option value="Metal">Metal</option>
            <option value="Glass">Glass</option>
            <option value="Electronic Waste">
              Electronic Waste
            </option>
            <option value="Textile">Textile</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="All">Sale & Donation</option>
            <option value="Sale">Sale</option>
            <option value="Donation">Donation</option>
          </select>

          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="All">All Conditions</option>
            <option value="Clean">Clean</option>
            <option value="Soiled">Soiled</option>
            <option value="Mixed">Mixed</option>
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
          >
            Clear Filters
          </button>

        </div>

        {/* Result Count */}
        {!loading && !error && listings.length > 0 && (
          <div className="mb-5 text-sm text-gray-500">
            Showing {filteredListings.length} of {listings.length} listings
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-xl shadow p-10 text-center">
            <p className="text-gray-500">
              Loading listings...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* No Listings */}
        {!loading &&
          !error &&
          listings.length === 0 && (
            <div className="bg-white rounded-xl shadow p-10 text-center">
              <h2 className="text-2xl font-semibold text-gray-700">
                No Listings Available
              </h2>

              <p className="text-gray-500 mt-3">
                No recyclable materials have been listed yet.
              </p>
            </div>
          )}

        {/* No Matching Results */}
        {!loading &&
          !error &&
          listings.length > 0 &&
          filteredListings.length === 0 && (
            <div className="bg-white rounded-xl shadow p-10 text-center">
              <h2 className="text-xl font-semibold text-gray-700">
                No Matching Listings
              </h2>

              <p className="text-gray-500 mt-2">
                Try changing your search or filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Clear Filters
              </button>
            </div>
          )}

        {/* Listing Cards */}
        {!loading && filteredListings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {filteredListings.map((listing) => (
              <div
                key={listing._id}
                className="bg-white rounded-xl shadow overflow-hidden"
              >

                {/* Listing Image */}
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0].url}
                    alt={listing.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}

                <div className="p-6">

                  {/* Material + Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-green-600">
                      {listing.materialType}
                    </span>

                    <span className="text-sm text-gray-500">
                      {listing.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-800 mb-3">
                    {listing.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-500 text-sm mb-4">
                    {listing.description ||
                      "No description provided."}
                  </p>

                  {/* Listing Information */}
                  <div className="space-y-2 text-sm text-gray-700">

                    <p>
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
                      <span className="font-semibold">
                        Type:
                      </span>{" "}
                      {listing.listingType}
                    </p>

                    <p>
                      <span className="font-semibold">
                        Location:
                      </span>{" "}
                      {listing.pickupAddress?.district},{" "}
                      {listing.pickupAddress?.division}
                    </p>

                    <p>
                      <span className="font-semibold">
                        Price:
                      </span>{" "}
                      {listing.listingType === "Donation"
                        ? "Free / Donation"
                        : `৳${listing.askingPrice}`}
                    </p>

                  </div>

                  {/* View Details */}
                  <Link
                    to={`/marketplace/${listing._id}`}
                    className="inline-block mt-5 w-full text-center py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    View Details
                  </Link>

                </div>
              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default Marketplace;