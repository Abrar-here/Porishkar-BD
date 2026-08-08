import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/dashboard"
          className="text-2xl font-bold text-green-600"
        >
          PorishkarBD
        </Link>

        {/* Menu */}
        <div className="flex items-center gap-6">

          <Link
            to="/dashboard"
            className="text-gray-700 hover:text-green-600"
          >
            Dashboard
          </Link>

          <Link
            to="/marketplace"
            className="text-gray-700 hover:text-green-600"
          >
            Marketplace
          </Link>

          <Link
            to="/my-listings"
            className="text-gray-700 hover:text-green-600"
          >
            My Listings
          </Link>

          <Link
            to="/report"
            className="text-gray-700 hover:text-green-600"
          >
            Report Waste
          </Link>

          <Link
            to="/my-reports"
            className="text-gray-700 hover:text-green-600"
          >
            My Reports
          </Link>

          {user && (
            <span className="text-sm text-gray-500">
              {user.name}
            </span>
          )}

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Logout
          </button>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;