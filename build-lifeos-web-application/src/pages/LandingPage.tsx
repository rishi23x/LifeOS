import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DollarSign, Mail, Briefcase,
  PenTool, Brain, Check, ChevronRight,
  Play, Sparkles, Shield, Smartphone, Globe,
  BarChart3, Users, Rocket
} from 'lucide-react'

// ─── Fading Video Component ───
function FadingVideo({ src, className, style }: {
  src: string
  className?: string
  style?: React.CSSProperties
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const rafRef = useRef<number>(0)
  const fadingOutRef = useRef(false)
  const FADE_MS = 500
  const FADE_OUT_LEAD = 0.55

  const fadeTo = (target: number, duration: number) => {
    cancelAnimationFrame(rafRef.current)
    const video = videoRef.current
    if (!video) return
    const start = performance.now()
    const from = parseFloat(video.style.opacity || '0')
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      video.style.opacity = String(from + (target - from) * progress)
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.style.opacity = '0'
    const onLoaded = () => { video.play(); fadeTo(1, FADE_MS) }
    const onTimeUpdate = () => {
      if (!fadingOutRef.current && video.duration - video.currentTime <= FADE_OUT_LEAD && video.duration - video.currentTime > 0) {
        fadingOutRef.current = true
        fadeTo(0, FADE_MS)
      }
    }
    const onEnded = () => {
      video.style.opacity = '0'
      setTimeout(() => {
        video.currentTime = 0
        video.play()
        fadingOutRef.current = false
        fadeTo(1, FADE_MS)
      }, 100)
    }
    video.addEventListener('loadeddata', onLoaded)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('ended', onEnded)
    return () => {
      cancelAnimationFrame(rafRef.current)
      video.removeEventListener('loadeddata', onLoaded)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('ended', onEnded)
    }
  }, [])

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      playsInline
      preload="auto"
      className={className}
      style={{ opacity: 0, ...style }}
    />
  )
}

// ─── Blur Text ───
function BlurText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const words = text.split(' ')

  return (
    <p
      ref={ref}
      className={className}
      style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', rowGap: '0.1em' }}
    >
      {words.map(function(word, i) {
        return (
          <motion.span
            key={i}
            initial={{ filter: 'blur(10px)', opacity: 0, y: 50 }}
            animate={visible ? {
              filter: ['blur(10px)', 'blur(5px)', 'blur(0px)'],
              opacity: [0, 0.5, 1],
              y: [50, -5, 0],
            } : {}}
            transition={{
              duration: 0.7,
              delay: i * 0.1,
              times: [0, 0.5, 1],
              ease: 'easeOut',
            }}
            style={{ display: 'inline-block', marginRight: '0.28em' }}
          >
            {word}
          </motion.span>
        )
      })}
    </p>
  )
}

// ─── Navbar ───
function Navbar() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(function() {
    const handleScroll = function() { setScrolled(window.scrollY > 20) }
    window.addEventListener('scroll', handleScroll)
    return function() { window.removeEventListener('scroll', handleScroll) }
  }, [])

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div
        className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3 rounded-full transition-all duration-500"
        style={{
          background: scrolled ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={function() { navigate('/') }}
        >
          <Brain size={22} className="text-white" />
          <span className="text-white font-semibold text-base font-inter">LifeOS</span>
          <span
            className="text-white/30 text-xs font-inter px-2 py-0.5 rounded-full"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            v1.0
          </span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Features', href: '#features' },
            { label: 'V2 Coming', href: '#v2coming' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'About', href: '#about' },
          ].map(function(link, i) {
            return (
              <motion.a
                key={link.label}
                href={link.href}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="text-white/60 text-sm font-medium hover:text-white transition-colors font-inter cursor-pointer"
              >
                {link.label}
              </motion.a>
            )
          })}
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={function() { navigate('/sign-in') }}
            className="text-white/60 text-sm font-medium cursor-pointer hover:text-white transition-colors font-inter hidden sm:block"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={function() { navigate('/sign-up') }}
            className="flex items-center gap-2 bg-white text-black rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-white/90 transition-all hover:scale-105 font-inter"
          >
            Get Started
          </button>
        </div>
      </div>
    </motion.nav>
  )
}

// ─── Hero ───
function Hero() {
  const navigate = useNavigate()

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0"
        style={{ width: '120%', height: '120%' }}
      />
      <div
        className="absolute inset-0 z-[1]"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.6) 100%)' }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-center px-6 pt-32 pb-20">

        {/* Live Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white/70 text-xs tracking-widest uppercase font-inter">
            Version 1.0 — Now Live
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6"
        >
          <h1
            className="font-instrument text-[15vw] md:text-[10vw] lg:text-[8vw] text-white leading-[0.85] tracking-tight"
            style={{ fontStyle: 'italic' }}
          >
            Your life,
          </h1>
          <h1
            className="font-instrument text-[15vw] md:text-[10vw] lg:text-[8vw] leading-[0.85] tracking-tight"
            style={{
              fontStyle: 'italic',
              backgroundImage: 'linear-gradient(to right, #091020 0%, #0B2551 12.5%, #A4F4FD 32.5%, #00d2ff 50%, #0B2551 67.5%, #091020 87.5%, #091020 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              animation: 'shiny 6s linear infinite',
            }}
          >
            automated.
          </h1>
        </motion.div>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-white/60 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed font-inter font-light"
        >
          LifeOS is your personal AI team that manages your finances, emails, job search, and content — so you spend time on what actually matters.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16"
        >
          <button
            type="button"
            onClick={function() { navigate('/sign-up') }}
            className="flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-white transition-all hover:scale-105 font-inter"
            style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15)',
            }}
          >
            <Rocket size={16} />
            Begin Your Journey — Free
          </button>
          <button
            type="button"
            onClick={function() { navigate('/sign-in') }}
            className="flex items-center gap-2 text-white/50 text-sm font-inter hover:text-white/80 transition-colors"
          >
            <Play size={14} className="fill-current" />
            Already have an account
          </button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex items-center gap-4 flex-wrap justify-center"
        >
          {[
            { value: '4', label: 'AI Agents Working' },
            { value: '24/7', label: 'Always Running' },
            { value: '$0', label: 'To Get Started' },
            { value: '2min', label: 'Setup Time' },
          ].map(function(stat) {
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center p-5 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  minWidth: '120px',
                }}
              >
                <span
                  className="font-instrument text-4xl text-white leading-none"
                  style={{ fontStyle: 'italic' }}
                >
                  {stat.value}
                </span>
                <span className="text-white/40 text-xs font-inter mt-2 text-center">
                  {stat.label}
                </span>
              </div>
            )
          })}
        </motion.div>
      </div>

      {/* Partners */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="relative z-10 flex flex-col items-center gap-4 pb-12"
      >
        <div
          className="rounded-full px-4 py-1.5 text-white/40 text-xs font-inter"
          style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
        >
          Powered by world-class infrastructure
        </div>
        <div className="flex items-center gap-8 md:gap-12 flex-wrap justify-center px-6">
          {['Groq AI', 'Supabase', 'Vercel', 'Clerk', 'Adzuna'].map(function(partner) {
            return (
              <span
                key={partner}
                className="font-instrument text-xl md:text-2xl text-white/30 hover:text-white/60 transition-colors"
                style={{ fontStyle: 'italic' }}
              >
                {partner}
              </span>
            )
          })}
        </div>
      </motion.div>
    </section>
  )
}

// ─── Dashboard Preview ───
function DashboardPreview() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const navigate = useNavigate()

  return (
    <section className="py-32 px-6 bg-black" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-white/30 text-xs tracking-widest uppercase font-inter mb-4">
            The Command Center
          </p>
          <BlurText
            text="Your AI team. Always ready."
            className="font-instrument text-5xl md:text-7xl text-white tracking-tight"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(14,16,20,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Title Bar */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="text-white/30 text-xs font-inter">LifeOS — Dashboard</span>
            <div className="w-16" />
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h2
                className="font-instrument text-2xl text-white mb-1"
                style={{ fontStyle: 'italic' }}
              >
                Good morning, Alex.
              </h2>
              <p className="text-white/30 text-sm font-inter">
                Here is what your agents have prepared for you today.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Money Saved', value: '$342', sub: 'This month' },
                { label: 'Emails Drafted', value: '47', sub: 'Ready to review' },
                { label: 'Jobs Found', value: '12', sub: 'Matching your profile' },
                { label: 'Posts Ready', value: '28', sub: 'Next 30 days' },
              ].map(function(stat) {
                return (
                  <div
                    key={stat.label}
                    className="rounded-xl p-4"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <p className="text-white/30 text-xs font-inter uppercase tracking-widest mb-2">
                      {stat.label}
                    </p>
                    <p className="font-instrument text-3xl text-white leading-none mb-1">
                      {stat.value}
                    </p>
                    <p className="text-white/20 text-xs font-inter">{stat.sub}</p>
                  </div>
                )
              })}
            </div>

            <div
              className="rounded-xl p-4"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-white/60 text-sm font-inter font-medium">Agent Activity</p>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white/30 text-xs font-inter">Live</span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Mail, text: 'Drafted reply to Google job offer', time: '2m ago', badge: 'Review' },
                  { icon: DollarSign, text: 'Adobe CC not charged in 47 days — flagged', time: '1hr ago', badge: 'Verify' },
                  { icon: Briefcase, text: '8 new jobs found matching your profile', time: '3hr ago', badge: 'View' },
                  { icon: PenTool, text: 'LinkedIn post scheduled for 9am tomorrow', time: '5hr ago', badge: 'Scheduled' },
                ].map(function(item, i) {
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      >
                        <item.icon size={13} className="text-white/50" />
                      </div>
                      <p className="text-white/60 text-xs font-inter flex-1">{item.text}</p>
                      <span className="text-white/20 text-xs font-inter flex-shrink-0">{item.time}</span>
                      <span
                        className="text-white/40 text-xs font-inter px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      >
                        {item.badge}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Blur overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 h-24 flex items-end justify-center pb-6"
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(14,16,20,0.98))' }}
          >
            <button
              type="button"
              onClick={function() { navigate('/sign-up') }}
              className="flex items-center gap-2 rounded-full px-6 py-2.5 text-white text-sm font-inter font-medium transition-all hover:scale-105"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Sparkles size={14} />
              See your real dashboard
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Features ───
function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const cards = [
    {
      icon: DollarSign,
      tag: 'FINANCE',
      title: 'AI Financial Manager',
      desc: 'Categorizes spending, detects subscriptions not charged recently, and gives you a full financial health report.',
      pills: ['Auto Categorization', 'Subscription Alerts', 'Investment Insights', 'Weekly Reports'],
      tags: ['Subscription AI', 'Smart Budgets', 'Logo Detection', 'Spending Charts'],
    },
    {
      icon: Mail,
      tag: 'COMMUNICATION',
      title: 'AI Email & DM Assistant',
      desc: 'Reads your Gmail, categorizes by urgency with color coding, and drafts replies in your exact voice.',
      pills: ['Smart Inbox', 'Auto Draft', 'Gmail OAuth', 'Tone Analyzer'],
      tags: ['🔴 Urgent', '🟡 Important', '🟢 Normal', '⚪ Spam'],
    },
    {
      icon: Briefcase,
      tag: 'CAREER',
      title: 'AI Job Application Bot',
      desc: 'Searches real live job listings, generates tailored cover letters, preps you for interviews, and tracks every application.',
      pills: ['Real Job Search', 'Cover Letters', 'Interview Prep', 'Application Tracker'],
      tags: ['Live Listings', 'AI Cover Letter', 'Status Tracking', 'LinkedIn Apply'],
    },
    {
      icon: PenTool,
      tag: 'CONTENT',
      title: 'AI Content Manager',
      desc: 'Generates 30 days of platform-specific content in your voice, schedules it, and publishes with one click.',
      pills: ['30-Day Calendar', 'Auto Schedule', 'Multi-Platform', 'One Click Post'],
      tags: ['Twitter/X', 'LinkedIn', 'Instagram', 'YouTube Soon'],
    },
  ]

  return (
    <section id="features" className="py-32 px-6 bg-black" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <p className="text-white/30 text-xs tracking-widest uppercase font-inter mb-4">
            // Capabilities
          </p>
          <BlurText
            text="Four agents. One life."
            className="font-instrument text-6xl md:text-8xl text-white tracking-tight leading-[0.9]"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map(function(card, i) {
            return (
              <motion.div
                key={card.tag}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.01 }}
                className="rounded-[1.25rem] p-6 flex flex-col min-h-[360px] cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                onMouseEnter={function(e) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                }}
                onMouseLeave={function(e) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-auto">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <card.icon size={20} className="text-white/70" />
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                    {card.tags.map(function(tag) {
                      return (
                        <span
                          key={tag}
                          className="text-white/60 font-inter whitespace-nowrap rounded-full px-3 py-1"
                          style={{
                            fontSize: '11px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          {tag}
                        </span>
                      )
                    })}
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-white/30 text-xs tracking-widest uppercase font-inter mb-2">
                    {card.tag}
                  </p>
                  <h3
                    className="font-instrument text-3xl md:text-4xl text-white mb-3 leading-none"
                    style={{ fontStyle: 'italic' }}
                  >
                    {card.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed font-inter mb-4">
                    {card.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {card.pills.map(function(pill) {
                      return (
                        <span
                          key={pill}
                          className="text-white/30 text-xs font-inter rounded-full px-3 py-1"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          {pill}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ───
function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="py-32 px-6 bg-black" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <BlurText
            text="Simple to start. Impossible to leave."
            className="font-instrument text-5xl md:text-7xl text-white tracking-tight"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              num: '01',
              icon: Globe,
              title: 'Connect Everything',
              body: 'Link your Gmail, and social accounts in under 2 minutes. Bank-level security. Zero configuration.',
            },
            {
              num: '02',
              icon: Brain,
              title: 'Agents Assist You',
              body: 'Four AI agents start helping immediately. Reading emails, tracking spending, finding jobs, creating content.',
            },
            {
              num: '03',
              icon: Sparkles,
              title: 'You Stay In Control',
              body: 'Review what your agents prepared. Approve actions. You always have the final say on everything.',
            },
          ].map(function(step, i) {
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ y: -6 }}
                className="rounded-[1.25rem] p-8 relative overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                <span
                  className="absolute top-6 right-8 font-instrument text-8xl font-bold select-none"
                  style={{ color: 'rgba(255,255,255,0.04)', fontStyle: 'italic' }}
                >
                  {step.num}
                </span>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <step.icon size={20} className="text-white/60" />
                </div>
                <h3 className="text-white text-xl font-medium mb-3 font-inter">{step.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed font-inter">{step.body}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── V2 Coming Soon ───
function V2ComingSoon() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="v2coming" className="py-32 px-6 bg-black" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-20"
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Sparkles size={12} className="text-white/50" />
            <span className="text-white/50 text-xs tracking-widest uppercase font-inter">
              Version 2.0 — Coming Soon
            </span>
          </div>
          <BlurText
            text="This is just the beginning."
            className="font-instrument text-5xl md:text-7xl text-white tracking-tight"
          />
          <p className="text-white/30 text-base max-w-xl mx-auto mt-6 font-inter leading-relaxed">
            Version 1 is live. Version 2 will make it feel like you have a full team of experts working for you around the clock.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Globe,
              title: 'Bank Account Connection',
              desc: 'Connect your real bank via Plaid. AI automatically tracks every transaction without manual entry.',
              badge: 'Q3 2026',
            },
            {
              icon: Smartphone,
              title: 'Mobile App (iOS & Android)',
              desc: 'Full LifeOS on your phone. Native apps with push notifications and offline access.',
              badge: 'Q3 2026',
            },
            {
              icon: PenTool,
              title: 'Real Social Media Posting',
              desc: 'Direct publishing to Twitter, Instagram, LinkedIn, and YouTube. One click.',
              badge: 'Q4 2026',
            },
            {
              icon: Brain,
              title: 'AI That Learns Your Style',
              desc: 'The more you use LifeOS, the smarter it gets. Learns your writing style, habits, and goals.',
              badge: 'Q4 2026',
            },
            {
              icon: Users,
              title: 'Team Collaboration',
              desc: 'Share agents with your team. Delegate tasks across departments. Built for founders.',
              badge: 'Q1 2027',
            },
            {
              icon: BarChart3,
              title: 'Advanced Analytics',
              desc: 'Deep insights into your life patterns. Trends in spending, productivity, and career growth.',
              badge: 'Q1 2027',
            },
          ].map(function(feature, i) {
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="rounded-[1.25rem] p-6 relative overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <feature.icon size={18} className="text-white/50" />
                  </div>
                  <span
                    className="text-white/20 text-xs font-inter rounded-full px-3 py-1"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-white/70 text-base font-medium mb-2 font-inter">
                  {feature.title}
                </h3>
                <p className="text-white/30 text-sm leading-relaxed font-inter">
                  {feature.desc}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <Shield size={11} className="text-white/15" />
                  <span className="text-white/15 text-xs font-inter">Coming in V2</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ───
function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      className="py-32 px-6 bg-black"
      ref={ref}
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <p className="text-white/30 text-xs tracking-widest uppercase font-inter">
            What people are saying
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "LifeOS gave me back 3 hours every week. The Gmail categorization alone is worth it. Red for urgent, green for normal — I see what matters instantly.",
              name: "Arjun Mehta",
              role: "Founder",
              company: "NEXUS LABS",
            },
            {
              quote: "The job application bot found me 3 interviews in one week. The cover letters it generates are indistinguishable from ones I would write myself.",
              name: "Priya Sharma",
              role: "Software Engineer",
              company: "TECHCORP",
            },
            {
              quote: "I stopped dreading my inbox. The AI drafts replies in my voice and I just hit approve. Game changing for anyone drowning in email.",
              name: "Marcus Johnson",
              role: "Product Manager",
              company: "BUILDFAST",
            },
          ].map(function(t, i) {
            return (
              <motion.figure
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="rounded-2xl p-6"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <blockquote className="text-white/60 text-sm leading-relaxed font-inter">
                  "{t.quote}"
                </blockquote>
                <figcaption
                  className="mt-6 pt-5"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <p className="text-white/80 text-sm font-semibold font-inter">{t.name}</p>
                  <p className="text-white/40 text-xs font-inter mt-0.5">{t.role}</p>
                  <p className="text-white text-xs font-semibold tracking-wide font-inter mt-1">
                    {t.company}
                  </p>
                </figcaption>
              </motion.figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ───
function Pricing() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const navigate = useNavigate()
  const [yearly, setYearly] = useState(false)

  const plans = [
    {
      tag: 'Free',
      price: '$0',
      period: 'forever',
      desc: 'For individuals getting started with AI assistance.',
      features: [
        'All 4 AI Modules (limited)',
        '100 AI actions per month',
        'Basic financial tracking',
        '10 email drafts per month',
        '5 job applications per month',
        '10 content posts per month',
      ],
      pro: false,
    },
    {
      tag: 'Pro',
      price: yearly ? '$290' : '$29',
      period: yearly ? 'per year' : 'per month',
      desc: 'For power users who want AI assistance across all areas of life.',
      features: [
        'All 4 AI Modules (unlimited)',
        'Unlimited AI actions',
        'Advanced financial insights',
        'Unlimited email drafting',
        'Unlimited job applications',
        'Unlimited content creation',
        'Priority AI processing',
        'Mobile responsive app',
      ],
      pro: true,
    },
    {
      tag: 'Business',
      price: yearly ? '$990' : '$99',
      period: yearly ? 'per year' : 'per month',
      desc: 'For teams and agencies who want shared AI agents.',
      features: [
        'Everything in Pro',
        'Up to 5 team members',
        'Shared agent dashboard',
        'Business email accounts',
        'Advanced analytics',
        'API access',
        'Priority support',
        'Custom agent training',
      ],
      pro: false,
    },
  ]

  return (
    <section id="pricing" className="py-32 px-6 bg-black relative overflow-hidden" ref={ref}>

      {/* Cinematic watermark */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden">
        <div
          className="font-instrument font-bold leading-[0.9] text-center"
          style={{ fontSize: 'clamp(4rem, 12vw, 9rem)', letterSpacing: '-0.05em' }}
        >
          <div style={{ color: 'rgba(255,255,255,0.03)' }}>Your life.</div>
          <div
            style={{
              backgroundImage: 'linear-gradient(to right, #091020 0%, #0B2551 25%, #A4F4FD 65%, #00d2ff 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              opacity: 0.06,
            }}
          >
            Automated
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <p className="text-white/30 text-xs tracking-widest uppercase font-inter mb-4">Pricing</p>
          <BlurText
            text="Simple pricing. Insane value."
            className="font-instrument text-5xl md:text-7xl text-white tracking-tight"
          />
          <p className="text-white/30 text-sm font-inter mt-4">
            Start free. Upgrade when ready. Cancel anytime.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className="text-white/40 text-sm font-inter">Monthly</span>
            <button
              type="button"
              onClick={function() { setYearly(!yearly) }}
              className="relative w-12 h-6 rounded-full transition-all duration-300"
              style={{ background: yearly ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)' }}
            >
              <div
                className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300"
                style={{ left: yearly ? '28px' : '4px' }}
              />
            </button>
            <span className="text-white/40 text-sm font-inter">
              Yearly
              <span className="text-white/60 ml-1">(Save 17%)</span>
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(function(plan, i) {
            return (
              <motion.div
                key={plan.tag}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -12, scale: 1.01 }}
                className="rounded-[2.75rem] flex flex-col relative overflow-hidden"
                style={{
                  padding: '50px 24px',
                  minHeight: '580px',
                  background: plan.pro
                    ? 'linear-gradient(135deg, rgba(0,0,0,0.85), rgba(0,0,0,0.55))'
                    : 'linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.4))',
                  backdropFilter: 'blur(14px)',
                  border: '1px solid rgba(255,255,255,' + (plan.pro ? '0.15' : '0.08') + ')',
                  transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    borderRadius: 'inherit',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 50%)',
                  }}
                />
                <p className="text-white/50 text-lg font-inter font-light mb-2 relative z-10">
                  {plan.tag}
                </p>
                <div className="flex items-end gap-2 mb-4 relative z-10">
                  <p
                    className="font-instrument text-5xl text-white"
                    style={{ letterSpacing: '-0.02em' }}
                  >
                    {plan.price}
                  </p>
                  <p className="text-white/30 text-sm font-inter mb-2">{plan.period}</p>
                </div>
                <p className="text-white/40 text-sm font-inter leading-relaxed mb-10 relative z-10">
                  {plan.desc}
                </p>
                <ul className="space-y-4 mb-8 relative z-10 flex-1">
                  {plan.features.map(function(feature) {
                    return (
                      <li key={feature} className="flex items-start gap-3">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: 'rgba(255,255,255,0.1)' }}
                        >
                          <Check size={12} className="text-white" />
                        </div>
                        <span className="text-white/70 text-sm font-inter leading-snug">
                          {feature}
                        </span>
                      </li>
                    )
                  })}
                </ul>
                <button
                  type="button"
                  onClick={function() { navigate('/sign-up') }}
                  className="relative z-10 rounded-full px-8 py-3 font-semibold text-sm self-center transition-all hover:scale-105"
                  style={{
                    background: plan.pro ? '#ffffff' : 'rgba(255,255,255,0.08)',
                    color: plan.pro ? '#000000' : '#ffffff',
                    border: plan.pro ? 'none' : '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  Choose Plan
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA ───
function FinalCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const navigate = useNavigate()

  return (
    <section className="py-32 px-6 bg-black" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl px-8 py-24 text-center overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(600px circle at 50% 0%, rgba(255,255,255,0.08), transparent 70%)',
              opacity: 0.5,
            }}
          />
          <div className="relative z-10">
            <h2
              className="font-instrument text-5xl md:text-7xl text-white tracking-tight mb-6 leading-[0.9]"
              style={{ fontStyle: 'italic' }}
            >
              Your AI team.
              <br />
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>Always ready.</span>
            </h2>
            <p className="text-white/40 text-base max-w-md mx-auto mb-12 font-inter leading-relaxed">
              Join people who use AI to work smarter. Start free. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={function() { navigate('/sign-up') }}
                className="flex items-center gap-2 rounded-full px-10 py-4 text-black text-sm font-semibold bg-white hover:bg-white/90 transition-all hover:scale-105 font-inter"
              >
                <Rocket size={16} />
                Get Started Free
              </button>
              <button
                type="button"
                onClick={function() { navigate('/sign-in') }}
                className="flex items-center gap-2 rounded-full px-10 py-4 text-white text-sm font-inter transition-all hover:bg-white/5"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Sign In
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div
          className="mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-white/20" />
            <span className="text-white/20 text-sm font-inter">LifeOS</span>
            <span className="text-white/10 text-xs font-inter">v1.0</span>
          </div>
          <div className="flex gap-8">
            {[
              { label: 'Privacy Policy', path: '/privacy' },
              { label: 'Terms of Service', path: '/terms' },
              { label: 'Contact', path: '/contact' },
            ].map(function(link) {
              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={function() { navigate(link.path) }}
                  className="text-white/15 text-xs hover:text-white/40 transition-colors font-inter cursor-pointer"
                >
                  {link.label}
                </button>
              )
            })}
          </div>
          <span className="text-white/15 text-xs font-inter">
            © 2026 LifeOS. All rights reserved.
          </span>
        </div>
      </div>
    </section>
  )
}

// ─── Landing Page ───
export default function LandingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-black min-h-screen"
    >
      <style>{`
        @keyframes shiny {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
      <Navbar />
      <Hero />
      <DashboardPreview />
      <Features />
      <HowItWorks />
      <V2ComingSoon />
      <Testimonials />
      <Pricing />
      <FinalCTA />
    </motion.div>
  )
}
