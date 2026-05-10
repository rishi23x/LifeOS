import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useClerk, useUser } from '@clerk/clerk-react'
import {
  Bell, User, Mail, DollarSign, PenTool, Briefcase, BarChart2
} from 'lucide-react'
import Sidebar from '../components/Sidebar'

function useAnimateInView() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  return { ref, isInView }
}

const stats = [
  { label: 'Money Saved', value: '$342', sub: 'This month by AI' },
  { label: 'Emails Handled', value: '47', sub: 'Drafted automatically' },
  { label: 'Jobs Applied', value: '12', sub: 'Last 7 days' },
  { label: 'Posts Scheduled', value: '28', sub: 'Next 30 days' },
]

const activities = [
  { icon: Mail, text: 'Drafted reply to job offer from Google', time: '2 minutes ago', badge: 'Review' },
  { icon: DollarSign, text: 'Cancelled unused Adobe subscription — saved $29.99/month', time: '1 hour ago', badge: 'Done' },
  { icon: PenTool, text: 'Posted LinkedIn article — 312 impressions so far', time: '3 hours ago', badge: 'View' },
  { icon: Briefcase, text: 'Applied to Senior Developer role at Stripe', time: '5 hours ago', badge: 'Review' },
  { icon: DollarSign, text: 'Weekly financial report is ready for review', time: '8 hours ago', badge: 'Open' },
]

const quickActions = [
  { icon: Mail, label: 'Send Email' },
  { icon: Briefcase, label: 'Apply to Job' },
  { icon: PenTool, label: 'Create Post' },
  { icon: BarChart2, label: 'View Report' },
]

const comingUp = [
  { text: 'Post Instagram reel', time: 'Tomorrow 9am' },
  { text: 'Follow-up email to Amazon HR', time: 'In 2 days' },
  { text: 'Monthly budget review', time: 'In 4 days' },
  { text: 'LinkedIn article scheduled', time: 'Friday 11am' },
  { text: 'Resume update reminder', time: 'Next Monday' },
]

export default function Dashboard() {
  const { ref: statsRef, isInView: statsInView } = useAnimateInView()
  const { signOut } = useClerk()
  const { user } = useUser()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-black min-h-screen"
    >
      <Sidebar />
      <main className="ml-0 md:ml-64 p-4 md:p-8">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="font-instrument text-3xl text-white">
  Good morning, {user?.firstName || 'there'}.
</h1>
            <p className="text-white/40 text-sm font-inter mt-1">Here is what your agents did while you slept.</p>
          </div>
          <div className="flex items-center gap-3">
  <span className="text-white/40 text-sm font-inter hidden sm:block">
    {user?.emailAddresses[0]?.emailAddress}
  </span>
  <div className="liquid-glass rounded-full p-3 text-white/60 hover:text-white cursor-pointer transition-colors">
    <Bell size={18} />
  </div>
  <button
    onClick={() => signOut()}
    className="liquid-glass rounded-full px-5 py-2.5 text-white/50 text-sm hover:text-white transition-all font-inter"
  >
    Sign Out
  </button>
</div>
        </div>

        {/* Stats */}
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.01 }}
              className="liquid-glass rounded-2xl p-6 hover:bg-white/[0.02] transition-all"
            >
              <p className="text-white/40 text-xs tracking-widest uppercase mb-3 font-inter">{stat.label}</p>
              <p className="font-instrument text-4xl text-white font-light mb-1">{stat.value}</p>
              <p className="text-white/30 text-xs font-inter">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Agent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="liquid-glass rounded-3xl p-6 md:p-8 mb-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-lg font-medium font-inter">Agent Activity</h2>
            <div className="liquid-glass rounded-full px-4 py-1.5 flex items-center gap-2">
              <span className="text-white/60 text-xs font-inter">Live</span>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {activities.map((item, i) => (
              <div key={i} className="flex items-start gap-4 py-5">
                <div className="liquid-glass rounded-full p-2.5 flex-shrink-0">
                  <item.icon size={16} className="text-white/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm font-inter font-medium">{item.text}</p>
                  <p className="text-white/30 text-xs mt-1 font-inter">{item.time}</p>
                </div>
                <div className="liquid-glass rounded-full px-3 py-1 flex-shrink-0">
                  <span className="text-white/50 text-xs font-inter">{item.badge}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="liquid-glass rounded-3xl p-6 md:p-8"
          >
            <h2 className="text-white text-lg font-medium mb-6 font-inter">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <div
                  key={action.label}
                  className="liquid-glass rounded-2xl p-5 flex flex-col items-center gap-3 text-center hover:bg-white/5 transition-all cursor-pointer group"
                >
                  <action.icon size={24} className="text-white/50 group-hover:text-white/80 transition-colors" />
                  <span className="text-white/50 text-xs font-inter group-hover:text-white/70 transition-colors">{action.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Coming Up */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="liquid-glass rounded-3xl p-6 md:p-8"
          >
            <h2 className="text-white text-lg font-medium mb-6 font-inter">Coming Up</h2>
            <div className="divide-y divide-white/5">
              {comingUp.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-4">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                    <span className="text-white/70 text-sm font-inter">{item.text}</span>
                  </div>
                  <span className="text-white/30 text-xs font-inter flex-shrink-0 ml-4">{item.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </motion.div>
  )
}
