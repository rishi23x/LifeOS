import { useState, memo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Brain, LayoutDashboard, DollarSign,
  Mail, Briefcase, PenTool, Settings, Menu, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
  { icon: DollarSign, label: 'Financial', path: '/dashboard/financial' },
  { icon: Mail, label: 'Email & DMs', path: '/dashboard/email' },
  { icon: Briefcase, label: 'Job Search', path: '/dashboard/jobs' },
  { icon: PenTool, label: 'Content', path: '/dashboard/content' },
]

// Extracted outside component to prevent re-creation on every render
const desktopStyle = {
  background: 'rgba(255,255,255,0.01)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRight: '1px solid rgba(255,255,255,0.06)',
  boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.04), 4px 0 24px rgba(0,0,0,0.3)',
}

const mobileTopStyle = {
  background: 'rgba(0,0,0,0.8)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
}

const drawerStyle = {
  background: 'rgba(8,8,8,0.98)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRight: '1px solid rgba(255,255,255,0.08)',
}

const bottomNavStyle = {
  background: 'rgba(0,0,0,0.9)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderTop: '1px solid rgba(255,255,255,0.06)',
}

const dividerStyle = {
  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)'
}

const activeStyle = {
  background: 'rgba(255,255,255,0.06)',
  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)',
  borderLeft: '2px solid rgba(255,255,255,0.3)',
}

function SidebarContent({
  navigate,
  location,
  setMobileOpen,
}: {
  navigate: (path: string) => void
  location: { pathname: string }
  setMobileOpen: (open: boolean) => void
}) {
  return (
    <div className="flex flex-col h-full px-4 py-6">
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-2 mb-10 cursor-pointer group"
        onClick={function() { navigate('/'); setMobileOpen(false) }}
      >
        <div className="liquid-glass rounded-xl p-2 group-hover:scale-110 transition-transform duration-300">
          <Brain size={20} className="text-white" />
        </div>
        <span className="text-white font-semibold text-lg font-inter tracking-tight">
          LifeOS
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1">
        {navItems.map(function(item, i) {
          const isActive = location.pathname === item.path
          return (
            <motion.div
              key={item.path}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              onClick={function() { navigate(item.path); setMobileOpen(false) }}
              whileHover={{ x: 6, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={
                'flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors duration-200 ' +
                (isActive ? 'text-white' : 'text-white/40 hover:text-white/80')
              }
              style={isActive ? activeStyle : {}}
            >
              <item.icon size={18} />
              <span className="text-sm font-inter font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.div>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="w-full h-px mb-4" style={dividerStyle} />

      {/* Settings */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-white/30 hover:text-white/60 transition-all duration-200">
        <Settings size={18} />
        <span className="text-sm font-inter">Settings</span>
      </div>

      <div className="px-4 mt-3">
        <span className="text-white/15 text-xs font-inter">LifeOS v1.0</span>
      </div>
    </div>
  )
}

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSetMobileOpen = useCallback(function(open: boolean) {
    setMobileOpen(open)
  }, [])

  const handleToggleMobile = useCallback(function() {
    setMobileOpen(function(prev) { return !prev })
  }, [])

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <motion.aside
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col z-50"
        style={desktopStyle}
      >
        <SidebarContent
          navigate={navigate}
          location={location}
          setMobileOpen={handleSetMobileOpen}
        />
      </motion.aside>

      {/* ── MOBILE TOP BAR ── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4"
        style={mobileTopStyle}
      >
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={function() { navigate('/dashboard') }}
        >
          <Brain size={20} className="text-white" />
          <span className="text-white font-semibold text-base font-inter">LifeOS</span>
        </div>
        <button
          type="button"
          onClick={handleToggleMobile}
          className="liquid-glass rounded-full p-2 text-white/60 hover:text-white transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.7)' }}
              onClick={function() { setMobileOpen(false) }}
            />
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="md:hidden fixed left-0 top-0 h-screen w-72 z-50"
              style={drawerStyle}
            >
              <SidebarContent
                navigate={navigate}
                location={location}
                setMobileOpen={handleSetMobileOpen}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-3"
        style={bottomNavStyle}
      >
        {navItems.map(function(item) {
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              type="button"
              onClick={function() { navigate(item.path); setMobileOpen(false) }}
              className={
                'flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ' +
                (isActive ? 'text-white' : 'text-white/30 hover:text-white/60')
              }
            >
              <item.icon size={20} />
              <span className="font-inter" style={{ fontSize: '9px' }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </>
  )
}

export default memo(Sidebar)
