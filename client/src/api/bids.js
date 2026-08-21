import api from "./axios";


// Create bid
export const createBid = async (data) => {
  const response = await api.post("/bids", data);
  return response.data;
};



// Seller view bids
export const getListingBids = async (listingId) => {
  const response = await api.get(
    `/bids/listing/${listingId}`
  );

  return response.data;
};



// Accept bid
export const acceptBid = async (bidId) => {
  const response = await api.patch(
    `/bids/${bidId}/accept`
  );

  return response.data;
};



// Reject bid
export const rejectBid = async (bidId) => {
  const response = await api.patch(
    `/bids/${bidId}/reject`
  );

  return response.data;
};



// Buyer view own bids
export const getMyBids = async () => {
  const response = await api.get(
    "/bids/my"
  );

  return response.data;
};