import { useEffect, useState } from "react";
import axios from "axios";


function RewardCentre(){

  const [rewards,setRewards] = useState([]);

  const [message,setMessage] = useState("");

  const [voucher,setVoucher] = useState("");

  const [loading,setLoading] = useState(false);



  useEffect(()=>{

    fetchRewards();

  },[]);





  const fetchRewards = async()=>{

    try{

      const token = localStorage.getItem("token");


      const res = await axios.get(

        "http://localhost:5000/api/rewards",

        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }

      );


      setRewards(res.data.rewards);



    }catch(error){

      console.log(error);

    }

  };







  const redeemReward = async(rewardId)=>{


    try{


      setLoading(true);

      setMessage("");

      setVoucher("");



      const token = localStorage.getItem("token");



      const res = await axios.post(

        "http://localhost:5000/api/redemptions/redeem",

        {
          rewardId
        },

        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }

      );



      setMessage(
        res.data.message
      );



      setVoucher(
        res.data.redemption.voucherCode
      );



      // refresh reward stock

      fetchRewards();



    }catch(error){


      setMessage(

        error.response?.data?.message ||
        "Redemption failed"

      );


    }finally{


      setLoading(false);


    }


  };







  return(

    <div className="max-w-6xl mx-auto p-6">


      <h1 className="text-3xl font-bold text-green-600 mb-6">

        Reward Centre

      </h1>





      {
        message && (

          <div className="mb-5 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">

            {message}


            {
              voucher && (

                <p className="mt-2 font-bold">

                  Voucher Code: {voucher}

                </p>

              )
            }


          </div>

        )
      }







      <div className="grid md:grid-cols-3 gap-5">



        {
          rewards.map((reward)=>(


            <div

              key={reward._id}

              className="border rounded-xl p-5 shadow-sm bg-white"

            >



              <h2 className="text-xl font-semibold">

                {reward.title}

              </h2>




              <p className="text-gray-600 mt-2">

                Type: {reward.type}

              </p>





              <p className="text-green-600 font-bold mt-2">

                {reward.pointsRequired} Points

              </p>





              <p>

                Value: {reward.value}

              </p>





              {
                reward.merchant && (

                  <p className="mt-2 text-gray-600">

                    Merchant: {reward.merchant.name}

                  </p>

                )
              }






              <p className="mt-2">

                Stock: {reward.stock}

              </p>






              <button

                onClick={()=>redeemReward(reward._id)}

                disabled={loading}

                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"

              >

                {
                  loading
                  ? "Processing..."
                  : "Redeem"
                }

              </button>




            </div>


          ))
        }



      </div>


    </div>

  );

}


export default RewardCentre;