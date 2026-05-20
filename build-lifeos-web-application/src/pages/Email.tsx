import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  Mail, AlertCircle, FileText, Send, Shield, BookOpen, Search,
  Zap, RotateCcw, Trash2, ArrowRight, LogIn
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { supabase } from '../lib/supabase'
import { useUser } from '@clerk/clerk-react'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const REDIRECT_URI = 'https://life-os-eosin-gamma.vercel.app/dashboard/email'
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify'

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

interface Email {
  id: string
  sender: string
  senderEmail: string
  subject: string
  preview: string
  full: string
  time: string
  category: 'urgent' | 'important' | 'normal' | 'spam'
  unread: boolean
  aiDrafted: boolean
}

export default function EmailPage() {
  const { user } = useUser()

  // Gmail OAuth state
  const [gmailToken, setGmailToken] = useState<string | null>(
    localStorage.getItem('gmail_token')
  )
  const [gmailConnected, setGmailConnected] = useState(false)
  const [loadingEmails, setLoadingEmails] = useState(false)

  // Email state
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState(0)
  const [activeFolder, setActiveFolder] = useState('all')
  const [activeTab, setActiveTab] = useState('inbox')
  const [searchQuery, setSearchQuery] = useState('')

  // AI Draft state
  const [aiDraft, setAiDraft] = useState('')
  const [generatingDraft, setGeneratingDraft] = useState(false)
  const [draftEdited, setDraftEdited] = useState('')
  const [savingDraft, setSavingDraft] = useState(false)

  // Compose state
  const [composeEmail, setComposeEmail] = useState('')
  const [composeContext, setComposeContext] = useState('')
  const [composedResult, setComposedResult] = useState('')
  const [composing, setComposing] = useState(false)

  // Tone analyzer
  const [toneText, setToneText] = useState('')
  const [toneResult, setToneResult] = useState('')
  const [analyzingTone, setAnalyzingTone] = useState(false)

  // Saved emails
  const [savedEmails, setSavedEmails] = useState<any[]>([])
  const [loadingSaved, setLoadingSaved] = useState(true)

  // Copy message
  const [copyMessage, setCopyMessage] = useState('')

  // On load check for OAuth code or existing token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      window.history.replaceState({}, '', '/dashboard/email')
      exchangeCodeForToken(code)
    } else if (gmailToken) {
      setGmailConnected(true)
      fetchGmailEmails(gmailToken)
    }
  }, [])

  useEffect(() => {
    fetchSavedEmails()
  }, [user])

  useEffect(() => {
    setAiDraft('')
    setDraftEdited('')
  }, [selectedEmail])

  // Connect Gmail
  const connectGmail = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPES)}&access_type=offline&prompt=consent`
    window.location.href = authUrl
  }

  // Exchange code for token
  const exchangeCodeForToken = async (code: string) => {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      })
      const data = await response.json()
      if (data.access_token) {
        localStorage.setItem('gmail_token', data.access_token)
        setGmailToken(data.access_token)
        setGmailConnected(true)
        fetchGmailEmails(data.access_token)
      }
    } catch (error) {
      console.error('Token exchange error:', error)
    }
  }

  // Fetch real Gmail emails
  const fetchGmailEmails = async (token: string) => {
    setLoadingEmails(true)
    try {
      const listResponse = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=in:inbox',
        { headers: { Authorization: 'Bearer ' + token } }
      )
      const listData = await listResponse.json()

      if (!listData.messages) {
        setLoadingEmails(false)
        return
      }

      const emailPromises = listData.messages.slice(0, 10).map(async (msg: any) => {
        const msgResponse = await fetch(
          'https://gmail.googleapis.com/gmail/v1/users/me/messages/' + msg.id + '?format=full',
          { headers: { Authorization: 'Bearer ' + token } }
        )
        return msgResponse.json()
      })

      const emailData = await Promise.all(emailPromises)

      const parsedEmails = emailData.map((email: any) => {
        const headers = email.payload?.headers || []
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject'
        const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown'
        const date = headers.find((h: any) => h.name === 'Date')?.value || ''

        const senderName = from.includes('<') ? from.split('<')[0].trim() : from
        const senderEmail = from.includes('<') ? from.split('<')[1].replace('>', '').trim() : from

        let body = ''
        if (email.payload?.body?.data) {
          body = atob(email.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'))
        } else if (email.payload?.parts) {
          const textPart = email.payload.parts.find(
            (p: any) => p.mimeType === 'text/plain'
          )
          if (textPart?.body?.data) {
            body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'))
          }
        }

        body = body.replace(/<[^>]*>/g, '').trim()
        if (!body) body = email.snippet || 'No content'

        const isUnread = email.labelIds?.includes('UNREAD') || false
        const timeAgo = getTimeAgo(new Date(date))

        return {
          id: email.id,
          sender: senderName.replace(/"/g, ''),
          senderEmail,
          subject,
          preview: email.snippet || '',
          full: body.slice(0, 1000),
          time: timeAgo,
          category: 'normal' as const,
          unread: isUnread,
          aiDrafted: false,
        }
      })

      // AI categorize all emails
      const categorized = await categorizeEmails(parsedEmails)
      setEmails(categorized)
    } catch (error) {
      console.error('Gmail fetch error:', error)
    }
    setLoadingEmails(false)
  }

  // AI categorize emails
  const categorizeEmails = async (emailList: Email[]) => {
    try {
      const summaries = emailList.map((e, i) =>
        i + ': Subject: ' + e.subject + ' From: ' + e.sender + ' Preview: ' + e.preview
      ).join('\n')

      const prompt = `You are an email categorization AI.
Categorize each email as exactly one of: urgent, important, normal, spam.

Rules:
- urgent = security alerts, payment failures, account issues, deadlines, job offers
- important = meetings, interviews, follow ups, business emails, personal emails
- normal = newsletters, notifications, social media, updates
- spam = promotions, advertisements, junk

Emails:
${summaries}

Return ONLY a JSON array of categories in the same order.
Example: ["urgent","normal","important","spam","normal"]
No other text. Just the JSON array.`

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + import.meta.env.VITE_GROQ_API_KEY,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 200,
        }),
      })

      const data = await response.json()
      const content = data.choices[0].message.content.trim()
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const categories = JSON.parse(cleaned)

      return emailList.map((email, i) => ({
        ...email,
        category: (categories[i] || 'normal') as Email['category'],
      }))
    } catch {
      return emailList
    }
  }

  // Get time ago string
  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (minutes < 60) return minutes + 'm'
    if (hours < 24) return hours + 'h'
    return days + 'd'
  }

  // Disconnect Gmail
  const disconnectGmail = () => {
    localStorage.removeItem('gmail_token')
    setGmailToken(null)
    setGmailConnected(false)
    setEmails([])
  }

  // Copy to clipboard
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
    setTimeout(function() { setCopyMessage('') }, 3000)
  }

  // Fetch saved emails from Supabase
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

  // Call Groq
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

  // Generate AI draft
  const generateDraft = async () => {
    if (emails.length === 0) return
    const current = emails[selectedEmail]
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

  // Save draft
  const saveDraft = async () => {
    if (!user || !draftEdited || emails.length === 0) return
    const current = emails[selectedEmail]
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
    const prompt = 'Write a professional email based on this request: ' + composeEmail + '. Context: ' + (composeContext || 'none') + '. Write only the email body. Sound natural and professional.'
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
    const prompt = 'Analyze the tone of this email in 2 to 3 sentences. Rate Professionalism, Friendliness, and Clarity each out of 10. Suggest one improvement. Email: ' + toneText
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

  // Get category color
  const getCategoryColor = (category: string) => {
    if (category === 'urgent') return 'text-red-400'
    if (category === 'important') return 'text-yellow-400'
    if (category === 'normal') return 'text-green-400'
    return 'text-white/30'
  }

  const getCategoryDot = (category: string) => {
    if (category === 'urgent') return 'bg-red-400'
    if (category === 'important') return 'bg-yellow-400'
    if (category === 'normal') return 'bg-green-400'
    return 'bg-white/20'
  }

  const getCategoryBadge = (category: string) => {
    if (category === 'urgent') return 'text-red-400/80 border border-red-400/30'
    if (category === 'important') return 'text-yellow-400/80 border border-yellow-400/30'
    if (category === 'normal') return 'text-green-400/80 border border-green-400/30'
    return 'text-white/30'
  }

  // Filter emails by folder
  const filteredEmails = emails.filter(function(email) {
    if (searchQuery) {
      return email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.sender.toLowerCase().includes(searchQuery.toLowerCase())
    }
    if (activeFolder === 'urgent') return email.category === 'urgent'
    if (activeFolder === 'important') return email.category === 'important'
    if (activeFolder === 'spam') return email.category === 'spam'
    return true
  })

  const urgentCount = emails.filter(function(e) { return e.category === 'urgent' }).length
  const importantCount = emails.filter(function(e) { return e.category === 'important' }).length
  const spamCount = emails.filter(function(e) { return e.category === 'spam' }).length
  const unreadCount = emails.filter(function(e) { return e.unread }).length

  const folders = [
    { key: 'all', icon: Mail, label: 'Inbox', count: unreadCount > 0 ? String(unreadCount) : '' },
    { key: 'urgent', icon: AlertCircle, label: 'Urgent', count: urgentCount > 0 ? String(urgentCount) : '' },
    { key: 'important', icon: FileText, label: 'Important', count: importantCount > 0 ? String(importantCount) : '' },
    { key: 'all', icon: Send, label: 'Sent', count: '' },
    { key: 'spam', icon: Shield, label: 'Spam', count: spamCount > 0 ? String(spamCount) : '' },
    { key: 'all', icon: BookOpen, label: 'Newsletters', count: '' },
  ]

  const current = filteredEmails[selectedEmail] || emails[0]

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
            {gmailConnected ? emails.length + ' emails loaded from your Gmail' : 'Connect your Gmail to get started'}
          </p>
        </div>

        {copyMessage !== '' && (
          <div className="liquid-glass rounded-full px-6 py-3 text-white/70 text-sm font-inter mb-4 inline-block">
            {copyMessage}
          </div>
        )}

        {/* Gmail Connection Banner */}
        {!gmailConnected && (
          <div className="liquid-glass rounded-3xl p-8 mb-8 text-center">
            <Mail size={48} className="text-white/20 mx-auto mb-4" />
            <h2 className="font-instrument text-2xl text-white mb-3">
              Connect your Gmail
            </h2>
            <p className="text-white/40 text-sm font-inter mb-6 max-w-md mx-auto">
              LifeOS will read your emails, categorize them by urgency using AI, and draft replies in your voice automatically.
            </p>
            <button
              type="button"
              onClick={connectGmail}
              className="liquid-glass rounded-full px-8 py-3.5 text-white text-sm font-inter hover:bg-white/5 transition-all flex items-center gap-2 mx-auto"
            >
              <LogIn size={16} />
              Connect Gmail Account
            </button>
            <p className="text-white/20 text-xs font-inter mt-4">
              Read only access. We never send emails without your approval.
            </p>
          </div>
        )}

        {gmailConnected && (
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400/70 text-sm font-inter">Gmail Connected</span>
              {loadingEmails && (
                <span className="text-white/30 text-xs font-inter">Loading emails...</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={function() { if (gmailToken) fetchGmailEmails(gmailToken) }}
                className="liquid-glass rounded-full px-4 py-2 text-white/50 text-xs font-inter hover:bg-white/5 transition-all"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={disconnectGmail}
                className="liquid-glass rounded-full px-4 py-2 text-red-400/50 text-xs font-inter hover:bg-white/5 transition-all"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}

        {/* AI Category Legend */}
        {gmailConnected && emails.length > 0 && (
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              <span className="text-white/40 text-xs font-inter">Urgent ({urgentCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              <span className="text-white/40 text-xs font-inter">Important ({importantCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-white/40 text-xs font-inter">Normal ({emails.filter(function(e) { return e.category === 'normal' }).length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white/20 rounded-full" />
              <span className="text-white/40 text-xs font-inter">Spam ({spamCount})</span>
            </div>
          </div>
        )}

        {/* Tabs */}
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

        {/* INBOX TAB */}
        {activeTab === 'inbox' && (
          <div>
            {!gmailConnected ? (
              <div className="text-center py-16">
                <p className="text-white/30 text-sm font-inter">
                  Connect your Gmail above to see your real emails here.
                </p>
              </div>
            ) : loadingEmails ? (
              <div className="text-center py-16">
                <p className="text-white/30 text-sm font-inter">
                  Loading and categorizing your emails with AI...
                </p>
              </div>
            ) : emails.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-white/30 text-sm font-inter">
                  No emails found in your inbox.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">

                {/* Folder Panel */}
                <div className="md:col-span-2">
                  <div className="liquid-glass rounded-2xl p-4 space-y-1">
                    {folders.map(function(folder, i) {
                      return (
                        <div
                          key={i}
                          onClick={function() { setActiveFolder(folder.key); setSelectedEmail(0) }}
                          className={
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ' +
                            (activeFolder === folder.key ? 'text-white bg-white/5' : 'text-white/50 hover:text-white hover:bg-white/5')
                          }
                        >
                          <folder.icon size={16} />
                          <span className="text-sm font-inter flex-1">{folder.label}</span>
                          {folder.count !== '' && (
                            <span className="text-white/30 text-xs font-inter">{folder.count}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Email List */}
                <div className="md:col-span-5">
                  <div className="liquid-glass rounded-full px-5 py-3 flex items-center gap-3 mb-4">
                    <Search size={16} className="text-white/30" />
                    <input
                      placeholder="Search emails..."
                      value={searchQuery}
                      onChange={function(e) { setSearchQuery(e.target.value) }}
                      className="bg-transparent text-white placeholder:text-white/30 outline-none w-full text-sm font-inter"
                    />
                  </div>

                  <div className="space-y-2">
                    {filteredEmails.map(function(email, i) {
                      return (
                        <div
                          key={email.id}
                          onClick={function() { setSelectedEmail(i) }}
                          className={
                            'liquid-glass rounded-2xl p-5 cursor-pointer hover:bg-white/2 transition-all ' +
                            (selectedEmail === i ? 'bg-white/3 ' : '') +
                            (email.unread ? 'border-l-2 border-white/20 ' : '')
                          }
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                              <div className={'w-2 h-2 rounded-full flex-shrink-0 ' + getCategoryDot(email.category)} />
                              <span className="text-white/80 text-sm font-medium font-inter truncate max-w-32">
                                {email.sender}
                              </span>
                            </div>
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
                            <span className={'liquid-glass rounded-full px-2 py-0.5 text-xs font-inter ' + getCategoryBadge(email.category)}>
                              {email.category.charAt(0).toUpperCase() + email.category.slice(1)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Email Preview */}
                <div className="md:col-span-5 space-y-4">
                  {current && (
                    <>
                      <div className="liquid-glass rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-white text-lg font-medium font-inter">
                              {current.sender}
                            </h3>
                            <p className="text-white/40 text-sm font-inter">{current.senderEmail}</p>
                            <p className="text-white/60 text-sm mt-1 font-inter">{current.subject}</p>
                            <p className="text-white/30 text-xs font-inter mt-1">{current.time} ago</p>
                          </div>
                          <span className={'liquid-glass rounded-full px-3 py-1 text-xs font-inter ' + getCategoryBadge(current.category)}>
                            {current.category.charAt(0).toUpperCase() + current.category.slice(1)}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed font-inter">
                          {current.full}
                        </p>
                      </div>

                      {/* AI Draft Panel */}
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
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* COMPOSE TAB */}
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
                  placeholder="Paste your email here..."
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

        {/* TEMPLATES TAB */}
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

        {/* SAVED TAB */}
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
                {savedEmails.map(function(email) {
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
