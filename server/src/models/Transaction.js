import mongoose from "mongoose";


const transactionSchema = new mongoose.Schema(
{
    listing:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Listing",
        required:true
    },


    bid:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Bid",
        required:true
    },


    buyer:{
        // Recycling Company
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },


    seller:{
        // Citizen
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },


    amount:{
        type:Number,
        required:true
    },


    commissionRate:{
        type:Number,
        default:5
    },


    commissionAmount:{
        type:Number,
        default:0
    },


    sellerAmount:{
        type:Number,
        default:0
    },


    paymentMethod:{
        type:String,
        default:null
    },


    paymentStatus:{
        type:String,
        enum:[
            "Pending",
            "Paid",
            "Held",
            "Released",
            "Refunded"
        ],
        default:"Pending"
    },


    collectionStatus:{
        type:String,
        enum:[
            "Waiting",
            "Collected",
            "Confirmed"
        ],
        default:"Waiting"
    },


    buyerConfirmed:{
        type:Boolean,
        default:false
    },


    sellerConfirmed:{
        type:Boolean,
        default:false
    },


    transactionId:{
        type:String,
        default:null
    }


},
{
    timestamps:true
});


export default mongoose.model(
    "Transaction",
    transactionSchema
);