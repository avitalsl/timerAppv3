// No React import needed with modern JSX transform
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const MainLayout = () => {
  return (
    <div className="flex h-screen w-full" data-testid="layout-main">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 flex justify-center">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default MainLayout
