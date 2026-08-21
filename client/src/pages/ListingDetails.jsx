import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { createBid } from "../api/bids";

function ListingDetails() {
  const { id } = useParams();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Bid states
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [bidLoading, setBidLoading] = useState(false);
  const [bidSuccess, setBidSuccess] = useState("");
  const [bidError, setBidError] = useState("");



  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get(`/listings/${id}`);

        setListing(res.data.listing);

      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load listing"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchListing();

  }, [id]);



  // Submit Bid
  const handleBidSubmit = async (e) => {
    e.preventDefault();

    try {

      setBidLoading(true);
      setBidError("");
      setBidSuccess("");

      await createBid({
        listingId: listing._id,
        amount: Number(bidAmount),
        message: bidMessage,
      });


      setBidSuccess(
        "Bid submitted successfully!"
      );

      setBidAmount("");
      setBidMessage("");


    } catch (err) {

      setBidError(
        err.response?.data?.message ||
        "Failed to submit bid"
      );

    } finally {

      setBidLoading(false);

    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">
          Loading listing...
        </p>
      </div>
    );
  }



  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-10">

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-8">

          <p className="text-red-600">
            {error}
          </p>


          <Link
            to="/marketplace"
            className="inline-block mt-4 text-green-600 hover:underline"
          >
            Back to Marketplace
          </Link>

        </div>

      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-8">


        <Link
          to="/marketplace"
          className="text-green-600 hover:underline"
        >
          ← Back to Marketplace
        </Link>



        {/* Images */}

        <div className="mt-6">

          {listing.images && listing.images.length > 0 ? (

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {listing.images.map((image, index) => (

                <img
                  key={image.publicId || index}
                  src={image.url}
                  alt={`${listing.title} ${index + 1}`}
                  className="w-full h-72 object-cover rounded-xl border"
                />

              ))}

            </div>

          ) : (

            <div className="w-full h-72 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">

              No Images Available

            </div>

          )}

        </div>




        <div className="mt-8">


          {/* Material + Status */}

          <div className="flex items-center justify-between">

            <span className="text-green-600 font-semibold">

              {listing.materialType}

            </span>


            <span className="text-gray-500">

              {listing.status}

            </span>

          </div>




          <h1 className="text-3xl font-bold text-gray-800 mt-3">

            {listing.title}

          </h1>




          <p className="text-gray-500 mt-3">

            {listing.description || "No description provided."}

          </p>





          {/* Information */}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">


            <div>
              <span className="font-semibold text-gray-700">
                Quantity:
              </span>{" "}
              {listing.quantity?.value} {listing.quantity?.unit}
            </div>


            <div>
              <span className="font-semibold text-gray-700">
                Condition:
              </span>{" "}
              {listing.condition}
            </div>


            <div>
              <span className="font-semibold text-gray-700">
                Listing Type:
              </span>{" "}
              {listing.listingType}
            </div>


            <div>
              <span className="font-semibold text-gray-700">
                Price:
              </span>{" "}
              {listing.listingType === "Donation"
                ? "Free / Donation"
                : `৳${listing.askingPrice}`}
            </div>


            <div>
              <span className="font-semibold text-gray-700">
                Pickup Address:
              </span>{" "}
              {listing.pickupAddress?.fullAddress}
            </div>


            <div>
              <span className="font-semibold text-gray-700">
                District:
              </span>{" "}
              {listing.pickupAddress?.district}
            </div>


            <div>
              <span className="font-semibold text-gray-700">
                Division:
              </span>{" "}
              {listing.pickupAddress?.division}
            </div>


            <div>
              <span className="font-semibold text-gray-700">
                Seller:
              </span>{" "}
              {listing.seller?.name || "Unknown"}
            </div>


            <div>
              <span className="font-semibold text-gray-700">
                Posted:
              </span>{" "}
              {new Date(listing.createdAt).toLocaleString()}
            </div>


          </div>





          {/* ================= BID SECTION ================= */}

          {
            listing.status === "Active" &&
            listing.listingType === "Sale" && (

              <div className="mt-10 border-t pt-8">


                <h2 className="text-2xl font-bold text-gray-800">

                  Make an Offer

                </h2>



                <form
                  onSubmit={handleBidSubmit}
                  className="mt-5 space-y-4"
                >


                  <input
                    type="number"
                    required
                    placeholder="Enter your offer amount"
                    value={bidAmount}
                    onChange={(e)=>setBidAmount(e.target.value)}
                    className="w-full border rounded-lg p-3"
                  />



                  <textarea

                    required

                    placeholder="Message to seller"

                    value={bidMessage}

                    onChange={(e)=>setBidMessage(e.target.value)}

                    className="w-full border rounded-lg p-3"

                  />



                  <button

                    type="submit"

                    disabled={bidLoading}

                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"

                  >

                    {
                      bidLoading
                      ? "Submitting..."
                      : "Submit Bid"
                    }


                  </button>


                </form>




                {
                  bidSuccess && (

                    <p className="text-green-600 mt-4">

                      {bidSuccess}

                    </p>

                  )
                }



                {
                  bidError && (

                    <p className="text-red-600 mt-4">

                      {bidError}

                    </p>

                  )
                }



              </div>

            )
          }



        </div>


      </div>


    </div>
  );
}


export default ListingDetails;