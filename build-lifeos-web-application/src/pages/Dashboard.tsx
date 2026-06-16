import { motion, useInView, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useRef, useEffect, useState, useCallback } from 'react'
import { useClerk, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, Mail, DollarSign, PenTool, Briefcase, BarChart2, Zap
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { supabase } from '../lib/supabase'

// ─── Design Tokens ───
const tokens = {
  bg: '#050507',
  surface1: '#0c0c12',
  surface2: '#13131d',
  surface3: '#1b1b29',
  border: 'rgba(255,255,255,0.08)',
  textPrimary: '#f5f5f8',
  textDim: 'rgba(245,245,248,0.6)',
  textFaint: 'rgba(245,245,248,0.34)',
}

// ─── 3D Tilt Card ───
function TiltCard({ children, className, style }: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [4, -4]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-4, 4]), { stiffness: 300, damping: 30 })

  const handleMouse = useCallback(function(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }, [x, y])

  const handleLeave = useCallback(function() {
    x.set(0)
    y.set(0)
  }, [x, y])

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', ...style }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Glass Card ───
function GlassCard({ children, className, style, onClick }: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: tokens.surface1,
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Shine overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 50%)',
          pointerEvents: 'none',
        }}
      />
      {children}
    </div>
  )
}

export default function Dashboard() {
  const { signOut } = useClerk()
  const { user } = useUser()
  const navigate = useNavigate()

  const [transactions, setTransactions] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [emails, setEmails] = useState<any[]>([])
  const [content, setContent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(function() {
    if (!user) return
    const fetchData = async function() {
      setLoading(true)
      const [t, j, e, c] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('jobs').select('*').eq('user_id', user.id).order('applied_at', { ascending: false }),
        supabase.from('emails').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('content').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ])
      if (t.data) setTransactions(t.data)
      if (j.data) setJobs(j.data)
      if (e.data) setEmails(e.data)
      if (c.data) setContent(c.data)
      setLoading(false)
    }
    fetchData()
  }, [user])

  const totalSpend = transactions.reduce(function(sum, t) {
    return sum + Number(t.amount || 0)
  }, 0)

  const stats = [
    {
      label: 'Total Spend',
      value: loading ? '...' : '$' + totalSpend.toFixed(0),
      sub: transactions.length + ' transactions',
      icon: DollarSign,
      color: '#a78bfa',
    },
    {
      label: 'Email Drafts',
      value: loading ? '...' : String(emails.length),
      sub: 'AI drafted and saved',
      icon: Mail,
      color: '#22d3ee',
    },
    {
      label: 'Jobs Applied',
      value: loading ? '...' : String(jobs.length),
      sub: 'Applications tracked',
      icon: Briefcase,
      color: '#f0abfc',
    },
    {
      label: 'Posts Saved',
      value: loading ? '...' : String(content.length),
      sub: 'Content scheduled',
      icon: PenTool,
      color: '#a78bfa',
    },
  ]

  const buildRealActivity = function() {
    const items: any[] = []
    transactions.slice(0, 2).forEach(function(t) {
      items.push({
        icon: DollarSign,
        text: 'Transaction recorded: ' + t.name + ' — $' + Number(t.amount).toFixed(2) + ' (' + t.category + ')',
        time: new Date(t.created_at).toLocaleDateString(),
        badge: 'Done',
        accent: '#a78bfa',
      })
    })
    jobs.slice(0, 2).forEach(function(j) {
      items.push({
        icon: Briefcase,
        text: 'Job tracked: ' + j.role + ' at ' + j.company + ' — ' + j.status,
        time: new Date(j.applied_at).toLocaleDateString(),
        badge: j.status,
        accent: '#22d3ee',
      })
    })
    emails.slice(0, 2).forEach(function(e) {
      items.push({
        icon: Mail,
        text: 'AI draft saved: Re: ' + e.subject + ' — To: ' + e.sender,
        time: new Date(e.created_at).toLocaleDateString(),
        badge: 'Review',
        accent: '#f0abfc',
      })
    })
    content.slice(0, 2).forEach(function(c) {
      items.push({
        icon: PenTool,
        text: 'Post on ' + c.platform + ': ' + c.post_text.slice(0, 60) + '...',
        time: new Date(c.created_at).toLocaleDateString(),
        badge: 'Scheduled',
        accent: '#a78bfa',
      })
    })
    return items.slice(0, 5)
  }

  const buildComingUp = function() {
    const items: any[] = []
    content
      .filter(function(c) { return c.scheduled_at && new Date(c.scheduled_at) > new Date() })
      .slice(0, 2)
      .forEach(function(c) {
        items.push({
          text: 'Post on ' + c.platform + ': ' + c.post_text.slice(0, 40) + '...',
          time: new Date(c.scheduled_at).toLocaleDateString(),
          accent: '#a78bfa',
        })
      })
    jobs
      .filter(function(j) { return j.status === 'Applied' || j.status === 'Interview' })
      .slice(0, 2)
      .forEach(function(j) {
        items.push({
          text: j.status === 'Interview'
            ? 'Interview prep: ' + j.role + ' at ' + j.company
            : 'Follow up: ' + j.role + ' at ' + j.company,
          time: j.status === 'Interview' ? 'Upcoming' : 'This week',
          accent: j.status === 'Interview' ? '#22d3ee' : '#f0abfc',
        })
      })
    emails
      .filter(function(e) { return e.status === 'draft' })
      .slice(0, 1)
      .forEach(function(e) {
        items.push({
          text: 'Send reply: Re: ' + e.subject,
          time: 'Pending',
          accent: '#22d3ee',
        })
      })
    return items.slice(0, 5)
  }

  const realActivity = buildRealActivity()
  const comingUpItems = buildComingUp()

  const quickActions = [
    { icon: Mail, label: 'Email Assistant', desc: 'Draft and send', action: function() { navigate('/dashboard/email') }, color: '#22d3ee' },
    { icon: Briefcase, label: 'Find Jobs', desc: 'Search and apply', action: function() { navigate('/dashboard/jobs') }, color: '#a78bfa' },
    { icon: PenTool, label: 'Create Content', desc: 'Generate posts', action: function() { navigate('/dashboard/content') }, color: '#f0abfc' },
    { icon: BarChart2, label: 'View Finances', desc: 'Track spending', action: function() { navigate('/dashboard/financial') }, color: '#a78bfa' },
  ]

  const getGreeting = function() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{ background: tokens.bg, minHeight: '100vh' }}
    >
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: '400px', height: '400px',
            background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)',
            top: '-50px', left: '-50px',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '300px', height: '300px',
            background: 'radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%)',
            bottom: '20%', right: '-50px',
            filter: 'blur(40px)',
          }}
        />
      </div>

      <Sidebar />

      <main
        className="ml-0 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 pb-24 md:pb-8 relative z-10"
      >
        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4"
        >
          <div>
            <h1
              className="font-instrument text-3xl md:text-4xl"
              style={{ color: tokens.textPrimary, fontStyle: 'italic' }}
            >
              {getGreeting()},{' '}
              <span
                style={{
                  backgroundImage: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {user?.firstName || 'there'}.
              </span>
            </h1>
            <p className="font-inter text-sm mt-1" style={{ color: tokens.textFaint }}>
              {loading
                ? 'Loading your data...'
                : realActivity.length > 0
                ? 'Here is what your agents have been doing.'
                : 'Start using your modules to see activity here.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className="font-inter text-sm hidden sm:block"
              style={{ color: tokens.textFaint }}
            >
              {user?.emailAddresses[0]?.emailAddress}
            </span>
            <button
              type="button"
              className="rounded-full p-3 transition-colors"
              style={{
                background: tokens.surface1,
                border: '1px solid rgba(255,255,255,0.08)',
                color: tokens.textFaint,
              }}
            >
              <Bell size={18} />
            </button>
            <button
              type="button"
              onClick={function() { signOut() }}
              className="rounded-full px-5 py-2.5 font-inter text-sm transition-all"
              style={{
                background: tokens.surface1,
                border: '1px solid rgba(255,255,255,0.08)',
                color: tokens.textFaint,
              }}
            >
              Sign Out
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(function(stat, i) {
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <TiltCard
                  className="rounded-2xl p-6 cursor-default"
                  style={{ background: tokens.surface1, border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <p
                      className="font-inter text-xs tracking-widest uppercase"
                      style={{ color: tokens.textFaint }}
                    >
                      {stat.label}
                    </p>
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: stat.color + '20', border: '1px solid ' + stat.color + '30' }}
                    >
                      <stat.icon size={13} style={{ color: stat.color }} />
                    </div>
                  </div>
                  <p
                    className="font-instrument text-4xl leading-none mb-2"
                    style={{
                      fontStyle: 'italic',
                      backgroundImage: 'linear-gradient(135deg, ' + stat.color + ', #f5f5f8)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {stat.value}
                  </p>
                  <p className="font-inter text-xs" style={{ color: tokens.textFaint }}>
                    {stat.sub}
                  </p>
                </TiltCard>
              </motion.div>
            )
          })}
        </div>

        {/* Agent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-3xl p-6 md:p-8 mb-6"
          style={{
            background: tokens.surface1,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-inter text-lg font-medium" style={{ color: tokens.textPrimary }}>
              Agent Activity
            </h2>
            <div
              className="flex items-center gap-2 rounded-full px-4 py-1.5"
              style={{
                background: tokens.surface2,
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span className="font-inter text-xs" style={{ color: tokens.textFaint }}>Live</span>
              <motion.span
                className="w-2 h-2 rounded-full bg-green-400"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(function(i) {
                return (
                  <div
                    key={i}
                    className="h-12 rounded-xl animate-pulse"
                    style={{ background: tokens.surface2 }}
                  />
                )
              })}
            </div>
          ) : realActivity.length === 0 ? (
            <div className="text-center py-12">
              <Zap size={40} className="mx-auto mb-4" style={{ color: 'rgba(167,139,250,0.2)' }} />
              <p className="font-inter text-sm mb-2" style={{ color: tokens.textFaint }}>
                No activity yet.
              </p>
              <p className="font-inter text-xs" style={{ color: 'rgba(245,245,248,0.2)' }}>
                Start using Financial, Jobs, Email, and Content modules.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {realActivity.map(function(item, i) {
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl transition-all"
                    style={{ background: 'transparent' }}
                    onMouseEnter={function(e) {
                      e.currentTarget.style.background = tokens.surface2
                    }}
                    onMouseLeave={function(e) {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: item.accent + '15',
                        border: '1px solid ' + item.accent + '25',
                      }}
                    >
                      <item.icon size={14} style={{ color: item.accent }} />
                    </div>
                    <p
                      className="font-inter text-sm flex-1 min-w-0 truncate"
                      style={{ color: tokens.textDim }}
                    >
                      {item.text}
                    </p>
                    <span
                      className="font-inter text-xs flex-shrink-0 hidden sm:block"
                      style={{ color: tokens.textFaint }}
                    >
                      {item.time}
                    </span>
                    <span
                      className="font-inter text-xs px-3 py-1 rounded-full flex-shrink-0"
                      style={{
                        background: item.accent + '15',
                        color: item.accent,
                        border: '1px solid ' + item.accent + '25',
                      }}
                    >
                      {item.badge}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-3xl p-6 md:p-8"
            style={{
              background: tokens.surface1,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <h2 className="font-inter text-lg font-medium mb-6" style={{ color: tokens.textPrimary }}>
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(function(action) {
                return (
                  <motion.button
                    key={action.label}
                    type="button"
                    onClick={action.action}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl text-center transition-all cursor-pointer"
                    style={{
                      background: tokens.surface2,
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                    onMouseEnter={function(e) {
                      e.currentTarget.style.borderColor = action.color + '40'
                      e.currentTarget.style.background = action.color + '08'
                    }}
                    onMouseLeave={function(e) {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                      e.currentTarget.style.background = tokens.surface2
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: action.color + '15',
                        border: '1px solid ' + action.color + '25',
                      }}
                    >
                      <action.icon size={18} style={{ color: action.color }} />
                    </div>
                    <div>
                      <p
                        className="font-inter text-xs font-medium"
                        style={{ color: tokens.textDim }}
                      >
                        {action.label}
                      </p>
                      <p
                        className="font-inter text-xs mt-0.5"
                        style={{ color: tokens.textFaint }}
                      >
                        {action.desc}
                      </p>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>

          {/* Coming Up */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="rounded-3xl p-6 md:p-8"
            style={{
              background: tokens.surface1,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <h2 className="font-inter text-lg font-medium mb-6" style={{ color: tokens.textPrimary }}>
              Coming Up
            </h2>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(function(i) {
                  return (
                    <div
                      key={i}
                      className="h-10 rounded-xl animate-pulse"
                      style={{ background: tokens.surface2 }}
                    />
                  )
                })}
              </div>
            ) : comingUpItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="font-inter text-sm mb-2" style={{ color: tokens.textFaint }}>
                  Nothing scheduled yet.
                </p>
                <p className="font-inter text-xs" style={{ color: 'rgba(245,245,248,0.2)' }}>
                  Add jobs, schedule content, and save email drafts.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {comingUpItems.map(function(item, i) {
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex justify-between items-center p-3 rounded-xl transition-all"
                      style={{ background: 'transparent' }}
                      onMouseEnter={function(e) {
                        e.currentTarget.style.background = tokens.surface2
                      }}
                      onMouseLeave={function(e) {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: item.accent }}
                        />
                        <span
                          className="font-inter text-sm truncate"
                          style={{ color: tokens.textDim }}
                        >
                          {item.text}
                        </span>
                      </div>
                      <span
                        className="font-inter text-xs flex-shrink-0 ml-4"
                        style={{ color: tokens.textFaint }}
                      >
                        {item.time}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </motion.div>
  )
}
