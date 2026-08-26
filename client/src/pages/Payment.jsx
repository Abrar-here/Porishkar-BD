import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function Payment() {
  const { transactionId } = useParams();

  const [transaction, setTransaction] = useState(null);

  const [method, setMethod] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransaction();
  }, []);

  const fetchTransaction = async () => {
    try {
      const res = await api.get(`/transactions/${transactionId}`);

      console.log("Transaction Data:", res.data.transaction);

      setTransaction(res.data.transaction);
    } catch (error) {
      console.log("Transaction Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Start SSLCommerz Payment

  const handlePayment = async () => {
    if (!method) {
      alert("Please select a payment method");

      return;
    }

    try {
      const res = await api.post(
        `/transactions/payment/${transactionId}`,

        {
          paymentMethod: method,
        },
      );

      console.log("Payment Response:", res.data);

      if (res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        alert("Payment gateway URL not received");
      }
    } catch (error) {
      console.log("Payment Initiation Error:", error);

      alert("Payment initiation failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7faf7] flex items-center justify-center">
        <p className="text-gray-500 font-medium">Loading payment details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faf7] text-gray-800">
      <main className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">
            Secure Payment
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Complete your transaction to confirm this purchase.
          </p>

          {/* Transaction summary */}
          <div className="mb-6 space-y-1.5 text-sm text-gray-700 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p>
              <span className="font-semibold">Material:</span>{" "}
              {transaction?.listing?.materialType}
            </p>

            <p>
              <span className="font-semibold">Amount:</span>{" "}
              <span className="text-emerald-700 font-bold">
                ৳{transaction?.amount}
              </span>
            </p>

            <p>
              <span className="font-semibold">Seller:</span>{" "}
              {transaction?.seller?.name}
            </p>
          </div>

          <h2 className="text-xs font-semibold text-gray-600 mb-2.5">
            Select Payment Method
          </h2>

          <div className="space-y-2.5">
            {["bKash", "Nagad", "Rocket", "Debit/Credit Card"].map((item) => (
              <label
                key={item}
                className={`flex items-center gap-3 border rounded-xl p-3.5 cursor-pointer transition ${
                  method === item
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={item}
                  checked={method === item}
                  onChange={(e) => setMethod(e.target.value)}
                  className="accent-emerald-600 w-4 h-4"
                />

                <span className="text-sm font-medium text-gray-800">
                  {item}
                </span>
              </label>
            ))}
          </div>

          <button
            onClick={handlePayment}
            className="mt-6 w-full bg-emerald-700 text-white font-semibold text-sm py-3 rounded-xl hover:bg-emerald-800 shadow-sm hover:shadow transition cursor-pointer"
          >
            Pay Now
          </button>
        </div>
      </main>
    </div>
  );
}

export default Payment;
