import React, { useEffect } from 'react'
import { useAuth } from '../features/auth/hook/useAuth'
import { RouterProvider } from 'react-router'
import router from '../router/routes'
import { Toaster } from 'sonner'

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
        richColors
        closeButton
        duration={2500}
        theme="light"
        toastOptions={{
          style: {
            fontFamily: 'inherit',
            fontSize: '13px',
            borderRadius: '8px',
          },
        }}
      />
      <RouterProvider router={router} />
    </>
  )
}

export default App