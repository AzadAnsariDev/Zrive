import { useEffect } from 'react'
import { Navigate } from 'react-router'
import { useSelector } from 'react-redux'
import { useAdmin } from '../hook/useAdmin'
import { ProtectedAdminSkeleton } from '../../../components/common/Skeleton'

const ProtectedAdmin = ({ children }) => {
  const { isAuthenticated, authChecked, loading } = useSelector((state) => state.admin)
  const { handleGetAdminProfile } = useAdmin()

  useEffect(() => {
    if (!authChecked) {
      handleGetAdminProfile()
    }
  }, [authChecked])

  if (!authChecked) {
    return <ProtectedAdminSkeleton />
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default ProtectedAdmin