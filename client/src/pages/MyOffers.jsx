import { useEffect, useState } from "react";
import { getMyBids } from "../api/bids";

function MyOffers() {

  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {

    const fetchBids = async () => {

      try {

        const res = await getMyBids();
        console.log("MY OFFERS RESPONSE:", res);
        setBids(res.bids);


      } catch(err){

        setError(
          err.response?.data?.message ||
          "Failed to load offers"
        );

      }
      finally{

        setLoading(false);

      }

    };


    fetchBids();

  }, []);



  if(loading){

    return(
      <div className="min-h-screen flex items-center justify-center">
        Loading offers...
      </div>
    );

  }



  return (

    <div className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="max-w-5xl mx-auto">


        <h1 className="text-3xl font-bold text-gray-800">
          My Offers
        </h1>



        {error && (

          <div className="mt-5 bg-red-50 text-red-600 p-4 rounded">

            {error}

          </div>

        )}



        {
          bids.length === 0 ? (

            <div className="bg-white mt-6 p-8 rounded-xl shadow text-center">

              No offers submitted yet.

            </div>

          ) : (


            <div className="mt-6 space-y-5">


              {
                bids.map((bid)=>(

                  <div
                    key={bid._id}
                    className="bg-white rounded-xl shadow p-6"
                  >


                    <h2 className="text-xl font-bold">

                      {bid.listing?.title || "Listing removed"}

                    </h2>


                    {
                      bid.listing && (

                        <p className="text-gray-500">

                          Material:
                          {" "}
                          {bid.listing.materialType}

                        </p>

                      )
                    }



                    <p className="mt-3">

                      <b>Your Offer:</b> ৳{bid.amount}

                    </p>



                    <p>

                      <b>Your Message:</b> {bid.message}

                    </p>




                    <p className="mt-3">

                      <b>Status:</b>


                      <span
                        className={
                          bid.status === "Accepted"
                          ? "text-green-600 font-bold ml-2"
                          :
                          bid.status === "Rejected"
                          ? "text-red-600 font-bold ml-2"
                          :
                          "text-yellow-600 font-bold ml-2"
                        }
                      >

                        {bid.status}

                      </span>


                    </p>




                    {
                      bid.status === "Accepted" && (

                        <p className="mt-3 text-green-700 font-semibold">

                          🎉 Seller accepted your offer!

                        </p>

                      )
                    }



                    {
                      bid.status === "Pending" && (

                        <p className="mt-3 text-yellow-700">

                          Waiting for seller response.

                        </p>

                      )
                    }



                    {
                      bid.status === "Rejected" && (

                        <p className="mt-3 text-red-700">

                          Seller rejected your offer.

                        </p>

                      )
                    }


                  </div>

                ))
              }


            </div>


          )
        }


      </div>

    </div>

  );

}


export default MyOffers;