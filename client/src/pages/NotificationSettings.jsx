import { useState, useEffect } from "react";
import api from "../api/axios";

function NotificationSettings() {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // tracks which specific toggle is mid-save, so we can show a subtle
  // loading state per-switch instead of blocking the whole page
  const [savingKey, setSavingKey] = useState(null);

  useEffect(() => {
    api
      .get("/notifications/preferences")
      .then((res) => setPreferences(res.data.preferences))
      .catch(() => setError("Failed to load notification settings"))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (type, channel) => {
    const current = preferences.find((p) => p.type === type);
    const newValue = !current[channel];
    const key = `${type}-${channel}`;

    setSavingKey(key);
    // optimistic update — flip it immediately, revert if the save fails
    setPreferences((prev) =>
      prev.map((p) => (p.type === type ? { ...p, [channel]: newValue } : p)),
    );

    try {
      await api.put(`/notifications/preferences/${type}`, {
        [channel]: newValue,
      });
    } catch {
      // revert on failure
      setPreferences((prev) =>
        prev.map((p) =>
          p.type === type ? { ...p, [channel]: !newValue } : p,
        ),
      );
      setError("Failed to save that change — please try again.");
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <p className="text-gray-500 text-center py-12">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">
        Notification Settings
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Choose how you'd like to be notified for each type of alert.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
        <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
          <span>Alert type</span>
          <span>In-app</span>
          <span>Email</span>
        </div>

        {preferences.map((pref) => (
          <div
            key={pref.type}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-4"
          >
            <span className="text-sm text-gray-800">{pref.label}</span>

            <button
              onClick={() => toggle(pref.type, "inApp")}
              disabled={savingKey === `${pref.type}-inApp`}
              className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${
                pref.inApp ? "bg-green-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  pref.inApp ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>

            <button
              onClick={() => toggle(pref.type, "email")}
              disabled={savingKey === `${pref.type}-email`}
              className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${
                pref.email ? "bg-green-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  pref.email ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotificationSettings;