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
import KickoffScreen from './components/KickoffScreen'

function App() {
  return (
    <Router>
      <div className="w-full min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<SetupScreen />} />
            <Route path="meeting" element={<TimerSetup />} />
            <Route path="participants" element={<Participants />} />
            <Route path="kickoff" element={<KickoffScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App
