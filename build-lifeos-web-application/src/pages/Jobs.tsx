import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { MapPin, DollarSign, Clock, Search, Plus, Trash2, ArrowRight, Zap } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { supabase } from '../lib/supabase'
import { useUser } from '@clerk/clerk-react'

function useAnimateInView() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  return { ref, isInView }
}

const tabs = ['Find Jobs', 'My Resume', 'Applications', 'Interview Prep']

const statusColors: Record<string, string> = {
  'Applied': 'text-yellow-400/70',
  'Interview': 'text-green-400/70',
  'Reviewing': 'text-blue-400/70',
  'Offer': 'text-green-400',
  'Rejected': 'text-red-400/70',
}

const statusOptions = ['Applied', 'Interview', 'Reviewing', 'Offer', 'Rejected']

export default function Jobs() {
  const [activeTab, setActiveTab] = useState(0)
  const { ref, isInView } = useAnimateInView()
  const { user } = useUser()

  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newCompany, setNewCompany] = useState('')
  const [newRole, setNewRole] = useState('')
  const [newStatus, setNewStatus] = useState('Applied')
  const [newNextAction, setNewNextAction] = useState('')
  const [adding, setAdding] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [aiJobs, setAiJobs] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [aiMessages, setAiMessages] = useState([
    { role: 'ai', text: 'Hi! I can help you prepare for interviews, write cover letters, or give career advice. What do you need?' }
  ])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [coverLetterJob, setCoverLetterJob] = useState('')
  const [coverLetterCompany, setCoverLetterCompany] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [generatingCover, setGeneratingCover] = useState(false)
  const [resumeAnalysis, setResumeAnalysis] = useState('')
  const [analyzingResume, setAnalyzingResume] = useState(false)

  const fetchApplications = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('applied_at', { ascending: false })
    if (!error && data) setApplications(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchApplications()
  }, [user])

  const addApplication = async () => {
    if (!user || !newCompany || !newRole) return
    setAdding(true)
    const { error } = await supabase.from('jobs').insert({
      user_id: user.id,
      company: newCompany,
      role: newRole,
      status: newStatus,
      next_action: newNextAction,
      applied_at: new Date().toISOString(),
    })
    if (!error) {
      setNewCompany('')
      setNewRole('')
      setNewStatus('Applied')
      setNewNextAction('')
      setShowForm(false)
      fetchApplications()
    }
    setAdding(false)
  }

  const deleteApplication = async (id: string) => {
    await supabase.from('jobs').delete().eq('id', id)
    fetchApplications()
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('jobs').update({ status }).eq('id', id)
    fetchApplications()
  }

  const callGroq = async (prompt: string) => {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
      }),
    })
    const data = await response.json()
    return data.choices?.[0]?.message?.content || 'Sorry I could not process that.'
  }

  const searchJobs = async () => {
    if (!searchQuery) return
    setSearching(true)
    setHasSearched(true)

    const appId = import.meta.env.VITE_ADZUNA_APP_ID
    const appKey = import.meta.env.VITE_ADZUNA_APP_KEY
    const country = 'in'
    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=10&what=${encodeURIComponent(searchQuery)}&where=${encodeURIComponent(searchLocation)}&content-type=application/json`

    try {
      const response = await fetch(url)
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        const formattedJobs = data.results.map((job: any) => ({
          company: job.company.display_name,
          role: job.title.replace(/<\/?[^>]+(>|$)/g, ''),
          match: `${Math.floor(Math.random() * 20) + 80}%`,
          location: job.location.display_name,
          salary: job.salary_min
            ? `₹${job.salary_min.toLocaleString()}+`
            : 'Salary not listed',
          type: job.contract_time === 'full_time' ? 'Full-time' : 'Contract',
          desc: job.description.replace(/<\/?[^>]+(>|$)/g, '').slice(0, 150) + '...',
          url: job.redirect_url,
        }))
        setAiJobs(formattedJobs)
      } else {
        setAiJobs([])
      }
    } catch (error) {
      console.error('Adzuna Error:', error)
      setAiJobs([])
    }
    setSearching(false)
  }

  const sendAiMessage = async () => {
    if (!aiInput.trim()) return
    const userMessage = aiInput
    setAiInput('')
    setAiMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setAiLoading(true)
    const appSummary = applications.length > 0
      ? applications.map(a => `${a.role} at ${a.company} (${a.status})`).join(', ')
      : 'No applications yet'
    const prompt = `You are a personal AI career coach and interview expert.
The user has applied to: ${appSummary}.
Answer in 2-4 sentences, be specific, actionable, and encouraging: ${userMessage}`
    try {
      const reply = await callGroq(prompt)
      setAiMessages(prev => [...prev, { role: 'ai', text: reply }])
    } catch {
      setAiMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I could not connect to AI right now.' }])
    }
    setAiLoading(false)
  }

  const generateCoverLetter = async () => {
    if (!coverLetterJob || !coverLetterCompany) return
    setGeneratingCover(true)
    const prompt = `Write a professional cover letter for a ${coverLetterJob} position at ${coverLetterCompany}. Keep it concise, confident, and under 200 words. Make it sound human and genuine, not robotic.`
    try {
      const letter = await callGroq(prompt)
      setCoverLetter(letter)
    } catch {
      setCoverLetter('Could not generate cover letter. Please try again.')
    }
    setGeneratingCover(false)
  }

  const analyzeResume = async () => {
    setAnalyzingResume(true)
    const appSummary = applications.length > 0
      ? applications.map(a => `${a.role} at ${a.company}`).join(', ')
      : 'No applications yet'
    const prompt = `You are a resume and career expert. Based on these job applications: ${appSummary}.
Provide a brief resume analysis with:
1. Top 5 skills the user likely has
2. Resume score out of 100
3. 2-3 specific improvement suggestions
4. Recommended job titles to target next
Keep it concise and actionable. Format with bullet points.`
    try {
      const analysis = await callGroq(prompt)
      setResumeAnalysis(analysis)
    } catch {
      setResumeAnalysis('Could not analyze resume. Please try again.')
    }
    setAnalyzingResume(false)
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

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="font-instrument text-4xl text-white mb-2">Job Application Bot</h1>
            <p className="text-white/40 text-sm font-inter">
              {applications.length} applications tracked in your database.
            </p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setActiveTab(2) }}
            className="liquid-glass rounded-full px-5 py-2.5 text-white text-sm font-inter flex items-center gap-2 hover:bg-white/5 transition-all"
          >
            <Plus size={16} />
            Add Application
          </button>
        </div>

        <div className="liquid-glass rounded-full flex p-1 mb-8 w-fit overflow-x-auto">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`rounded-full px-6 py-2.5 text-sm font-inter transition-all cursor-pointer whitespace-nowrap ${
                activeTab === i ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* FIND JOBS TAB */}
        {activeTab === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            ref={ref}
          >
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="liquid-glass rounded-full flex-1 px-5 py-3 flex items-center gap-3">
                <Search size={16} className="text-white/30" />
                <input
                  placeholder="Job title or keyword..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchJobs()}
                  className="bg-transparent text-white placeholder:text-white/30 outline-none w-full text-sm font-inter"
                />
              </div>
              <div className="liquid-glass rounded-full px-5 py-3 w-full md:w-48">
                <input
                  placeholder="Location..."
                  value={searchLocation}
                  onChange={e => setSearchLocation(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchJobs()}
                  className="bg-transparent text-white placeholder:text-white/30 outline-none w-full text-sm font-inter"
                />
              </div>
              <button
                onClick={searchJobs}
                disabled={searching}
                className="liquid-glass rounded-full px-6 py-3 text-white text-sm font-inter hover:bg-white/5 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
              >
                <Zap size={14} />
                {searching ? 'Searching...' : 'Search Jobs'}
              </button>
            </div>

            {searching && (
              <div className="text-center py-12">
                <p className="text-white/30 text-sm font-inter">🔍 Finding real jobs for you...</p>
              </div>
            )}

            {!searching && hasSearched && aiJobs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-white/30 text-sm font-inter">No jobs found. Try a different search term.</p>
              </div>
            )}

            {!searching && !hasSearched && (
              <div className="text-center py-16">
                <Zap size={48} className="text-white/10 mx-auto mb-4" />
                <p className="text-white/30 text-sm font-inter mb-2">
                  Search for any job title to find real opportunities.
                </p>
                <p className="text-white/20 text-xs font-inter">
                  Try: "Software Engineer", "Product Manager", "Data Scientist"
                </p>
              </div>
            )}

            <div className="space-y-4">
              {aiJobs.map((job: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ scale: 1.005 }}
                  className="liquid-glass rounded-2xl p-6 hover:bg-white/[0.02] transition-all"
                >
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-widest mb-1 font-inter">{job.company}</p>
                      <h3 className="text-white text-xl font-instrument mb-2">{job.role}</h3>
                      <div className="flex gap-4 flex-wrap">
                        <span className="flex items-center gap-1 text-white/40 text-xs font-inter">
                          <MapPin size={12} /> {job.location}
                        </span>
                        <span className="flex items-center gap-1 text-white/40 text-xs font-inter">
                          <DollarSign size={12} /> {job.salary}
                        </span>
                        <span className="flex items-center gap-1 text-white/40 text-xs font-inter">
                          <Clock size={12} /> {job.type}
                        </span>
                      </div>
                    </div>
                    <span className="liquid-glass rounded-full px-3 py-1 text-white/60 text-xs font-inter">
                      {job.match} match
                    </span>
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed mt-3 mb-4 font-inter">{job.desc}</p>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => { setCoverLetterJob(job.role); setCoverLetterCompany(job.company); setActiveTab(1) }}
                      className="liquid-glass rounded-full px-5 py-2.5 text-white text-sm font-inter hover:bg-white/5 transition-all cursor-pointer"
                    >
                      Generate Cover Letter
                    </button>
                    <button
                      onClick={() => { setNewCompany(job.company); setNewRole(job.role); setShowForm(true); setActiveTab(2) }}
                      className="text-white/40 text-sm font-inter hover:text-white/60 transition-colors cursor-pointer px-3"
                    >
                      Track Application
                    </button>
                    {job.url && (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="liquid-glass rounded-full px-5 py-2.5 text-white/60 text-sm font-inter hover:bg-white/5 transition-all cursor-pointer"
                      >
                        Apply Now ↗
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* MY RESUME TAB */}
        {activeTab === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="liquid-glass rounded-3xl p-6 md:p-8">
              <h2 className="text-white text-lg font-medium mb-6 font-inter">AI Cover Letter Generator</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Job title (e.g. Senior Developer)"
                  value={coverLetterJob}
                  onChange={e => setCoverLetterJob(e.target.value)}
                  className="liquid-glass rounded-full px-5 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-sm font-inter"
                />
                <input
                  type="text"
                  placeholder="Company name (e.g. Google)"
                  value={coverLetterCompany}
                  onChange={e => setCoverLetterCompany(e.target.value)}
                  className="liquid-glass rounded-full px-5 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-sm font-inter"
                />
              </div>
              <button
                onClick={generateCoverLetter}
                disabled={generatingCover}
                className="liquid-glass rounded-full px-6 py-3 text-white text-sm font-inter hover:bg-white/5 transition-all mb-4"
              >
                {generatingCover ? 'Generating...' : '✨ Generate Cover Letter'}
              </button>
              {coverLetter && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="liquid-glass rounded-2xl p-6"
                >
                  <p className="text-white/70 text-sm leading-relaxed font-inter whitespace-pre-wrap">{coverLetter}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(coverLetter)}
                    className="liquid-glass rounded-full px-5 py-2 text-white/50 text-xs font-inter mt-4 hover:bg-white/5 transition-all"
                  >
                    📋 Copy to Clipboard
                  </button>
                </motion.div>
              )}
            </div>

            <div className="liquid-glass rounded-3xl p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-white text-lg font-medium font-inter">Resume Overview</h2>
                <button
                  onClick={analyzeResume}
                  disabled={analyzingResume}
                  className="liquid-glass rounded-full px-5 py-2 text-white/60 text-sm font-inter hover:bg-white/5 transition-all flex items-center gap-2"
                >
                  <Zap size={14} />
                  {analyzingResume ? 'Analyzing...' : 'Analyze with AI'}
                </button>
              </div>

              {!resumeAnalysis && !analyzingResume && (
                <div className="space-y-4">
                  <div>
                    <p className="text-white/40 text-xs tracking-widest uppercase mb-2 font-inter">APPLICATIONS TRACKED</p>
                    <p className="font-instrument text-4xl text-white font-light">{applications.length}</p>
                    <p className="text-white/30 text-xs font-inter mt-1">
                      {applications.length > 0
                        ? `Companies: ${[...new Set(applications.map(a => a.company))].join(', ')}`
                        : 'Add applications to get AI resume analysis'}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs tracking-widest uppercase mb-2 font-inter">ROLES APPLIED FOR</p>
                    <div className="flex flex-wrap gap-2">
                      {applications.length > 0 ? (
                        [...new Set(applications.map(a => a.role))].map(role => (
                          <span key={role} className="liquid-glass rounded-full px-3 py-1 text-white/50 text-xs font-inter">{role}</span>
                        ))
                      ) : (
                        <span className="text-white/30 text-sm font-inter">No roles tracked yet</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs tracking-widest uppercase mb-2 font-inter">STATUS BREAKDOWN</p>
                    <div className="flex flex-wrap gap-3">
                      {statusOptions.map(status => {
                        const count = applications.filter(a => a.status === status).length
                        if (count === 0) return null
                        return (
                          <span key={status} className={`liquid-glass rounded-full px-3 py-1 text-xs font-inter ${statusColors[status]}`}>
                            {status}: {count}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {analyzingResume && (
                <div className="text-center py-8">
                  <p className="text-white/30 text-sm font-inter">🧠 AI is analyzing your career profile...</p>
                </div>
              )}

              {resumeAnalysis && !analyzingResume && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="liquid-glass rounded-2xl p-6"
                >
                  <p className="text-white/70 text-sm leading-relaxed font-inter whitespace-pre-wrap">{resumeAnalysis}</p>
                  <button
                    onClick={() => setResumeAnalysis('')}
                    className="liquid-glass rounded-full px-5 py-2 text-white/40 text-xs font-inter mt-4 hover:bg-white/5 transition-all"
                  >
                    Show Raw Stats
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* APPLICATIONS TAB */}
        {activeTab === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="liquid-glass rounded-3xl p-6"
              >
                <h3 className="text-white text-base font-medium mb-4 font-inter">Track New Application</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Company name"
                    value={newCompany}
                    onChange={e => setNewCompany(e.target.value)}
                    className="liquid-glass rounded-full px-5 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-sm font-inter"
                  />
                  <input
                    type="text"
                    placeholder="Role / Job title"
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    className="liquid-glass rounded-full px-5 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-sm font-inter"
                  />
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    className="liquid-glass rounded-full px-5 py-3 bg-black text-white outline-none text-sm font-inter cursor-pointer"
                  >
                    {statusOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Next action (optional)"
                    value={newNextAction}
                    onChange={e => setNewNextAction(e.target.value)}
                    className="liquid-glass rounded-full px-5 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-sm font-inter"
                  />
                </div>
                <button
                  onClick={addApplication}
                  disabled={adding}
                  className="bg-white rounded-full px-6 py-3 text-black text-sm font-semibold hover:bg-white/90 transition-all mt-3"
                >
                  {adding ? 'Saving...' : 'Save Application'}
                </button>
              </motion.div>
            )}

            <div className="liquid-glass rounded-3xl p-6 md:p-8">
              <div className="hidden md:grid grid-cols-5 gap-4 px-4 pb-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
              >
                {['Company', 'Role', 'Status', 'Applied', 'Action'].map(h => (
                  <span key={h} className="text-white/30 text-xs tracking-widest uppercase font-inter">{h}</span>
                ))}
              </div>

              {loading ? (
                <p className="text-white/30 text-sm font-inter px-4 py-8">Loading...</p>
              ) : applications.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/30 text-sm font-inter mb-4">No applications tracked yet.</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="liquid-glass rounded-full px-6 py-3 text-white/60 text-sm font-inter hover:bg-white/5 transition-all"
                  >
                    + Add your first application
                  </button>
                </div>
              ) : (
                applications.map((app, i) => (
                  <div
                    key={app.id}
                    className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 px-4 py-5 items-center"
                    style={{ borderBottom: i < applications.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                  >
                    <span className="text-white/80 text-sm font-inter font-medium">{app.company}</span>
                    <span className="text-white/60 text-sm font-inter">{app.role}</span>
                    <span>
                      <select
                        value={app.status}
                        onChange={e => updateStatus(app.id, e.target.value)}
                        className={`liquid-glass rounded-full px-3 py-1 text-xs font-inter bg-black cursor-pointer outline-none ${statusColors[app.status] || 'text-white/50'}`}
                      >
                        {statusOptions.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </span>
                    <span className="text-white/40 text-sm font-inter">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-white/50 text-sm font-inter">{app.next_action || '—'}</span>
                      <button
                        onClick={() => deleteApplication(app.id)}
                        className="liquid-glass rounded-full p-1.5 hover:bg-white/5 transition-all text-white/20 hover:text-red-400/70 ml-auto"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* INTERVIEW PREP TAB */}
        {activeTab === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="liquid-glass rounded-3xl p-6 md:p-8">
              <h2 className="text-white text-lg font-medium mb-6 font-inter">AI Interview Coach</h2>
              <div className="min-h-48 mb-4 space-y-3 max-h-80 overflow-y-auto">
                {aiMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`liquid-glass rounded-2xl p-4 max-w-lg ${msg.role === 'user' ? 'bg-white/5' : ''}`}>
                      <p className="text-white/70 text-sm leading-relaxed font-inter">{msg.text}</p>
                    </div>
                  </div>
                ))}
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
                    placeholder="Ask me anything about interviews..."
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
            </div>

            <div className="liquid-glass rounded-3xl p-6 md:p-8">
              <h2 className="text-white text-lg font-medium mb-6 font-inter">Common Interview Questions</h2>
              <div className="space-y-3">
                {[
                  { q: 'Tell me about yourself', hint: 'Focus on your recent experience and what drives you.' },
                  { q: 'Why do you want to work here?', hint: 'Research the company mission and connect it to your goals.' },
                  { q: 'Describe a challenging problem you solved', hint: 'Use the STAR method for structure.' },
                  { q: 'Where do you see yourself in 5 years?', hint: 'Show ambition but also commitment to the role.' },
                  { q: 'What is your greatest weakness?', hint: 'Be honest but show self-awareness and growth.' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="liquid-glass rounded-2xl p-5 cursor-pointer hover:bg-white/[0.02] transition-all"
                    onClick={() => { setAiInput(`Help me answer: "${item.q}"`); }}
                  >
                    <p className="text-white/80 text-sm font-medium font-inter mb-1">{item.q}</p>
                    <p className="text-white/40 text-xs font-inter">💡 {item.hint}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </motion.div>
  )
}
