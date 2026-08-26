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
          err.response?.data?.message || "Failed to load marketplace listings",
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
      listing.pickupAddress?.district?.toLowerCase().includes(searchText) ||
      listing.pickupAddress?.division?.toLowerCase().includes(searchText);

    const matchesMaterial =
      materialFilter === "All" || listing.materialType === materialFilter;

    const matchesType =
      typeFilter === "All" || listing.listingType === typeFilter;

    const matchesCondition =
      conditionFilter === "All" || listing.condition === conditionFilter;

    return matchesSearch && matchesMaterial && matchesType && matchesCondition;
  });

  const clearFilters = () => {
    setSearch("");
    setMaterialFilter("All");
    setTypeFilter("All");
    setConditionFilter("All");
  };

  return (
    <div className="min-h-screen bg-[#f7faf7] text-gray-800">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Recycling Marketplace
            </h1>

            <p className="text-gray-500 mt-1.5 text-sm sm:text-base">
              Browse recyclable materials available for sale or donation.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/my-listings"
              className="px-5 py-2.5 border border-emerald-600 text-emerald-700 font-semibold text-sm rounded-xl hover:bg-emerald-50 transition"
            >
              My Listings
            </Link>

            <Link
              to="/marketplace/create"
              className="px-5 py-2.5 bg-emerald-700 text-white font-semibold text-sm rounded-xl hover:bg-emerald-800 shadow-sm hover:shadow transition"
            >
              + Create Listing
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, material or location..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
          <select
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          >
            <option value="All">All Materials</option>
            <option value="Plastic">Plastic</option>
            <option value="Paper">Paper</option>
            <option value="Metal">Metal</option>
            <option value="Glass">Glass</option>
            <option value="Electronic Waste">Electronic Waste</option>
            <option value="Textile">Textile</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          >
            <option value="All">Sale & Donation</option>
            <option value="Sale">Sale</option>
            <option value="Donation">Donation</option>
          </select>

          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          >
            <option value="All">All Conditions</option>
            <option value="Clean">Clean</option>
            <option value="Soiled">Soiled</option>
            <option value="Mixed">Mixed</option>
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2.5 border border-gray-200 text-gray-600 font-medium text-sm rounded-xl hover:bg-gray-50 transition cursor-pointer"
          >
            Clear Filters
          </button>
        </div>

        {/* Result Count */}
        {!loading && !error && listings.length > 0 && (
          <div className="mb-5 text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {filteredListings.length}
            </span>{" "}
            of {listings.length} listings
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-500 font-medium">Loading listings...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {/* No Listings */}
        {!loading && !error && listings.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <h2 className="text-xl font-bold text-gray-800">
              No Listings Available
            </h2>

            <p className="text-gray-500 mt-2 text-sm">
              No recyclable materials have been listed yet.
            </p>
          </div>
        )}

        {/* No Matching Results */}
        {!loading &&
          !error &&
          listings.length > 0 &&
          filteredListings.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <h2 className="text-lg font-bold text-gray-800">
                No Matching Listings
              </h2>

              <p className="text-gray-500 mt-2 text-sm">
                Try changing your search or filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 px-5 py-2.5 bg-emerald-700 text-white font-semibold text-sm rounded-xl hover:bg-emerald-800 shadow-sm transition cursor-pointer"
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
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
              >
                {/* Listing Image */}
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0].url}
                    alt={listing.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    No Image
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Material + Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      {listing.materialType}
                    </span>

                    <span className="text-xs font-medium text-gray-500">
                      {listing.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-bold text-gray-900 mb-2">
                    {listing.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {listing.description || "No description provided."}
                  </p>

                  {/* Listing Information */}
                  <div className="space-y-1.5 text-sm text-gray-700 bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                    <p>
                      <span className="font-semibold">Quantity:</span>{" "}
                      {listing.quantity?.value} {listing.quantity?.unit}
                    </p>

                    <p>
                      <span className="font-semibold">Condition:</span>{" "}
                      {listing.condition}
                    </p>

                    <p>
                      <span className="font-semibold">Type:</span>{" "}
                      {listing.listingType}
                    </p>

                    <p>
                      <span className="font-semibold">Location:</span>{" "}
                      {listing.pickupAddress?.district},{" "}
                      {listing.pickupAddress?.division}
                    </p>

                    <p>
                      <span className="font-semibold">Price:</span>{" "}
                      {listing.listingType === "Donation"
                        ? "Free / Donation"
                        : `৳${listing.askingPrice}`}
                    </p>
                  </div>

                  {/* View Details */}
                  <Link
                    to={`/marketplace/${listing._id}`}
                    className="inline-block mt-5 w-full text-center py-2.5 bg-emerald-700 text-white font-semibold text-sm rounded-xl hover:bg-emerald-800 shadow-sm hover:shadow transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Marketplace;
