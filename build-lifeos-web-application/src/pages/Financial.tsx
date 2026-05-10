import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { ArrowRight, CreditCard, Plus, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import Sidebar from '../components/Sidebar'
import { supabase } from '../lib/supabase'
import { useUser } from '@clerk/clerk-react'

function useAnimateInView() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  return { ref, isInView }
}

const subscriptions = [
  { name: 'Spotify', price: '$9.99/mo', status: 'Active', unused: false },
  { name: 'Netflix', price: '$15.99/mo', status: 'Active', unused: false },
  { name: 'Adobe CC', price: '$54.99/mo', status: 'Unused 47 days', unused: true },
  { name: 'Gym membership', price: '$39.99/mo', status: 'Unused 23 days', unused: true },
  { name: 'Notion', price: '$16/mo', status: 'Active', unused: false },
]

export default function Financial() {
  const { ref: statsRef, isInView: statsInView } = useAnimateInView()
  const { user } = useUser()

  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newCategory, setNewCategory] = useState('Food')
  const [adding, setAdding] = useState(false)

  const [aiMessages, setAiMessages] = useState([
    {
      role: 'ai',
      text: 'Hi! I can help you understand your finances. Ask me anything about your spending.'
    }
  ])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Other']

  // Fetch transactions
  const fetchTransactions = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (!error && data) setTransactions(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchTransactions()
  }, [user])

  // Add transaction
  const addTransaction = async () => {
    if (!user || !newName || !newAmount) return
    setAdding(true)
    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      name: newName,
      amount: parseFloat(newAmount),
      category: newCategory,
      date: new Date().toISOString().split('T')[0],
    })
    if (!error) {
      setNewName('')
      setNewAmount('')
      setNewCategory('Food')
      setShowForm(false)
      fetchTransactions()
    }
    setAdding(false)
  }

  // Delete transaction
  const deleteTransaction = async (id: string) => {
    await supabase.from('transactions').delete().eq('id', id)
    fetchTransactions()
  }

  // Calculate stats
  const totalSpend = transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0)

  // Spending by category for chart
  const categoryTotals = categories.map(cat => ({
    name: cat,
    amount: transactions
      .filter(t => t.category === cat)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
  })).filter(c => c.amount > 0)

  const chartData = categoryTotals.length > 0 ? categoryTotals : [
    { name: 'No data yet', amount: 0 }
  ]

  const stats = [
    {
      label: 'Total Spend',
      value: loading ? '...' : `$${totalSpend.toFixed(0)}`,
      sub: `${transactions.length} transactions`
    },
    {
      label: 'Transactions',
      value: loading ? '...' : `${transactions.length}`,
      sub: 'In your database'
    },
    {
      label: 'Subscriptions',
      value: '14',
      sub: '2 flagged as unused'
    },
    {
      label: 'Top Category',
      value: loading ? '...' : categoryTotals.length > 0
        ? categoryTotals.sort((a, b) => b.amount - a.amount)[0].name
        : 'None',
      sub: 'Highest spending area'
    },
  ]

  // AI Chat
  const sendAiMessage = async () => {
    if (!aiInput.trim()) return
    const userMessage = aiInput
    setAiInput('')
    setAiMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setAiLoading(true)

    const transactionSummary = transactions.length > 0
      ? transactions.map(t => `${t.name}: $${t.amount} (${t.category})`).join(', ')
      : 'No transactions yet'

    const prompt = `You are a personal AI financial advisor. 
The user has these transactions: ${transactionSummary}. 
Total spend: $${totalSpend}.
Answer this question in 2-3 sentences max, be specific and helpful: ${userMessage}`

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'llama3-8b-8192',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 150,
  }),
})
const data = await response.json()
const aiReply = data.choices?.[0]?.message?.content || 'Sorry I could not process that.'
      setAiMessages(prev => [...prev, { role: 'ai', text: aiReply }])
    } catch {
      setAiMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I could not connect to AI right now.' }])
    }
    setAiLoading(false)
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
      <main className="ml-0 md:ml-64 p-4 md:p-8">

        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="font-instrument text-4xl text-white mb-2">
              Financial Manager
            </h1>
            <p className="text-white/40 text-sm font-inter">
              Your AI is managing your money around the clock.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="liquid-glass rounded-full px-5 py-2.5 text-white text-sm font-inter flex items-center gap-2 hover:bg-white/5 transition-all"
          >
            <Plus size={16} />
            Add Transaction
          </button>
        </div>

        {/* Add Transaction Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="liquid-glass rounded-3xl p-6 mb-6"
          >
            <h3 className="text-white text-base font-medium mb-4 font-inter">
              New Transaction
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Transaction name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="liquid-glass rounded-full px-5 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-sm font-inter"
              />
              <input
                type="number"
                placeholder="Amount ($)"
                value={newAmount}
                onChange={e => setNewAmount(e.target.value)}
                className="liquid-glass rounded-full px-5 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-sm font-inter"
              />
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="liquid-glass rounded-full px-5 py-3 bg-black text-white outline-none text-sm font-inter cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                onClick={addTransaction}
                disabled={adding}
                className="bg-white rounded-full px-5 py-3 text-black text-sm font-semibold hover:bg-white/90 transition-all"
              >
                {adding ? 'Saving...' : 'Save Transaction'}
              </button>
            </div>
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
              <p className="text-white/40 text-xs tracking-widest uppercase mb-3 font-inter">
                {stat.label}
              </p>
              <p className="font-instrument text-4xl text-white font-light mb-1">
                {stat.value}
              </p>
              <p className="text-white/30 text-xs font-inter">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Real Transaction List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="liquid-glass rounded-3xl p-6 md:p-8 mb-6"
        >
          <h2 className="text-white text-lg font-medium mb-6 font-inter">
            Your Transactions
          </h2>

          {loading ? (
            <p className="text-white/30 text-sm font-inter">Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="text-white/30 text-sm font-inter">
              No transactions yet. Add your first one above.
            </p>
          ) : (
            <div className="divide-y divide-white/5">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="liquid-glass rounded-xl p-2.5">
                      <CreditCard size={16} className="text-white/40" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-inter font-medium">
                        {t.name}
                      </p>
                      <p className="text-white/30 text-xs font-inter mt-0.5">
                        {t.category} · {t.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white text-sm font-inter font-medium">
                      ${Number(t.amount).toFixed(2)}
                    </span>
                    <button
                      onClick={() => deleteTransaction(t.id)}
                      className="liquid-glass rounded-full p-2 hover:bg-white/5 transition-all text-white/30 hover:text-red-400/70"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Spending Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="liquid-glass rounded-3xl p-6 md:p-8 mb-6"
        >
          <h2 className="text-white text-lg font-medium mb-6 font-inter">
            Spending Breakdown
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={40}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
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
                <Bar
                  dataKey="amount"
                  fill="rgba(255,255,255,0.6)"
                  radius={[8, 8, 0, 0]}
                />
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
            <h2 className="text-white text-lg font-medium font-inter">
              Subscription Detector
            </h2>
            <span className="liquid-glass rounded-full px-3 py-1 text-white/50 text-xs font-inter">
              2 unused
            </span>
          </div>

          <div>
            {subscriptions.map((sub, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-4"
                style={{
                  borderBottom: i < subscriptions.length - 1
                    ? '1px solid rgba(255,255,255,0.05)'
                    : 'none'
                }}
              >
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
          <h2 className="text-white text-lg font-medium mb-6 font-inter">
            Ask about your finances
          </h2>

          <div className="min-h-48 mb-4 space-y-3 max-h-64 overflow-y-auto">
            {aiMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`liquid-glass rounded-2xl p-4 max-w-lg ${msg.role === 'user' ? 'bg-white/5' : ''}`}>
                  <p className="text-white/70 text-sm leading-relaxed font-inter">
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="liquid-glass rounded-2xl p-4">
                  <p className="text-white/30 text-sm font-inter">
                    Thinking...
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <div className="liquid-glass rounded-full flex-1 px-5 py-3">
              <input
                type="text"
                placeholder="Ask anything about your money..."
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendAiMessage()}
                className="bg-transparent text-white placeholder:text-white/30 outline-none w-full text-sm font-inter"
              />
            </div>
            <button
              onClick={sendAiMessage}
              disabled={aiLoading}
              className="liquid-glass rounded-full p-3 hover:bg-white/5 transition-all cursor-pointer"
            >
              <ArrowRight size={18} className="text-white/60" />
            </button>
          </div>
        </motion.div>
      </main>
    </motion.div>
  )
}
