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
        prev.map((p) => (p.type === type ? { ...p, [channel]: !newValue } : p)),
      );
      setError("Failed to save that change — please try again.");
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7faf7] flex items-center justify-center">
        <p className="text-gray-500 font-medium">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faf7] text-gray-800">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">
          Notification Settings
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Choose how you'd like to be notified for each type of alert.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3.5 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <span>Alert type</span>
            <span>In-app</span>
            <span>Email</span>
          </div>

          {preferences.map((pref) => (
            <div
              key={pref.type}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-4 last:pb-4.5"
            >
              <span className="text-sm font-medium text-gray-800">
                {pref.label}
              </span>

              <button
                onClick={() => toggle(pref.type, "inApp")}
                disabled={savingKey === `${pref.type}-inApp`}
                className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 cursor-pointer ${
                  pref.inApp ? "bg-emerald-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    pref.inApp ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>

              <button
                onClick={() => toggle(pref.type, "email")}
                disabled={savingKey === `${pref.type}-email`}
                className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 cursor-pointer ${
                  pref.email ? "bg-emerald-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    pref.email ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default NotificationSettings;
