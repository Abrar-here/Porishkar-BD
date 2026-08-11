import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app startup, if a token exists, fetch the current user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .get("/auth/me")
        .then((res) => setUser(res.data.user))
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Register a new account
  const register = async (formData) => {
    const res = await api.post("/auth/register", formData);
    return res.data;
  };

  // Log in and store the token + user
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  // Log out
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // Request an OTP be sent to a phone number (registration verification)
  const sendOtp = async (phone) => {
    const res = await api.post("/auth/send-otp", { phone });
    return res.data;
  };

  // Verify a submitted OTP (registration verification)
  const verifyOtp = async (phone, otp) => {
    const res = await api.post("/auth/verify-otp", { phone, otp });
    return res.data;
  };

  // Request a password reset OTP be sent to a phone number
  const forgotPassword = async (phone) => {
    const res = await api.post("/auth/forgot-password", { phone });
    return res.data;
  };

  // Submit OTP + new password to complete a password reset
  const resetPassword = async (phone, otp, newPassword) => {
    const res = await api.post("/auth/reset-password", {
      phone,
      otp,
      newPassword,
    });
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        sendOtp,
        verifyOtp,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook so components can do: const { user, login } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}