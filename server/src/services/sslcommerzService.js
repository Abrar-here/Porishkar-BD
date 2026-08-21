import axios from "axios";
import qs from "qs";



export const createSSLCommerzSession = async ({
    amount,
    transactionId,
    customerName,
    customerEmail,
    customerPhone
}) => {


    const data = {


        store_id: process.env.SSLC_STORE_ID,


        store_passwd: process.env.SSLC_STORE_PASSWORD,


        total_amount: amount,


        currency: "BDT",


        tran_id: transactionId,



        success_url:
            `${process.env.SERVER_URL}/api/transactions/payment-success`,



        fail_url:
            `${process.env.SERVER_URL}/api/transactions/payment-fail`,



        cancel_url:
            `${process.env.SERVER_URL}/api/transactions/payment-cancel`,



        cus_name: customerName,


        cus_email: customerEmail,


        cus_phone: customerPhone,



        shipping_method: "NO",


        product_name: "Recyclable Material",


        product_category: "Recycling",


        product_profile: "general"

    };





    const url =

        process.env.SSLC_IS_LIVE === "true"

        ?

        "https://securepay.sslcommerz.com/gwprocess/v4/api.php"

        :

        "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";







    const response = await axios.post(

        url,

        qs.stringify(data),

        {

            headers: {

                "Content-Type":
                "application/x-www-form-urlencoded"

            }

        }

    );




    return response.data;

};