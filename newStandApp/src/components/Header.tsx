
import TopBarMeetingButton from './TopBarMeetingButton'

const Header = () => {
  return (
    <header 
      className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6"
      data-testid="component-header"
    >
      <div className="flex items-center">
        <h1 className="text-xl font-semibold" style={{ color: 'rgba(49, 114, 113, 1)' }} data-testid="header-title">
          Meeting Time Manager
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <TopBarMeetingButton data-testid="header-meeting-button" />

      </div>
    </header>
  )
}

export default Header
