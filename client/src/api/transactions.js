import api from "./axios";

// Recycling company: view own transactions (as buyer)
export const getMyTransactions = async () => {
  const response = await api.get("/transactions/my");
  return response.data;
};

// Recycling company: intake statistics for the dashboard
export const getMyIntakeStats = async () => {
  const response = await api.get("/transactions/my-stats");
  return response.data;
};

// Recycling company: confirm physical collection of materials
export const confirmCollection = async (transactionId) => {
  const response = await api.patch(
    `/transactions/${transactionId}/confirm-collection`,
  );
  return response.data;
};

// Citizen: confirm receipt of payment for a completed transaction
export const confirmReceipt = async (transactionId) => {
  const response = await api.patch(
    `/transactions/${transactionId}/confirm-receipt`,
  );
  return response.data;
};
