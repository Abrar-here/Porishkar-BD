import { Routes, Route, Navigate } from "react-router-dom";
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

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={user ? "/dashboard" : "/login"} />}
      />

      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" /> : <Register />}
      />

      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" /> : <Login />}
      />

      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" />}
      />

      <Route
        path="/report"
        element={user ? <ReportForm /> : <Navigate to="/login" />}
      />

      <Route
        path="/my-reports"
        element={user ? <MyReports /> : <Navigate to="/login" />}
      />

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




      
      {/* <Route
        path="/marketplace"
        element={user ? <Marketplace /> : <Navigate to="/login" />}
      />

      <Route
        path="/marketplace/create"
        element={user ? <CreateListing /> : <Navigate to="/login" />}
      />

      <Route
        path="/marketplace/:id"
        element={user ? <ListingDetails /> : <Navigate to="/login" />}
      />

      <Route
        path="/my-listings"
        element={user ? <MyListings /> : <Navigate to="/login" />}
      />

      <Route
        path="/my-listings/:id/edit"
        element={user ? <EditListing /> : <Navigate to="/login" />}
      /> */}

      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} />}
      />
    </Routes>
  );
}

export default App;