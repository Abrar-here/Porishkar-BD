import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import centreRoutes from "./routes/centreRoutes.js";
import bidRoutes from "./routes/bidRoutes.js";

import ecoPointsRoutes from "./routes/ecoPointsRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import badgeRoutes from "./routes/badgeRoutes.js";

import transactionRoutes from "./routes/transactionRoutes.js";


const app = express();



// ================================
// Middlewares
// ================================

app.use(cors());


app.use(
    express.json()
);


app.use(
    express.urlencoded({
        extended: true
    })
);




// ================================
// Marketplace
// ================================

app.use(
    "/api/listings",
    listingRoutes
);



// ================================
// Recycling Centres
// ================================

app.use(
    "/api/centres",
    centreRoutes
);



// ================================
// Eco Points & Gamification
// ================================

app.use(
    "/api/ecopoints",
    ecoPointsRoutes
);


app.use(
    "/api/leaderboard",
    leaderboardRoutes
);


app.use(
    "/api/badges",
    badgeRoutes
);



// ================================
// Bid & Offer System (F10)
// ================================

app.use(
    "/api/bids",
    bidRoutes
);



// ================================
// F11 Transaction + SSLCommerz
// ================================

app.use(
    "/api/transactions",
    transactionRoutes
);



// ================================
// Authentication
// ================================

app.use(
    "/api/auth",
    authRoutes
);



// ================================
// Reports
// ================================

app.use(
    "/api/reports",
    reportRoutes
);



// ================================
// Health Check
// ================================

app.get(
    "/api/health",
    (req, res)=>{

        res.status(200).json({

            success:true,

            status:"ok",

            message:"PorishkarBD API is running"

        });

    }
);



// ================================
// Error Handler
// ================================

app.use(
    (err, req, res, next)=>{

        console.error(err);

        res.status(500).json({

            success:false,

            message:"Server Error",

            error:err.message

        });

    }
);



export default app;