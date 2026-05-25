import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { useClerk, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, Mail, DollarSign, PenTool, Briefcase, BarChart2
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { supabase } from '../lib/supabase'

function useAnimateInView() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  return { ref, isInView }
}

export default function Dashboard() {
  const { ref: statsRef, isInView: statsInView } = useAnimateInView()
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
      sub: transactions.length + ' transactions tracked'
    },
    {
      label: 'Email Drafts',
      value: loading ? '...' : String(emails.length),
      sub: 'AI drafted and saved'
    },
    {
      label: 'Jobs Applied',
      value: loading ? '...' : String(jobs.length),
      sub: 'Applications tracked'
    },
    {
      label: 'Posts Saved',
      value: loading ? '...' : String(content.length),
      sub: 'Content scheduled'
    },
  ]

  // Build REAL agent activity from actual database data
  const buildRealActivity = function() {
    const items: any[] = []

    // Recent transactions
    transactions.slice(0, 2).forEach(function(t) {
      items.push({
        icon: DollarSign,
        text: 'Transaction recorded: ' + t.name + ' — $' + Number(t.amount).toFixed(2) + ' (' + t.category + ')',
        time: new Date(t.created_at).toLocaleDateString(),
        badge: 'Done',
        color: 'text-green-400/60',
      })
    })

    // Recent jobs
    jobs.slice(0, 2).forEach(function(j) {
      items.push({
        icon: Briefcase,
        text: 'Job tracked: ' + j.role + ' at ' + j.company + ' — Status: ' + j.status,
        time: new Date(j.applied_at).toLocaleDateString(),
        badge: j.status,
        color: 'text-blue-400/60',
      })
    })

    // Recent email drafts
    emails.slice(0, 2).forEach(function(e) {
      items.push({
        icon: Mail,
        text: 'AI draft saved: Re: ' + e.subject + ' — To: ' + e.sender,
        time: new Date(e.created_at).toLocaleDateString(),
        badge: 'Review',
        color: 'text-yellow-400/60',
      })
    })

    // Recent content
    content.slice(0, 2).forEach(function(c) {
      items.push({
        icon: PenTool,
        text: 'Post scheduled on ' + c.platform + ': ' + c.post_text.slice(0, 60) + '...',
        time: new Date(c.created_at).toLocaleDateString(),
        badge: 'Scheduled',
        color: 'text-purple-400/60',
      })
    })

    // Sort by most recent and take top 5
    return items.slice(0, 5)
  }

  const realActivity = buildRealActivity()

  // Build REAL coming up from database
  const buildComingUp = function() {
    const items: any[] = []

    // Upcoming scheduled content
    content
      .filter(function(c) { return c.scheduled_at && new Date(c.scheduled_at) > new Date() })
      .slice(0, 3)
      .forEach(function(c) {
        items.push({
          text: 'Post on ' + c.platform + ': ' + c.post_text.slice(0, 40) + '...',
          time: new Date(c.scheduled_at).toLocaleDateString(),
          dot: 'bg-purple-400/60',
        })
      })

    // Jobs that need follow up
    jobs
      .filter(function(j) { return j.status === 'Applied' || j.status === 'Interview' })
      .slice(0, 2)
      .forEach(function(j) {
        items.push({
          text: j.status === 'Interview'
            ? 'Interview prep: ' + j.role + ' at ' + j.company
            : 'Follow up: ' + j.role + ' at ' + j.company,
          time: j.status === 'Interview' ? 'Upcoming' : 'This week',
          dot: j.status === 'Interview' ? 'bg-green-400/60' : 'bg-yellow-400/60',
        })
      })

    // Email drafts to send
    emails
      .filter(function(e) { return e.status === 'draft' })
      .slice(0, 2)
      .forEach(function(e) {
        items.push({
          text: 'Send reply: Re: ' + e.subject,
          time: 'Pending',
          dot: 'bg-blue-400/60',
        })
      })

    return items.slice(0, 5)
  }

  const comingUpItems = buildComingUp()

  // Quick Actions with real navigation
  const quickActions = [
    {
      icon: Mail,
      label: 'Email Assistant',
      action: function() { navigate('/dashboard/email') },
      desc: 'Draft and send emails'
    },
    {
      icon: Briefcase,
      label: 'Find Jobs',
      action: function() { navigate('/dashboard/jobs') },
      desc: 'Search and apply'
    },
    {
      icon: PenTool,
      label: 'Create Content',
      action: function() { navigate('/dashboard/content') },
      desc: 'Generate posts'
    },
    {
      icon: BarChart2,
      label: 'View Finances',
      action: function() { navigate('/dashboard/financial') },
      desc: 'Track spending'
    },
  ]

  const getGreeting = function() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-black min-h-screen"
    >
      <Sidebar />
      <main className="ml-0 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 pb-24 md:pb-8">

        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="font-instrument text-3xl text-white">
              {getGreeting()}, {user?.firstName || 'there'}.
            </h1>
            <p className="text-white/40 text-sm font-inter mt-1">
              {loading
                ? 'Loading your data...'
                : realActivity.length > 0
                ? 'Here is what your agents have been doing.'
                : 'Start using your modules to see activity here.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/40 text-sm font-inter hidden sm:block">
              {user?.emailAddresses[0]?.emailAddress}
            </span>
            <div className="liquid-glass rounded-full p-3 text-white/60 hover:text-white cursor-pointer transition-colors">
              <Bell size={18} />
            </div>
            <button
              type="button"
              onClick={function() { signOut() }}
              className="liquid-glass rounded-full px-5 py-2.5 text-white/50 text-sm hover:text-white transition-all font-inter"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats */}
       <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
  {stats.map(function(stat, i) {
    return (
      <motion.div
        key={stat.label}
        initial={{ opacity: 0, y: 30 }}
        animate={statsInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: i * 0.1 }}
        whileHover={{ scale: 1.02, y: -4 }}
        className="liquid-glass rounded-2xl p-6 hover:bg-white/[0.02] transition-all cursor-default"
      >
        <p className="text-white/40 text-xs tracking-widest uppercase mb-3 font-inter">
          {stat.label}
        </p>
        <p className="font-instrument text-4xl text-white font-light mb-1">
          {stat.value}
        </p>
        <p className="text-white/30 text-xs font-inter">{stat.sub}</p>
      </motion.div>
    )
  })}
</div>
        {/* Agent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="liquid-glass rounded-3xl p-6 md:p-8 mb-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-lg font-medium font-inter">
              Agent Activity
            </h2>
            <div className="liquid-glass rounded-full px-4 py-1.5 flex items-center gap-2">
              <span className="text-white/60 text-xs font-inter">Live</span>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
          </div>

          {loading ? (
            <p className="text-white/30 text-sm font-inter py-4">Loading activity...</p>
          ) : realActivity.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/30 text-sm font-inter mb-2">
                No activity yet.
              </p>
              <p className="text-white/20 text-xs font-inter">
                Start using Financial, Jobs, Email, and Content modules to see real activity here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {realActivity.map(function(item, i) {
                return (
                  <div key={i} className="flex items-start gap-4 py-5">
                    <div className="liquid-glass rounded-full p-2.5 flex-shrink-0">
                      <item.icon size={16} className={'text-white/60 ' + (item.color || '')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-sm font-inter font-medium">
                        {item.text}
                      </p>
                      <p className="text-white/30 text-xs mt-1 font-inter">
                        {item.time}
                      </p>
                    </div>
                    <div className="liquid-glass rounded-full px-3 py-1 flex-shrink-0">
                      <span className="text-white/50 text-xs font-inter">
                        {item.badge}
                      </span>
                    </div>
                  </div>
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
            className="liquid-glass rounded-3xl p-6 md:p-8"
          >
            <h2 className="text-white text-lg font-medium mb-6 font-inter">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(function(action) {
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={action.action}
                    className="liquid-glass rounded-2xl p-5 flex flex-col items-center gap-3 text-center hover:bg-white/5 transition-all cursor-pointer group"
                  >
                    <action.icon
                      size={24}
                      className="text-white/50 group-hover:text-white/80 transition-colors"
                    />
                    <div>
                      <p className="text-white/60 text-xs font-inter font-medium group-hover:text-white/80 transition-colors">
                        {action.label}
                      </p>
                      <p className="text-white/30 text-xs font-inter mt-0.5">
                        {action.desc}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Coming Up */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="liquid-glass rounded-3xl p-6 md:p-8"
          >
            <h2 className="text-white text-lg font-medium mb-6 font-inter">
              Coming Up
            </h2>

            {loading ? (
              <p className="text-white/30 text-sm font-inter">Loading...</p>
            ) : comingUpItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/30 text-sm font-inter mb-2">
                  Nothing scheduled yet.
                </p>
                <p className="text-white/20 text-xs font-inter">
                  Add jobs, schedule content, and save email drafts to see upcoming tasks here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {comingUpItems.map(function(item, i) {
                  return (
                    <div key={i} className="flex justify-between items-center py-4">
                      <div className="flex items-center gap-3">
                        <span className={'w-1.5 h-1.5 rounded-full flex-shrink-0 ' + (item.dot || 'bg-white/30')} />
                        <span className="text-white/70 text-sm font-inter">
                          {item.text}
                        </span>
                      </div>
                      <span className="text-white/30 text-xs font-inter flex-shrink-0 ml-4">
                        {item.time}
                      </span>
                    </div>
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
