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


      const res = await api.get(
        `/transactions/${transactionId}`
      );



      console.log(
        "Transaction Data:",
        res.data.transaction
      );



      setTransaction(
        res.data.transaction
      );



    } catch(error) {


      console.log(
        "Transaction Fetch Error:",
        error
      );



    } finally {


      setLoading(false);


    }


  };









  // Start SSLCommerz Payment

  const handlePayment = async () => {



    if(!method){


      alert(
        "Please select a payment method"
      );


      return;


    }




    try {



      const res = await api.post(

        `/transactions/payment/${transactionId}`,

        {
          paymentMethod: method
        }

      );





      console.log(
        "Payment Response:",
        res.data
      );





      if(res.data.paymentUrl){


        window.location.href =
          res.data.paymentUrl;



      }else{


        alert(
          "Payment gateway URL not received"
        );


      }






    } catch(error) {



      console.log(
        "Payment Initiation Error:",
        error
      );



      alert(
        "Payment initiation failed"
      );



    }



  };









  if(loading){


    return (

      <div className="p-10">

        Loading payment details...

      </div>


    );


  }









  return (



    <div className="min-h-screen bg-gray-50 p-8">





      <div className="max-w-xl mx-auto bg-white shadow rounded-xl p-6">





        <h1 className="text-2xl font-bold mb-6">

          Secure Payment

        </h1>









        <div className="mb-5">





          <p>

            Material:

            <b>

              {" "}

              {transaction?.listing?.materialType}

            </b>

          </p>








          <p>

            Amount:

            <b>

              {" "}

              ৳{transaction?.amount}

            </b>

          </p>








          <p>

            Seller:

            <b>

              {" "}

              {transaction?.seller?.name}

            </b>

          </p>








        </div>









        <h2 className="font-semibold mb-3">

          Select Payment Method

        </h2>









        <div className="space-y-3">





          {[

            "bKash",

            "Nagad",

            "Rocket",

            "Debit/Credit Card"


          ].map((item)=>(




            <label

              key={item}

              className="block border rounded-lg p-3 cursor-pointer"

            >






              <input


                type="radio"


                name="payment"


                value={item}


                checked={method === item}


                onChange={(e)=>setMethod(e.target.value)}


              />








              <span className="ml-3">

                {item}

              </span>







            </label>





          ))}







        </div>












        <button



          onClick={handlePayment}



          className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"



        >



          Pay Now



        </button>







      </div>







    </div>



  );



}



export default Payment;