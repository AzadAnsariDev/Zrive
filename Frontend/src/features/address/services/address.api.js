import axios from "axios";

const addressApiInstance = axios.create({
  baseURL: "/api/address",
  withCredentials: true,
});

// Create Address
export const createAddress = async (addressData) => {
  const response = await addressApiInstance.post(
    "/createAddress",
    addressData
  );
  return response.data;
};

// Update Address
export const updateAddress = async (addressId, addressData) => {
  const response = await addressApiInstance.patch(
    `/updateAddress/${addressId}`,
    addressData
  );
  return response.data;
};

// Get All Addresses
export const getAllAddresses = async () => {
  const response = await addressApiInstance.get("/getAllAddresses");
  return response.data;
};

// Get Single Address
export const getAddressById = async (addressId) => {
  const response = await addressApiInstance.get(
    `/getAddress/${addressId}`
  );
  return response.data;
};

// Delete Address
export const deleteAddress = async (addressId) => {
  const response = await addressApiInstance.delete(
    `/deleteAddress/${addressId}`
  );
  return response.data;
};