import React, { useEffect } from 'react'
import { useAuth } from '../features/auth/hook/useAuth'
import { RouterProvider } from 'react-router'
import router from '../router/routes'

const App = () => {
  const { handleGetMe } = useAuth()

  useEffect(()=>{
    handleGetMe()
  },[])
  return <RouterProvider router={router} />
}

export default App