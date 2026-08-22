import Bid from "../models/Bid.js";
import Listing from "../models/Listing.js";
import Transaction from "../models/Transaction.js";


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



    if (!listingId || !amount) {

      return res.status(400).json({

        success: false,

        message: "Listing ID and amount are required",

      });

    }



    const listing = await Listing.findById(listingId);



    if (!listing) {

      return res.status(404).json({

        success:false,

        message:"Listing not found",

      });

    }



    if (listing.status !== "Active") {

      return res.status(400).json({

        success:false,

        message:"This listing is not available for bidding",

      });

    }



    if (
      listing.seller.toString() === req.user._id.toString()
    ) {

      return res.status(400).json({

        success:false,

        message:"You cannot bid on your own listing",

      });

    }



    const bid = await Bid.create({

      listing:listingId,

      bidder:req.user._id,

      amount:Number(amount),

      message,

    });



    return res.status(201).json({

      success:true,

      message:"Bid submitted successfully",

      bid,

    });



  } catch(error) {


    return res.status(500).json({

      success:false,

      message:"Failed to create bid",

      error:error.message,

    });


  }

};









// ======================================
// Get all bids for a listing (Seller)
// ======================================
export const getListingBids = async (req,res)=>{


  try {


    const { listingId } = req.params;



    const listing = await Listing.findById(listingId);



    if(!listing){

      return res.status(404).json({

        success:false,

        message:"Listing not found",

      });

    }




    if(
      listing.seller.toString() !== req.user._id.toString()
    ){

      return res.status(403).json({

        success:false,

        message:"You are not allowed to view these bids",

      });

    }




    const bids = await Bid.find({

      listing:listingId,

    })

    .populate(
      "bidder",
      "name email"
    )

    .sort({
      createdAt:-1
    });





    return res.status(200).json({

      success:true,

      count:bids.length,

      bids,

    });




  } catch(error){


    return res.status(500).json({

      success:false,

      message:"Failed to get bids",

      error:error.message,

    });


  }

};









// ======================================
// Get bids placed by logged-in buyer
// ======================================
export const getMyBids = async (req,res)=>{


  try {


    const bids = await Bid.find({

      bidder:req.user._id,

    })

    .populate(

      "listing",

      "title materialType askingPrice status"

    )

    .sort({

      createdAt:-1

    });






    const bidsWithTransaction = await Promise.all(


      bids.map(async (bid)=>{


        const transaction = await Transaction.findOne({

          bid:bid._id,

        });




        return {

          ...bid.toObject(),

          transaction:transaction || null,

        };


      })


    );






    return res.status(200).json({

      success:true,

      count:bidsWithTransaction.length,

      bids:bidsWithTransaction,

    });






  } catch(error){


    return res.status(500).json({

      success:false,

      message:"Failed to get your bids",

      error:error.message,

    });


  }

};









// ======================================
// Accept a bid (Seller)
// ======================================
export const acceptBid = async(req,res)=>{


  try {


    const bid = await Bid.findById(req.params.id);



    if(!bid){

      return res.status(404).json({

        success:false,

        message:"Bid not found",

      });

    }





    const listing = await Listing.findById(
      bid.listing
    );




    if(!listing){

      return res.status(404).json({

        success:false,

        message:"Listing not found",

      });

    }





    if(
      listing.seller.toString() !== req.user._id.toString()
    ){

      return res.status(403).json({

        success:false,

        message:"You are not allowed to accept this bid",

      });

    }





    bid.status="Accepted";

    await bid.save();







    await Bid.updateMany(

      {

        listing:listing._id,

        _id:{
          $ne:bid._id
        }

      },

      {

        status:"Rejected"

      }

    );








    listing.status="Sold";

    await listing.save();









    const transaction = await Transaction.create({

      listing:listing._id,

      bid:bid._id,

      seller:listing.seller,

      buyer:bid.bidder,

      amount:bid.amount,

    });









    return res.status(200).json({

      success:true,

      message:"Bid accepted and transaction created successfully",

      bid,

      transaction,

    });






  } catch(error){


    return res.status(500).json({

      success:false,

      message:"Failed to accept bid",

      error:error.message,

    });


  }

};









// ======================================
// Reject a bid (Seller)
// ======================================
export const rejectBid = async(req,res)=>{


  try {


    const bid = await Bid.findById(req.params.id);



    if(!bid){

      return res.status(404).json({

        success:false,

        message:"Bid not found",

      });

    }





    const listing = await Listing.findById(
      bid.listing
    );





    if(!listing){

      return res.status(404).json({

        success:false,

        message:"Listing not found",

      });

    }





    if(
      listing.seller.toString() !== req.user._id.toString()
    ){

      return res.status(403).json({

        success:false,

        message:"You are not allowed to reject this bid",

      });

    }





    bid.status="Rejected";

    await bid.save();






    return res.status(200).json({

      success:true,

      message:"Bid rejected successfully",

      bid,

    });





  } catch(error){


    return res.status(500).json({

      success:false,

      message:"Failed to reject bid",

      error:error.message,

    });


  }

};