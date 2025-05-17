import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  ClockIcon,
  SettingsIcon,
  UsersIcon,
  LayoutDashboardIcon,
  CalendarIcon,
  HistoryIcon,
} from 'lucide-react'

const Sidebar = () => {
  return (
    <aside 
      className="w-16 md:w-64 bg-[#1a2a42] text-white flex flex-col"
      data-testid="component-sidebar"
    >
      <div className="p-4 flex items-center justify-center md:justify-start" data-testid="sidebar-logo">
        <ClockIcon className="h-8 w-8" />
        <span className="ml-2 text-xl font-bold hidden md:block">
          MeetingTime
        </span>
      </div>
      <nav className="flex-1 mt-6">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center py-3 px-4 ${isActive ? 'bg-[#2c4066] border-l-4 border-[#4a9fff]' : ''}`
          }
          end
          data-testid="sidebar-nav-link-home"
        >
          <SettingsIcon className="h-5 w-5" />
          <span className="ml-3 hidden md:block">Setup</span>
        </NavLink>
        <NavLink
          to="/meeting"
          className={({ isActive }) =>
            `flex items-center py-3 px-4 ${isActive ? 'bg-[#2c4066] border-l-4 border-[#4a9fff]' : ''}`
          }
          data-testid="sidebar-nav-link-meeting"
        >
          <LayoutDashboardIcon className="h-5 w-5" />
          <span className="ml-3 hidden md:block">Active Meeting</span>
        </NavLink>
        <div className="flex items-center py-3 px-4 text-gray-400">
          <UsersIcon className="h-5 w-5" />
          <span className="ml-3 hidden md:block">Participants</span>
        </div>
        <div className="flex items-center py-3 px-4 text-gray-400">
          <CalendarIcon className="h-5 w-5" />
          <span className="ml-3 hidden md:block">Schedule</span>
        </div>
        <div className="flex items-center py-3 px-4 text-gray-400">
          <HistoryIcon className="h-5 w-5" />
          <span className="ml-3 hidden md:block">History</span>
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar
