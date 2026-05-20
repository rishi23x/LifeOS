import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  Mail, AlertCircle, FileText, Send, Shield, BookOpen, Search,
  Zap, RotateCcw, Trash2, ArrowRight
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { supabase } from '../lib/supabase'
import { useUser } from '@clerk/clerk-react'

const folders = [
  { icon: Mail, label: 'Inbox', count: '47', active: true },
  { icon: AlertCircle, label: 'Urgent', count: '3' },
  { icon: FileText, label: 'Drafts', count: '12' },
  { icon: Send, label: 'Sent' },
  { icon: Shield, label: 'Spam', count: '8' },
  { icon: BookOpen, label: 'Newsletters', count: '23' },
]

const mockEmails = [
  {
    sender: 'Google Careers',
    subject: 'Job Offer: Senior Developer',
    preview: 'We are pleased to offer you...',
    time: '2m',
    aiDrafted: true,
    unread: true,
    urgent: false,
    full: `Dear Candidate,

We are pleased to offer you the position of Senior Developer at Google. After careful consideration of your application and interviews, the hiring committee has unanimously decided to extend this offer.

Position: Senior Frontend Developer
Team: Chrome Browser
Location: Mountain View, CA (Hybrid)
Compensation: $210,000 base + equity package

We believe your experience and skills will be a great addition to our team. Please review the attached offer letter and let us know your decision within 7 business days.

Best regards,
Sarah Chen
Technical Recruiting, Google`,
    senderEmail: 'careers@google.com',
  },
  {
    sender: 'Stripe HR',
    subject: 'Interview scheduled for Tuesday',
    preview: 'Please confirm your availability...',
    time: '1h',
    unread: true,
    urgent: false,
    aiDrafted: false,
    full: 'Please confirm your availability for the technical interview scheduled for Tuesday at 2:00 PM PST. The interview will be conducted via Zoom and will last approximately 90 minutes.',
    senderEmail: 'hr@stripe.com',
  },
  {
    sender: 'Bank of America',
    subject: 'Unusual activity detected',
    preview: 'We noticed a login from...',
    time: '3h',
    urgent: true,
    unread: false,
    aiDrafted: false,
    full: 'We noticed a login from an unrecognized device in a new location. Please verify this was you by clicking the link below. If this was not you, please secure your account immediately.',
    senderEmail: 'alerts@bankofamerica.com',
  },
  {
    sender: 'LinkedIn',
    subject: '12 people viewed your profile',
    preview: 'Your profile appeared in...',
    time: '5h',
    unread: false,
    urgent: false,
    aiDrafted: false,
    full: 'Your profile appeared in 12 search results this week. You also received 3 new connection requests from people in your industry.',
    senderEmail: 'notifications@linkedin.com',
  },
  {
    sender: 'Netflix',
    subject: 'Your payment failed',
    preview: 'We could not process...',
    time: '8h',
    unread: false,
    urgent: false,
    aiDrafted: false,
    full: 'We could not process your payment of $15.99. Please update your billing information to continue enjoying Netflix.',
    senderEmail: 'billing@netflix.com',
  },
]

const emailTemplates = [
  {
    name: 'Job Application Follow Up',
    prompt: 'Write a professional follow-up email for a job application I sent 1 week ago. Be polite, concise, and express continued interest.'
  },
  {
    name: 'Meeting Request',
    prompt: 'Write a professional email requesting a 30-minute meeting to discuss a business opportunity. Be clear about the purpose and offer flexible timing.'
  },
  {
    name: 'Thank You After Interview',
    prompt: 'Write a thank you email to send after a job interview. Express gratitude, reinforce interest in the role, and mention one specific thing discussed.'
  },
  {
    name: 'Cold Outreach',
    prompt: 'Write a cold outreach email to a potential client or partner. Be direct about the value proposition and end with a clear call to action.'
  },
  {
    name: 'Salary Negotiation',
    prompt: 'Write a professional email to negotiate a salary offer. Be confident but respectful, provide reasoning, and suggest a specific number.'
  },
]

export default function EmailPage() {
  const { user } = useUser()
  const [selectedEmail, setSelectedEmail] = useState(0)
  const [activeFolder, setActiveFolder] = useState(0)
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose' | 'templates' | 'saved'>('inbox')
  const [aiDraft, setAiDraft] = useState('')
  const [generatingDraft, setGeneratingDraft] = useState(false)
  const [draftEdited, setDraftEdited] = useState('')
  const [composeEmail, setComposeEmail] = useState('')
  const [composeContext, setComposeContext] = useState('')
  const [composedResult, setComposedResult] = useState('')
  const [composing, setComposing] = useState(false)
  const [toneText, setToneText] = useState('')
  const [toneResult, setToneResult] = useState('')
  const [analyzingTone, setAnalyzingTone] = useState(false)
  const [savedEmails, setSavedEmails] = useState<any[]>([])
  const [loadingSaved, setLoadingSaved] = useState(true)
  const [savingDraft, setSavingDraft] = useState(false)
  const [copyMessage, setCopyMessage] = useState('')

  const current = mockEmails[selectedEmail]

  // Copy to clipboard with fallback
  const copyToClipboard = (text: string) => {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  textarea.style.top = '0'
  textarea.style.left = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()

  try {
    document.execCommand('copy')
    setCopyMessage('✅ Copied! Now paste into your email.')
  } catch {
    setCopyMessage('❌ Copy failed. Please select and copy manually.')
  }

  document.body.removeChild(textarea)
  setTimeout(() => setCopyMessage(''), 4000)
}

  // Fetch saved emails
  const fetchSavedEmails = async () => {
    if (!user) return
    setLoadingSaved(true)
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (!error && data) setSavedEmails(data)
    setLoadingSaved(false)
  }

  useEffect(() => {
    fetchSavedEmails()
  }, [user])

  // Reset draft when email changes
  useEffect(() => {
    setAiDraft('')
    setDraftEdited('')
  }, [selectedEmail])

  // Call Groq
  const callGroq = async (prompt: string, maxTokens = 400) => {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
      }),
    })
    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  }

  // Generate AI draft
  const generateDraft = async () => {
    setGeneratingDraft(true)
    const prompt = `You are a professional email assistant writing on behalf of the user.

Read this email carefully:
"${current.full}"

From: ${current.sender} (${current.senderEmail})
Subject: ${current.subject}

Write a professional, natural, and concise reply email.
- Keep it under 100 words
- Sound human not robotic
- Be appropriate for the context
- Do not include subject line
- Just write the body of the reply`

    try {
      const draft = await callGroq(prompt)
      setAiDraft(draft)
      setDraftEdited(draft)
    } catch {
      setAiDraft('Could not generate draft. Please try again.')
      setDraftEdited('Could not generate draft. Please try again.')
    }
    setGeneratingDraft(false)
  }

  // Save draft to Supabase
  const saveDraft = async () => {
    if (!user || !draftEdited) return
    setSavingDraft(true)
    await supabase.from('emails').insert({
      user_id: user.id,
      sender: current.sender,
      subject: current.subject,
      body: current.full,
      ai_draft: draftEdited,
      status: 'draft',
    })
    fetchSavedEmails()
    setSavingDraft(false)
  }

  // Delete saved email
  const deleteSavedEmail = async (id: string) => {
    await supabase.from('emails').delete().eq('id', id)
    fetchSavedEmails()
  }

  // Compose with AI
  const composeWithAI = async () => {
    if (!composeEmail) return
    setComposing(true)
    const prompt = `You are a professional email writer.

Write a professional email based on this request:
"${composeEmail}"

Additional context: "${composeContext || 'none'}"

Requirements:
- Write only the email body
- Sound natural and professional
- Be concise and clear
- End with an appropriate sign-off`

    try {
      const result = await callGroq(prompt, 500)
      setComposedResult(result)
    } catch {
      setComposedResult('Could not compose email. Please try again.')
    }
    setComposing(false)
  }

  // Analyze tone
  const analyzeTone = async () => {
    if (!toneText) return
    setAnalyzingTone(true)
    const prompt = `Analyze the tone of this email in 2-3 sentences.
Rate it on: Professionalism (1-10), Friendliness (1-10), Clarity (1-10).
Suggest one specific improvement.

Email: "${toneText}"`

    try {
      const result = await callGroq(prompt, 200)
      setToneResult(result)
    } catch {
      setToneResult('Could not analyze tone. Please try again.')
    }
    setAnalyzingTone(false)
  }

  // Use template
  const useTemplate = (template: any) => {
    setActiveTab('compose')
    setComposeEmail(template.prompt)
    setComposedResult('')
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
        <div className="mb-8">
          <h1 className="font-instrument text-4xl text-white mb-2">
            Email & DM Assistant
          </h1>
          <p className="text-white/40 text-sm font-inter">
            AI reads, drafts, and manages your emails automatically.
          </p>
        </div>

        {/* Copy Message Toast */}
        {copyMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="liquid-glass rounded-full px-6 py-3 text-white/70 text-sm font-inter mb-4 inline-block"
          >
            {copyMessage}
          </motion.div>
        )}

        {/* Tab Selector */}
        <div className="liquid-glass rounded-full flex p-1 mb-8 w-fit overflow-x-auto">
          {[
            { key: 'inbox', label: '📬 Inbox' },
            { key: 'compose', label: '✍️ Compose' },
            { key: 'templates', label: '📋 Templates' },
            { key: 'saved', label: `💾 Saved (${savedEmails.length})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`rounded-full px-6 py-2.5 text-sm font-inter transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* INBOX TAB */}
        {activeTab === 'inbox' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">

              {/* Folder Panel */}
              <div className="md:col-span-2">
                <div className="liquid-glass rounded-2xl p-4 space-y-1">
                  {folders.map((folder, i) => (
                    <div
                      key={folder.label}
                      onClick={() => setActiveFolder(i)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                        activeFolder === i
                          ? 'text-white bg-white/5'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <folder.icon size={16} />
                      <span className="text-sm font-inter flex-1">{folder.label}</span>
                      {folder.count && (
                        <span className="text-white/30 text-xs font-inter">{folder.count}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Email List */}
              <div className="md:col-span-5">
                <div className="liquid-glass rounded-full px-5 py-3 flex items-center gap-3 mb-4">
                  <Search size={16} className="text-white/30" />
                  <input
                    placeholder="Search emails..."
                    className="bg-transparent text-white placeholder:text-white/30 outline-none w-full text-sm font-inter"
                  />
                </div>

                <div className="space-y-2">
                  {mockEmails.map((email, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedEmail(i)}
                      className={`liquid-glass rounded-2xl p-5 cursor-pointer hover:bg-white/[0.02] transition-all ${
                        selectedEmail === i ? 'bg-white/[0.03]' : ''
                      } ${email.unread ? 'border-l-2 border-white/20' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-white/80 text-sm font-medium font-inter">
                          {email.sender}
                        </span>
                        <span className="text-white/30 text-xs font-inter flex-shrink-0 ml-2">
                          {email.time}
                        </span>
                      </div>
                      <p className="text-white/60 text-sm mt-1 truncate font-inter">
                        {email.subject}
                      </p>
                      <p className="text-white/30 text-xs mt-1 truncate font-inter">
                        {email.preview}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {email.aiDrafted && (
                          <span className="liquid-glass rounded-full px-2 py-0.5 text-white/40 text-xs font-inter">
                            AI Drafted
                          </span>
                        )}
                        {email.urgent && (
                          <span className="liquid-glass rounded-full px-2 py-0.5 text-red-400/70 text-xs font-inter">
                            URGENT
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Preview + AI Draft */}
              <div className="md:col-span-5 space-y-4">
                <div className="liquid-glass rounded-2xl p-6">
                  <div className="mb-6">
                    <h3 className="text-white text-lg font-medium font-inter">
                      {current.sender}
                    </h3>
                    <p className="text-white/40 text-sm font-inter">{current.senderEmail}</p>
                    <p className="text-white/60 text-sm mt-1 font-inter">{current.subject}</p>
                    <p className="text-white/30 text-xs font-inter mt-1">{current.time} ago</p>
                  </div>
                  <div className="text-white/60 text-sm leading-relaxed font-inter whitespace-pre-line">
                    {current.full}
                  </div>
                </div>

                {/* AI Draft Panel */}
                <div className="liquid-glass rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap size={16} className="text-white/60" />
                    <span className="text-white text-sm font-medium font-inter">
                      AI Draft Reply
                    </span>
                  </div>

                  {!aiDraft && !generatingDraft && (
                    <button
                      onClick={generateDraft}
                      className="liquid-glass rounded-full px-5 py-2.5 text-white/60 text-sm font-inter hover:bg-white/5 transition-all flex items-center gap-2"
                    >
                      <Zap size={14} />
                      Generate AI Reply
                    </button>
                  )}

                  {generatingDraft && (
                    <p className="text-white/30 text-sm font-inter">
                      🧠 AI is drafting your reply...
                    </p>
                  )}

                  {aiDraft && !generatingDraft && (
                    <>
                      <textarea
                        value={draftEdited}
                        onChange={e => setDraftEdited(e.target.value)}
                        className="liquid-glass rounded-xl p-4 w-full text-white/70 text-sm leading-relaxed min-h-32 bg-transparent outline-none resize-none font-inter mb-4"
                      />
                      <div className="flex gap-3 flex-wrap">
                        <button
                          onClick={generateDraft}
                          className="liquid-glass rounded-full px-4 py-2 flex items-center gap-2 text-white/60 text-sm hover:bg-white/5 transition-all cursor-pointer font-inter"
                        >
                          <RotateCcw size={14} />
                          Regenerate
                        </button>
                        <button
                          onClick={saveDraft}
                          disabled={savingDraft}
                          className="liquid-glass rounded-full px-4 py-2 flex items-center gap-2 text-white/60 text-sm hover:bg-white/5 transition-all cursor-pointer font-inter"
                        >
                          <FileText size={14} />
                          {savingDraft ? 'Saving...' : 'Save Draft'}
                        </button>
                        <button
                          onClick={() => copyToClipboard(draftEdited)}
                          className="liquid-glass rounded-full px-4 py-2 flex items-center gap-2 text-white text-sm hover:bg-white/5 transition-all cursor-pointer font-inter"
                        >
                          <Send size={14} />
                          Copy & Send
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* COMPOSE TAB */}
        {activeTab === 'compose' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* AI Email Composer */}
            <div className="liquid-glass rounded-3xl p-6 md:p-8">
              <h2 className="text-white text-lg font-medium mb-6 font-inter">
                AI Email Composer
              </h2>

              <div className="space-y-3 mb-4">
                <div className="liquid-glass rounded-2xl px-5 py-3">
                  <textarea
                    placeholder="What do you want to write? (e.g. Follow up on my job application at Google sent 1 week ago...)"
                    value={composeEmail}
                    onChange={e => setComposeEmail(e.target.value)}
                    className="bg-transparent text-white placeholder:text-white/30 outline-none w-full text-sm font-inter min-h-20 resize-none"
                  />
                </div>
                <div className="liquid-glass rounded-full px-5 py-3">
                  <input
                    placeholder="Any extra context? (optional)"
                    value={composeContext}
                    onChange={e => setComposeContext(e.target.value)}
                    className="bg-transparent text-white placeholder:text-white/30 outline-none w-full text-sm font-inter"
                  />
                </div>
              </div>

              <button
                onClick={composeWithAI}
                disabled={composing || !composeEmail}
                className="liquid-glass rounded-full px-6 py-3 text-white text-sm font-inter hover:bg-white/5 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Zap size={16} />
                {composing ? 'Writing...' : '✨ Write Email with AI'}
              </button>

              {composedResult && !composing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="liquid-glass rounded-2xl p-6 mt-6"
                >
                  <p className="text-white/70 text-sm leading-relaxed font-inter whitespace-pre-wrap mb-4">
                    {composedResult}
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <button
  onClick={(e) => {
    e.preventDefault()
    e.stopPropagation()
    alert('Copying: ' + draftEdited.slice(0, 50))
    copyToClipboard(draftEdited)
  }}
  className="liquid-glass rounded-full px-4 py-2 flex items-center gap-2 text-white text-sm hover:bg-white/5 transition-all cursor-pointer font-inter"
  type="button"
>
  <Send size={14} />
  Copy & Send
</button>
                      onClick={composeWithAI}
                      className="liquid-glass rounded-full px-5 py-2 text-white/50 text-sm font-inter hover:bg-white/5 transition-all flex items-center gap-2"
                    >
                      <RotateCcw size={14} />
                      Regenerate
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Tone Analyzer */}
            <div className="liquid-glass rounded-3xl p-6 md:p-8">
              <h2 className="text-white text-lg font-medium mb-2 font-inter">
                Tone Analyzer
              </h2>
              <p className="text-white/40 text-xs font-inter mb-4">
                Paste any email to analyze its tone before sending.
              </p>

              <div className="liquid-glass rounded-2xl px-5 py-3 mb-4">
                <textarea
                  placeholder="Paste your email here to analyze the tone..."
                  value={toneText}
                  onChange={e => setToneText(e.target.value)}
                  className="bg-transparent text-white placeholder:text-white/30 outline-none w-full text-sm font-inter min-h-24 resize-none"
                />
              </div>

              <button
                onClick={analyzeTone}
                disabled={analyzingTone || !toneText}
                className="liquid-glass rounded-full px-6 py-3 text-white text-sm font-inter hover:bg-white/5 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <ArrowRight size={16} />
                {analyzingTone ? 'Analyzing...' : 'Analyze Tone'}
              </button>

              {toneResult && !analyzingTone && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="liquid-glass rounded-2xl p-6 mt-4"
                >
                  <p className="text-white/70 text-sm leading-relaxed font-inter whitespace-pre-wrap">
                    {toneResult}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="liquid-glass rounded-3xl p-6 md:p-8"
          >
            <h2 className="text-white text-lg font-medium mb-2 font-inter">
              Email Templates
            </h2>
            <p className="text-white/40 text-sm font-inter mb-6">
              Click any template to instantly generate a professional email.
            </p>

            <div className="space-y-3">
              {emailTemplates.map((template, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="liquid-glass rounded-2xl p-5 flex items-center justify-between hover:bg-white/[0.02] transition-all cursor-pointer group"
                  onClick={() => useTemplate(template)}
                >
                  <div>
                    <p className="text-white/80 text-sm font-medium font-inter mb-1">
                      {template.name}
                    </p>
                    <p className="text-white/40 text-xs font-inter">
                      Click to generate with AI
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-white/30 group-hover:text-white/60 transition-colors flex-shrink-0"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SAVED TAB */}
        {activeTab === 'saved' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="liquid-glass rounded-3xl p-6 md:p-8"
          >
            <h2 className="text-white text-lg font-medium mb-6 font-inter">
              Saved Drafts
            </h2>

            {loadingSaved ? (
              <p className="text-white/30 text-sm font-inter">Loading...</p>
            ) : savedEmails.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/30 text-sm font-inter mb-4">
                  No saved drafts yet.
                </p>
                <button
                  onClick={() => setActiveTab('inbox')}
                  className="liquid-glass rounded-full px-6 py-3 text-white/60 text-sm font-inter hover:bg-white/5 transition-all"
                >
                  Go to Inbox to generate drafts
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {savedEmails.map((email, i) => (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="liquid-glass rounded-2xl p-5 hover:bg-white/[0.02] transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="text-white/80 text-sm font-medium font-inter">
                            Re: {email.subject}
                          </span>
                          <span className="liquid-glass rounded-full px-2 py-0.5 text-white/40 text-xs font-inter">
                            {email.status}
                          </span>
                        </div>
                        <p className="text-white/40 text-xs font-inter mb-3">
                          To: {email.sender}
                        </p>
                        <p className="text-white/60 text-sm leading-relaxed font-inter">
                          {email.ai_draft}
                        </p>
                        <button
                          onClick={() => copyToClipboard(email.ai_draft)}
                          className="liquid-glass rounded-full px-4 py-1.5 text-xs text-white/50 font-inter hover:bg-white/5 transition-all mt-3 flex items-center gap-1"
                        >
                          <Send size={11} />
                          Copy & Send
                        </button>
                      </div>
                      <button
                        onClick={() => deleteSavedEmail(email.id)}
                        className="liquid-glass rounded-full p-2 hover:bg-white/5 transition-all text-white/20 hover:text-red-400/70 flex-shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>
    </motion.div>
  )
}
