import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from '@clerk/clerk-react'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Financial from './pages/Financial'
import Email from './pages/Email'
import Jobs from './pages/Jobs'
import Content from './pages/Content'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Contact from './pages/Contact'
import Settings from './pages/Settings'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/40 text-sm">Loading...</div>
      </div>
    )
  }
  if (!isSignedIn) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

function HomeRoute() {
  const { isSignedIn, isLoaded } = useAuth()
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/40 text-sm">Loading...</div>
      </div>
    )
  }
  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />
  }
  return <LandingPage />
}

function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/financial" element={
          <ProtectedRoute>
            <Financial />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/email" element={
          <ProtectedRoute>
            <Email />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/jobs" element={
          <ProtectedRoute>
            <Jobs />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/content" element={
          <ProtectedRoute>
            <Content />
          </ProtectedRoute>
        } />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/contact" element={<Contact />} />
<Route path="/dashboard/settings" element={
  <ProtectedRoute>
    <Settings />
  </ProtectedRoute>
} />
      </Routes>
    </AnimatePresence>
  )
}

export default App
