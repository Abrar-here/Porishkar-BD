import Merchant from "../models/Merchant.js";



// ================================
// Get all merchants
// ================================

export const getMerchants = async (req,res)=>{

    try{


        const merchants = await Merchant.find({

            status:"active"

        }).sort({

            createdAt:-1

        });



        res.status(200).json({

            success:true,

            count:merchants.length,

            merchants

        });


    }catch(error){

        res.status(500).json({

            success:false,

            message:"Failed to fetch merchants",

            error:error.message

        });

    }

};





// ================================
// Create merchant (Admin)
// ================================

export const createMerchant = async(req,res)=>{

    try{


        const merchant = await Merchant.create({

            ...req.body,

            createdBy:req.user._id

        });



        res.status(201).json({

            success:true,

            message:"Merchant added successfully",

            merchant

        });



    }catch(error){


        res.status(500).json({

            success:false,

            message:"Failed to create merchant",

            error:error.message

        });


    }

};





// ================================
// Update merchant (Admin)
// ================================

export const updateMerchant = async(req,res)=>{

    try{


        const merchant = await Merchant.findByIdAndUpdate(

            req.params.id,

            req.body,

            {
                new:true
            }

        );



        if(!merchant){

            return res.status(404).json({

                success:false,

                message:"Merchant not found"

            });

        }



        res.status(200).json({

            success:true,

            merchant

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:"Failed to update merchant",

            error:error.message

        });

    }

};





// ================================
// Delete merchant (Admin)
// ================================

export const deleteMerchant = async(req,res)=>{

    try{


        const merchant = await Merchant.findByIdAndDelete(

            req.params.id

        );



        if(!merchant){

            return res.status(404).json({

                success:false,

                message:"Merchant not found"

            });

        }



        res.status(200).json({

            success:true,

            message:"Merchant deleted"

        });



    }catch(error){


        res.status(500).json({

            success:false,

            message:"Failed to delete merchant",

            error:error.message

        });


    }

};