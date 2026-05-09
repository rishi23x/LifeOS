import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { ArrowRight, CreditCard } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import Sidebar from '../components/Sidebar'

function useAnimateInView() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  return { ref, isInView }
}

const stats = [
  { label: 'Monthly Spend', value: '$2,847', sub: 'vs $3,200 last month' },
  { label: 'Money Saved', value: '$342', sub: 'By AI negotiations' },
  { label: 'Subscriptions', value: '14', sub: '3 flagged as unused' },
  { label: 'Investment', value: '+8.2%', sub: 'Portfolio this month' },
]

const spendingData = [
  { name: 'Food', amount: 840 },
  { name: 'Transport', amount: 320 },
  { name: 'Entertainment', amount: 180 },
  { name: 'Shopping', amount: 620 },
  { name: 'Bills', amount: 890 },
]

const subscriptions = [
  { name: 'Spotify', price: '$9.99/mo', status: 'Active', unused: false },
  { name: 'Netflix', price: '$15.99/mo', status: 'Active', unused: false },
  { name: 'Adobe CC', price: '$54.99/mo', status: 'Unused 47 days', unused: true },
  { name: 'Gym membership', price: '$39.99/mo', status: 'Unused 23 days', unused: true },
  { name: 'Notion', price: '$16/mo', status: 'Active', unused: false },
]

export default function Financial() {
  const { ref: statsRef, isInView: statsInView } = useAnimateInView()
  const [showBank, setShowBank] = useState(false)

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
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-instrument text-4xl text-white mb-2">Financial Manager</h1>
          <p className="text-white/40 text-sm font-inter">Your AI is managing your money around the clock.</p>
        </div>

        {/* Connect Bank CTA (optional - hidden by default, togglable) */}
        {showBank && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto text-center liquid-glass rounded-3xl p-12 mb-8"
          >
            <CreditCard size={56} className="text-white/20 mb-6 mx-auto" />
            <h2 className="font-instrument text-2xl text-white mb-3">Connect your bank</h2>
            <p className="text-white/40 text-sm mb-8 font-inter">Your AI cannot help until it can see your transactions.</p>
            <button
              onClick={() => setShowBank(false)}
              className="liquid-glass rounded-full px-8 py-3.5 text-white text-sm font-medium w-full max-w-xs mx-auto hover:bg-white/5 transition-all cursor-pointer"
            >
              Connect via Plaid — Bank-level security
            </button>
          </motion.div>
        )}

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

        {/* Spending Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="liquid-glass rounded-3xl p-6 md:p-8 mb-6"
        >
          <h2 className="text-white text-lg font-medium mb-6 font-inter">Spending Breakdown</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendingData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(0,0,0,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '12px',
                  }}
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                />
                <Bar dataKey="amount" fill="rgba(255,255,255,0.6)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Subscription Detector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="liquid-glass rounded-3xl p-6 md:p-8 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-white text-lg font-medium font-inter">Subscription Detector</h2>
            <span className="liquid-glass rounded-full px-3 py-1 text-white/50 text-xs font-inter">3 unused</span>
          </div>

          <div>
            {subscriptions.map((sub, i) => (
              <div key={i} className="flex justify-between items-center py-4" style={{ borderBottom: i < subscriptions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div className="flex items-center gap-4">
                  <div className="liquid-glass rounded-xl p-2.5">
                    <CreditCard size={16} className="text-white/40" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-inter">{sub.name}</p>
                    <p className="text-white/40 text-xs mt-0.5 font-inter">{sub.price}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`liquid-glass rounded-full px-3 py-1 text-xs font-inter ${sub.unused ? 'text-yellow-400/70' : 'text-white/50'}`}>
                    {sub.status}
                  </span>
                  {sub.unused && (
                    <button className="liquid-glass rounded-full px-3 py-1 text-red-400/70 text-xs font-inter hover:bg-white/5 transition-all cursor-pointer">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Chat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="liquid-glass rounded-3xl p-6 md:p-8"
        >
          <h2 className="text-white text-lg font-medium mb-6 font-inter">Ask about your finances</h2>

          <div className="min-h-48 mb-4 space-y-3">
            <div className="liquid-glass rounded-2xl p-4 max-w-lg">
              <p className="text-white/70 text-sm leading-relaxed font-inter">
                You spent $840 on food this month, which is 18% higher than your monthly average. Your biggest food expense was restaurants ($520). Want me to set a restaurant budget alert?
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="liquid-glass rounded-full flex-1 px-5 py-3">
              <input
                type="text"
                placeholder="Ask anything about your money..."
                className="bg-transparent text-white placeholder:text-white/30 outline-none w-full text-sm font-inter"
              />
            </div>
            <button className="liquid-glass rounded-full p-3 hover:bg-white/5 transition-all cursor-pointer">
              <ArrowRight size={18} className="text-white/60" />
            </button>
          </div>
        </motion.div>
      </main>
    </motion.div>
  )
}
