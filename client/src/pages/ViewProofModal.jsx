// client/src/components/ViewProofModal.jsx
import React, { useState } from "react";
import api from "../api/axios"; // adjust path to match your axios instance location

const ViewProofModal = ({ report, onClose, onDisputeSuccess }) => {
  const [showDisputeInput, setShowDisputeInput] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!report || !report.proofOfCollection) return null;

  const { imageUrl, uploadedAt, location } = report.proofOfCollection;

  // Format timestamp (e.g., July 11, 2026 - 03:24 PM)
  const formattedDate = uploadedAt
    ? new Date(uploadedAt).toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  // Calculate 24-hour dispute limit window
  const completionTime = new Date(uploadedAt || report.updatedAt).getTime();
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  const isWithin24Hours = Date.now() - completionTime <= TWENTY_FOUR_HOURS;

  // Dispute Handler Function
  const handleRaiseDispute = async () => {
    if (!reason.trim()) {
      setErrorMsg("Please enter a reason for disputing.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");

      await api.post(`/reports/${report._id}/dispute`, { reason });

      alert(
        "Dispute submitted successfully! Case is locked for Admin/Supervisor investigation.",
      );

      if (onDisputeSuccess) {
        onDisputeSuccess();
      }
      onClose();
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          "Failed to raise dispute. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <h3 className="text-lg font-bold text-gray-900 break-all text-left">
            Proof of Collection — #{report._id}
          </h3>
          <span
            className={`shrink-0 px-3 py-1 text-xs font-semibold rounded-full ${
              report.isDisputed
                ? "bg-amber-100 text-amber-800 border border-amber-300"
                : "bg-blue-900 text-white"
            }`}
          >
            {report.isDisputed ? "Disputed" : "Completed"}
          </span>
        </div>

        <div className="p-6 text-center">
          {/* Cloudinary Image Box */}
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-100">
            <img
              src={imageUrl}
              alt="Proof of Collection"
              className="w-full h-64 object-cover"
            />
          </div>

          {/* Upload Tag */}
          <p className="text-xs text-gray-400 font-medium mt-2">
            Uploaded via Cloudinary API
          </p>

          {/* Original Metadata Block */}
          <div className="mt-3 text-xs text-gray-700 space-y-1 text-left bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p>
              <strong>Timestamp:</strong> {formattedDate}
            </p>
            {location?.latitude && location?.longitude && (
              <p>
                <strong>GPS Coordinates:</strong> {location.latitude.toFixed(4)}
                ° N, {location.longitude.toFixed(4)}° E
              </p>
            )}
          </div>

          {/* 24-Hour Dispute Integration */}
          {report.isDisputed ? (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-800 font-semibold text-center">
              🚨 Case Disputed — Locked Under Admin/Supervisor Investigation
            </div>
          ) : isWithin24Hours ? (
            !showDisputeInput ? (
              <button
                type="button"
                onClick={() => setShowDisputeInput(true)}
                className="mt-4 w-full text-xs text-red-600 hover:text-red-700 font-semibold underline text-center cursor-pointer"
              >
                Disagree with completion? Raise a Dispute (within 24h)
              </button>
            ) : (
              <div className="mt-4 space-y-2 bg-red-50 p-3 rounded-xl border border-red-100 text-left">
                <label className="text-xs font-semibold text-red-900 block">
                  Reason for Disagreement
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe why you disagree (e.g. waste still left behind)..."
                  className="w-full p-2.5 bg-white border border-red-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-red-500 transition"
                  rows={2}
                />

                {errorMsg && (
                  <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDisputeInput(false);
                      setErrorMsg("");
                    }}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRaiseDispute}
                    disabled={submitting}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition cursor-pointer"
                  >
                    {submitting ? "Submitting..." : "Submit Dispute"}
                  </button>
                </div>
              </div>
            )
          ) : (
            <p className="mt-4 text-xs text-gray-400">
              Dispute period closed (24 hours exceeded)
            </p>
          )}

          {/* Close Button */}
          <div className="mt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 rounded-xl font-semibold shadow-sm hover:shadow transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProofModal;
