// No need to import React with JSX transform in React 17+
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import SetupScreen from './pages/SetupScreen'
import TimerSetup from './pages/TimerSetup'
import Participants from './pages/Participants'
import LinksSetup from './pages/LinksSetup'
import ChecklistTime from './pages/ChecklistTime'
import KickoffScreen from './components/KickoffScreen'
import { MeetingProvider } from './contexts/MeetingContext';
import { ComponentVisibilityProvider } from './hooks/ComponentVisibilityProvider';
import { UserProvider } from './contexts/UserContext';

function App() {
  return (
    <UserProvider>
      <Router>
        <MeetingProvider>
          <ComponentVisibilityProvider>
          <div className="w-full min-h-screen bg-gray-100">
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<SetupScreen />} />
                <Route path="meeting" element={<TimerSetup />} />
                <Route path="participants" element={<Participants />} />
                <Route path="links" element={<LinksSetup />} />
                <Route path="checklist" element={<ChecklistTime />} />
                <Route path="kickoff" element={<KickoffScreen />} />
              <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </div>
          </ComponentVisibilityProvider>
        </MeetingProvider>
      </Router>
    </UserProvider>
  )
}

export default App
