import React from 'react'
import { Outlet } from 'react-router'
import Navbar from '../home/components/Navbar'

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      {/* pb-20 clears the fixed mobile bottom nav; desktop needs no extra
          bottom padding since its nav is sticky (in-flow), not fixed. */}
      <main className="pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  )
}

export default UserLayout