import express from "express";

import {

    createTransaction,
    getTransaction,
    initiatePayment,
    paymentSuccess,
    paymentFail,
    paymentCancel

} from "../controllers/transactionController.js";


const router = express.Router();



// ======================================
// Create Transaction
// ======================================
router.post(

    "/",

    createTransaction

);



// ======================================
// Get transaction details
// ======================================
router.get(

    "/:id",

    getTransaction

);



// ======================================
// Initiate SSLCommerz payment
// ======================================
router.post(

    "/payment/:id",

    initiatePayment

);



// ======================================
// SSLCommerz success callback
// ======================================
router.post(

    "/payment-success",

    paymentSuccess

);



// ======================================
// SSLCommerz failed callback
// ======================================
router.post(

    "/payment-fail",

    paymentFail

);



// ======================================
// SSLCommerz cancelled callback
// ======================================
router.post(

    "/payment-cancel",

    paymentCancel

);



export default router;