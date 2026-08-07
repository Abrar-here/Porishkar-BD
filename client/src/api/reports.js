import api from "./axios";

// Create a new waste report
export const createReport = async (reportData) => {
  const res = await api.post("/reports", reportData);
  return res.data;
};

// Get all reports submitted by the logged-in citizen
export const getMyReports = async () => {
  const res = await api.get("/reports/my");
  return res.data;
};

// Get a single report by its Mongo _id
export const getReportById = async (id) => {
  const res = await api.get(`/reports/${id}`);
  return res.data;
};
