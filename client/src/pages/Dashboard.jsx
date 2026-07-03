import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();

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
          <div className="space-y-2 text-gray-600">
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
          <p className="mt-6 text-sm text-gray-400">
            This is your dashboard. We'll build role-specific features here
            next.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
