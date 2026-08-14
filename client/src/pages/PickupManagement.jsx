import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import RequestPickupModal from "./RequestPickupModal";

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

export default function PickupManagement() {
  const { user } = useAuth();

  const isCollector =
    user?.role === "collector" ||
    user?.role === "Collector" ||
    user?.userType === "collector";

  const [activeTab, setActiveTab] = useState("available");
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [wasteTypeFilter, setWasteTypeFilter] = useState("All");

  const getMongoId = (idVal) => {
    if (!idVal) return "";
    if (typeof idVal === "object" && idVal.$oid) return idVal.$oid;
    return String(idVal);
  };

  const parseMongoDate = (dateVal) => {
    if (!dateVal) return null;
    const rawString =
      typeof dateVal === "object" && dateVal.$date ? dateVal.$date : dateVal;
    const parsed = new Date(rawString);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatDateOnly = (dateVal) => {
    const parsedDate = parseMongoDate(dateVal);
    if (!parsedDate) return "N/A";
    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const isReportLocked = (item) => {
    if (!item || !item.pickupDate) return true;
    try {
      const baseDate = parseMongoDate(item.pickupDate || item.createdAt);
      if (!baseDate) return true;
      let hours = 0;
      let minutes = 0;
      if (item.pickupTime) {
        const match = item.pickupTime
          .trim()
          .match(/^(\d{1,2}):(\d{2})\s*([AP]M)?$/i);
        if (match) {
          hours = parseInt(match[1], 10);
          minutes = parseInt(match[2], 10);
          const ampm = match[3] ? match[3].toUpperCase() : null;
          if (ampm === "PM" && hours < 12) hours += 12;
          if (ampm === "AM" && hours === 12) hours = 0;
        }
      }
      const exactPickupTime = new Date(
        baseDate.getUTCFullYear(),
        baseDate.getUTCMonth(),
        baseDate.getUTCDate(),
        hours,
        minutes,
      ).getTime();
      return exactPickupTime - Date.now() < FOUR_HOURS_MS;
    } catch {
      return true;
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");
      let response;
      if (isCollector) {
        if (activeTab === "assigned") {
          try {
            response = await api.get("/reports/assigned");
          } catch {
            response = await api.get("/reports/my");
          }
        } else {
          try {
            response = await api.get("/reports/available");
          } catch {
            response = await api.get("/reports/all");
          }
        }
      } else {
        try {
          response = await api.get("/reports/my");
        } catch {
          response = await api.get("/reports/user");
        }
      }
      const data = response.data.reports || response.data || [];
      const reportArray = Array.isArray(data) ? data : [];
      if (isCollector) {
        setPickups(
          activeTab === "available"
            ? reportArray.filter((r) => r.status === "Reported" || !r.status)
            : reportArray.filter((r) => r.status === "Assigned"),
        );
      } else {
        // Citizens: only show reports that have a pickupDate (F05 requests)
        setPickups(reportArray.filter((r) => r.pickupDate));
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError(
          "Access forbidden: Your account role does not have permission.",
        );
      } else {
        setError("Failed to load waste pickup requests.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [isCollector, activeTab]);

  const getStatusBg = (status) => {
    switch (status) {
      case "Assigned":
      case "Collector En Route":
      case "Cleanup In Progress":
        return "bg-emerald-800 text-white";
      case "Reported":
        return "bg-amber-700 text-white";
      case "Resolved":
      case "Closed":
        return "bg-blue-900 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const filteredPickups = pickups.filter((item) => {
    const rawId = getMongoId(item._id || item.id);
    const ref = item.caseReference || rawId || "";
    const category = item.category || "";
    const address = item.location?.address || "";
    const matchesSearch =
      ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      item.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesType =
      wasteTypeFilter === "All" ||
      category.toLowerCase() === wasteTypeFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAcceptPickup = async (reportId) => {
    try {
      await api.put(`/reports/${reportId}/accept`);
      alert("Pickup task accepted successfully!");
      setPickups((prev) =>
        prev.filter((p) => getMongoId(p._id || p.id) !== reportId),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept pickup task.");
    }
  };

  const handleCancel = async (reportId) => {
    if (!reportId) return;
    if (!window.confirm("Are you sure you want to cancel this pickup request?"))
      return;
    try {
      const response = await api.put(`/reports/${reportId}/cancel`);
      alert(response.data?.message || "Pickup request canceled successfully!");
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel pickup.");
    }
  };

  const openRescheduleModal = (reportId) => {
    setSelectedReportId(reportId);
    setRescheduleDate("");
    setRescheduleTime("");
    setIsRescheduleOpen(true);
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReportId || !rescheduleDate || !rescheduleTime) {
      alert("Please select both a date and time.");
      return;
    }
    try {
      setRescheduleLoading(true);
      const [year, month, day] = rescheduleDate.split("-");
      const [hours, minutes] = rescheduleTime.split(":");
      const combinedDateTime = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
      );
      const formattedTimeString = combinedDateTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const response = await api.put(
        `/reports/${selectedReportId}/reschedule`,
        {
          newDate: combinedDateTime.toISOString(),
          pickupTime: formattedTimeString,
        },
      );
      alert(response.data?.message || "Pickup rescheduled successfully!");
      setIsRescheduleOpen(false);
      setSelectedReportId(null);
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reschedule pickup.");
    } finally {
      setRescheduleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf7] text-gray-800">
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Banner */}
        <section className="bg-[#e8f5eb] rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center shadow-xs">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {isCollector
                ? activeTab === "available"
                  ? "Available Community Pickup Tasks"
                  : "My Assigned Tasks List"
                : "Manage your Household Waste Pickups"}
            </h2>
            <p className="text-gray-600 font-medium">
              {isCollector
                ? activeTab === "available"
                  ? "Accept pending pickup requests posted by citizens in your area."
                  : "View and manage all the pickup jobs assigned to you."
                : "Schedule, reschedule, or cancel household waste pickup requests."}
            </p>
            {!isCollector && (
              <div className="pt-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-5 py-2.5 rounded-lg text-sm shadow-xs transition cursor-pointer"
                >
                  + Request Pickup
                </button>
              </div>
            )}
          </div>
          <div className="mt-6 md:mt-0 flex flex-col items-center text-center space-y-2 bg-white/40 backdrop-blur-xs p-4 rounded-2xl border border-emerald-100">
            <div className="w-12 h-12 bg-emerald-200/60 text-emerald-800 rounded-full flex items-center justify-center text-xl font-bold">
              ♻️
            </div>
            <p className="text-xs text-emerald-900 max-w-45 font-medium leading-tight">
              Transparent price discovery without informal middlemen
            </p>
          </div>
        </section>

        {/* Collector Tabs */}
        {isCollector && (
          <div className="flex items-center space-x-3 border-b border-gray-200 pb-2">
            <button
              onClick={() => setActiveTab("available")}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer ${
                activeTab === "available"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              📋 Available Tasks
            </button>
            <button
              onClick={() => setActiveTab("assigned")}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer ${
                activeTab === "assigned"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              ✅ My Assigned Tasks
            </button>
          </div>
        )}

        {/* Search */}
        <section>
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by address, ID or waste type..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>
        </section>

        {/* Filters & Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Sidebar */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-5">
            <h3 className="text-lg font-bold text-gray-900">Filters</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Pickup Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="All">Select All</option>
                  <option value="assigned">Scheduled / Assigned</option>
                  <option value="reported">Reported (Pending)</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Waste Type
                </label>
                <select
                  value={wasteTypeFilter}
                  onChange={(e) => setWasteTypeFilter(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="All">Select All</option>
                  <option value="household">Household</option>
                  <option value="industrial">Industrial</option>
                  <option value="medical">Medical</option>
                  <option value="construction">Construction</option>
                  <option value="water body pollution">
                    Water Body Pollution
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="text-center py-12 text-gray-500 font-medium">
                Loading pickup records...
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600 font-medium">
                {error}
              </div>
            ) : filteredPickups.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-500">
                {isCollector
                  ? activeTab === "available"
                    ? "No unassigned pickup requests available right now."
                    : "You do not have any assigned tasks currently."
                  : "No scheduled pickups yet. Click '+ Request Pickup' to schedule one."}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPickups.map((item) => {
                  const itemId = getMongoId(item._id || item.id);
                  const isLocked = isReportLocked(item);
                  const isNonModifiable = [
                    "Closed",
                    "Resolved",
                    "Completed",
                    "Cancelled",
                  ].includes(item.status);
                  return (
                    <div
                      key={itemId}
                      className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col justify-between space-y-4 shadow-sm"
                    >
                      <div className="bg-[#eaf5ed] p-4 rounded-xl space-y-1">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-md inline-block mb-1 ${getStatusBg(item.status)}`}
                        >
                          {item.status || "Reported"}
                        </span>
                        <p className="text-xs text-gray-500 font-medium">
                          Pickup Date & Time
                        </p>
                        <p className="text-xl font-black text-gray-900">
                          {formatDateOnly(item.pickupDate || item.createdAt)}
                        </p>
                        <p className="text-sm font-bold text-emerald-800">
                          {item.pickupTime || "Time N/A"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-gray-800">
                          ID: {item.caseReference || itemId}
                        </h4>
                        <p className="text-xs text-gray-600">
                          <strong>Type:</strong> {item.category}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          <strong>Location:</strong>{" "}
                          {item.location?.address || "Address not specified"}
                        </p>
                        {isCollector &&
                          activeTab === "assigned" &&
                          item.reportedBy && (
                            <div className="mt-3 p-2 bg-emerald-50 rounded-lg border border-emerald-100 text-xs space-y-0.5">
                              <p className="font-bold text-emerald-900">
                                👤 Reporter Details:
                              </p>
                              <p className="text-gray-700">
                                <strong>Name:</strong>{" "}
                                {item.reportedBy.name || "N/A"}
                              </p>
                              <p className="text-gray-700">
                                <strong>Phone:</strong>{" "}
                                {item.reportedBy.phone || "N/A"}
                              </p>
                            </div>
                          )}
                      </div>
                      {isCollector ? (
                        activeTab === "available" ? (
                          <button
                            onClick={() => handleAcceptPickup(itemId)}
                            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
                          >
                            Accept Pickup Task
                          </button>
                        ) : (
                          <div className="text-center text-xs text-emerald-800 font-semibold py-2 bg-emerald-100 rounded-lg">
                            ✓ Assigned to You
                          </div>
                        )
                      ) : !isNonModifiable && !isLocked ? (
                        <div className="flex space-x-2 pt-2">
                          <button
                            onClick={() => openRescheduleModal(itemId)}
                            className="w-1/2 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-lg transition cursor-pointer"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleCancel(itemId)}
                            className="w-1/2 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-xs text-gray-500 font-semibold py-2.5 bg-gray-100 rounded-lg border border-gray-200">
                          {isNonModifiable
                            ? `Request ${item.status}`
                            : "🔒 Locked (< 4h remaining)"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Pickup Request Modal */}
      <RequestPickupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRequestSuccess={fetchReports}
      />

      {/* Reschedule Modal */}
      {isRescheduleOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                Reschedule Waste Pickup
              </h3>
              <button
                onClick={() => setIsRescheduleOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    New Date
                  </label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    New Time
                  </label>
                  <input
                    type="time"
                    required
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <p className="text-[11px] text-gray-500">
                Must be scheduled at least 4 hours in advance.
              </p>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRescheduleOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduleLoading}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {rescheduleLoading ? "Rescheduling..." : "Confirm Reschedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
