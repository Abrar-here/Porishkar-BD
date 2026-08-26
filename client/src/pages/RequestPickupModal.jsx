import React, { useState, useEffect } from "react";
import api from "../api/axios";

export default function RequestPickupModal({
  isOpen,
  onClose,
  onRequestSuccess,
}) {
  // Get today's local date in YYYY-MM-DD
  const getTodayLocalDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [pickupDate, setPickupDate] = useState(getTodayLocalDate());
  const [pickupTime, setPickupTime] = useState("09:00"); // Time input state
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("Household");
  const [estimatedVolume, setEstimatedVolume] = useState("Medium");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [smsPreview, setSmsPreview] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPickupDate(getTodayLocalDate());
      setPickupTime("09:00");
      setAddress("");
      setCategory("Household");
      setEstimatedVolume("Medium");
      setDescription("");
      setError("");
      setSmsPreview("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!pickupDate || !pickupTime) {
      setError("Please select both date and time.");
      setSubmitting(false);
      return;
    }

    try {
      // Parse local YYYY-MM-DD and HH:mm strictly into local JS Date
      const [year, month, day] = pickupDate.split("-");
      const [hours, minutes] = pickupTime.split(":");

      const combinedDateTime = new Date(
        parseInt(year),
        parseInt(month) - 1, // Month is 0-indexed in JS
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
      );

      if (isNaN(combinedDateTime.getTime())) {
        setError("Invalid date or time format.");
        setSubmitting(false);
        return;
      }

      // Convert 24h string (e.g., "09:00" or "14:30") to 12h display string (e.g., "09:00 AM")
      const formattedTimeString = combinedDateTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const locationObj = {
        lat: 23.8103,
        lng: 90.4125,
        address: address,
      };

      const payload = {
        category,
        estimatedVolume,
        description:
          description ||
          `Scheduled for ${pickupDate} at ${formattedTimeString}`,
        location: JSON.stringify(locationObj),
        pickupDate: combinedDateTime.toISOString(), // Standardized ISO timestamp
        pickupTime: formattedTimeString, // 👈 REQUIRED BY BACKEND CONTROLLER
      };

      const res = await api.post("/reports/pickup", payload);

      setSubmitting(false);
      setSmsPreview(res.data.smsPreview || "");
      onRequestSuccess();
      setTimeout(() => {
        onClose();
      }, 3500);
    } catch (err) {
      console.error("Failed to submit pickup request:", err);
      setError(err.response?.data?.message || "Failed to submit request.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-100 px-6 sm:px-8 py-5 sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Schedule a Pickup
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Request a household waste pickup
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-4 bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {smsPreview && (
            <div className="mb-4 bg-amber-50 border border-amber-100 rounded-lg p-3">
              <p className="text-xs text-amber-700 font-semibold mb-1">
                📱 SMS notification
              </p>
              <p className="text-sm text-amber-800">{smsPreview}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pickup Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Pickup Date
                </label>
                <input
                  type="date"
                  required
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>

              {/* Pickup Time */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Pickup Time
                </label>
                <input
                  type="time"
                  required
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Pickup Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Block B, House 12, Bashundhara R/A"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            {/* Waste Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Waste Type
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              >
                <option value="Household">Household</option>
                <option value="Industrial">Industrial</option>
                <option value="Medical">Medical</option>
                <option value="Construction">Construction</option>
                <option value="Water Body Pollution">
                  Water Body Pollution
                </option>
              </select>
            </div>

            {/* Estimated Volume */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Estimated Waste Volume
              </label>
              <select
                value={estimatedVolume}
                onChange={(e) => setEstimatedVolume(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              >
                <option value="Small">Small — a bag or two</option>
                <option value="Medium">Medium — several bags</option>
                <option value="Large">Large — overflowing or bulky</option>
              </select>
            </div>

            {/* Additional Instructions */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Additional Instructions (Optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details regarding pickup location or specific items..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Submitting..." : "Confirm & Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
