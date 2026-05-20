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
    full: 'Dear Candidate, We are pleased to offer you the position of Senior Developer at Google. Position: Senior Frontend Developer. Team: Chrome Browser. Location: Mountain View, CA. Compensation: $210,000 base plus equity. Please respond within 7 business days. Best regards, Sarah Chen, Google Recruiting.',
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
    full: 'We noticed a login from an unrecognized device in a new location. Please verify this was you. If this was not you, please secure your account immediately.',
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
    prompt: 'Write a professional follow-up email for a job application sent 1 week ago. Be polite and express continued interest.'
  },
  {
    name: 'Meeting Request',
    prompt: 'Write a professional email requesting a 30 minute meeting to discuss a business opportunity. Be clear and offer flexible timing.'
  },
  {
    name: 'Thank You After Interview',
    prompt: 'Write a thank you email after a job interview. Express gratitude and reinforce interest in the role.'
  },
  {
    name: 'Cold Outreach',
    prompt: 'Write a cold outreach email to a potential client. Be direct about the value proposition and end with a clear call to action.'
  },
  {
    name: 'Salary Negotiation',
    prompt: 'Write a professional email to negotiate a salary offer. Be confident but respectful and suggest a specific number.'
  },
]

export default function EmailPage() {
  const { user } = useUser()
  const [selectedEmail, setSelectedEmail] = useState(0)
  const [activeFolder, setActiveFolder] = useState(0)
  const [activeTab, setActiveTab] = useState('inbox')
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

  const doCopy = (text: string) => {
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.left = '-9999px'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    setCopyMessage('Copied! Paste into your email client.')
    setTimeout(() => setCopyMessage(''), 3000)
  }

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

  useEffect(() => {
    setAiDraft('')
    setDraftEdited('')
  }, [selectedEmail])

  const callGroq = async (prompt: string, maxTokens: number) => {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + import.meta.env.VITE_GROQ_API_KEY,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
      }),
    })
    const data = await response.json()
    return data.choices[0].message.content || ''
  }

  const generateDraft = async () => {
    setGeneratingDraft(true)
    const prompt = 'You are a professional email assistant. Read this email: ' + current.full + ' From: ' + current.sender + '. Subject: ' + current.subject + '. Write a professional natural concise reply under 100 words. Just the body no subject line.'
    try {
      const draft = await callGroq(prompt, 400)
      setAiDraft(draft)
      setDraftEdited(draft)
    } catch {
      setAiDraft('Could not generate draft. Please try again.')
      setDraftEdited('Could not generate draft. Please try again.')
    }
    setGeneratingDraft(false)
  }

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

  const deleteSavedEmail = async (id: string) => {
    await supabase.from('emails').delete().eq('id', id)
    fetchSavedEmails()
  }

  const composeWithAI = async () => {
    if (!composeEmail) return
    setComposing(true)
    const prompt = 'Write a professional email based on this request: ' + composeEmail + '. Context: ' + (composeContext || 'none') + '. Write only the email body. Sound natural and professional. End with appropriate sign off.'
    try {
      const result = await callGroq(prompt, 500)
      setComposedResult(result)
    } catch {
      setComposedResult('Could not compose email. Please try again.')
    }
    setComposing(false)
  }

  const analyzeTone = async () => {
    if (!toneText) return
    setAnalyzingTone(true)
    const prompt = 'Analyze the tone of this email in 2 to 3 sentences. Rate Professionalism, Friendliness, and Clarity each out of 10. Suggest one improvement. Email: ' + toneText
    try {
      const result = await callGroq(prompt, 200)
      setToneResult(result)
    } catch {
      setToneResult('Could not analyze tone. Please try again.')
    }
    setAnalyzingTone(false)
  }

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

        <div className="mb-8">
          <h1 className="font-instrument text-4xl text-white mb-2">
            Email and DM Assistant
          </h1>
          <p className="text-white/40 text-sm font-inter">
            AI reads, drafts, and manages your emails automatically.
          </p>
        </div>

        {copyMessage !== '' && (
          <div className="liquid-glass rounded-full px-6 py-3 text-white/70 text-sm font-inter mb-4 inline-block">
            {copyMessage}
          </div>
        )}

        <div className="liquid-glass rounded-full flex p-1 mb-8 w-fit overflow-x-auto">
          {[
            { key: 'inbox', label: 'Inbox' },
            { key: 'compose', label: 'Compose' },
            { key: 'templates', label: 'Templates' },
            { key: 'saved', label: 'Saved ' + savedEmails.length },
          ].map(function(tab) {
            return (
              <button
                key={tab.key}
                type="button"
                onClick={function() { setActiveTab(tab.key) }}
                className={
                  'rounded-full px-6 py-2.5 text-sm font-inter transition-all cursor-pointer whitespace-nowrap ' +
                  (activeTab === tab.key ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60')
                }
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {activeTab === 'inbox' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">

              <div className="md:col-span-2">
                <div className="liquid-glass rounded-2xl p-4 space-y-1">
                  {folders.map(function(folder, i) {
                    return (
                      <div
                        key={folder.label}
                        onClick={function() { setActiveFolder(i) }}
                        className={
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ' +
                          (activeFolder === i ? 'text-white bg-white/5' : 'text-white/50 hover:text-white hover:bg-white/5')
                        }
                      >
                        <folder.icon size={16} />
                        <span className="text-sm font-inter flex-1">{folder.label}</span>
                        {folder.count && (
                          <span className="text-white/30 text-xs font-inter">{folder.count}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="md:col-span-5">
                <div className="liquid-glass rounded-full px-5 py-3 flex items-center gap-3 mb-4">
                  <Search size={16} className="text-white/30" />
                  <input
                    placeholder="Search emails..."
                    className="bg-transparent text-white placeholder:text-white/30 outline-none w-full text-sm font-inter"
                  />
                </div>

                <div className="space-y-2">
                  {mockEmails.map(function(email, i) {
                    return (
                      <div
                        key={i}
                        onClick={function() { setSelectedEmail(i) }}
                        className={
                          'liquid-glass rounded-2xl p-5 cursor-pointer hover:bg-white/2 transition-all ' +
                          (selectedEmail === i ? 'bg-white/3 ' : '') +
                          (email.unread ? 'border-l-2 border-white/20' : '')
                        }
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
                    )
                  })}
                </div>
              </div>

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
                  <p className="text-white/60 text-sm leading-relaxed font-inter">
                    {current.full}
                  </p>
                </div>

                <div className="liquid-glass rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap size={16} className="text-white/60" />
                    <span className="text-white text-sm font-medium font-inter">
                      AI Draft Reply
                    </span>
                  </div>

                  {aiDraft === '' && generatingDraft === false && (
                    <button
                      type="button"
                      onClick={generateDraft}
                      className="liquid-glass rounded-full px-5 py-2.5 text-white/60 text-sm font-inter hover:bg-white/5 transition-all flex items-center gap-2"
                    >
                      <Zap size={14} />
                      Generate AI Reply
                    </button>
                  )}

                  {generatingDraft && (
                    <p className="text-white/30 text-sm font-inter">
                      AI is drafting your reply...
                    </p>
                  )}

                  {aiDraft !== '' && generatingDraft === false && (
                    <div>
                      <textarea
                        value={draftEdited}
                        onChange={function(e) { setDraftEdited(e.target.value) }}
                        className="liquid-glass rounded-xl p-4 w-full text-white/70 text-sm leading-relaxed min-h-32 bg-transparent outline-none resize-none font-inter mb-4"
                      />
                      <div className="flex gap-3 flex-wrap">
                        <button
                          type="button"
                          onClick={generateDraft}
                          className="liquid-glass rounded-full px-4 py-2 flex items-center gap-2 text-white/60 text-sm hover:bg-white/5 transition-all cursor-pointer font-inter"
                        >
                          <RotateCcw size={14} />
                          Regenerate
                        </button>
                        <button
                          type="button"
                          onClick={saveDraft}
                          className="liquid-glass rounded-full px-4 py-2 flex items-center gap-2 text-white/60 text-sm hover:bg-white/5 transition-all cursor-pointer font-inter"
                        >
                          <FileText size={14} />
                          {savingDraft ? 'Saving...' : 'Save Draft'}
                        </button>
                        <button
                          type="button"
                          onClick={function() { doCopy(draftEdited) }}
                          className="liquid-glass rounded-full px-4 py-2 flex items-center gap-2 text-white text-sm hover:bg-white/5 transition-all cursor-pointer font-inter"
                        >
                          <Send size={14} />
                          Copy and Send
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compose' && (
          <div className="space-y-6">
            <div className="liquid-glass rounded-3xl p-6 md:p-8">
              <h2 className="text-white text-lg font-medium mb-6 font-inter">
                AI Email Composer
              </h2>

              <div className="space-y-3 mb-4">
                <div className="liquid-glass rounded-2xl px-5 py-3">
                  <textarea
                    placeholder="What do you want to write? For example: Follow up on my job application at Google sent 1 week ago"
                    value={composeEmail}
                    onChange={function(e) { setComposeEmail(e.target.value) }}
                    className="bg-transparent text-white placeholder:text-white/30 outline-none w-full text-sm font-inter min-h-20 resize-none"
                  />
                </div>
                <div className="liquid-glass rounded-full px-5 py-3">
                  <input
                    placeholder="Any extra context? Optional"
                    value={composeContext}
                    onChange={function(e) { setComposeContext(e.target.value) }}
                    className="bg-transparent text-white placeholder:text-white/30 outline-none w-full text-sm font-inter"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={composeWithAI}
                disabled={composing || composeEmail === ''}
                className="liquid-glass rounded-full px-6 py-3 text-white text-sm font-inter hover:bg-white/5 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Zap size={16} />
                {composing ? 'Writing...' : 'Write Email with AI'}
              </button>

              {composedResult !== '' && composing === false && (
                <div className="liquid-glass rounded-2xl p-6 mt-6">
                  <p className="text-white/70 text-sm leading-relaxed font-inter mb-4">
                    {composedResult}
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={function() { doCopy(composedResult) }}
                      className="liquid-glass rounded-full px-5 py-2 text-white/60 text-sm font-inter hover:bg-white/5 transition-all flex items-center gap-2"
                    >
                      <Send size={14} />
                      Copy and Send
                    </button>
                    <button
                      type="button"
                      onClick={composeWithAI}
                      className="liquid-glass rounded-full px-5 py-2 text-white/50 text-sm font-inter hover:bg-white/5 transition-all flex items-center gap-2"
                    >
                      <RotateCcw size={14} />
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>

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
                  onChange={function(e) { setToneText(e.target.value) }}
                  className="bg-transparent text-white placeholder:text-white/30 outline-none w-full text-sm font-inter min-h-24 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={analyzeTone}
                disabled={analyzingTone || toneText === ''}
                className="liquid-glass rounded-full px-6 py-3 text-white text-sm font-inter hover:bg-white/5 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <ArrowRight size={16} />
                {analyzingTone ? 'Analyzing...' : 'Analyze Tone'}
              </button>

              {toneResult !== '' && analyzingTone === false && (
                <div className="liquid-glass rounded-2xl p-6 mt-4">
                  <p className="text-white/70 text-sm leading-relaxed font-inter">
                    {toneResult}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="liquid-glass rounded-3xl p-6 md:p-8">
            <h2 className="text-white text-lg font-medium mb-2 font-inter">
              Email Templates
            </h2>
            <p className="text-white/40 text-sm font-inter mb-6">
              Click any template to instantly generate a professional email.
            </p>

            <div className="space-y-3">
              {emailTemplates.map(function(template, i) {
                return (
                  <div
                    key={i}
                    className="liquid-glass rounded-2xl p-5 flex items-center justify-between hover:bg-white/2 transition-all cursor-pointer group"
                    onClick={function() { useTemplate(template) }}
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
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="liquid-glass rounded-3xl p-6 md:p-8">
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
                  type="button"
                  onClick={function() { setActiveTab('inbox') }}
                  className="liquid-glass rounded-full px-6 py-3 text-white/60 text-sm font-inter hover:bg-white/5 transition-all"
                >
                  Go to Inbox to generate drafts
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {savedEmails.map(function(email, i) {
                  return (
                    <div
                      key={email.id}
                      className="liquid-glass rounded-2xl p-5 hover:bg-white/2 transition-all"
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
                            type="button"
                            onClick={function() { doCopy(email.ai_draft) }}
                            className="liquid-glass rounded-full px-4 py-1.5 text-xs text-white/50 font-inter hover:bg-white/5 transition-all mt-3 flex items-center gap-1"
                          >
                            <Send size={11} />
                            Copy and Send
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={function() { deleteSavedEmail(email.id) }}
                          className="liquid-glass rounded-full p-2 hover:bg-white/5 transition-all text-white/20 hover:text-red-400/70 flex-shrink-0"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </main>
    </motion.div>
  )
}
