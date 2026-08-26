import { useEffect, useState } from "react";
import api from "../api/axios";
import LocationPickerMap from "../components/LocationPickerMap";

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

const MATERIAL_OPTIONS = [
  "Plastic",
  "Paper",
  "Metal",
  "Glass",
  "Electronic Waste",
  "Textile",
];

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Which user is currently being approved with a centre form open
  const [centreFormUserId, setCentreFormUserId] = useState(null);
  const [centreForm, setCentreForm] = useState({
    name: "",
    address: "",
    lat: "",
    lng: "",
    openTime: "9:00 AM",
    closeTime: "6:00 PM",
    phone: "",
  });
  const [centreMaterials, setCentreMaterials] = useState([]);
  const [centreError, setCentreError] = useState("");

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

  const handleStatusChange = async (
    userId,
    newStatus,
    centrePayload = null,
  ) => {
    setUpdatingId(userId);
    try {
      const body = { status: newStatus };
      if (centrePayload) body.centre = centrePayload;

      await api.put(`/auth/users/${userId}/status`, body);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u)),
      );
      setCentreFormUserId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update this user");
    } finally {
      setUpdatingId(null);
    }
  };

  // For recycling_company approvals, open the centre-details form
  // instead of updating status immediately.
  const handleApproveClick = (user) => {
    if (user.role === "recycling_company") {
      setCentreFormUserId(user._id);
      setCentreForm({
        name: user.name,
        address: "",
        lat: "",
        lng: "",
        openTime: "9:00 AM",
        closeTime: "6:00 PM",
        phone: user.phone || "",
      });
      setCentreMaterials([]);
      setCentreError("");
    } else {
      handleStatusChange(user._id, "active");
    }
  };

  const handleLocationPick = (lat, lng, address) => {
    setCentreForm((prev) => ({
      ...prev,
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
      address: prev.address.trim() === "" ? address : prev.address,
    }));
  };

  const toggleCentreMaterial = (material) => {
    setCentreMaterials((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material],
    );
  };

  const handleCentreSubmit = (userId) => {
    setCentreError("");

    if (!centreForm.name.trim() || !centreForm.address.trim()) {
      setCentreError("Centre name and address are required.");
      return;
    }
    if (centreForm.lat === "" || centreForm.lng === "") {
      setCentreError("Please drop a pin on the map to set the location.");
      return;
    }
    if (centreMaterials.length === 0) {
      setCentreError("Select at least one accepted material.");
      return;
    }

    handleStatusChange(userId, "active", {
      name: centreForm.name.trim(),
      address: centreForm.address.trim(),
      location: {
        lat: parseFloat(centreForm.lat),
        lng: parseFloat(centreForm.lng),
      },
      acceptedMaterials: centreMaterials,
      hours: { open: centreForm.openTime, close: centreForm.closeTime },
      phone: centreForm.phone.trim() || null,
    });
  };

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
              <div key={u._id} className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                        onClick={() =>
                          action.value === "active"
                            ? handleApproveClick(u)
                            : handleStatusChange(u._id, action.value)
                        }
                        disabled={updatingId === u._id}
                        className={`px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-60 ${action.style}`}
                      >
                        {updatingId === u._id ? "..." : action.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inline centre-details form for recycling_company approval */}
                {centreFormUserId === u._id && (
                  <div className="mt-5 p-5 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Set Up {u.name}'s Recycling Centre
                    </h3>

                    {centreError && (
                      <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                        {centreError}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Centre Name
                        </label>
                        <input
                          type="text"
                          value={centreForm.name}
                          onChange={(e) =>
                            setCentreForm({
                              ...centreForm,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location — click the map to drop a pin
                        </label>
                        <LocationPickerMap
                          onLocationPick={handleLocationPick}
                        />
                        {centreForm.lat && centreForm.lng && (
                          <div className="mt-2 grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={centreForm.lat}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-600"
                            />
                            <input
                              type="text"
                              value={centreForm.lng}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-600"
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          value={centreForm.address}
                          onChange={(e) =>
                            setCentreForm({
                              ...centreForm,
                              address: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Accepted Materials
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {MATERIAL_OPTIONS.map((material) => {
                            const selected = centreMaterials.includes(material);
                            return (
                              <button
                                type="button"
                                key={material}
                                onClick={() => toggleCentreMaterial(material)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                                  selected
                                    ? "bg-green-600 text-white border-green-600"
                                    : "bg-white text-gray-700 border-gray-300"
                                }`}
                              >
                                {material}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Opening Time
                          </label>
                          <input
                            type="text"
                            value={centreForm.openTime}
                            onChange={(e) =>
                              setCentreForm({
                                ...centreForm,
                                openTime: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Closing Time
                          </label>
                          <input
                            type="text"
                            value={centreForm.closeTime}
                            onChange={(e) =>
                              setCentreForm({
                                ...centreForm,
                                closeTime: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Phone
                        </label>
                        <input
                          type="text"
                          value={centreForm.phone}
                          onChange={(e) =>
                            setCentreForm({
                              ...centreForm,
                              phone: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => handleCentreSubmit(u._id)}
                          disabled={updatingId === u._id}
                          className="px-5 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-60"
                        >
                          {updatingId === u._id
                            ? "Approving..."
                            : "Approve & Create Centre"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setCentreFormUserId(null)}
                          className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;
