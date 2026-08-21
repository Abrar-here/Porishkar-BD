// import Merchant from "../models/Merchant.js";



// // ================================
// // Admin Create Merchant
// // ================================

// export const createMerchant = async(req,res)=>{

//     try{


//         const merchant = await Merchant.create(req.body);



//         res.status(201).json({

//             success:true,

//             message:"Merchant created successfully",

//             merchant

//         });



//     }catch(error){


//         res.status(500).json({

//             success:false,

//             message:"Failed to create merchant",

//             error:error.message

//         });


//     }

// };





// // ================================
// // Get Active Merchants
// // Citizen + Admin
// // ================================

// export const getMerchants = async(req,res)=>{

//     try{


//         const merchants = await Merchant.find({

//             status:"Active"

//         })

//         .sort({

//             createdAt:-1

//         });



//         res.status(200).json({

//             success:true,

//             count:merchants.length,

//             merchants

//         });



//     }catch(error){


//         res.status(500).json({

//             success:false,

//             message:"Failed to get merchants",

//             error:error.message

//         });


//     }

// };






// // ================================
// // Admin Get All Merchants
// // ================================

// export const getAllMerchants = async(req,res)=>{

//     try{


//         const merchants =
//             await Merchant.find()
//             .sort({

//                 createdAt:-1

//             });



//         res.json({

//             success:true,

//             merchants

//         });



//     }catch(error){


//         res.status(500).json({

//             success:false,

//             message:error.message

//         });


//     }

// };







// // ================================
// // Admin Update Merchant
// // ================================

// export const updateMerchant = async(req,res)=>{


//     try{


//         const merchant =
//             await Merchant.findByIdAndUpdate(

//                 req.params.id,

//                 req.body,

//                 {

//                     new:true

//                 }

//             );



//         if(!merchant){

//             return res.status(404).json({

//                 success:false,

//                 message:"Merchant not found"

//             });

//         }



//         res.json({

//             success:true,

//             message:"Merchant updated",

//             merchant

//         });



//     }catch(error){


//         res.status(500).json({

//             success:false,

//             message:error.message

//         });


//     }


// };







// // ================================
// // Admin Delete Merchant
// // ================================

// export const deleteMerchant = async(req,res)=>{


//     try{


//         const merchant =
//             await Merchant.findByIdAndDelete(
//                 req.params.id
//             );



//         if(!merchant){

//             return res.status(404).json({

//                 success:false,

//                 message:"Merchant not found"

//             });

//         }



//         res.json({

//             success:true,

//             message:"Merchant deleted"

//         });



//     }catch(error){


//         res.status(500).json({

//             success:false,

//             message:error.message

//         });


//     }


// };