import React, { useEffect } from 'react'
import { useAuth } from '../features/auth/hook/useAuth'
import { RouterProvider } from 'react-router'
import router from '../router/routes'
import { Toaster } from "react-hot-toast";

const App = () => {
  const { handleGetMe } = useAuth()

  useEffect(() => {
    handleGetMe()
    const theme = localStorage.getItem('zrive_theme')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
        }}
      />
      <RouterProvider router={router} />
    </>
  )
}

export default App