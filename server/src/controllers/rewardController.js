import Reward from "../models/Reward.js";


// ================================
// Create Reward (Admin)
// ================================

export const createReward = async (req,res)=>{

    try{

        const reward = await Reward.create({

            ...req.body

        });


        res.status(201).json({

            success:true,

            message:"Reward created successfully",

            reward

        });


    }catch(error){

        res.status(500).json({

            success:false,

            message:"Failed to create reward",

            error:error.message

        });

    }

};



// ================================
// Get All Active Rewards
// ================================

export const getRewards = async(req,res)=>{

    try{


        const rewards = await Reward.find({

            status:"Active"

        })
        .populate(
            "merchant",
            "name category location"
        );


        res.json({

            success:true,

            count:rewards.length,

            rewards

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:"Failed to fetch rewards",

            error:error.message

        });

    }

};



// ================================
// Update Reward (Admin)
// ================================

export const updateReward = async(req,res)=>{

    try{


        const reward =
        await Reward.findByIdAndUpdate(

            req.params.id,

            req.body,

            {
                new:true
            }

        );


        if(!reward){

            return res.status(404).json({

                message:"Reward not found"

            });

        }



        res.json({

            success:true,

            message:"Reward updated",

            reward

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:"Update failed",

            error:error.message

        });

    }

};



// ================================
// Delete Reward (Admin)
// ================================

export const deleteReward = async(req,res)=>{

    try{


        const reward =
        await Reward.findByIdAndDelete(

            req.params.id

        );


        if(!reward){

            return res.status(404).json({

                message:"Reward not found"

            });

        }



        res.json({

            success:true,

            message:"Reward deleted"

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:"Delete failed",

            error:error.message

        });

    }

};