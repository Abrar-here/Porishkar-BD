import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ReportForm from "./pages/ReportForm";
import MyReports from "./pages/MyReports";

import Marketplace from "./pages/Marketplace";
import CreateListing from "./pages/CreateListing";
import ListingDetails from "./pages/ListingDetails";
import MyListings from "./pages/MyListings";
import EditListing from "./pages/EditListing";

import BidManagement from "./pages/BidManagement";
import MyOffers from "./pages/MyOffers";

import AddRecyclingCentre from "./pages/AddRecyclingCentre";
import RecyclingCentres from "./pages/RecyclingCentres";
import EditRecyclingCentre from "./pages/EditRecyclingCentre";

import Navbar from "./components/Navbar";



// Protected Layout
function ProtectedLayout() {

  const { user } = useAuth();


  if (!user) {

    return <Navigate to="/login" />;

  }


  return (

    <>
      <Navbar />
      <Outlet />
    </>

  );

}





function App() {

  const { user, loading } = useAuth();



  if (loading) {

    return (

      <div className="flex items-center justify-center min-h-screen bg-gray-50">

        <p className="text-gray-500">
          Loading...
        </p>

      </div>

    );

  }





  return (

    <Routes>



      {/* Default */}

      <Route

        path="/"

        element={

          <Navigate

            to={user ? "/dashboard" : "/login"}

          />

        }

      />





      {/* Public Routes */}


      <Route

        path="/register"

        element={

          user

          ? <Navigate to="/dashboard" />

          : <Register />

        }

      />





      <Route

        path="/login"

        element={

          user

          ? <Navigate to="/dashboard" />

          : <Login />

        }

      />







      {/* Protected Routes */}


      <Route element={<ProtectedLayout />}>



        <Route

          path="/dashboard"

          element={<Dashboard />}

        />




        <Route

          path="/report"

          element={<ReportForm />}

        />




        <Route

          path="/my-reports"

          element={<MyReports />}

        />







        {/* ======================
            Marketplace (F09)
        ======================= */}



        <Route

          path="/marketplace"

          element={<Marketplace />}

        />




        <Route

          path="/marketplace/create"

          element={<CreateListing />}

        />




        <Route

          path="/marketplace/:id"

          element={<ListingDetails />}

        />




        <Route

          path="/my-listings"

          element={<MyListings />}

        />







        {/* ======================
            Bid & Offer (F10)
        ======================= */}



        {/* Buyer: View submitted offers */}

        <Route

          path="/my-offers"

          element={<MyOffers />}

        />




        {/* Seller: Manage offers */}

        <Route

          path="/my-listings/:id/offers"

          element={<BidManagement />}

        />




        <Route

          path="/my-listings/:id/edit"

          element={<EditListing />}

        />








        {/* ======================
            Recycling Centres
        ======================= */}



        <Route

          path="/recycling-centres"

          element={<RecyclingCentres />}

        />




        <Route

          path="/recycling-centres/add"

          element={<AddRecyclingCentre />}

        />




        <Route

          path="/recycling-centres/:id/edit"

          element={<EditRecyclingCentre />}

        />



      </Route>








      {/* Invalid Route */}


      <Route

        path="*"

        element={

          <Navigate

            to={user ? "/dashboard" : "/login"}

          />

        }

      />



    </Routes>

  );

}




export default App;