import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Financial from './pages/Financial'
import Email from './pages/Email'
import Jobs from './pages/Jobs'
import Content from './pages/Content'

function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/financial" element={<Financial />} />
        <Route path="/dashboard/email" element={<Email />} />
        <Route path="/dashboard/jobs" element={<Jobs />} />
        <Route path="/dashboard/content" element={<Content />} />
      </Routes>
    </AnimatePresence>
  )
}

export default App
