import { useNavigate, useLocation } from 'react-router-dom'
import {
  Brain, LayoutDashboard, DollarSign,
  Mail, Briefcase, PenTool, Settings
} from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
  { icon: DollarSign, label: 'Financial', path: '/dashboard/financial' },
  { icon: Mail, label: 'Email & DMs', path: '/dashboard/email' },
  { icon: Briefcase, label: 'Job Search', path: '/dashboard/jobs' },
  { icon: PenTool, label: 'Content', path: '/dashboard/content' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      className="fixed left-0 top-0 h-screen w-64 flex flex-col px-4 py-6 z-50"
      style={{
        background: 'rgba(255,255,255,0.01)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.04), 4px 0 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Logo */}
      <motion.div
        className="flex items-center gap-3 px-2 mb-10 cursor-pointer group"
        onClick={function() { navigate('/') }}
        whileHover={{ x: 4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <div
          className="liquid-glass rounded-xl p-2 group-hover:scale-110 transition-transform duration-300"
          style={{ boxShadow: '0 0 20px rgba(255,255,255,0.05)' }}
        >
          <Brain size={20} className="text-white" />
        </div>
        <span className="text-white font-semibold text-lg font-inter tracking-tight">
          LifeOS
        </span>
      </motion.div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1">
        {navItems.map(function(item, i) {
          const isActive = location.pathname === item.path
          return (
            <motion.div
              key={item.path}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                duration: 0.4,
                delay: i * 0.08,
                ease: [0.34, 1.56, 0.64, 1]
              }}
              onClick={function() { navigate(item.path) }}
              whileHover={{ x: 6, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={
                'flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors duration-200 ' +
                (isActive
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/80')
              }
              style={isActive ? {
                background: 'rgba(255,255,255,0.06)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 0 20px rgba(255,255,255,0.03)',
                borderLeft: '2px solid rgba(255,255,255,0.3)',
              } : {}}
            >
              <motion.div
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <item.icon size={18} />
              </motion.div>
              <span className="text-sm font-inter font-medium">{item.label}</span>

              {/* Active indicator dot */}
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

      {/* Bottom divider */}
      <div className="glass-divider mb-4" />

      {/* Settings */}
      <motion.div
        onClick={function() {}}
        whileHover={{ x: 6, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-white/30 hover:text-white/60 transition-colors duration-200"
      >
        <Settings size={18} />
        <span className="text-sm font-inter">Settings</span>
      </motion.div>

      {/* Version tag */}
      <div className="px-4 mt-3">
        <span className="text-white/15 text-xs font-inter">LifeOS v1.0</span>
      </div>
    </motion.aside>
  )
}
