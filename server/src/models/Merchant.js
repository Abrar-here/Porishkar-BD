import mongoose from "mongoose";


const merchantSchema = new mongoose.Schema(

    {

        name: {

            type: String,

            required: true,

            trim: true

        },


        category: {

            type: String,

            required: true,

            enum: [

                "organic_food",

                "solar_products",

                "eco_store",

                "other"

            ]

        },


        description: {

            type: String,

            default: ""

        },


        location: {

            type: String,

            required: true

        },


        contactEmail: {

            type: String,

            default: ""

        },


        phone: {

            type: String,

            default: ""

        },


        voucherStock: {

            type: Number,

            default: 0

        },


        voucherValue: {

            type: Number,

            default: 0

        },


        status: {

            type: String,

            enum: [

                "active",

                "inactive"

            ],

            default: "active"

        },


        createdBy: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User"

        }

    },

    {

        timestamps: true

    }

);



export default mongoose.model(
    "Merchant",
    merchantSchema
);