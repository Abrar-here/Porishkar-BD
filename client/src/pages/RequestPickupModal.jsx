import React, { useState, useEffect } from "react";
import api from "../api/axios";

export default function RequestPickupModal({ isOpen, onClose, onRequestSuccess }) {
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
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [smsPreview, setSmsPreview] = useState("");

  // Reset the form and any leftover SMS/error banners each time the modal
  // is freshly opened, so a previous submission's data doesn't linger.
  useEffect(() => {
    if (isOpen) {
      setPickupDate(getTodayLocalDate());
      setPickupTime("09:00");
      setAddress("");
      setCategory("Household");
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
        parseInt(minutes)
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
        description: description || `Scheduled for ${pickupDate} at ${formattedTimeString}`,
        location: JSON.stringify(locationObj),
        pickupDate: combinedDateTime.toISOString(), // Standardized ISO timestamp
        pickupTime: formattedTimeString,             // 👈 REQUIRED BY BACKEND CONTROLLER
      };

      const res = await api.post("/reports", payload);

      setSubmitting(false);
      setSmsPreview(res.data.smsPreview || "");
      onRequestSuccess();
      // Keep the modal open briefly to show the demo SMS banner instead of
      // closing immediately — closes automatically after a short delay.
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f4f9f5] flex flex-col items-center justify-start py-8 px-4">
      <div className="w-full max-w-4xl space-y-8">
        
        {/* Banner */}
        <div className="bg-[#e7f4ea] text-[#13301a] text-center py-12 px-6 rounded-3xl shadow-xs border border-emerald-100 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-6 text-gray-500 hover:text-gray-800 text-2xl font-bold cursor-pointer"
          >
            ✕
          </button>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Schedule a New Household Waste Pickup
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-8 md:p-12 max-w-2xl mx-auto shadow-xs border border-gray-100">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Request Form</h2>

          {error && (
            <div className="mb-4 bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {smsPreview && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-700 font-medium mb-1">
                📱 Demo mode — SMS notification (no live provider connected yet)
              </p>
              <p className="text-sm text-yellow-800">{smsPreview}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pickup Date */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Select Pickup Date
                </label>
                <input
                  type="date"
                  required
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-[#f4f7f4] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Pickup Time */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Select Pickup Time
                </label>
                <input
                  type="time"
                  required
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full bg-[#f4f7f4] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Pickup Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Block B, House 12, Bashundhara R/A"
                className="w-full bg-[#f4f7f4] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Waste Type */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Select Waste Type
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#f4f7f4] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="Household">Household</option>
                <option value="Industrial">Industrial</option>
                <option value="Medical">Medical</option>
                <option value="Construction">Construction</option>
                <option value="Water Body Pollution">Water Body Pollution</option>
              </select>
            </div>

            {/* Additional Instructions */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Additional Instructions (Optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details regarding pickup location or specific items..."
                className="w-full bg-[#f4f7f4] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#0d7842] hover:bg-[#0a6336] text-white font-bold text-base py-3.5 rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
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