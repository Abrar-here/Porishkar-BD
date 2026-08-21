import Redemption from "../models/Redemption.js";
import Reward from "../models/Reward.js";
import User from "../models/User.js";



// ================================
// Redeem Reward
// ================================

export const redeemReward = async (req, res) => {

    try {


        const { rewardId } = req.body;



        const user = await User.findById(req.user.id);


        const reward = await Reward.findById(rewardId);



        if (!user) {

            return res.status(404).json({

                message:"User not found"

            });

        }



        if (!reward) {

            return res.status(404).json({

                message:"Reward not found"

            });

        }



        if (reward.stock <= 0) {

            return res.status(400).json({

                message:"Reward out of stock"

            });

        }



        if (user.ecoPoints < reward.pointsRequired) {

            return res.status(400).json({

                message:"Not enough Eco Points"

            });

        }




        // Deduct Eco Points

        user.ecoPoints -= reward.pointsRequired;

        await user.save();





        // Reduce reward stock

        reward.stock -= 1;

        await reward.save();






        // Generate Voucher Code

        const voucherCode =
            "ECO-" +
            Math.random()
            .toString(36)
            .substring(2,8)
            .toUpperCase();






        // Create Redemption

        const redemption = await Redemption.create({

            user:user._id,

            reward:reward._id,

            pointsUsed:reward.pointsRequired,

            voucherCode,

            status:"Approved"

        });






        res.status(201).json({

            success:true,

            message:"Reward redeemed successfully",

            redemption

        });



    } catch(error) {


        res.status(500).json({

            success:false,

            message:"Redemption failed",

            error:error.message

        });


    }

};






// ================================
// My Redemption History
// ================================

export const getMyRedemptions = async(req,res)=>{


    try{


        const redemptions = await Redemption.find({

            user:req.user.id

        })
        .populate(

            "reward",

            "title type value pointsRequired"

        );



        res.json({

            success:true,

            count:redemptions.length,

            redemptions

        });



    }catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};