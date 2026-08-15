import Bid from "../models/Bid.js";
import Listing from "../models/Listing.js";


// ======================================
// Create a new bid (Buyer)
// ======================================
export const createBid = async (req, res) => {
  try {
    const {
      listingId,
      amount,
      message,
    } = req.body;


    // Required fields validation
    if (!listingId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Listing ID and amount are required",
      });
    }


    // Find listing
    const listing = await Listing.findById(listingId);


    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }


    // Check listing status
    if (listing.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "This listing is not available for bidding",
      });
    }


    // Seller cannot bid on own listing
    if (
      listing.seller.toString() === req.user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot bid on your own listing",
      });
    }


    // Create bid
    const bid = await Bid.create({
      listing: listingId,
      bidder: req.user._id,
      amount: Number(amount),
      message,
    });


    return res.status(201).json({
      success: true,
      message: "Bid submitted successfully",
      bid,
    });


  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Failed to create bid",
      error: error.message,
    });

  }
};




// ======================================
// Get all bids for a listing (Seller)
// ======================================
export const getListingBids = async (req, res) => {
  try {

    const { listingId } = req.params;


    const listing = await Listing.findById(listingId);


    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }


    // Only owner can see bids
    if (
      listing.seller.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view these bids",
      });
    }


    const bids = await Bid.find({
      listing: listingId,
    })
      .populate("bidder", "name email")
      .sort({ createdAt: -1 });


    return res.status(200).json({
      success: true,
      count: bids.length,
      bids,
    });


  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Failed to get bids",
      error: error.message,
    });

  }
};




// ======================================
// Get bids placed by logged-in buyer
// ======================================
export const getMyBids = async (req, res) => {
  try {

    const bids = await Bid.find({
      bidder: req.user._id,
    })
      .populate(
        "listing",
        "title materialType askingPrice status"
      )
      .sort({ createdAt: -1 });



    return res.status(200).json({

      success: true,

      count: bids.length,

      bids,

    });


  } catch (error) {

    return res.status(500).json({

      success: false,

      message: "Failed to get your bids",

      error: error.message,

    });

  }
};




// ======================================
// Accept a bid (Seller)
// ======================================
export const acceptBid = async (req, res) => {
  try {

    const bid = await Bid.findById(req.params.id);


    if (!bid) {
      return res.status(404).json({
        success: false,
        message: "Bid not found",
      });
    }


    const listing = await Listing.findById(
      bid.listing
    );


    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }


    // Only seller can accept
    if (
      listing.seller.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to accept this bid",
      });
    }


    // Accept selected bid
    bid.status = "Accepted";
    await bid.save();



    // Reject other bids
    await Bid.updateMany(
      {
        listing: listing._id,
        _id: { $ne: bid._id },
      },
      {
        status: "Rejected",
      }
    );



    // Update listing status
    listing.status = "Sold";
    await listing.save();



    return res.status(200).json({
      success: true,
      message: "Bid accepted successfully",
      bid,
    });


  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Failed to accept bid",
      error: error.message,
    });

  }
};




// ======================================
// Reject a bid (Seller)
// ======================================
export const rejectBid = async (req, res) => {
  try {

    const bid = await Bid.findById(req.params.id);


    if (!bid) {
      return res.status(404).json({
        success: false,
        message: "Bid not found",
      });
    }


    const listing = await Listing.findById(
      bid.listing
    );


    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }


    // Only seller can reject
    if (
      listing.seller.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to reject this bid",
      });
    }


    bid.status = "Rejected";
    await bid.save();


    return res.status(200).json({
      success: true,
      message: "Bid rejected successfully",
      bid,
    });


  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Failed to reject bid",
      error: error.message,
    });

  }
};