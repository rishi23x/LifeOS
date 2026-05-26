import { motion } from 'framer-motion'
import { useState } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Bell, CreditCard, BarChart2, Brain,
  Sparkles, User, Mail, Briefcase,
  DollarSign, PenTool, LogOut, Trash2,
  Check, ArrowLeft
} from 'lucide-react'
import Sidebar from '../components/Sidebar'

const tabs = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'subscription', label: 'Subscription', icon: CreditCard },
  { key: 'usage', label: 'Usage', icon: BarChart2 },
  { key: 'memories', label: 'Memories', icon: Brain },
  { key: 'accounts', label: 'Linked Accounts', icon: Mail },
  { key: 'preferences', label: 'Preferences', icon: Sparkles },
  { key: 'whatsnew', label: "What's New", icon: Sparkles },
]

export default function SettingsPage() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'profile'
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [notifications, setNotifications] = useState({
    emailDigest: true,
    jobAlerts: true,
    budgetAlerts: true,
    contentReminders: false,
    weeklyReport: true,
  })
  const [currency, setCurrency] = useState('USD')
  const [language, setLanguage] = useState('English')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-black min-h-screen"
    >
      <Sidebar />
      <main className="ml-0 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 pb-24 md:pb-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            type="button"
            onClick={function() { navigate('/dashboard') }}
            className="liquid-glass rounded-full p-2 text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-instrument text-3xl text-white">Settings</h1>
            <p className="text-white/40 text-sm font-inter mt-1">
              Manage your account and preferences
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* Sidebar Tabs */}
          <div className="md:col-span-1">
            <div className="liquid-glass rounded-2xl p-2 space-y-1">
              {tabs.map(function(tab) {
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={function() { setActiveTab(tab.key) }}
                    className={
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-inter transition-all text-left ' +
                      (activeTab === tab.key
                        ? 'bg-white/8 text-white'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5')
                    }
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                )
              })}

              {/* Sign Out */}
              <div className="pt-2 mt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={function() { signOut() }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-inter transition-all text-red-400/50 hover:text-red-400/80 hover:bg-white/5"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3 space-y-6">

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="liquid-glass rounded-3xl p-8">
                  <h2 className="text-white text-lg font-medium mb-6 font-inter">
                    Profile
                  </h2>

                  {/* Avatar */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="text-white text-3xl font-instrument">
                        {user?.firstName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium font-inter">
                        {user?.firstName + ' ' + (user?.lastName || '')}
                      </p>
                      <p className="text-white/40 text-sm font-inter">
                        {user?.emailAddresses[0]?.emailAddress}
                      </p>
                      <span className="liquid-glass rounded-full px-3 py-1 text-white/50 text-xs font-inter mt-2 inline-block">
                        Free Plan
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-white/40 text-xs uppercase tracking-widest font-inter mb-2 block">
                        Full Name
                      </label>
                      <div className="liquid-glass rounded-full px-5 py-3">
                        <input
                          defaultValue={user?.firstName + ' ' + (user?.lastName || '')}
                          className="bg-transparent text-white/70 text-sm font-inter outline-none w-full"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-white/40 text-xs uppercase tracking-widest font-inter mb-2 block">
                        Email
                      </label>
                      <div className="liquid-glass rounded-full px-5 py-3">
                        <input
                          defaultValue={user?.emailAddresses[0]?.emailAddress}
                          disabled
                          className="bg-transparent text-white/40 text-sm font-inter outline-none w-full cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="liquid-glass rounded-3xl p-8 border border-red-400/10">
                  <h2 className="text-red-400/70 text-lg font-medium mb-4 font-inter">
                    Danger Zone
                  </h2>
                  <p className="text-white/30 text-sm font-inter mb-4">
                    Once you delete your account, all your data will be permanently removed.
                  </p>
                  <button
                    type="button"
                    className="liquid-glass rounded-full px-6 py-3 text-red-400/60 text-sm font-inter hover:bg-white/5 transition-all flex items-center gap-2 border border-red-400/20"
                  >
                    <Trash2 size={14} />
                    Delete Account
                  </button>
                </div>
              </motion.div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="liquid-glass rounded-3xl p-8"
              >
                <h2 className="text-white text-lg font-medium mb-6 font-inter">
                  Notifications
                </h2>
                <div className="space-y-4">
                  {[
                    { key: 'emailDigest', label: 'Daily Email Digest', desc: 'Get a daily summary of your AI activity' },
                    { key: 'jobAlerts', label: 'Job Alerts', desc: 'Notify when new jobs match your profile' },
                    { key: 'budgetAlerts', label: 'Budget Alerts', desc: 'Alert when spending exceeds limits' },
                    { key: 'contentReminders', label: 'Content Reminders', desc: 'Remind when posts need to be published' },
                    { key: 'weeklyReport', label: 'Weekly Report', desc: 'Get your weekly life summary every Monday' },
                  ].map(function(notif) {
                    return (
                      <div
                        key={notif.key}
                        className="flex items-center justify-between py-4 border-b border-white/5 last:border-0"
                      >
                        <div>
                          <p className="text-white/80 text-sm font-inter font-medium">
                            {notif.label}
                          </p>
                          <p className="text-white/30 text-xs font-inter mt-0.5">
                            {notif.desc}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={function() {
                            setNotifications(function(prev) {
                              return { ...prev, [notif.key]: !prev[notif.key as keyof typeof prev] }
                            })
                          }}
                          className={
                            'w-12 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ' +
                            (notifications[notif.key as keyof typeof notifications]
                              ? 'bg-white/20'
                              : 'bg-white/5')
                          }
                        >
                          <div
                            className={
                              'absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ' +
                              (notifications[notif.key as keyof typeof notifications]
                                ? 'left-7'
                                : 'left-1')
                            }
                          />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* SUBSCRIPTION TAB */}
            {activeTab === 'subscription' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="liquid-glass rounded-3xl p-8">
                  <h2 className="text-white text-lg font-medium mb-6 font-inter">
                    Current Plan
                  </h2>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-white text-2xl font-instrument">Free Plan</p>
                      <p className="text-white/40 text-sm font-inter mt-1">$0/month</p>
                    </div>
                    <span className="liquid-glass rounded-full px-4 py-2 text-white/50 text-xs font-inter">
                      Active
                    </span>
                  </div>

                  <div className="space-y-2 mb-6">
                    {[
                      '100 AI actions per month',
                      '10 email drafts per month',
                      '5 job applications per month',
                      '10 content posts per month',
                      'Basic financial tracking',
                    ].map(function(feature) {
                      return (
                        <div key={feature} className="flex items-center gap-3">
                          <Check size={14} className="text-white/30" />
                          <span className="text-white/50 text-sm font-inter">{feature}</span>
                        </div>
                      )
                    })}
                  </div>

                  <button
                    type="button"
                    className="bg-white rounded-full px-8 py-3.5 text-black text-sm font-semibold hover:bg-white/90 transition-all w-full"
                  >
                    Upgrade to Pro — $29/month
                  </button>
                </div>

                {/* Pro Plan Preview */}
                <div className="liquid-glass rounded-3xl p-8 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-white font-instrument text-xl">Pro Plan</p>
                    <p className="text-white/60 font-inter">$29/month</p>
                  </div>
                  <div className="space-y-2">
                    {[
                      'Unlimited AI actions',
                      'Unlimited email drafts',
                      'Unlimited job applications',
                      'Unlimited content posts',
                      'Advanced financial insights',
                      'Priority AI processing',
                    ].map(function(feature) {
                      return (
                        <div key={feature} className="flex items-center gap-3">
                          <Check size={14} className="text-white/60" />
                          <span className="text-white/60 text-sm font-inter">{feature}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* USAGE TAB */}
            {activeTab === 'usage' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="liquid-glass rounded-3xl p-8"
              >
                <h2 className="text-white text-lg font-medium mb-6 font-inter">
                  Usage This Month
                </h2>
                <div className="space-y-6">
                  {[
                    { label: 'AI Actions', used: 47, total: 100, icon: Brain },
                    { label: 'Email Drafts', used: 3, total: 10, icon: Mail },
                    { label: 'Job Applications', used: 2, total: 5, icon: Briefcase },
                    { label: 'Content Posts', used: 6, total: 10, icon: PenTool },
                    { label: 'Financial Transactions', used: 12, total: 999, icon: DollarSign },
                  ].map(function(item) {
                    const percent = Math.min((item.used / item.total) * 100, 100)
                    const isLow = percent > 80
                    return (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <item.icon size={14} className="text-white/40" />
                            <span className="text-white/70 text-sm font-inter">
                              {item.label}
                            </span>
                          </div>
                          <span className={'text-xs font-inter ' + (isLow ? 'text-red-400/70' : 'text-white/40')}>
                            {item.used} / {item.total === 999 ? '∞' : item.total}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={'h-full rounded-full transition-all duration-500 ' + (isLow ? 'bg-red-400/60' : 'bg-white/30')}
                            style={{ width: item.total === 999 ? '10%' : percent + '%' }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-8 liquid-glass rounded-2xl p-4">
                  <p className="text-white/40 text-xs font-inter text-center">
                    Usage resets on the 1st of each month.
                    Upgrade to Pro for unlimited access.
                  </p>
                </div>
              </motion.div>
            )}

            {/* MEMORIES TAB */}
            {activeTab === 'memories' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="liquid-glass rounded-3xl p-8"
              >
                <h2 className="text-white text-lg font-medium mb-2 font-inter">
                  AI Memories
                </h2>
                <p className="text-white/40 text-sm font-inter mb-6">
                  Things LifeOS has learned about you to personalize your experience.
                </p>

                <div className="space-y-3">
                  {[
                    { category: 'Career', memory: 'Looking for Frontend Developer roles in tech companies' },
                    { category: 'Finance', memory: 'Monthly budget focused on reducing entertainment spend' },
                    { category: 'Content', memory: 'Posts about AI and technology perform best for you' },
                    { category: 'Email', memory: 'Prefers concise professional replies under 100 words' },
                  ].map(function(mem, i) {
                    return (
                      <div
                        key={i}
                        className="liquid-glass rounded-2xl p-4 flex items-start justify-between gap-4"
                      >
                        <div>
                          <span className="text-white/30 text-xs uppercase tracking-widest font-inter">
                            {mem.category}
                          </span>
                          <p className="text-white/70 text-sm font-inter mt-1">
                            {mem.memory}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="text-white/20 hover:text-red-400/60 transition-colors flex-shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )
                  })}
                </div>

                <button
                  type="button"
                  className="liquid-glass rounded-full px-6 py-3 text-red-400/50 text-sm font-inter hover:bg-white/5 transition-all mt-6 flex items-center gap-2 border border-red-400/10"
                >
                  <Trash2 size={14} />
                  Clear All Memories
                </button>
              </motion.div>
            )}

            {/* LINKED ACCOUNTS TAB */}
            {activeTab === 'accounts' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="liquid-glass rounded-3xl p-8"
              >
                <h2 className="text-white text-lg font-medium mb-6 font-inter">
                  Linked Accounts
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      name: 'Gmail',
                      desc: 'Read and draft emails',
                      logo: 'https://www.google.com/s2/favicons?domain=gmail.com&sz=32',
                      connected: true,
                    },
                    {
                      name: 'Google',
                      desc: 'Sign in with Google',
                      logo: 'https://www.google.com/s2/favicons?domain=google.com&sz=32',
                      connected: true,
                    },
                    {
                      name: 'LinkedIn',
                      desc: 'Job applications and content',
                      logo: 'https://www.google.com/s2/favicons?domain=linkedin.com&sz=32',
                      connected: false,
                    },
                    {
                      name: 'Twitter / X',
                      desc: 'Content publishing',
                      logo: 'https://www.google.com/s2/favicons?domain=x.com&sz=32',
                      connected: false,
                    },
                    {
                      name: 'Instagram',
                      desc: 'Content publishing',
                      logo: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=32',
                      connected: false,
                    },
                  ].map(function(account) {
                    return (
                      <div
                        key={account.name}
                        className="flex items-center justify-between py-4 border-b border-white/5 last:border-0"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={account.logo}
                            alt={account.name}
                            className="w-8 h-8 rounded-lg"
                          />
                          <div>
                            <p className="text-white/80 text-sm font-inter font-medium">
                              {account.name}
                            </p>
                            <p className="text-white/30 text-xs font-inter">
                              {account.desc}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={
                            'liquid-glass rounded-full px-4 py-1.5 text-xs font-inter transition-all ' +
                            (account.connected
                              ? 'text-red-400/50 hover:text-red-400/70 border border-red-400/10'
                              : 'text-white/50 hover:text-white/70')
                          }
                        >
                          {account.connected ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="liquid-glass rounded-3xl p-8"
              >
                <h2 className="text-white text-lg font-medium mb-6 font-inter">
                  Preferences
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-widest font-inter mb-2 block">
                      Default Currency
                    </label>
                    <select
                      value={currency}
                      onChange={function(e) { setCurrency(e.target.value) }}
                      className="liquid-glass rounded-full px-5 py-3 bg-black text-white/70 outline-none text-sm font-inter cursor-pointer w-full"
                    >
                      <option value="USD">USD — US Dollar</option>
                      <option value="INR">INR — Indian Rupee</option>
                      <option value="EUR">EUR — Euro</option>
                      <option value="GBP">GBP — British Pound</option>
                      <option value="AED">AED — UAE Dirham</option>
                      <option value="SGD">SGD — Singapore Dollar</option>
                      <option value="CAD">CAD — Canadian Dollar</option>
                      <option value="AUD">AUD — Australian Dollar</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-widest font-inter mb-2 block">
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={function(e) { setLanguage(e.target.value) }}
                      className="liquid-glass rounded-full px-5 py-3 bg-black text-white/70 outline-none text-sm font-inter cursor-pointer w-full"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Arabic">Arabic</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-widest font-inter mb-2 block">
                      AI Response Style
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Concise', 'Balanced', 'Detailed'].map(function(style) {
                        return (
                          <button
                            key={style}
                            type="button"
                            className="liquid-glass rounded-full py-2.5 text-white/50 text-sm font-inter hover:text-white hover:bg-white/5 transition-all"
                          >
                            {style}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* WHATS NEW TAB */}
            {activeTab === 'whatsnew' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="liquid-glass rounded-3xl p-8"
              >
                <h2 className="text-white text-lg font-medium mb-6 font-inter">
                  What's New
                </h2>
                <div className="space-y-6">
                  {[
                    {
                      version: 'v1.0.3',
                      date: 'May 2026',
                      updates: [
                        'Real Gmail OAuth integration with AI categorization',
                        'Subscription Detector with Red/Yellow/Green urgency system',
                        'Real job listings powered by Adzuna API',
                        'AI Cover Letter Generator',
                        'Mobile responsive sidebar with bottom nav',
                      ]
                    },
                    {
                      version: 'v1.0.2',
                      date: 'April 2026',
                      updates: [
                        'Content Manager with 30-day calendar',
                        'Groq AI integration for faster responses',
                        'Secure AI proxy via Vercel serverless function',
                        'Real company logos in Financial module',
                      ]
                    },
                    {
                      version: 'v1.0.1',
                      date: 'March 2026',
                      updates: [
                        'Dashboard with real Supabase data',
                        'Clerk authentication',
                        'Liquid Glass UI design system',
                        'Financial transaction tracking',
                      ]
                    },
                  ].map(function(release) {
                    return (
                      <div key={release.version}>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="liquid-glass rounded-full px-3 py-1 text-white/60 text-xs font-inter">
                            {release.version}
                          </span>
                          <span className="text-white/30 text-xs font-inter">
                            {release.date}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {release.updates.map(function(update) {
                            return (
                              <div key={update} className="flex items-start gap-3">
                                <Check size={14} className="text-white/30 mt-0.5 flex-shrink-0" />
                                <span className="text-white/50 text-sm font-inter">
                                  {update}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                        <div className="w-full h-px bg-white/5 mt-6" />
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </main>
    </motion.div>
  )
}
