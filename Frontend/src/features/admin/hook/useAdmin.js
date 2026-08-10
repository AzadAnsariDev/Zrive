import { useDispatch } from 'react-redux'
import {
  adminLogin, adminLogout, getAdminProfile,
  getAllSellerApplications, getSellerApplicationDetail,
  approveSellerApplication, rejectSellerApplication,
} from '../services/admin.api'
import {
  setAdmin, clearAdmin, setLoading, setError,
  setSellers, setSelectedSeller, updateSellerInStore,
} from '../state/adminSlice'

export const useAdmin = () => {
  const dispatch = useDispatch()

  const handleGetAdminProfile = async () => {
    dispatch(setLoading({ key: 'fetch', value: true }))
    try {
      const data = await getAdminProfile()
      dispatch(setAdmin(data.admin))
      return true
    } catch (err) {
      dispatch(clearAdmin())
      dispatch(setError(err?.response?.data?.message || err.message))
      return false
    } finally {
      dispatch(setLoading({ key: 'fetch', value: false }))
    }
  }

  const handleAdminLogin = async ({ email, password }) => {
    dispatch(setLoading({ key: 'create', value: true }))
    dispatch(setError(null))
    try {
      const data = await adminLogin({ email, password })
      dispatch(setAdmin(data.admin))
      return true
    } catch (err) {
      dispatch(setError(err?.response?.data?.message || 'Login failed'))
      return false
    } finally {
      dispatch(setLoading({ key: 'create', value: false }))
    }
  }

  const handleAdminLogout = async () => {
    dispatch(setLoading({ key: 'create', value: true }))
    try {
      await adminLogout()
    } catch (err) {
      // ignore — local state clear kar denge chahe API fail ho
    } finally {
      dispatch(clearAdmin())
      dispatch(setLoading({ key: 'create', value: false }))
    }
  }

  const handleGetAllSellers = async () => {
    dispatch(setLoading({ key: 'fetch', value: true }))
    try {
      const data = await getAllSellerApplications()
      dispatch(setSellers(data.applications))
    } catch (err) {
      dispatch(setError(err?.response?.data?.message || err.message))
    } finally {
      dispatch(setLoading({ key: 'fetch', value: false }))
    }
  }

  const handleGetSellerDetail = async (sellerId) => {
    dispatch(setLoading({ key: 'fetch', value: true }))
    try {
      const data = await getSellerApplicationDetail(sellerId)
      dispatch(setSelectedSeller(data.seller))
    } catch (err) {
      dispatch(setError(err?.response?.data?.message || err.message))
    } finally {
      dispatch(setLoading({ key: 'fetch', value: false }))
    }
  }

  const handleApproveSeller = async (sellerId) => {
    dispatch(setLoading({ key: 'create', value: true }))
    try {
      await approveSellerApplication(sellerId)
      dispatch(updateSellerInStore({ _id: sellerId, applicationStatus: 'approved' }))
      return { success: true }
    } catch (err) {
      return { success: false, error: err?.response?.data?.message || 'Approval failed' }
    } finally {
      dispatch(setLoading({ key: 'create', value: false }))
    }
  }

  const handleRejectSeller = async (sellerId, rejectionReason) => {
    dispatch(setLoading({ key: 'create', value: true }))
    try {
      await rejectSellerApplication(sellerId, rejectionReason)
      dispatch(updateSellerInStore({ _id: sellerId, applicationStatus: 'rejected', rejectionReason }))
      return { success: true }
    } catch (err) {
      return { success: false, error: err?.response?.data?.message || 'Reject failed' }
    } finally {
      dispatch(setLoading({ key: 'create', value: false }))
    }
  }

  return {
    handleGetAdminProfile, handleAdminLogin, handleAdminLogout,
    handleGetAllSellers, handleGetSellerDetail, handleApproveSeller, handleRejectSeller,
  }
}