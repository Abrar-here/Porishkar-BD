import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import RequestPickupModal from "./RequestPickupModal";
import ViewProofModal from "./ViewProofModal";
import RecyclingCompanyDashboard from "./RecyclingCompanyDashboard";
import { Link } from "react-router-dom";

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

export default function Dashboard() {
  const { user } = useAuth();

  // 1. Get search params from URL
  const [searchParams] = useSearchParams();

  // Determine user role
  const isCollector =
    user?.role === "collector" ||
    user?.role === "Collector" ||
    user?.userType === "collector";

  // 2. Local activeTab state initialized from URL param (?tab=available or ?tab=assigned)
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "available",
  );

  // 1. Check if user is an Admin/Supervisor
  const isAdmin = user?.role === "admin" || user?.role === "Admin";

  // Recycling companies get an entirely separate dashboard (bids,
  // collections, intake stats) — none of the citizen/collector/admin
  // report-fetching logic below applies to them.
  const isRecyclingCompany =
    user?.role === "recycling_company" || user?.role === "Recycling Company";

  // 2. Add state for the Admin Investigation Modal
  const [investigationData, setInvestigationData] = useState(null);
  const [investigationLoading, setInvestigationLoading] = useState(false);

  // 3. Keep activeTab in sync when top navbar links are clicked
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // ... rest of your original Dashboard code remains completely untouched ...

  // Reports / pickups
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Request Pickup Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Reschedule Modal
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [wasteTypeFilter, setWasteTypeFilter] = useState("All");

  //F08
  // Proof Modal State for Collectors
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedProofReportId, setSelectedProofReportId] = useState(null);
  const [proofImage, setProofImage] = useState(null);
  const [proofUploading, setProofUploading] = useState(false);

  const [selectedProofReport, setSelectedProofReport] = useState(null);

  // Handle Complete Task Submission
  const handleCompleteWithProof = async (e) => {
    e.preventDefault();
    if (!proofImage || !selectedProofReportId) {
      alert("Please upload a proof image.");
      return;
    }

    try {
      setProofUploading(true);
      const formData = new FormData();
      formData.append("proofImage", proofImage);

      await api.patch(`/reports/${selectedProofReportId}/complete`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Task completed successfully!");
      setProofModalOpen(false);
      setProofImage(null);
      setSelectedProofReportId(null);
      fetchReports();
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to submit completion proof.",
      );
    } finally {
      setProofUploading(false);
    }
  };

  // Extract MongoDB ID
  const getMongoId = (idVal) => {
    if (!idVal) return "";

    if (typeof idVal === "object" && idVal.$oid) {
      return idVal.$oid;
    }

    return String(idVal);
  };

  // Safely parse MongoDB date
  const parseMongoDate = (dateVal) => {
    if (!dateVal) return null;

    const rawString =
      typeof dateVal === "object" && dateVal.$date ? dateVal.$date : dateVal;

    const parsed = new Date(rawString);

    return isNaN(parsed.getTime()) ? null : parsed;
  };

  // Format date
  const formatDateOnly = (dateVal) => {
    const parsedDate = parseMongoDate(dateVal);

    if (!parsedDate) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  // Check if request is locked within 4 hours
  const isReportLocked = (item) => {
    if (!item || !item.pickupDate) {
      return true;
    }

    try {
      const baseDate = parseMongoDate(item.pickupDate || item.createdAt);

      if (!baseDate) {
        return true;
      }

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

          if (ampm === "PM" && hours < 12) {
            hours += 12;
          }

          if (ampm === "AM" && hours === 12) {
            hours = 0;
          }
        }
      }

      const exactPickupTime = new Date(
        baseDate.getUTCFullYear(),
        baseDate.getUTCMonth(),
        baseDate.getUTCDate(),
        hours,
        minutes,
      ).getTime();

      const now = Date.now();

      return exactPickupTime - now < FOUR_HOURS_MS;
    } catch {
      return true;
    }
  };

  // Fetch reports based on role
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      let response;

      if (isAdmin) {
        response = await api.get("/reports");
      } else if (isCollector) {
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
        if (activeTab === "available") {
          setPickups(
            reportArray.filter((r) => r.status === "Reported" || !r.status),
          );
        } else {
          setPickups(reportArray.filter((r) => r.status === "Assigned"));
        }
      } else {
        setPickups(reportArray);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);

      if (err.response?.status === 403) {
        setError(
          "Access forbidden: Your account role does not have permission to view these reports.",
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

  useEffect(() => {
    fetchReports();
  }, [isCollector, isAdmin, activeTab]);

  // Status color
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

  // Filter requests
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
      (statusFilter === "Disputed" &&
        (item.status === "Disputed" ||
          item.status === "disputed" ||
          item.status === "Under Investigation" ||
          item.isDisputed)) ||
      item.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesType =
      wasteTypeFilter === "All" ||
      category.toLowerCase() === wasteTypeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  // Collector accepts pickup
  const handleAcceptPickup = async (reportId) => {
    try {
      await api.put(`/reports/${reportId}/accept`);

      alert(
        "Pickup task accepted successfully! It has been moved to your Assigned Tasks.",
      );

      setPickups((prev) =>
        prev.filter((p) => getMongoId(p._id || p.id) !== reportId),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept pickup task.");
    }
  };

  // Citizen cancels request
  const handleCancel = async (reportId) => {
    if (!reportId) {
      return;
    }

    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this pickup request?",
    );

    if (!confirmCancel) {
      return;
    }

    try {
      const response = await api.put(`/reports/${reportId}/cancel`);

      alert(response.data?.message || "Pickup request canceled successfully!");

      fetchReports();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to cancel pickup. Requests are locked within 4 hours of pickup time.",
      );
    }
  };

  // Open reschedule modal
  const openRescheduleModal = (reportId) => {
    setSelectedReportId(reportId);
    setRescheduleDate("");
    setRescheduleTime("");
    setIsRescheduleOpen(true);
  };

  const handleInvestigate = async (reportId) => {
    try {
      setInvestigationLoading(true);
      const res = await api.get(`/reports/${reportId}/investigate`);

      // Use API response or fallback to local item data if API lacks structure
      const reportItem = pickups.find(
        (p) => getMongoId(p._id || p.id) === reportId,
      );

      setInvestigationData({
        report: res.data?.report || reportItem || {},
        collectorInfo:
          res.data?.collectorInfo ||
          res.data?.collector ||
          reportItem?.assignedTo ||
          null,
      });
    } catch (err) {
      console.error("Investigation error:", err);
      // Fallback: search local report state so the admin can at least see local card details
      const reportItem = pickups.find(
        (p) => getMongoId(p._id || p.id) === reportId,
      );
      if (reportItem) {
        setInvestigationData({
          report: reportItem,
          collectorInfo: reportItem.assignedTo || null,
        });
      } else {
        alert(
          "Failed to load investigation details: " +
            (err.response?.data?.message || err.message),
        );
      }
    } finally {
      setInvestigationLoading(false);
    }
  };

  // Submit reschedule
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

      alert(
        response.data?.message || "Pickup request rescheduled successfully!",
      );

      setIsRescheduleOpen(false);
      setSelectedReportId(null);

      fetchReports();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reschedule pickup.");
    } finally {
      setRescheduleLoading(false);
    }
  };

  if (isRecyclingCompany) {
    return <RecyclingCompanyDashboard />;
  }

  return (
    <div className="min-h-screen bg-[#f7faf7] text-gray-800">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Banner */}
        <section className="bg-[#e8f5eb] rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center relative shadow-xs">
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
                : "Discover Household: Household Waste Management"}
            </p>

            {/* Request Pickup Button */}
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
            {/* Admin: Collector Performance Link */}
            {isAdmin && (
              <div className="pt-4">
                <Link
                  to="/admin/performance"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition duration-200 inline-flex items-center gap-2"
                >
                  <span>📊 Collector Performance</span>
                </Link>
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
              placeholder="Search pickup address or ID....."
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
              {/* Status Filter */}
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

                  <option value="Disputed">
                    🚨 Disputed / Under Investigation
                  </option>

                  <option value="assigned">Scheduled / Assigned</option>

                  <option value="reported">Reported (Pending)</option>

                  <option value="resolved">Resolved</option>
                </select>
              </div>

              {/* Waste Type Filter */}
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
                Loading pickup records from database...
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600 font-medium">
                {error}
              </div>
            ) : filteredPickups.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-500">
                {isAdmin
                  ? "No pickup requests found matching current filters."
                  : isCollector
                    ? activeTab === "available"
                      ? "No unassigned pickup requests available right now."
                      : "You do not have any assigned tasks currently."
                    : "No pickup requests found for your account."}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPickups.map((item) => {
                  const itemId = getMongoId(item._id || item.id);

                  const isLocked = isReportLocked(item);

                  const isNonModifiableStatus =
                    item.status === "Closed" ||
                    item.status === "Resolved" ||
                    item.status === "Completed" ||
                    item.status === "Cancelled";

                  return (
                    <div
                      key={itemId}
                      className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col justify-between space-y-4 shadow-sm"
                    >
                      {/* Date Header */}
                      <div className="bg-[#eaf5ed] p-4 rounded-xl space-y-1">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-md inline-block mb-1 ${getStatusBg(
                            item.status,
                          )}`}
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

                      {/* Details */}
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

                        {/* Reporter details */}
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

                      {/* Actions */}
                      {isAdmin &&
                      (item.status === "Disputed" ||
                        item.status === "disputed" ||
                        item.isDisputed) ? (
                        <button
                          onClick={() => handleInvestigate(itemId)}
                          disabled={investigationLoading}
                          className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-2.5 rounded-xl text-xs transition cursor-pointer"
                        >
                          🚨 Investigate Details
                        </button>
                      ) : isAdmin ? (
                        <div className="text-center text-xs text-gray-400 font-medium py-2 bg-gray-50 rounded-lg border border-gray-100">
                          No active disputes
                        </div>
                      ) : isCollector ? (
                        activeTab === "available" ? (
                          <button
                            onClick={() => handleAcceptPickup(itemId)}
                            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
                          >
                            Accept Pickup Task
                          </button>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-center text-xs text-emerald-800 font-semibold py-1.5 bg-emerald-100 rounded-lg">
                              ✓ Assigned to You
                            </div>

                            <button
                              onClick={() => {
                                setSelectedProofReportId(itemId);
                                setProofModalOpen(true);
                              }}
                              className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-lg transition cursor-pointer"
                            >
                              📷 Complete Task & Upload Proof
                            </button>
                          </div>
                        )
                      ) : item.status === "Completed" ||
                        item.status === "Resolved" ? (
                        /* 1. Show View Proof button when job is done */
                        <button
                          onClick={() => setSelectedProofReport(item)}
                          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
                        >
                          View Proof of Collection
                        </button>
                      ) : !isNonModifiableStatus && !isLocked ? (
                        /* 2. Show Reschedule & Cancel if report is active and unlocked */
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
                        /* 3. Fallback for locked or cancelled status */
                        <div className="text-center text-xs text-gray-500 font-semibold py-2.5 bg-gray-100 rounded-lg border border-gray-200">
                          {isNonModifiableStatus
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
      {/* Proof Upload Modal */}
      {proofModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                Upload Completion Proof
              </h3>
              <button
                onClick={() => {
                  setProofModalOpen(false);
                  setProofImage(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCompleteWithProof} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Proof Image (After Cleanup)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setProofImage(e.target.files[0])}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setProofModalOpen(false);
                    setProofImage(null);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={proofUploading}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {proofUploading ? "Uploading..." : "Submit Proof"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --- ADD THIS RIGHT HERE --- */}
      {selectedProofReport && (
        <ViewProofModal
          report={selectedProofReport}
          onClose={() => setSelectedProofReport(null)}
        />
      )}
      {/* Admin Investigation Modal */}
      {investigationData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                🚨 Investigation Details — #
                {getMongoId(
                  investigationData.report?._id || investigationData.report?.id,
                )?.slice(-6)}
              </h3>
              <button
                onClick={() => setInvestigationData(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-red-50 p-4 rounded-xl border border-red-200 space-y-1">
              <p className="text-xs font-bold text-red-900">Dispute Details:</p>
              <p className="text-xs text-red-800">
                <strong>Status:</strong>{" "}
                {investigationData.report?.status || "Under Investigation"}
              </p>
              <p className="text-xs text-red-800">
                <strong>Reporter Name:</strong>{" "}
                {investigationData.report?.reportedBy?.name || "N/A"}
              </p>
              <p className="text-xs text-red-800">
                <strong>Reporter Phone:</strong>{" "}
                {investigationData.report?.reportedBy?.phone || "N/A"}
              </p>
              <p className="text-xs text-red-800">
                <strong>Reason / Notes:</strong> "
                {investigationData.report?.disputeDetails?.reason ||
                  investigationData.report?.description ||
                  "No specific dispute reason supplied."}
                "
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 space-y-1.5">
              <p className="text-xs font-bold text-blue-900">
                Assigned Collector Info:
              </p>
              {investigationData.collectorInfo ? (
                <>
                  <p className="text-xs text-gray-800">
                    <strong>Name:</strong>{" "}
                    {investigationData.collectorInfo.name || "N/A"}
                  </p>
                  <p className="text-xs text-gray-800">
                    <strong>Phone:</strong>{" "}
                    {investigationData.collectorInfo.phone || "Not provided"}
                  </p>
                  <p className="text-xs text-gray-800">
                    <strong>Email:</strong>{" "}
                    {investigationData.collectorInfo.email || "N/A"}
                  </p>
                </>
              ) : (
                <p className="text-xs text-gray-500 italic">
                  No assigned collector found for this task.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInvestigationData(null)}
                className="px-5 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
