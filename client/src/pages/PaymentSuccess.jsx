function PaymentSuccess() {

  return (

    <div className="min-h-screen flex items-center justify-center bg-green-50">

      <div className="bg-white p-10 rounded-xl shadow">

        <h1 className="text-3xl font-bold text-green-600">
          Payment Successful
        </h1>


        <p className="mt-4 text-gray-600">
          Your payment is secured.
          Waiting for material confirmation.
        </p>


      </div>

    </div>

  );

}


export default PaymentSuccess;