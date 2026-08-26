import { useEffect, useState } from "react";
import api from "../api/axios";

function MerchantDirectory() {
  const [merchants, setMerchants] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      const response = await api.get("/merchants");

      setMerchants(response.data.merchants);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load merchants");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7faf7] flex items-center justify-center">
        <p className="text-gray-500 font-medium">Loading merchants...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faf7] text-gray-800">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Partner Merchant Directory
        </h1>

        <p className="mt-1.5 text-gray-500 text-sm sm:text-base">
          Explore our registered eco-friendly partner merchants.
        </p>

        {error && (
          <div className="mt-5 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          {merchants.map((merchant) => (
            <div
              key={merchant._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <h2 className="text-lg font-bold text-gray-900">
                {merchant.name}
              </h2>

              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-semibold text-gray-700">Category:</span>{" "}
                  {merchant.category}
                </p>

                <p>
                  <span className="font-semibold text-gray-700">Location:</span>{" "}
                  {merchant.location}
                </p>
              </div>

              {merchant.description && (
                <p className="mt-3 text-sm text-gray-500">
                  {merchant.description}
                </p>
              )}

              <div className="mt-4 bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl">
                <p className="text-emerald-700 font-semibold text-sm">
                  Voucher Available
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold">Stock:</span>{" "}
                  {merchant.voucherStock}
                </p>

                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Value:</span>{" "}
                  {merchant.voucherValue}
                </p>
              </div>
            </div>
          ))}
        </div>

        {merchants.length === 0 && (
          <div className="mt-8 bg-white p-12 rounded-2xl border border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              No partner merchants available.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default MerchantDirectory;
