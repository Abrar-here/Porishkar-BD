// import mongoose from "mongoose";


// const merchantSchema = new mongoose.Schema(

//     {

//         name: {

//             type: String,

//             required: true,

//             trim: true

//         },


//         category: {

//             type: String,

//             required: true

//         },


//         description: {

//             type: String

//         },


//         location: {

//             type: String,

//             required: true

//         },


//         contact: {

//             type: String

//         },


//         voucherStock: {

//             type: Number,

//             default: 0

//         },


//         status: {

//             type: String,

//             enum: [

//                 "Active",

//                 "Inactive"

//             ],

//             default: "Active"

//         }


//     },

//     {

//         timestamps: true

//     }

// );



// export default mongoose.model(
//     "Merchant",
//     merchantSchema
// );