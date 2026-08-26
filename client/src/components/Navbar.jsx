import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();

    navigate("/login");
  };

  const isActive = (path) => {
    // Links with a query string (e.g. "/dashboard?tab=available") need
    // to match both the pathname AND the tab param — otherwise every
    // collector tab would light up together, same as the exact-match
    // fix below solves for plain routes.
    const [linkPath, linkQuery] = path.split("?");

    const pathMatches = location.pathname === linkPath;

    const queryMatches = linkQuery
      ? new URLSearchParams(location.search).get("tab") ===
        new URLSearchParams(linkQuery).get("tab")
      : location.search === "";

    return pathMatches && queryMatches
      ? "bg-green-600 text-white shadow-sm"
      : "text-gray-600 hover:bg-green-50 hover:text-green-700";
  };

  // Citizen / Buyer / Seller

  const citizenLinks = [
    { to: "/dashboard", label: "Dashboard" },

    { to: "/marketplace", label: "Marketplace" },

    { to: "/my-listings", label: "My Listings" },

    { to: "/my-offers", label: "My Offers" },

    { to: "/report", label: "Report Waste" },

    { to: "/my-reports", label: "My Reports" },

    { to: "/recycling-centres", label: "Recycling Centres" },

    { to: "/eco-points", label: "Eco Points" },

    { to: "/reward-centre", label: "Reward Centre" },

    { to: "/merchant-directory", label: "Merchant Directory" },

    { to: "/leaderboard", label: "Leaderboard" },

    { to: "/achievements", label: "Achievements" },

    { to: "/heatmap", label: "Hotspot Map" },
  ];

  // Collector

  const collectorLinks = [
    {
      to: "/dashboard?tab=available",
      label: "Available Pickups",
    },

    {
      to: "/dashboard?tab=assigned",
      label: "My Pickups",
    },

    {
      to: "/my-route",
      label: "My Route",
    },
  ];

  // Recycling Company
  const recyclingLinks = [
    {
      to: "/dashboard",
      label: "Dashboard",
    },
    {
      to: "/marketplace",
      label: "Marketplace",
    },
    {
      to: "/my-listings",
      label: "My Listings",
    },
    {
      to: "/my-offers",
      label: "My Offers",
    },
    {
      to: "/my-centre",
      label: "My Centre",
    },
    {
      to: "/merchant-directory",
      label: "Merchant Directory",
    },
  ];

  // Admin

  const adminLinks = [
    {
      to: "/dashboard",
      label: "Dashboard",
    },

    {
      to: "/admin/reports",
      label: "All Reports",
    },

    {
      to: "/admin/reports/queue",
      label: "Priority Queue",
    },

    {
      to: "/admin/users",
      label: "Users",
    },

    {
      to: "/recycling-centres",
      label: "Recycling Centres",
    },

    {
      to: "/merchant-directory",
      label: "Merchant Directory",
    },

    {
      to: "/admin/merchants",
      label: "Merchant Management",
    },

    {
      to: "/admin/routes",
      label: "Collector Routes",
    },

    {
      to: "/admin/analytics",
      label: "Analytics",
    },

    {
      to: "/heatmap",
      label: "Hotspot Map",
    },
  ];

  const getLinks = () => {
    const role = user?.role?.toLowerCase();

    switch (role) {
      case "citizen":

      case "buyer":

      case "seller":
        return citizenLinks;

      case "collector":
        return collectorLinks;

      case "recycling_company":

      case "recycling company":
        return recyclingLinks;

      case "admin":
        return adminLinks;

      default:
        return citizenLinks;
    }
  };

  const links = getLinks();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top row: logo + user info + mobile toggle */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-xl font-bold text-green-600 shrink-0"
          >
            <span className="w-8 h-8 rounded-lg bg-green-600 text-white flex items-center justify-center text-base">
              ♻
            </span>
            <span className="hidden sm:inline">PorishkarBD</span>
          </Link>

          {/* User + actions */}
          <div className="flex items-center gap-3">
            {user && <NotificationBell />}

            {user && (
              <div className="hidden md:flex items-center gap-2 pl-3 border-l border-gray-200">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <span className="text-green-700 text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="leading-tight">
                  <p className="text-xs font-medium text-gray-800">
                    {user.name}
                  </p>

                  <p className="text-xs text-gray-400 capitalize">
                    {user.role?.replace("_", " ")}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 border border-red-100 transition-colors"
            >
              Logout
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Desktop nav: scrollable pill row so it never wraps or overflows the layout */}
        <div className="hidden md:flex items-center gap-1 pb-3 overflow-x-auto scrollbar-none">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${isActive(
                link.to,
              )}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-1 max-h-[70vh] overflow-y-auto">
          {user && (
            <div className="flex items-center gap-2 pb-3 mb-2 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <span className="text-green-700 text-xs font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="leading-tight">
                <p className="text-xs font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-400 capitalize">
                  {user.role?.replace("_", " ")}
                </p>
              </div>
            </div>
          )}

          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${isActive(
                link.to,
              )}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
