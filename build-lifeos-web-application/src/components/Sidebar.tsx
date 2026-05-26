import { useState, memo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useClerk, useUser } from '@clerk/clerk-react'
import {
  Brain, LayoutDashboard, DollarSign,
  Mail, Briefcase, PenTool, Settings, Menu, X,
  ChevronUp, Zap, Link2, Sparkles, HelpCircle, LogOut
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
  { icon: DollarSign, label: 'Financial', path: '/dashboard/financial' },
  { icon: Mail, label: 'Email & DMs', path: '/dashboard/email' },
  { icon: Briefcase, label: 'Job Search', path: '/dashboard/jobs' },
  { icon: PenTool, label: 'Content', path: '/dashboard/content' },
]

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

const accountMenuStyle = {
  boxShadow: '0 -20px 40px rgba(0,0,0,0.4)'
}

function SidebarContent({
  navigate,
  location,
  setMobileOpen,
  user,
  signOut,
  showAccountMenu,
  setShowAccountMenu,
}: {
  navigate: (path: string) => void
  location: { pathname: string }
  setMobileOpen: (open: boolean) => void
  user: any
  signOut: () => void
  showAccountMenu: boolean
  setShowAccountMenu: (open: boolean) => void
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

      {/* Account Menu */}
      <div className="relative">
        <div
          onClick={function() { setShowAccountMenu(!showAccountMenu) }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-white/30 hover:text-white/60 transition-all duration-200 hover:bg-white/5"
        >
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-white/60 text-xs font-inter font-medium">
              {user?.firstName?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/60 text-xs font-inter font-medium truncate">
              {user?.firstName || 'User'}
            </p>
            <p className="text-white/30 text-xs font-inter truncate">
              {user?.emailAddresses?.[0]?.emailAddress || ''}
            </p>
          </div>
          <ChevronUp
            size={14}
            className={'text-white/30 transition-transform duration-200 ' + (showAccountMenu ? '' : 'rotate-180')}
          />
        </div>

        {/* Popup Menu */}
        <AnimatePresence>
          {showAccountMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full left-0 right-0 mb-2 liquid-glass rounded-2xl p-2 z-50"
              style={accountMenuStyle}
            >
              {/* User Card */}
              <div className="flex items-center gap-3 px-3 py-3 mb-1 border-b border-white/5">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-white/70 text-sm font-inter font-medium">
                    {user?.firstName?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-white/80 text-sm font-inter font-medium truncate">
                    {(user?.firstName || '') + ' ' + (user?.lastName || '')}
                  </p>
                  <p className="text-white/30 text-xs font-inter truncate">
                    {user?.emailAddresses?.[0]?.emailAddress || ''}
                  </p>
                </div>
              </div>

              {/* Menu Items */}
              {[
                {
                  icon: Zap,
                  label: 'Upgrade to Pro',
                  color: 'text-yellow-400/70',
                  action: function() { navigate('/') }
                },
                {
                  icon: Link2,
                  label: 'Linked Accounts',
                  color: 'text-white/50',
                  action: function() { navigate('/dashboard/settings?tab=accounts') }
                },
                {
                  icon: Brain,
                  label: 'Memories',
                  color: 'text-white/50',
                  action: function() { navigate('/dashboard/settings?tab=memories') }
                },
                {
                  icon: Sparkles,
                  label: "What's New",
                  color: 'text-white/50',
                  action: function() { navigate('/dashboard/settings?tab=whatsnew') }
                },
                {
                  icon: HelpCircle,
                  label: 'Support',
                  color: 'text-white/50',
                  action: function() { window.location.href = 'mailto:support@lifeos.app' }
                },
                {
                  icon: Settings,
                  label: 'Settings',
                  color: 'text-white/50',
                  action: function() { navigate('/dashboard/settings') }
                },
              ].map(function(item) {
                return (
                  <div
                    key={item.label}
                    onClick={function() {
                      item.action()
                      setShowAccountMenu(false)
                      setMobileOpen(false)
                    }}
                    className={'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/5 transition-all ' + item.color}
                  >
                    <item.icon size={15} />
                    <span className="text-sm font-inter">{item.label}</span>
                  </div>
                )
              })}

              {/* Sign Out */}
              <div className="border-t border-white/5 mt-1 pt-1">
                <div
                  onClick={function() {
                    signOut()
                    setShowAccountMenu(false)
                    setMobileOpen(false)
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/5 transition-all text-red-400/60 hover:text-red-400/80"
                >
                  <LogOut size={15} />
                  <span className="text-sm font-inter">Sign Out</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
  const { signOut } = useClerk()
  const { user } = useUser()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)

  const handleSetMobileOpen = useCallback(function(open: boolean) {
    setMobileOpen(open)
  }, [])

  const handleToggleMobile = useCallback(function() {
    setMobileOpen(function(prev) { return !prev })
  }, [])

  return (
    <>
      {/* DESKTOP SIDEBAR */}
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
          user={user}
          signOut={signOut}
          showAccountMenu={showAccountMenu}
          setShowAccountMenu={setShowAccountMenu}
        />
      </motion.aside>

      {/* MOBILE TOP BAR */}
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

      {/* MOBILE DRAWER */}
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
                user={user}
                signOut={signOut}
                showAccountMenu={showAccountMenu}
                setShowAccountMenu={setShowAccountMenu}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MOBILE BOTTOM NAV */}
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
