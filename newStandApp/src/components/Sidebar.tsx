// No React import needed with modern JSX transform
import { NavLink } from 'react-router-dom'
import {
  ClockIcon,
  SettingsIcon,
  UsersIcon,
  LinkIcon,
  CheckSquareIcon,
} from 'lucide-react'
import { useComponentVisibility } from '../hooks/useComponentVisibility';

const Sidebar = () => {
  const { visibilityConfig } = useComponentVisibility();
  const selectedFeatures = visibilityConfig?.visibleComponents || [];

  // 
  // Sidebar responsive states:
  // - Desktop: ≥1200px (desktop)
  // - Tablet: 900px–1199px (tablet)
  // - Mobile: <900px (default)
  // Uses custom Tailwind breakpoints defined in tailwind.config.js.
  //
  // To test responsive states:
  // - Desktop: viewport ≥1200px (desktop)
  // - Tablet: 900px–1199px (tablet)
  // - Mobile: <900px (default)
  // Use viewport resizing and Tailwind classes to verify state.
  //

  return (
    <aside
      className="
        w-16              // Mobile: <900px
        tablet:w-52       // Tablet: 900px–1199px
        desktop:w-56      // Desktop: ≥1200px
        bg-primary-dark text-white flex flex-col
        transition-all duration-300
      "
      data-testid="component-sidebar"
    >
      <div className="p-4 flex items-center justify-center md:justify-start" data-testid="sidebar-logo">
        <ClockIcon className="h-8 w-8" />
        <span className="ml-2 text-xl font-bold hidden tablet:block">
          MeetingTime
        </span>
      </div>
      <nav className="flex-1 mt-6" data-testid="sidebar-link-container">
        {/* Meeting Setup - Always visible */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center py-3 px-4 ${isActive ? 'bg-[#2c4066] border-l-4 border-[#4a9fff]' : ''}`
          }
          end
          data-testid="sidebar-nav-link-home"
        >
          <SettingsIcon className="h-5 w-5" />
          <span className="ml-3 hidden tablet:block" data-component-name="Sidebar">Meeting Setup</span>
        </NavLink>
        
        {/* Participants - Only visible if selected */}
        {selectedFeatures.includes('participants') && (
          <NavLink
            to="/participants"
            className={({ isActive }) =>
              `flex items-center py-3 px-4 ${isActive ? 'bg-[#2c4066] border-l-4 border-[#4a9fff]' : ''}`
            }
            data-testid="sidebar-nav-link-participants"
          >
            <UsersIcon className="h-5 w-5" />
            <span className="ml-3 hidden tablet:block">Participants</span>
          </NavLink>
        )}
        
        {/* Links - Only visible if selected */}
        {selectedFeatures.includes('links') && (
          <NavLink
            to="/links"
            className={({ isActive }) =>
              `flex items-center py-3 px-4 ${isActive ? 'bg-[#2c4066] border-l-4 border-[#4a9fff]' : ''}`
            }
            data-testid="sidebar-nav-link-links"
          >
            <LinkIcon className="h-5 w-5" />
            <span className="ml-3 hidden tablet:block">Set Links</span>
          </NavLink>
        )}
        
        {/* Checklist - Only visible if selected */}
        {selectedFeatures.includes('checklist') && (
          <NavLink
            to="/checklist"
            className={({ isActive }) =>
              `flex items-center py-3 px-4 ${isActive ? 'bg-[#2c4066] border-l-4 border-[#4a9fff]' : ''}`
            }
            data-testid="sidebar-nav-link-checklist"
          >
            <CheckSquareIcon className="h-5 w-5" />
            <span className="ml-3 hidden tablet:block">Checklist Time</span>
          </NavLink>
        )}
        
        {/* Kickoff link removed as it's now integrated into the SetupScreen */}
        {/* History section removed */}
      </nav>
    </aside>
  )
}

export default Sidebar
