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
    const result = await createAddress(addressData);

    if (result.success) {
      dispatch(addAddress(result.address));
    }

    return result;
  };

  // Get All
  const handleGetAllAddresses = async () => {
    const result = await getAllAddresses();

    if (result.success) {
      dispatch(setAddresses(result.addresses));
    }

    return result;
  };

  // Get One
  const handleGetAddressById = async (addressId) => {
    const result = await getAddressById(addressId);

    if (result.success) {
      dispatch(setSelectedAddress(result.address));
    }

    return result;
  };

  // Update
  const handleUpdateAddress = async (addressId, addressData) => {
    const result = await updateAddress(addressId ,addressData);

    if (result.success) {
      dispatch(updateAddressInStore(result.address));
    }

    return result;
  };

  // Delete
  const handleDeleteAddress = async (addressId) => {
    const result = await deleteAddress(addressId);

    if (result.success) {
      dispatch(deleteAddressInStore(addressId));
    }

    return result;
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