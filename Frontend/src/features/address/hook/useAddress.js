import { useDispatch } from "react-redux";
import {
  createAddress,
  updateAddress,
  getAllAddresses,
  getAddressById,
  deleteAddress,
} from "../services/address.api";

import {
  addAddress,
  setAddresses,
  setSelectedAddress,
  updateAddressInStore,
  deleteAddressInStore,
} from "../state/addressSlice";

const useAddress = () => {
  const dispatch = useDispatch();

  // Create
  const handleCreateAddress = async (addressData) => {
    try {
      const result = await createAddress(addressData);

      if (result.success) {
        dispatch(addAddress(result.address));
        return result.address;
      }

      return null;
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  // Get All
  const handleGetAllAddresses = async () => {
    try {
      const result = await getAllAddresses();

      if (result.success) {
        dispatch(setAddresses(result.addresses));
      }

      return result;
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  // Get One
  const handleGetAddressById = async (addressId) => {
    try {
      const result = await getAddressById(addressId);

      if (result.success) {
        dispatch(setSelectedAddress(result.address));
      }

      return result;
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  // Update
  const handleUpdateAddress = async (addressId, addressData) => {
    try {
      const result = await updateAddress(addressId, addressData);

      if (result.success) {
        dispatch(updateAddressInStore(result.address));
        return result.address;
      }

      return null;
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  // Delete
  const handleDeleteAddress = async (addressId) => {
    try {
      const result = await deleteAddress(addressId);

      if (result.success) {
        dispatch(deleteAddressInStore(addressId));
        return true;
      }

      return null;
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  return {
    handleCreateAddress,
    handleGetAllAddresses,
    handleGetAddressById,
    handleUpdateAddress,
    handleDeleteAddress,
  };
};

export default useAddress;