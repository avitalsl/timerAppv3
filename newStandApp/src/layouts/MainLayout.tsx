import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const MainLayout = () => {
  return (
    <div className="flex h-screen w-full" data-testid="layout-main">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 flex">
          <div className="w-2/3 pr-4">
            <Outlet />
          </div>
          <div className="w-1/3 pl-4">
            {/* Right container content will go here */}
          </div>
        </main>
      </div>
    </div>
  )
}

export default MainLayout
