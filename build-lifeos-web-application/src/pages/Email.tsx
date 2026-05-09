import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Mail, AlertCircle, FileText, Send, Shield, BookOpen, Search,
  Zap, RotateCcw
} from 'lucide-react'
import Sidebar from '../components/Sidebar'

const folders = [
  { icon: Mail, label: 'Inbox', count: '47', active: true },
  { icon: AlertCircle, label: 'Urgent', count: '3' },
  { icon: FileText, label: 'Drafts', count: '12' },
  { icon: Send, label: 'Sent' },
  { icon: Shield, label: 'Spam', count: '8' },
  { icon: BookOpen, label: 'Newsletters', count: '23' },
]

const emails = [
  {
    sender: 'Google Careers',
    subject: 'Job Offer: Senior Developer',
    preview: 'We are pleased to offer you...',
    time: '2m',
    aiDrafted: true,
    unread: true,
    full: `Dear Candidate,

We are pleased to offer you the position of Senior Developer at Google. After careful consideration of your application and interviews, the hiring committee has unanimously decided to extend this offer.

Position: Senior Frontend Developer
Team: Chrome Browser
Location: Mountain View, CA (Hybrid)
Compensation: $210,000 base + equity package

We believe your experience and skills will be a great addition to our team. Please review the attached offer letter and let us know your decision within 7 business days.

We look forward to hearing from you.

Best regards,
Sarah Chen
Technical Recruiting, Google`,
    senderEmail: 'careers@google.com',
  },
  {
    sender: 'Stripe HR',
    subject: 'Interview scheduled for Tuesday',
    preview: 'Please confirm your...',
    time: '1h',
    unread: true,
    full: 'Please confirm your availability for the technical interview scheduled for Tuesday at 2:00 PM PST.',
    senderEmail: 'hr@stripe.com',
  },
  {
    sender: 'Bank of America',
    subject: 'Unusual activity detected',
    preview: 'We noticed a login from...',
    time: '3h',
    urgent: true,
    full: 'We noticed a login from an unrecognized device. Please verify this was you.',
    senderEmail: 'alerts@bankofamerica.com',
  },
  {
    sender: 'LinkedIn',
    subject: '12 people viewed your profile',
    preview: 'Your profile appeared in...',
    time: '5h',
    full: 'Your profile appeared in 12 search results this week.',
    senderEmail: 'notifications@linkedin.com',
  },
  {
    sender: 'Netflix',
    subject: 'Your payment failed',
    preview: 'We could not process...',
    time: '8h',
    full: 'We could not process your payment. Please update your billing information.',
    senderEmail: 'billing@netflix.com',
  },
]

export default function EmailPage() {
  const [selectedEmail, setSelectedEmail] = useState(0)
  const [activeFolder, setActiveFolder] = useState(0)
  const current = emails[selectedEmail]

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
          <h1 className="font-instrument text-4xl text-white mb-2">Email & DM Assistant</h1>
          <p className="text-white/40 text-sm font-inter">47 emails handled automatically today.</p>
        </div>

        {/* 3 Column Layout */}
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
            {/* Search */}
            <div className="liquid-glass rounded-full px-5 py-3 flex items-center gap-3 mb-4">
              <Search size={16} className="text-white/30" />
              <input
                placeholder="Search emails..."
                className="bg-transparent text-white placeholder:text-white/30 outline-none w-full text-sm font-inter"
              />
            </div>

            <div className="space-y-2">
              {emails.map((email, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedEmail(i)}
                  className={`liquid-glass rounded-2xl p-5 cursor-pointer hover:bg-white/[0.02] transition-all ${
                    selectedEmail === i ? 'bg-white/[0.03]' : ''
                  } ${email.unread ? 'border-l-2 border-white/20' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-white/80 text-sm font-medium font-inter">{email.sender}</span>
                    <span className="text-white/30 text-xs font-inter flex-shrink-0 ml-2">{email.time}</span>
                  </div>
                  <p className="text-white/60 text-sm mt-1 truncate font-inter">{email.subject}</p>
                  <p className="text-white/30 text-xs mt-1 truncate font-inter">{email.preview}</p>
                  <div className="flex gap-2 mt-2">
                    {email.aiDrafted && (
                      <span className="liquid-glass rounded-full px-2 py-0.5 text-white/40 text-xs font-inter">AI Drafted</span>
                    )}
                    {email.urgent && (
                      <span className="liquid-glass rounded-full px-2 py-0.5 text-red-400/70 text-xs font-inter">URGENT</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Preview */}
          <div className="md:col-span-5">
            <div className="liquid-glass rounded-2xl p-6">
              <div className="mb-6">
                <h3 className="text-white text-lg font-medium font-inter">{current.sender}</h3>
                <p className="text-white/40 text-sm font-inter">{current.senderEmail}</p>
                <p className="text-white/60 text-sm mt-1 font-inter">{current.subject}</p>
                <p className="text-white/30 text-xs font-inter mt-1">{current.time} ago</p>
              </div>

              <div className="text-white/60 text-sm leading-relaxed mb-8 font-inter whitespace-pre-line">
                {current.full}
              </div>
            </div>

            {/* AI Draft Panel */}
            {selectedEmail === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="liquid-glass rounded-2xl p-6 mt-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={16} className="text-white/60" />
                  <span className="text-white text-sm font-medium font-inter">AI Draft</span>
                  <span className="text-white/40 text-xs ml-auto font-inter">Generated in your voice</span>
                </div>

                <textarea
                  defaultValue="Thank you for the offer. I am very excited about the opportunity to join Google as a Senior Developer. I would like to discuss the compensation package before making a final decision. Could we schedule a call this week? Best regards."
                  className="liquid-glass rounded-xl p-4 w-full text-white/70 text-sm leading-relaxed min-h-32 bg-transparent outline-none resize-none font-inter"
                />

                <div className="flex gap-3 mt-4">
                  <button className="liquid-glass rounded-full px-5 py-2.5 flex items-center gap-2 text-white/60 text-sm hover:bg-white/5 transition-all cursor-pointer font-inter">
                    <RotateCcw size={14} />
                    Regenerate
                  </button>
                  <button className="liquid-glass rounded-full px-5 py-2.5 flex items-center gap-2 text-white text-sm hover:bg-white/5 transition-all cursor-pointer font-inter">
                    <Send size={14} />
                    Send Email
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </motion.div>
  )
}
