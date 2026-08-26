import { useEffect, useState } from "react";
import api from "../api/axios";

const ROLE_LABELS = {
  citizen: "Citizen",
  collector: "Waste Collector",
  recycling_company: "Recycling Company",
  admin: "Admin",
};

const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  suspended: "bg-orange-100 text-orange-700",
  banned: "bg-red-100 text-red-700",
  rejected: "bg-gray-200 text-gray-600",
};

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (roleFilter) params.role = roleFilter;
      const res = await api.get("/auth/users", { params });
      setUsers(res.data.users);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, roleFilter]);

  const handleStatusChange = async (userId, newStatus) => {
    setUpdatingId(userId);
    try {
      await api.put(`/auth/users/${userId}/status`, { status: newStatus });
      // Update in place — no need to re-fetch the whole list
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u)),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update this user");
    } finally {
      setUpdatingId(null);
    }
  };

  // Which action buttons make sense for a user's current status —
  // no point showing "Approve" on someone who's already active, etc.
  const getAvailableActions = (status) => {
    switch (status) {
      case "pending":
        return [
          {
            label: "Approve",
            value: "active",
            style: "bg-green-600 hover:bg-green-700 text-white",
          },
          {
            label: "Reject",
            value: "rejected",
            style:
              "bg-red-50 hover:bg-red-100 text-red-600 border border-red-100",
          },
        ];
      case "active":
        return [
          {
            label: "Suspend",
            value: "suspended",
            style:
              "bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-100",
          },
          {
            label: "Ban",
            value: "banned",
            style:
              "bg-red-50 hover:bg-red-100 text-red-600 border border-red-100",
          },
        ];
      case "suspended":
        return [
          {
            label: "Reactivate",
            value: "active",
            style: "bg-green-600 hover:bg-green-700 text-white",
          },
          {
            label: "Ban",
            value: "banned",
            style:
              "bg-red-50 hover:bg-red-100 text-red-600 border border-red-100",
          },
        ];
      case "banned":
      case "rejected":
        return [
          {
            label: "Reactivate",
            value: "active",
            style: "bg-green-600 hover:bg-green-700 text-white",
          },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 mt-2">
            Approve new accounts, and suspend or ban accounts that violate
            platform policies.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-5 mb-6 flex flex-col md:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="">All roles</option>
              <option value="citizen">Citizen</option>
              <option value="collector">Waste Collector</option>
              <option value="recycling_company">Recycling Company</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-center py-12">Loading users...</p>
        ) : users.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow text-gray-500">
            No users match these filters.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow divide-y divide-gray-100">
            {users.map((u) => (
              <div
                key={u._id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800">{u.name}</p>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        STATUS_STYLES[u.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {u.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{u.email}</p>
                  <p className="text-sm text-gray-500">{u.phone}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {ROLE_LABELS[u.role] || u.role}
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  {getAvailableActions(u.status).map((action) => (
                    <button
                      key={action.value}
                      type="button"
                      onClick={() => handleStatusChange(u._id, action.value)}
                      disabled={updatingId === u._id}
                      className={`px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-60 ${action.style}`}
                    >
                      {updatingId === u._id ? "..." : action.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;
