import React from 'react'
import { Outlet } from 'react-router'
import Navbar from '../home/components/Navbar'
import Footer from '../home/components/Footer'

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <Navbar />

      {/* pb-20 clears the fixed mobile bottom nav; desktop needs no extra
          bottom padding since its nav is sticky (in-flow), not fixed. */}
      <main className="pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default UserLayout