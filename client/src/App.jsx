import {
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ReportForm from "./pages/ReportForm";
import MyReports from "./pages/MyReports";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";

import Marketplace from "./pages/Marketplace";
import CreateListing from "./pages/CreateListing";
import ListingDetails from "./pages/ListingDetails";
import MyListings from "./pages/MyListings";
import EditListing from "./pages/EditListing";

import Navbar from "./components/Navbar";


// Layout for logged-in pages
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

      {/* Starting page */}
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
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/report"
        element={user ? <ReportForm /> : <Navigate to="/login" />}
      />


      {/* Logged-in Routes */}
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

        {/* F09 Marketplace */}
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

        <Route
          path="/my-listings/:id/edit"
          element={<EditListing />}
        />

      </Route>


      {/* Wrong URL */}
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