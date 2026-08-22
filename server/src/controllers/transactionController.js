import Transaction from "../models/Transaction.js";

import {
    createSSLCommerzSession
} from "../services/sslcommerzService.js";



// ======================================
// Create Transaction
// ======================================
export const createTransaction = async (req, res) => {

    try {

        const {
            listing,
            bid,
            buyer,
            seller,
            amount
        } = req.body;



        const commissionRate = 5;

        const commissionAmount =
            (amount * commissionRate) / 100;


        const sellerAmount =
            amount - commissionAmount;



        const transaction = await Transaction.create({

            listing,

            bid,

            buyer,

            seller,

            amount,

            commissionRate,

            commissionAmount,

            sellerAmount

        });



        return res.status(201).json({

            success: true,

            message:
                "Transaction created successfully",

            transaction

        });



    } catch (error) {


        return res.status(500).json({

            success: false,

            message:
                "Transaction creation failed",

            error:
                error.message

        });


    }

};




// ======================================
// Get single transaction
// ======================================
export const getTransaction = async (req, res) => {

    try {


        const transaction =
            await Transaction.findById(req.params.id)

            .populate(
                "seller",
                "name email phone"
            )

            .populate(
                "buyer",
                "name email phone"
            )

            .populate(
                "listing",
                "title materialType quantity"
            );



        if (!transaction) {

            return res.status(404).json({

                success: false,

                message: "Transaction not found"

            });

        }



        return res.status(200).json({

            success: true,

            transaction

        });



    } catch (error) {


        return res.status(500).json({

            success: false,

            message:
                "Failed to get transaction",

            error:
                error.message

        });


    }

};







// ======================================
// Initiate SSLCommerz Payment
// ======================================
export const initiatePayment = async (req, res) => {


    try {


        const transaction =

            await Transaction.findById(req.params.id)

            .populate(
                "buyer",
                "name email phone"
            );




        if (!transaction) {


            return res.status(404).json({

                success: false,

                message:
                    "Transaction not found"

            });


        }




        if (!transaction.buyer) {


            return res.status(400).json({

                success: false,

                message:
                    "Buyer information not found"

            });


        }





        const sslResponse =

            await createSSLCommerzSession({

                amount:
                    transaction.amount,


                transactionId:
                    transaction._id.toString(),


                customerName:
                    transaction.buyer.name,


                customerEmail:
                    transaction.buyer.email,


                customerPhone:
                    transaction.buyer.phone || "01700000000"

            });






        console.log(
            "SSLCommerz Response:",
            sslResponse
        );







        if (!sslResponse.GatewayPageURL) {


            return res.status(400).json({

                success:false,

                message:
                    "Failed to create payment session",

                response:
                    sslResponse

            });


        }






        transaction.paymentStatus =
            "Pending";


        transaction.paymentMethod =
            req.body.paymentMethod || null;



        await transaction.save();






        return res.status(200).json({

            success:true,

            paymentUrl:
                sslResponse.GatewayPageURL

        });







    } catch(error) {


        console.log(
            "SSLCommerz Error:",
            error.response?.data || error.message
        );



        return res.status(500).json({

            success:false,

            message:
                "Payment initiation failed",

            error:
                error.response?.data || error.message

        });


    }


};








// ======================================
// SSLCommerz Success Callback
// ======================================
export const paymentSuccess = async (req, res) => {

    try {


        console.log(
            "SSL SUCCESS BODY:",
            req.body
        );


        const tran_id =
            req.body?.tran_id;



        if (!tran_id) {

            return res.status(400).send(
                "Transaction ID missing"
            );

        }



        const transaction =
            await Transaction.findById(tran_id);



        if (!transaction) {

            return res.status(404).send(
                "Transaction not found"
            );

        }



        transaction.paymentStatus = "Held";


        transaction.transactionId = tran_id;



        await transaction.save();



        res.redirect(
            "http://localhost:5173/payment-success"
        );



    } catch(error) {


        console.log(
            "PAYMENT SUCCESS ERROR:",
            error
        );


        res.status(500).send(
            "Payment verification failed"
        );


    }

};
// ======================================
// SSLCommerz Failed Callback
// ======================================
export const paymentFail = async (req, res) => {


    try {


        const transaction =

            await Transaction.findById(
                req.body.tran_id
            );



        if(transaction){


            transaction.paymentStatus =
                "Pending";


            await transaction.save();

        }



        res.send(
            "Payment failed"
        );



    } catch(error){


        res.status(500).send(
            "Payment failed"
        );


    }


};







// ======================================
// SSLCommerz Cancel Callback
// ======================================
export const paymentCancel = async (req, res) => {


    res.send(
        "Payment cancelled"
    );


};