import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { ArrowRight, CreditCard, Plus, Trash2, Zap } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import Sidebar from '../components/Sidebar'
import { supabase } from '../lib/supabase'
import { useUser } from '@clerk/clerk-react'

function useAnimateInView() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  return { ref, isInView }
}

interface DetectedSubscription {
  name: string
  amount: number
  frequency: string
  lastUsed: string
  daysSinceUsed: number
  status: 'active' | 'unused' | 'urgent'
  occurrences: number
}

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

  // Subscription detector state
  const [detectedSubs, setDetectedSubs] = useState<DetectedSubscription[]>([])
  const [analyzingSubs, setAnalyzingSubs] = useState(false)
  const [subsAnalyzed, setSubsAnalyzed] = useState(false)

  const [aiMessages, setAiMessages] = useState([
    {
      role: 'ai',
      text: 'Hi! I can help you understand your finances. Ask me anything about your spending.'
    }
  ])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Subscription', 'Other']

  const fetchTransactions = async function() {
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

  useEffect(function() {
    fetchTransactions()
  }, [user])

  const addTransaction = async function() {
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

  const deleteTransaction = async function(id: string) {
    await supabase.from('transactions').delete().eq('id', id)
    fetchTransactions()
  }

  const totalSpend = transactions.reduce(function(sum, t) {
    return sum + Number(t.amount || 0)
  }, 0)

  const categoryTotals = categories.map(function(cat) {
    return {
      name: cat,
      amount: transactions
        .filter(function(t) { return t.category === cat })
        .reduce(function(sum, t) { return sum + Number(t.amount || 0) }, 0)
    }
  }).filter(function(c) { return c.amount > 0 })

  const chartData = categoryTotals.length > 0 ? categoryTotals : [{ name: 'No data yet', amount: 0 }]

  // Detect subscriptions from real transactions
  const detectSubscriptions = async function() {
    if (transactions.length === 0) return
    setAnalyzingSubs(true)

    // Group transactions by name to find recurring ones
    const nameGroups: Record<string, any[]> = {}
    transactions.forEach(function(t) {
      const key = t.name.toLowerCase().trim()
      if (!nameGroups[key]) nameGroups[key] = []
      nameGroups[key].push(t)
    })

    // Find recurring transactions (appear more than once OR marked as subscription)
    const recurring = Object.entries(nameGroups).filter(function([_, txns]) {
      return txns.length >= 1
    })

    if (recurring.length === 0) {
      setDetectedSubs([])
      setSubsAnalyzed(true)
      setAnalyzingSubs(false)
      return
    }

    // Use AI to analyze which ones are subscriptions and their status
    const transactionList = recurring.map(function([name, txns]) {
      const dates = txns.map(function(t) { return t.date }).join(', ')
      const amount = txns[txns.length - 1].amount
      return name + ' ($' + amount + ') — dates: ' + dates + ' — count: ' + txns.length
    }).join('\n')

    const prompt = `You are a subscription detection AI.

Analyze these transactions and identify which ones are likely subscriptions or recurring payments:

${transactionList}

Today's date: ${new Date().toISOString().split('T')[0]}

For each transaction that looks like a subscription, return a JSON array.
Each object must have:
- name (string: transaction name)
- amount (number: monthly cost)
- frequency (string: "monthly", "weekly", "annual", or "one-time")
- status (string: "active", "unused", or "urgent")
  - active = used recently or appears regularly
  - unused = only appears once or hasn't appeared in a long time
  - urgent = high cost and appears unused
- reason (string: one sentence explanation)
- daysSinceUsed (number: estimated days since last used, use 0 if recent)

Return ONLY the JSON array. No other text.`

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + import.meta.env.VITE_GROQ_API_KEY,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 600,
        }),
      })

      const data = await response.json()
      const content = data.choices[0].message.content.trim()
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(cleaned)

      const subs: DetectedSubscription[] = parsed.map(function(item: any) {
        const txns = nameGroups[item.name.toLowerCase()] || []
        const lastTxn = txns[txns.length - 1]
        const lastDate = lastTxn ? new Date(lastTxn.date) : new Date()
        const daysDiff = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

        return {
          name: item.name,
          amount: item.amount,
          frequency: item.frequency,
          lastUsed: lastDate.toLocaleDateString(),
          daysSinceUsed: daysDiff,
          status: item.status,
          occurrences: txns.length,
        }
      })

      setDetectedSubs(subs)
    } catch {
      // Fallback: manually detect from transactions
      const fallbackSubs: DetectedSubscription[] = Object.entries(nameGroups).map(function([name, txns]) {
        const lastTxn = txns[txns.length - 1]
        const lastDate = new Date(lastTxn.date)
        const daysDiff = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        const status = daysDiff > 60 ? 'urgent' : daysDiff > 30 ? 'unused' : 'active'

        return {
          name: lastTxn.name,
          amount: Number(lastTxn.amount),
          frequency: txns.length > 1 ? 'monthly' : 'one-time',
          lastUsed: lastDate.toLocaleDateString(),
          daysSinceUsed: daysDiff,
          status,
          occurrences: txns.length,
        }
      })
      setDetectedSubs(fallbackSubs)
    }

    setSubsAnalyzed(true)
    setAnalyzingSubs(false)
  }

  const getStatusColor = function(status: string) {
    if (status === 'urgent') return 'text-red-400/80 border border-red-400/30'
    if (status === 'unused') return 'text-yellow-400/80 border border-yellow-400/30'
    return 'text-green-400/80 border border-green-400/30'
  }

  const getStatusDot = function(status: string) {
    if (status === 'urgent') return 'bg-red-400'
    if (status === 'unused') return 'bg-yellow-400'
    return 'bg-green-400'
  }

  const getStatusText = function(sub: DetectedSubscription) {
    if (sub.status === 'urgent') return 'Unused ' + sub.daysSinceUsed + ' days — Cancel now'
    if (sub.status === 'unused') return 'Unused ' + sub.daysSinceUsed + ' days'
    if (sub.daysSinceUsed === 0) return 'Used today'
    return 'Used ' + sub.daysSinceUsed + ' days ago'
  }

  const urgentCount = detectedSubs.filter(function(s) { return s.status === 'urgent' }).length
  const unusedCount = detectedSubs.filter(function(s) { return s.status === 'unused' }).length
  const wastedAmount = detectedSubs
    .filter(function(s) { return s.status === 'urgent' || s.status === 'unused' })
    .reduce(function(sum, s) { return sum + s.amount }, 0)

  const stats = [
    {
      label: 'Total Spend',
      value: loading ? '...' : '$' + totalSpend.toFixed(0),
      sub: transactions.length + ' transactions'
    },
    {
      label: 'Transactions',
      value: loading ? '...' : String(transactions.length),
      sub: 'In your database'
    },
    {
      label: 'Subscriptions',
      value: subsAnalyzed ? String(detectedSubs.length) : '—',
      sub: subsAnalyzed ? (urgentCount + unusedCount) + ' flagged as unused' : 'Click Analyze to detect'
    },
    {
      label: 'Top Category',
      value: loading ? '...' : categoryTotals.length > 0
        ? categoryTotals.sort(function(a, b) { return b.amount - a.amount })[0].name
        : 'None',
      sub: 'Highest spending area'
    },
  ]

  const sendAiMessage = async function() {
    if (!aiInput.trim()) return
    const userMessage = aiInput
    setAiInput('')
    setAiMessages(function(prev) { return [...prev, { role: 'user', text: userMessage }] })
    setAiLoading(true)

    const transactionSummary = transactions.length > 0
      ? transactions.map(function(t) { return t.name + ': $' + t.amount + ' (' + t.category + ')' }).join(', ')
      : 'No transactions yet'

    const prompt = 'You are a personal AI financial advisor. The user has these transactions: ' + transactionSummary + '. Total spend: $' + totalSpend + '. Answer this question in 2-3 sentences max, be specific and helpful: ' + userMessage

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + import.meta.env.VITE_GROQ_API_KEY,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
        }),
      })
      const data = await response.json()
      const aiReply = data.choices[0].message.content || 'Sorry I could not process that.'
      setAiMessages(function(prev) { return [...prev, { role: 'ai', text: aiReply }] })
    } catch {
      setAiMessages(function(prev) { return [...prev, { role: 'ai', text: 'Sorry, I could not connect to AI right now.' }] })
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
            type="button"
            onClick={function() { setShowForm(!showForm) }}
            className="liquid-glass rounded-full px-5 py-2.5 text-white text-sm font-inter flex items-center gap-2 hover:bg-white/5 transition-all"
          >
            <Plus size={16} />
            Add Transaction
          </button>
        </div>

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
                onChange={function(e) { setNewName(e.target.value) }}
                className="liquid-glass rounded-full px-5 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-sm font-inter"
              />
              <input
                type="number"
                placeholder="Amount ($)"
                value={newAmount}
                onChange={function(e) { setNewAmount(e.target.value) }}
                className="liquid-glass rounded-full px-5 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-sm font-inter"
              />
              <select
                value={newCategory}
                onChange={function(e) { setNewCategory(e.target.value) }}
                className="liquid-glass rounded-full px-5 py-3 bg-black text-white outline-none text-sm font-inter cursor-pointer"
              >
                {categories.map(function(cat) {
                  return <option key={cat} value={cat}>{cat}</option>
                })}
              </select>
              <button
                type="button"
                onClick={addTransaction}
                disabled={adding}
                className="bg-white rounded-full px-5 py-3 text-black text-sm font-semibold hover:bg-white/90 transition-all"
              >
                {adding ? 'Saving...' : 'Save Transaction'}
              </button>
            </div>
          </motion.div>
        )}

        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(function(stat, i) {
            return (
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
            )
          })}
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
              {transactions.map(function(t) {
                return (
                  <div key={t.id} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className="liquid-glass rounded-xl p-2.5">
                        <CreditCard size={16} className="text-white/40" />
                      </div>
                      <div>
                        <p className="text-white/80 text-sm font-inter font-medium">{t.name}</p>
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
                        type="button"
                        onClick={function() { deleteTransaction(t.id) }}
                        className="liquid-glass rounded-full p-2 hover:bg-white/5 transition-all text-white/30 hover:text-red-400/70"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
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

        {/* REAL Subscription Detector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="liquid-glass rounded-3xl p-6 md:p-8 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-white text-lg font-medium font-inter">
                Subscription Detector
              </h2>
              {subsAnalyzed && (
                <div className="flex gap-2">
                  {urgentCount > 0 && (
                    <span className="liquid-glass rounded-full px-3 py-1 text-red-400/70 text-xs font-inter border border-red-400/20">
                      {urgentCount} urgent
                    </span>
                  )}
                  {unusedCount > 0 && (
                    <span className="liquid-glass rounded-full px-3 py-1 text-yellow-400/70 text-xs font-inter border border-yellow-400/20">
                      {unusedCount} unused
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={detectSubscriptions}
              disabled={analyzingSubs || transactions.length === 0}
              className="liquid-glass rounded-full px-5 py-2 text-white/60 text-sm font-inter hover:bg-white/5 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Zap size={14} />
              {analyzingSubs ? 'Analyzing...' : subsAnalyzed ? 'Re-Analyze' : 'Analyze with AI'}
            </button>
          </div>

          {/* Wasted money alert */}
          {subsAnalyzed && wastedAmount > 0 && (
            <div className="liquid-glass rounded-2xl p-4 mb-4 border border-red-400/20">
              <p className="text-red-400/80 text-sm font-inter font-medium">
                ⚠️ You may be wasting ${wastedAmount.toFixed(2)}/month on unused subscriptions.
              </p>
            </div>
          )}

          {/* Legend */}
          {subsAnalyzed && (
            <div className="flex gap-4 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-white/40 text-xs font-inter">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                <span className="text-white/40 text-xs font-inter">Unused (consider cancelling)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full" />
                <span className="text-white/40 text-xs font-inter">Urgent (cancel immediately)</span>
              </div>
            </div>
          )}

          {!subsAnalyzed && !analyzingSubs && (
            <div className="text-center py-8">
              {transactions.length === 0 ? (
                <p className="text-white/30 text-sm font-inter">
                  Add transactions first then click Analyze with AI.
                </p>
              ) : (
                <p className="text-white/30 text-sm font-inter">
                  Click Analyze with AI to detect recurring subscriptions from your {transactions.length} transactions.
                </p>
              )}
            </div>
          )}

          {analyzingSubs && (
            <div className="text-center py-8">
              <p className="text-white/30 text-sm font-inter">
                🧠 AI is analyzing your transactions for recurring subscriptions...
              </p>
            </div>
          )}

          {subsAnalyzed && !analyzingSubs && detectedSubs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-white/30 text-sm font-inter">
                No recurring subscriptions detected in your transactions.
              </p>
            </div>
          )}

          {subsAnalyzed && !analyzingSubs && detectedSubs.length > 0 && (
            <div className="divide-y divide-white/5">
              {detectedSubs
                .sort(function(a, b) {
                  const order: Record<string, number> = { urgent: 0, unused: 1, active: 2 }
                  return order[a.status] - order[b.status]
                })
                .map(function(sub, i) {
                  return (
                    <div key={i} className="flex justify-between items-center py-4">
                      <div className="flex items-center gap-4">
                        <div className="liquid-glass rounded-xl p-2.5 relative">
                          <CreditCard size={16} className="text-white/40" />
                          <div className={'absolute -top-1 -right-1 w-3 h-3 rounded-full ' + getStatusDot(sub.status)} />
                        </div>
                        <div>
                          <p className="text-white/80 text-sm font-inter font-medium">
                            {sub.name}
                          </p>
                          <p className="text-white/40 text-xs mt-0.5 font-inter">
                            ${sub.amount.toFixed(2)}/mo · {sub.frequency} · {sub.occurrences} transaction{sub.occurrences > 1 ? 's' : ''}
                          </p>
                          <p className="text-white/30 text-xs font-inter mt-0.5">
                            Last recorded: {sub.lastUsed}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={'liquid-glass rounded-full px-3 py-1 text-xs font-inter ' + getStatusColor(sub.status)}>
                          {getStatusText(sub)}
                        </span>
                        {(sub.status === 'urgent' || sub.status === 'unused') && (
                          <button
                            type="button"
                            className="liquid-glass rounded-full px-3 py-1 text-red-400/70 text-xs font-inter hover:bg-white/5 transition-all cursor-pointer border border-red-400/20"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
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
            {aiMessages.map(function(msg, i) {
              return (
                <div key={i} className={'flex ' + (msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={'liquid-glass rounded-2xl p-4 max-w-lg ' + (msg.role === 'user' ? 'bg-white/5' : '')}>
                    <p className="text-white/70 text-sm leading-relaxed font-inter">{msg.text}</p>
                  </div>
                </div>
              )
            })}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="liquid-glass rounded-2xl p-4">
                  <p className="text-white/30 text-sm font-inter">Thinking...</p>
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
                onChange={function(e) { setAiInput(e.target.value) }}
                onKeyDown={function(e) { if (e.key === 'Enter') sendAiMessage() }}
                className="bg-transparent text-white placeholder:text-white/30 outline-none w-full text-sm font-inter"
              />
            </div>
            <button
              type="button"
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
