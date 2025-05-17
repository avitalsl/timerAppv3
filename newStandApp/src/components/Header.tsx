import React from 'react'
import { BellIcon, UserIcon } from 'lucide-react'

const Header = () => {
  return (
    <header 
      className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6"
      data-testid="component-header"
    >
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-800" data-testid="header-title">
          Meeting Time Manager
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <button 
          className="p-2 rounded-full hover:bg-gray-100"
          data-testid="header-notification-button"
        >
          <BellIcon className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex items-center" data-testid="header-user-profile">
          <div className="w-8 h-8 rounded-full bg-[#4a9fff] flex items-center justify-center text-white">
            <UserIcon className="h-5 w-5" />
          </div>
          <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
            John Doe
          </span>
        </div>
      </div>
    </header>
  )
}

export default Header
