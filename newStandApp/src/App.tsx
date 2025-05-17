// No need to import React with JSX transform in React 17+
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import SetupScreen from './pages/SetupScreen'
import MeetingScreen from './pages/MeetingScreen'

function App() {
  return (
    <Router>
      <div className="w-full min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<SetupScreen />} />
            <Route path="meeting" element={<MeetingScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App
