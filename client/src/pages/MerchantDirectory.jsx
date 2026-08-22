import { useEffect, useState } from "react";
import axios from "axios";


function MerchantDirectory() {


    const [merchants, setMerchants] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");



    useEffect(() => {

        fetchMerchants();

    }, []);




    const fetchMerchants = async () => {


        try {


            const token = localStorage.getItem("token");


            const response = await axios.get(

                "http://localhost:5000/api/merchants",

                {
                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );


            setMerchants(
                response.data.merchants
            );



        } catch (err) {


            setError(

                err.response?.data?.message ||
                "Failed to load merchants"

            );


        } finally {


            setLoading(false);


        }


    };





    if (loading) {


        return (

            <div className="min-h-screen flex items-center justify-center">

                Loading merchants...

            </div>

        );


    }





    return (


        <div className="min-h-screen bg-gray-50 px-6 py-10">


            <div className="max-w-6xl mx-auto">


                <h1 className="text-3xl font-bold text-green-600">

                    Partner Merchant Directory

                </h1>



                <p className="mt-2 text-gray-600">

                    Explore our registered eco-friendly partner merchants.

                </p>





                {
                    error && (

                        <div className="mt-5 bg-red-50 text-red-600 p-4 rounded-lg">

                            {error}

                        </div>

                    )
                }







                <div className="grid md:grid-cols-3 gap-6 mt-8">



                    {
                        merchants.map((merchant)=>(


                            <div

                                key={merchant._id}

                                className="bg-white rounded-xl shadow p-6"

                            >



                                <h2 className="text-xl font-bold text-gray-800">

                                    {merchant.name}

                                </h2>




                                <p className="mt-3 text-gray-600">

                                    Category:

                                    {" "}

                                    {merchant.category}

                                </p>





                                <p className="mt-2 text-gray-600">

                                    Location:

                                    {" "}

                                    {merchant.location}

                                </p>





                                {
                                    merchant.description && (

                                        <p className="mt-3 text-sm text-gray-500">

                                            {merchant.description}

                                        </p>

                                    )
                                }





                                <div className="mt-4 bg-green-50 p-3 rounded-lg">


                                    <p className="text-green-700 font-semibold">

                                        Voucher Available

                                    </p>


                                    <p className="text-sm text-gray-600">

                                        Stock:

                                        {" "}

                                        {merchant.voucherStock}

                                    </p>



                                    <p className="text-sm text-gray-600">

                                        Value:

                                        {" "}

                                        {merchant.voucherValue}

                                    </p>


                                </div>



                            </div>


                        ))
                    }



                </div>




                {
                    merchants.length === 0 && (

                        <div className="mt-8 bg-white p-8 rounded-xl shadow text-center">

                            <p className="text-gray-500">

                                No partner merchants available.

                            </p>

                        </div>

                    )
                }




            </div>


        </div>


    );

}



export default MerchantDirectory;