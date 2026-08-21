// import mongoose from "mongoose";


// const rewardSchema = new mongoose.Schema(

// {

//     title: {

//         type: String,

//         required: true

//     },


//     type: {

//         type: String,

//         enum:[

//             "Mobile Recharge",

//             "Voucher",

//             "Pickup Discount"

//         ],

//         required:true

//     },


//     pointsRequired: {

//         type:Number,

//         required:true

//     },


//     value: {

//         type:String,

//         required:true

//     },


//     merchant: {

//         type: mongoose.Schema.Types.ObjectId,

//         ref:"Merchant"

//     },


//     stock: {

//         type:Number,

//         default:0

//     },


//     expiryDate: {

//         type:Date

//     },


//     status: {

//         type:String,

//         enum:[

//             "Active",

//             "Inactive"

//         ],

//         default:"Active"

//     }


// },

// {

//     timestamps:true

// }


// );



// export default mongoose.model(
//     "Reward",
//     rewardSchema
// );