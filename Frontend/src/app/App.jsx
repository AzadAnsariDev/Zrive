import React, { useEffect } from 'react'
import { useAuth } from '../features/auth/hook/useAuth'
import { RouterProvider } from 'react-router'
import router from '../router/routes'
import { Toaster } from "react-hot-toast";

const App = () => {
  const { handleGetMe } = useAuth()

  useEffect(() => {
    handleGetMe()
  }, [])
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000, // sab toasts ke liye default 2 sec
          // success: { duration: 2000 },
          // error: { duration: 2000 }, // 
        }} />
      <RouterProvider router={router} />
    </>
  )
}

export default App