import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Brain, ArrowLeft, Mail, Linkedin, MessageCircle } from 'lucide-react'
import { useState } from 'react'

export default function Contact() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('General')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = function() {
    if (!name || !email || !message) return
    const mailtoLink = 'mailto:hello@lifeos.app?subject=LifeOS Contact: ' +
      encodeURIComponent(subject) +
      '&body=' +
      encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message)
    window.location.href = mailtoLink
    setSubmitted(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-black min-h-screen px-6 py-12"
    >
      <div className="max-w-3xl mx-auto">

        <div className="flex items-center gap-4 mb-12">
          <button
            type="button"
            onClick={function() { navigate('/') }}
            className="liquid-glass rounded-full p-2 text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <Brain size={20} className="text-white" />
            <span className="text-white font-semibold font-inter">LifeOS</span>
          </div>
        </div>

        <h1 className="font-instrument text-5xl text-white mb-4">Contact Us</h1>
        <p className="text-white/40 text-sm font-inter mb-12">
          We typically respond within 24 hours.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[
            {
              icon: Mail,
              title: 'Email Us',
              value: 'hello@lifeos.app',
              desc: 'For general inquiries',
              action: function() { window.location.href = 'mailto:hello@lifeos.app' }
            },
            {
              icon: Mail,
              title: 'Support',
              value: 'support@lifeos.app',
              desc: 'For technical issues',
              action: function() { window.location.href = 'mailto:support@lifeos.app' }
            },
            {
  icon: MessageCircle,
  title: 'Twitter / X',
  value: '@lifeosapp',
  desc: 'Follow us for updates',
  action: function() { window.open('https://x.com', '_blank') }
},
            {
              icon: Linkedin,
              title: 'LinkedIn',
              value: 'LifeOS',
              desc: 'Connect with us',
              action: function() { window.open('https://linkedin.com', '_blank') }
            },
          ].map(function(contact) {
            return (
              <motion.div
                key={contact.title}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={contact.action}
                className="liquid-glass rounded-2xl p-6 cursor-pointer hover:bg-white/[0.02] transition-all"
              >
                <div className="liquid-glass rounded-xl p-3 w-fit mb-4">
                  <contact.icon size={18} className="text-white/60" />
                </div>
                <p className="text-white/40 text-xs uppercase tracking-widest font-inter mb-1">
                  {contact.title}
                </p>
                <p className="text-white text-sm font-medium font-inter mb-1">
                  {contact.value}
                </p>
                <p className="text-white/30 text-xs font-inter">
                  {contact.desc}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Contact Form */}
        {!submitted ? (
          <div className="liquid-glass rounded-3xl p-8">
            <h2 className="text-white text-lg font-medium mb-6 font-inter">
              Send us a message
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={function(e) { setName(e.target.value) }}
                  className="liquid-glass rounded-full px-5 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-sm font-inter w-full"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={function(e) { setEmail(e.target.value) }}
                  className="liquid-glass rounded-full px-5 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-sm font-inter w-full"
                />
              </div>

              <select
                value={subject}
                onChange={function(e) { setSubject(e.target.value) }}
                className="liquid-glass rounded-full px-5 py-3 bg-black text-white outline-none text-sm font-inter cursor-pointer w-full"
              >
                <option value="General">General Inquiry</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Billing">Billing Question</option>
                <option value="Privacy">Privacy Concern</option>
                <option value="Partnership">Partnership</option>
              </select>

              <div className="liquid-glass rounded-2xl px-5 py-3">
                <textarea
                  placeholder="Your message..."
                  value={message}
                  onChange={function(e) { setMessage(e.target.value) }}
                  className="bg-transparent text-white placeholder:text-white/30 outline-none text-sm font-inter w-full min-h-32 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!name || !email || !message}
                className="bg-white rounded-full px-8 py-3.5 text-black text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-50 w-full"
              >
                Send Message
              </button>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="liquid-glass rounded-3xl p-12 text-center"
          >
            <MessageCircle size={48} className="text-white/20 mx-auto mb-4" />
            <h2 className="font-instrument text-3xl text-white mb-3">Message Sent!</h2>
            <p className="text-white/40 text-sm font-inter mb-6">
              We will get back to you within 24 hours.
            </p>
            <button
              type="button"
              onClick={function() { navigate('/') }}
              className="liquid-glass rounded-full px-6 py-3 text-white/60 text-sm font-inter hover:bg-white/5 transition-all"
            >
              ← Back to LifeOS
            </button>
          </motion.div>
        )}

        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={function() { navigate('/') }}
            className="liquid-glass rounded-full px-6 py-3 text-white/60 text-sm font-inter hover:bg-white/5 transition-all"
          >
            ← Back to LifeOS
          </button>
        </div>
      </div>
    </motion.div>
  )
}
