import { useEffect } from 'react'
import { Navigate } from 'react-router'
import { useSelector } from 'react-redux'
import { useAdmin } from '../hook/useAdmin'

const ProtectedAdmin = ({ children }) => {
  const { isAuthenticated, authChecked, loading } = useSelector((state) => state.admin)
  const { handleGetAdminProfile } = useAdmin()

  useEffect(() => {
    if (!authChecked) {
      handleGetAdminProfile()
    }
  }, [authChecked])

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="text-[13px] text-ink-soft">Checking session...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default ProtectedAdmin