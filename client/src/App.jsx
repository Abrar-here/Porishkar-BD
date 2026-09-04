import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import Register from "./pages/Register";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";

import Dashboard from "./pages/Dashboard";
import ReportForm from "./pages/ReportForm";
import MyReports from "./pages/MyReports";

import EcoPoints from "./pages/EcoPoints";
import RewardCentre from "./pages/RewardCentre";
import MerchantDirectory from "./pages/MerchantDirectory";
import AdminMerchantManagement from "./pages/AdminMerchantManagement";

import Leaderboard from "./pages/Leaderboard";
import Achievements from "./pages/Achievements";

import NotificationSettings from "./pages/NotificationSettings";

import Marketplace from "./pages/Marketplace";
import CreateListing from "./pages/CreateListing";
import ListingDetails from "./pages/ListingDetails";
import MyListings from "./pages/MyListings";
import EditListing from "./pages/EditListing";

import BidManagement from "./pages/BidManagement";
import MyOffers from "./pages/MyOffers";

import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";

import AddRecyclingCentre from "./pages/AddRecyclingCentre";
import RecyclingCentres from "./pages/RecyclingCentres";
import EditRecyclingCentre from "./pages/EditRecyclingCentre";

// Existing demo features

import AdminRoutes from "./pages/AdminRoutes";
import CollectorRoute from "./pages/CollectorRoute";
import AdminAnalytics from "./pages/AdminAnalytics";
import HotspotHeatmap from "./pages/HotspotHeatmap";
import AdminReports from "./pages/AdminReports";
import AdminReportQueue from "./pages/AdminReportQueue";
import AdminPerformanceDashboard from "./pages/AdminPerformanceDashboard";
import AdminUsers from "./pages/AdminUsers";

import Navbar from "./components/Navbar";

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
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" /> : <LandingPage />}
      />

      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" /> : <Register />}
      />

      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" /> : <Login />}
      />

      <Route path="/verify-otp" element={<VerifyOtp />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/payment-success" element={<PaymentSuccess />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/notification-settings"
          element={<NotificationSettings />}
        />

        <Route path="/report" element={<ReportForm />} />

        <Route path="/my-reports" element={<MyReports />} />

        {/* F19 */}

        <Route path="/eco-points" element={<EcoPoints />} />

        <Route path="/reward-centre" element={<RewardCentre />} />

        <Route path="/merchant-directory" element={<MerchantDirectory />} />

        <Route path="/admin/merchants" element={<AdminMerchantManagement />} />

        <Route path="/leaderboard" element={<Leaderboard />} />

        <Route path="/achievements" element={<Achievements />} />

        {/* Marketplace */}

        <Route path="/marketplace" element={<Marketplace />} />

        <Route path="/marketplace/create" element={<CreateListing />} />

        <Route path="/marketplace/:id" element={<ListingDetails />} />

        <Route path="/my-listings" element={<MyListings />} />

        <Route path="/my-listings/:id/edit" element={<EditListing />} />

        {/* F10 */}

        <Route path="/my-offers" element={<MyOffers />} />

        <Route path="/my-listings/:id/offers" element={<BidManagement />} />

        {/* F11 */}

        <Route path="/payment/:transactionId" element={<Payment />} />

        {/* Recycling */}

        <Route path="/recycling-centres" element={<RecyclingCentres />} />

        <Route path="/recycling-centres/add" element={<AddRecyclingCentre />} />

        <Route
          path="/recycling-centres/:id/edit"
          element={<EditRecyclingCentre />}
        />
        {/* Recycling company edits their own centre — no ID needed */}
        <Route path="/my-centre" element={<EditRecyclingCentre />} />

        {/* Admin / Collector Features */}

        <Route path="/admin/reports/queue" element={<AdminReportQueue />} />

        <Route path="/admin/routes" element={<AdminRoutes />} />

        <Route path="/my-route" element={<CollectorRoute />} />

        <Route path="/admin/analytics" element={<AdminAnalytics />} />

        <Route path="/heatmap" element={<HotspotHeatmap />} />

        <Route path="/admin/reports" element={<AdminReports />} />

        <Route
          path="/admin/performance"
          element={<AdminPerformanceDashboard />}
        />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} />}
      />
    </Routes>
  );
}

export default App;
