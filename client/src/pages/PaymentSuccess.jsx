import { useNavigate } from "react-router-dom";

function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center border border-green-100">
        {/* Animated success icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-75" />
            <div className="relative bg-green-100 rounded-full p-4">
              <svg
                className="w-14 h-14 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75l2.25 2.25 6-6m-9 12.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-green-600">
          Payment Successful
        </h1>

        <p className="mt-4 text-gray-600">
          Your payment is secured. Waiting for material confirmation.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => navigate("/orders")}
            className="w-full py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
          >
            View Order
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 rounded-lg border border-gray-200 text-gray-600 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
