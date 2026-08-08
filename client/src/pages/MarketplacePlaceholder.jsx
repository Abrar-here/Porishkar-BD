import { useNavigate } from "react-router-dom";

function MarketplacePlaceholder() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 text-center">
      <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm">
        <p className="text-4xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Marketplace</h2>
        <p className="text-gray-500 mb-6">
          The Recyclable Material Listing & Discovery Portal is being built by
          your teammate. This placeholder will be replaced with the full feature
          shortly.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
        >
          Back to dashboard
        </button>
      </div>
    </div>
  );
}

export default MarketplacePlaceholder;
