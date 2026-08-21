// import mongoose from "mongoose";


// const redemptionSchema = new mongoose.Schema(

// {

//     user: {

//         type:mongoose.Schema.Types.ObjectId,

//         ref:"User",

//         required:true

//     },


//     reward: {

//         type:mongoose.Schema.Types.ObjectId,

//         ref:"Reward",

//         required:true

//     },


//     pointsUsed: {

//         type:Number,

//         required:true

//     },


//     voucherCode: {

//         type:String

//     },


//     status: {

//         type:String,

//         enum:[

//             "Pending",

//             "Approved",

//             "Completed",

//             "Rejected"

//         ],

//         default:"Pending"

//     }


// },

// {

//     timestamps:true

// }


// );



// export default mongoose.model(
//     "Redemption",
//     redemptionSchema
// );