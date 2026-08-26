import express from "express";

import {
  createTransaction,
  getTransaction,
  initiatePayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  getMyTransactions,
  confirmCollection,
  confirmReceipt,
  getMyIntakeStats,
} from "../controllers/transactionController.js";

import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ======================================
// Recycling company's own transactions
// ======================================
router.get("/my", protect, authorize("recycling_company"), getMyTransactions);

// ======================================
// Recycling company's intake statistics
// ======================================
router.get(
  "/my-stats",
  protect,
  authorize("recycling_company"),
  getMyIntakeStats,
);

// ======================================
// Buyer confirms physical collection
// Any authenticated buyer can confirm — the
// controller itself checks that req.user is
// the actual buyer on this transaction, so
// no role restriction is needed here.
// ======================================
router.patch("/:id/confirm-collection", protect, confirmCollection);

// ======================================
// Seller confirms receipt of payment
// Any authenticated seller can confirm — the
// controller itself checks that req.user is
// the actual seller on this transaction, so
// no role restriction is needed here.
// ======================================
router.patch("/:id/confirm-receipt", protect, confirmReceipt);

// ======================================
// Create Transaction
// ======================================
router.post(
  "/",

  createTransaction,
);

// ======================================
// Get transaction details
// ======================================
router.get(
  "/:id",

  getTransaction,
);

// ======================================
// Initiate SSLCommerz payment
// ======================================
router.post(
  "/payment/:id",

  initiatePayment,
);

// ======================================
// SSLCommerz success callback
// ======================================
router.post(
  "/payment-success",

  paymentSuccess,
);

// ======================================
// SSLCommerz failed callback
// ======================================
router.post(
  "/payment-fail",

  paymentFail,
);

// ======================================
// SSLCommerz cancelled callback
// ======================================
router.post(
  "/payment-cancel",

  paymentCancel,
);

export default router;
