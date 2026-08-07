function MyListings() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold text-gray-800">
          My Listings
        </h1>

        <p className="text-gray-500 mt-2 mb-8">
          Manage all your recyclable listings.
        </p>

        <div className="bg-white rounded-xl shadow p-8 text-center">
          <p className="text-gray-500">
            You haven't created any listings yet.
          </p>
        </div>

      </div>
    </div>
  );
}

export default MyListings;