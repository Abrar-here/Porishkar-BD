import Transaction from "../models/Transaction.js";
import Listing from "../models/Listing.js";

import { createSSLCommerzSession } from "../services/sslcommerzService.js";

// ======================================
// Create Transaction
// ======================================
export const createTransaction = async (req, res) => {
  try {
    const { listing, bid, buyer, seller, amount } = req.body;

    const commissionRate = 5;

    const commissionAmount = (amount * commissionRate) / 100;

    const sellerAmount = amount - commissionAmount;

    const transaction = await Transaction.create({
      listing,

      bid,

      buyer,

      seller,

      amount,

      commissionRate,

      commissionAmount,

      sellerAmount,
    });

    return res.status(201).json({
      success: true,

      message: "Transaction created successfully",

      transaction,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: "Transaction creation failed",

      error: error.message,
    });
  }
};

// ======================================
// Get single transaction
// ======================================
export const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)

      .populate("seller", "name email phone")

      .populate("buyer", "name email phone")

      .populate("listing", "title materialType quantity");

    if (!transaction) {
      return res.status(404).json({
        success: false,

        message: "Transaction not found",
      });
    }

    return res.status(200).json({
      success: true,

      transaction,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: "Failed to get transaction",

      error: error.message,
    });
  }
};

// ======================================
// Initiate SSLCommerz Payment
// ======================================
export const initiatePayment = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)

      .populate("buyer", "name email phone");

    if (!transaction) {
      return res.status(404).json({
        success: false,

        message: "Transaction not found",
      });
    }

    if (!transaction.buyer) {
      return res.status(400).json({
        success: false,

        message: "Buyer information not found",
      });
    }

    const sslResponse = await createSSLCommerzSession({
      amount: transaction.amount,

      transactionId: transaction._id.toString(),

      customerName: transaction.buyer.name,

      customerEmail: transaction.buyer.email,

      customerPhone: transaction.buyer.phone || "01700000000",
    });

    console.log("SSLCommerz Response:", sslResponse);

    if (!sslResponse.GatewayPageURL) {
      return res.status(400).json({
        success: false,

        message: "Failed to create payment session",

        response: sslResponse,
      });
    }

    transaction.paymentStatus = "Pending";

    transaction.paymentMethod = req.body.paymentMethod || null;

    await transaction.save();

    return res.status(200).json({
      success: true,

      paymentUrl: sslResponse.GatewayPageURL,
    });
  } catch (error) {
    console.log("SSLCommerz Error:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,

      message: "Payment initiation failed",

      error: error.response?.data || error.message,
    });
  }
};

// ======================================
// SSLCommerz Success Callback
// ======================================
export const paymentSuccess = async (req, res) => {
  try {
    console.log("SSL SUCCESS BODY:", req.body);

    const tran_id = req.body?.tran_id;

    if (!tran_id) {
      return res.status(400).send("Transaction ID missing");
    }

    const transaction = await Transaction.findById(tran_id);

    if (!transaction) {
      return res.status(404).send("Transaction not found");
    }

    transaction.paymentStatus = "Held";

    transaction.transactionId = tran_id;

    await transaction.save();

    res.redirect("http://localhost:5173/payment-success");
  } catch (error) {
    console.log("PAYMENT SUCCESS ERROR:", error);

    res.status(500).send("Payment verification failed");
  }
};
// ======================================
// SSLCommerz Failed Callback
// ======================================
export const paymentFail = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.body.tran_id);

    if (transaction) {
      transaction.paymentStatus = "Pending";

      await transaction.save();
    }

    res.send("Payment failed");
  } catch (error) {
    res.status(500).send("Payment failed");
  }
};

// ======================================
// SSLCommerz Cancel Callback
// ======================================
export const paymentCancel = async (req, res) => {
  res.send("Payment cancelled");
};

// ======================================
// Get the logged-in recycling company's
// own transactions (as buyer), newest first.
// Powers the "Needs Action" panel and the
// full transaction history on their dashboard.
// ======================================
// @route   GET /api/transactions/my
// @access  Private (recycling_company)
export const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      buyer: req.user._id,
    })
      .populate("seller", "name email phone")
      .populate("listing", "title materialType quantity pickupAddress")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get your transactions",
      error: error.message,
    });
  }
};

// ======================================
// Recycling company confirms they have
// physically collected the materials.
// Per the requirements doc, the held payment
// is only released once BOTH sides confirm —
// this sets the buyer's half of that check.
// ======================================
// @route   PATCH /api/transactions/:id/confirm-collection
// @access  Private (recycling_company)
export const confirmCollection = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Only the buyer on this specific transaction may confirm collection
    if (transaction.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not the buyer on this transaction",
      });
    }

    transaction.buyerConfirmed = true;
    transaction.collectionStatus = "Collected";

    // Both sides confirmed — release the held payment to the seller
    if (transaction.sellerConfirmed) {
      transaction.collectionStatus = "Confirmed";
      transaction.paymentStatus = "Released";
    }

    await transaction.save();

    return res.status(200).json({
      success: true,
      message: "Collection confirmed",
      transaction,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to confirm collection",
      error: error.message,
    });
  }
};

// ======================================
// Citizen (seller) confirms they've received
// payment for a completed transaction. This is
// the seller's half of the two-sided confirmation
// described above — kept here since it shares the
// exact same release logic as confirmCollection.
// ======================================
// @route   PATCH /api/transactions/:id/confirm-receipt
// @access  Private (citizen)
export const confirmReceipt = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (transaction.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not the seller on this transaction",
      });
    }

    transaction.sellerConfirmed = true;

    if (transaction.buyerConfirmed) {
      transaction.collectionStatus = "Confirmed";
      transaction.paymentStatus = "Released";
    }

    await transaction.save();

    return res.status(200).json({
      success: true,
      message: "Receipt confirmed",
      transaction,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to confirm receipt",
      error: error.message,
    });
  }
};

// ======================================
// Recycling intake statistics for the logged-in
// company — total completed transactions, total
// spent, and a breakdown by material type. This is
// the "recycling intake statistics" the requirements
// doc promises on the company's dashboard.
// ======================================
// @route   GET /api/transactions/my-stats
// @access  Private (recycling_company)
export const getMyIntakeStats = async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      {
        $match: {
          buyer: req.user._id,
          collectionStatus: "Confirmed",
        },
      },
      {
        $lookup: {
          from: "listings",
          localField: "listing",
          foreignField: "_id",
          as: "listingInfo",
        },
      },
      { $unwind: "$listingInfo" },
      {
        // Group by material + unit together — summing "5 kg" and
        // "3 ton" as one number would be meaningless, so each
        // material/unit combination gets its own running total.
        $group: {
          _id: {
            materialType: "$listingInfo.materialType",
            unit: "$listingInfo.quantity.unit",
          },
          totalQuantity: { $sum: "$listingInfo.quantity.value" },
          transactionCount: { $sum: 1 },
          totalSpent: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          materialType: "$_id.materialType",
          unit: "$_id.unit",
          totalQuantity: 1,
          transactionCount: 1,
          totalSpent: 1,
        },
      },
      { $sort: { totalSpent: -1 } },
    ]);

    const totals = stats.reduce(
      (acc, row) => {
        acc.totalTransactions += row.transactionCount;
        acc.totalSpent += row.totalSpent;
        return acc;
      },
      { totalTransactions: 0, totalSpent: 0 },
    );

    return res.status(200).json({
      success: true,
      byMaterial: stats,
      totals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get intake statistics",
      error: error.message,
    });
  }
};
