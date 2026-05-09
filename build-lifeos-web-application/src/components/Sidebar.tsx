import { useNavigate, useLocation } from 'react-router-dom'
import { Brain, LayoutDashboard, DollarSign, Mail, Briefcase, PenTool, Settings } from 'lucide-react'
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
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed left-0 top-0 h-screen w-64 liquid-glass flex flex-col px-4 py-6 z-50"
      style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div
        className="flex items-center gap-3 px-2 mb-10 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <Brain size={24} className="text-white" />
        <span className="text-white font-semibold text-lg font-inter">LifeOS</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'liquid-glass text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={18} />
              <span className="text-sm font-inter">{item.label}</span>
            </div>
          )
        })}
      </nav>

      <div
        onClick={() => {}}
        className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-white/30 hover:text-white/60 transition-all duration-200"
      >
        <Settings size={18} />
        <span className="text-sm font-inter">Settings</span>
      </div>
    </motion.aside>
  )
}
