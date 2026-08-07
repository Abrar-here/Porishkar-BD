function Marketplace() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Recycling Marketplace
            </h1>

            <p className="text-gray-500 mt-2">
              Browse recyclable materials available for sale or donation.
            </p>
          </div>

          <button className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            + Create Listing
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search recyclable materials..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Temporary Empty State */}
        <div className="bg-white rounded-xl shadow p-10 text-center">
          <h2 className="text-2xl font-semibold text-gray-700">
            Marketplace Page
          </h2>

          <p className="text-gray-500 mt-3">
            No listings available yet.
          </p>
        </div>

      </div>
    </div>
  );
}

export default Marketplace;