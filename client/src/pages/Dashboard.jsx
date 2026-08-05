import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-700">PorishkarBD</h1>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Log Out
        </button>
      </nav>

      <div className="p-6">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Welcome, {user?.name}! 👋
          </h2>
          <div className="space-y-2 text-gray-600 mb-6">
            <p>
              <span className="font-medium">Email:</span> {user?.email}
            </p>
            <p>
              <span className="font-medium">Role:</span> {user?.role}
            </p>
            <p>
              <span className="font-medium">Status:</span> {user?.status}
            </p>
          </div>

          {/* Quick actions — only shown to citizens */}
          {user?.role === "citizen" && (
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => navigate("/report")}
                className="p-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 text-left transition-colors"
              >
                <p className="text-lg">🗑️</p>
                <p className="font-semibold mt-1">Report an issue</p>
                <p className="text-xs opacity-80 mt-1">
                  Report waste problems in your area
                </p>
              </button>
              <button
                onClick={() => navigate("/my-reports")}
                className="p-4 bg-white border-2 border-green-600 text-green-700 rounded-xl font-medium hover:bg-green-50 text-left transition-colors"
              >
                <p className="text-lg">📋</p>
                <p className="font-semibold mt-1">My reports</p>
                <p className="text-xs opacity-80 mt-1">
                  Track your submitted reports
                </p>
              </button>
            </div>
          )}

          {/* Placeholder for other roles */}
          {user?.role === "collector" && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-yellow-700 font-medium">Collector dashboard</p>
              <p className="text-yellow-600 text-sm mt-1">
                Collection features coming soon.
              </p>
            </div>
          )}

          {user?.role === "recycling_company" && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-blue-700 font-medium">
                Recycling company dashboard
              </p>
              <p className="text-blue-600 text-sm mt-1">
                Marketplace features coming soon.
              </p>
            </div>
          )}

          {user?.role === "admin" && (
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <p className="text-purple-700 font-medium">Admin dashboard</p>
              <p className="text-purple-600 text-sm mt-1">
                Admin features coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
