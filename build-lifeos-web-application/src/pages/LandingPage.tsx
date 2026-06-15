import { motion, useInView, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useRef, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DollarSign, Mail, Briefcase, PenTool, Brain,
  Check, ChevronRight, Play, Sparkles, Shield,
  Smartphone, Globe, BarChart3, Users, Rocket,
  Zap, Calendar, BookOpen
} from 'lucide-react'

// ─── Design Tokens ───
const tokens = {
  bg: '#050507',
  surface1: '#0c0c12',
  surface2: '#13131d',
  surface3: '#1b1b29',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.16)',
  textPrimary: '#f5f5f8',
  textDim: 'rgba(245,245,248,0.6)',
  textFaint: 'rgba(245,245,248,0.34)',
  accent: 'linear-gradient(135deg, #a78bfa, #22d3ee, #f0abfc)',
}

// ─── Background FX ───
function BackgroundFX() {
  return (
    <>
      {/* Film grain */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none z-[1]" style={{ opacity: 0.05, mixBlendMode: 'overlay' }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '600px', height: '600px',
            background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)',
            top: '-100px', left: '-100px',
            mixBlendMode: 'screen',
            filter: 'blur(40px)',
          }}
          animate={{ x: [0, 80, 0], y: [0, 60, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '500px', height: '500px',
            background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)',
            top: '30%', right: '-100px',
            mixBlendMode: 'screen',
            filter: 'blur(40px)',
          }}
          animate={{ x: [0, -60, 0], y: [0, 80, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '400px', height: '400px',
            background: 'radial-gradient(circle, rgba(240,171,252,0.1) 0%, transparent 70%)',
            bottom: '10%', left: '30%',
            mixBlendMode: 'screen',
            filter: 'blur(40px)',
          }}
          animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Tron grid floor */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full"
          style={{
            height: '400px',
            backgroundImage: 'linear-gradient(rgba(167,139,250,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.08) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            transform: 'perspective(600px) rotateX(62deg) scale(2.4)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
            maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
          }}
        />
      </div>
    </>
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

  return (
    <p
      ref={ref}
      className={className}
      style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', rowGap: '0.1em' }}
    >
      {text.split(' ').map(function(word, i) {
        return (
          <motion.span
            key={i}
            initial={{ filter: 'blur(10px)', opacity: 0, y: 50 }}
            animate={visible ? {
              filter: ['blur(10px)', 'blur(5px)', 'blur(0px)'],
              opacity: [0, 0.5, 1],
              y: [50, -5, 0],
            } : {}}
            transition={{ duration: 0.7, delay: i * 0.1, times: [0, 0.5, 1], ease: 'easeOut' }}
            style={{ display: 'inline-block', marginRight: '0.28em' }}
          >
            {word}
          </motion.span>
        )
      })}
    </p>
  )
}

// ─── 3D Tilt Card ───
function TiltCard({ children, className, style }: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 })

  const handleMouse = useCallback(function(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }, [x, y])

  const handleLeave = useCallback(function() {
    x.set(0)
    y.set(0)
  }, [x, y])

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', ...style }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Gradient Text ───
function GradientText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={className}
      style={{
        backgroundImage: 'linear-gradient(135deg, #a78bfa 0%, #22d3ee 50%, #f0abfc 100%)',
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
        animation: 'gradientShift 6s linear infinite',
      }}
    >
      {children}
    </span>
  )
}

// ─── Glass Card ───
function GlassCard({ children, className, style, hover = true }: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  hover?: boolean
}) {
  return (
    <div
      className={className}
      style={{
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
        position: 'relative',
        overflow: 'hidden',
        transition: hover ? 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)' : undefined,
        ...style,
      }}
    >
      {/* Border gradient */}
      <div
        style={{
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          padding: '1px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.06) 100%)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
        }}
      />
      {children}
    </div>
  )
}

// ─── Navbar ───
function Navbar() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(function() {
    const onScroll = function() { setScrolled(window.scrollY > 20) }
    window.addEventListener('scroll', onScroll)
    return function() { window.removeEventListener('scroll', onScroll) }
  }, [])

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <GlassCard
        className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3 rounded-full"
        style={{
          background: scrolled ? 'rgba(5,5,7,0.9)' : 'rgba(255,255,255,0.02)',
          transition: 'background 0.4s ease',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={function() { navigate('/') }}
        >
          {/* Breathing gradient dot */}
          <motion.div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
              boxShadow: '0 0 12px rgba(167,139,250,0.4)',
            }}
            animate={{ boxShadow: ['0 0 8px rgba(167,139,250,0.3)', '0 0 20px rgba(34,211,238,0.5)', '0 0 8px rgba(167,139,250,0.3)'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Brain size={14} className="text-white" />
          </motion.div>
          <span className="text-white font-semibold text-base font-inter">LifeOS</span>
          <span
            className="text-xs font-inter px-2 py-0.5 rounded-full"
            style={{ border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa' }}
          >
            v1.0
          </span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Dashboard', 'Pricing', 'About'].map(function(link, i) {
            return (
              <motion.a
                key={link}
                href={'#' + link.toLowerCase()}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="font-inter transition-colors"
                style={{ color: tokens.textDim, fontSize: '14px', fontWeight: 500 }}
                onMouseEnter={function(e) { e.currentTarget.style.color = tokens.textPrimary }}
                onMouseLeave={function(e) { e.currentTarget.style.color = tokens.textDim }}
              >
                {link}
              </motion.a>
            )
          })}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={function() { navigate('/sign-in') }}
            className="hidden sm:block font-inter transition-colors"
            style={{ color: tokens.textDim, fontSize: '14px', fontWeight: 500 }}
          >
            Sign In
          </button>
          <motion.button
            type="button"
            onClick={function() { navigate('/sign-up') }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-full px-5 py-2.5 font-inter font-semibold text-sm text-white"
            style={{
              background: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
              boxShadow: '0 0 20px rgba(167,139,250,0.25)',
            }}
          >
            Get Started
          </motion.button>
        </div>
      </GlassCard>
    </motion.nav>
  )
}

// ─── Hero ───
function Hero() {
  const navigate = useNavigate()

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-20"
      style={{ background: tokens.bg }}
    >
      {/* Status pill */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex items-center gap-2 rounded-full px-4 py-1.5 mb-8"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <motion.span
          className="w-1.5 h-1.5 bg-green-400 rounded-full"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="font-inter text-xs tracking-widest uppercase" style={{ color: tokens.textDim }}>
          Version 1.0 — Now Live
        </span>
      </motion.div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6"
      >
        <h1
          className="font-instrument leading-[0.85] tracking-tight"
          style={{ fontSize: 'clamp(4rem, 12vw, 10rem)', fontStyle: 'italic', color: tokens.textPrimary }}
        >
          Your life,
        </h1>
        <h1
          className="font-instrument leading-[0.85] tracking-tight"
          style={{
            fontSize: 'clamp(4rem, 12vw, 10rem)',
            fontStyle: 'italic',
            backgroundImage: 'linear-gradient(135deg, #a78bfa 0%, #22d3ee 50%, #f0abfc 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            WebkitTextFillColor: 'transparent',
            animation: 'gradientShift 6s linear infinite',
          }}
        >
          automated.
        </h1>
      </motion.div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35 }}
        className="font-inter font-light max-w-xl mx-auto mb-10 leading-relaxed"
        style={{ color: tokens.textDim, fontSize: '18px' }}
      >
        LifeOS is your personal AI team managing finances, emails, career, and content — so you spend time on what actually matters.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="flex flex-col sm:flex-row items-center gap-4 mb-16"
      >
        <motion.button
          type="button"
          onClick={function() { navigate('/sign-up') }}
          whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(167,139,250,0.4)' }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 rounded-full px-8 py-4 font-inter font-semibold text-sm text-white"
          style={{
            background: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
            boxShadow: '0 0 20px rgba(167,139,250,0.2)',
          }}
        >
          <Rocket size={16} />
          Begin Your Journey — Free
        </motion.button>
        <motion.button
          type="button"
          onClick={function() { navigate('/sign-in') }}
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 font-inter text-sm"
          style={{ color: tokens.textFaint }}
        >
          <Play size={14} className="fill-current" />
          Already have an account
        </motion.button>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.65 }}
        className="flex items-center gap-4 flex-wrap justify-center mb-16"
      >
        {[
          { value: '4', label: 'AI Agents' },
          { value: '24/7', label: 'Always On' },
          { value: '$0', label: 'To Start' },
          { value: '2min', label: 'Setup' },
        ].map(function(stat) {
          return (
            <GlassCard
              key={stat.label}
              className="flex flex-col items-center px-6 py-4 rounded-2xl"
              style={{ minWidth: '100px' }}
            >
              <span
                className="font-instrument leading-none mb-1"
                style={{
                  fontSize: '2.5rem',
                  fontStyle: 'italic',
                  backgroundImage: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {stat.value}
              </span>
              <span className="font-inter text-xs" style={{ color: tokens.textFaint }}>
                {stat.label}
              </span>
            </GlassCard>
          )
        })}
      </motion.div>

      {/* Partners */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="flex flex-col items-center gap-4"
      >
        <GlassCard className="rounded-full px-4 py-1.5">
          <span className="font-inter text-xs" style={{ color: tokens.textFaint }}>
            Powered by world-class infrastructure
          </span>
        </GlassCard>
        <div className="flex items-center gap-8 md:gap-12 flex-wrap justify-center">
          {['Groq AI', 'Supabase', 'Vercel', 'Clerk', 'Adzuna'].map(function(p) {
            return (
              <span
                key={p}
                className="font-instrument text-xl md:text-2xl transition-all duration-300"
                style={{ fontStyle: 'italic', color: tokens.textFaint, cursor: 'default' }}
                onMouseEnter={function(e) { e.currentTarget.style.color = tokens.textDim }}
                onMouseLeave={function(e) { e.currentTarget.style.color = tokens.textFaint }}
              >
                {p}
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
    <section id="dashboard" className="py-32 px-6" style={{ background: tokens.bg }} ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <p className="font-inter text-xs tracking-widest uppercase mb-4" style={{ color: tokens.textFaint }}>
            // Live preview
          </p>
          <BlurText
            text="See your life, at a glance."
            className="font-instrument text-5xl md:text-7xl tracking-tight"
            style={{ color: tokens.textPrimary, fontStyle: 'italic' } as any}
          />
          <p className="font-inter mt-4 max-w-lg mx-auto" style={{ color: tokens.textDim, fontSize: '16px' }}>
            One dashboard. Every agent. All your progress. Beautifully organized.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <TiltCard
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: tokens.surface1,
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            {/* Title bar */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="font-inter text-xs" style={{ color: tokens.textFaint }}>
                LifeOS — Dashboard
              </span>
              <div className="w-16" />
            </div>

            {/* Content */}
            <div className="p-6" style={{ background: tokens.surface1 }}>
              <div className="mb-6">
                <h2 className="font-instrument text-2xl mb-1" style={{ color: tokens.textPrimary, fontStyle: 'italic' }}>
                  Good morning, Alex.
                </h2>
                <p className="font-inter text-sm" style={{ color: tokens.textFaint }}>
                  Your agents have been working. Here is what they found.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Money Saved', value: '$342' },
                  { label: 'Emails Drafted', value: '47' },
                  { label: 'Jobs Found', value: '12' },
                  { label: 'Posts Ready', value: '28' },
                ].map(function(stat) {
                  return (
                    <div
                      key={stat.label}
                      className="rounded-xl p-4"
                      style={{ background: tokens.surface2, border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <p className="font-inter text-xs uppercase tracking-widest mb-2" style={{ color: tokens.textFaint }}>
                        {stat.label}
                      </p>
                      <p
                        className="font-instrument text-3xl leading-none"
                        style={{
                          fontStyle: 'italic',
                          backgroundImage: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                          color: 'transparent',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {stat.value}
                      </p>
                    </div>
                  )
                })}
              </div>

              <div
                className="rounded-xl p-4"
                style={{ background: tokens.surface2, border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="font-inter text-sm font-medium" style={{ color: tokens.textDim }}>
                    Agent Activity
                  </p>
                  <div className="flex items-center gap-2">
                    <motion.span
                      className="w-1.5 h-1.5 bg-green-400 rounded-full"
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="font-inter text-xs" style={{ color: tokens.textFaint }}>Live</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: DollarSign, text: 'Notion Team — not charged in 47 days · flagged for review', badge: 'Verify' },
                    { icon: Mail, text: 'Sorted 14 emails, archived 9 newsletters automatically', badge: 'Done' },
                    { icon: Briefcase, text: '8 new jobs found matching your saved preferences', badge: 'View' },
                    { icon: PenTool, text: 'LinkedIn post scheduled for tomorrow 9am', badge: 'Scheduled' },
                  ].map(function(item, i) {
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: tokens.surface3 }}
                        >
                          <item.icon size={13} style={{ color: tokens.textFaint }} />
                        </div>
                        <p className="font-inter text-xs flex-1" style={{ color: tokens.textDim }}>{item.text}</p>
                        <span
                          className="font-inter text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: tokens.surface3, color: tokens.textFaint }}
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
              style={{ background: 'linear-gradient(to bottom, transparent, ' + tokens.surface1 + ')' }}
            >
              <motion.button
                type="button"
                onClick={function() { navigate('/sign-up') }}
                whileHover={{ scale: 1.04 }}
                className="flex items-center gap-2 rounded-full px-6 py-2.5 font-inter text-sm font-medium"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: tokens.textPrimary,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Sparkles size={14} />
                See your real dashboard
              </motion.button>
            </div>
          </TiltCard>
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
      title: 'The Saver',
      desc: 'Detects subscriptions not charged recently, flags potential waste, and gives AI-powered financial insights.',
      tags: ['Subscription Alerts', 'Smart Budgets', 'Weekly Reports', 'AI Advisor'],
    },
    {
      icon: Mail,
      tag: 'COMMUNICATION',
      title: 'The Sorter',
      desc: 'Reads your Gmail, categorizes by urgency with color coding, and drafts replies in your exact voice.',
      tags: ['🔴 Urgent', '🟡 Important', '🟢 Normal', 'Auto Draft'],
    },
    {
      icon: Briefcase,
      tag: 'CAREER',
      title: 'The Planner',
      desc: 'Searches real live job listings, generates tailored cover letters, and tracks every application.',
      tags: ['Live Listings', 'Cover Letters', 'Interview Prep', 'Status Track'],
    },
    {
      icon: BookOpen,
      tag: 'CONTENT',
      title: 'The Memory',
      desc: 'Generates 30 days of platform-specific content in your voice and schedules it automatically.',
      tags: ['30-Day Plan', 'Your Voice', 'Multi-Platform', 'One Click Post'],
    },
  ]

  return (
    <section id="features" className="py-32 px-6" style={{ background: tokens.bg }} ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="mb-20"
        >
          <p className="font-inter text-xs tracking-widest uppercase mb-4" style={{ color: tokens.textFaint }}>
            // Capabilities
          </p>
          <BlurText
            text="Four agents. One life."
            className="font-instrument text-6xl md:text-8xl tracking-tight leading-[0.9]"
            style={{ color: tokens.textPrimary, fontStyle: 'italic' } as any}
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
              >
                <TiltCard
                  className="rounded-[1.25rem] p-6 flex flex-col min-h-[340px] cursor-pointer"
                  style={{
                    background: tokens.surface1,
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-auto">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(34,211,238,0.2))',
                        border: '1px solid rgba(167,139,250,0.2)',
                      }}
                    >
                      <card.icon size={20} style={{ color: '#a78bfa' }} />
                    </div>
                    <div className="flex flex-wrap justify-end gap-1.5 max-w-[65%]">
                      {card.tags.map(function(tag) {
                        return (
                          <span
                            key={tag}
                            className="font-inter whitespace-nowrap rounded-full px-3 py-1"
                            style={{
                              fontSize: '11px',
                              background: tokens.surface2,
                              border: '1px solid rgba(255,255,255,0.08)',
                              color: tokens.textFaint,
                            }}
                          >
                            {tag}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="font-inter text-xs tracking-widest uppercase mb-2" style={{ color: tokens.textFaint }}>
                      {card.tag}
                    </p>
                    <h3
                      className="font-instrument text-3xl md:text-4xl mb-3 leading-none"
                      style={{ color: tokens.textPrimary, fontStyle: 'italic' }}
                    >
                      {card.title}
                    </h3>
                    <p className="font-inter text-sm leading-relaxed" style={{ color: tokens.textDim }}>
                      {card.desc}
                    </p>
                  </div>
                </TiltCard>
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
    <section className="py-32 px-6" style={{ background: tokens.bg }} ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-20"
        >
          <BlurText
            text="Simple to start. Impossible to leave."
            className="font-instrument text-5xl md:text-7xl tracking-tight"
            style={{ color: tokens.textPrimary, fontStyle: 'italic' } as any}
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { num: '01', icon: Globe, title: 'Connect', body: 'Link your Gmail and accounts in under 2 minutes. Bank-level security. Zero configuration required.' },
            { num: '02', icon: Zap, title: 'Your agents wake up', body: 'Four AI agents start assisting immediately. Reading emails, tracking spending, finding jobs, creating content.' },
            { num: '03', icon: Sparkles, title: 'Get your time back', body: 'Review what your agents prepared. Approve actions. You stay in control of everything that matters.' },
          ].map(function(step, i) {
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <GlassCard
                  className="rounded-[1.25rem] p-8 relative overflow-hidden"
                  style={{ background: tokens.surface1 }}
                >
                  <span
                    className="absolute top-6 right-8 font-instrument font-bold select-none"
                    style={{ fontSize: '6rem', color: 'rgba(255,255,255,0.03)', fontStyle: 'italic' }}
                  >
                    {step.num}
                  </span>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-6"
                    style={{
                      background: 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(34,211,238,0.15))',
                      border: '1px solid rgba(167,139,250,0.2)',
                    }}
                  >
                    <step.icon size={20} style={{ color: '#a78bfa' }} />
                  </div>
                  <h3 className="font-inter text-xl font-medium mb-3" style={{ color: tokens.textPrimary }}>
                    {step.title}
                  </h3>
                  <p className="font-inter text-sm leading-relaxed" style={{ color: tokens.textFaint }}>
                    {step.body}
                  </p>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── V2 Section ───
function V2Section() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="py-32 px-6" style={{ background: tokens.bg }} ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-20"
        >
          <GlassCard
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
          >
            <Sparkles size={12} style={{ color: '#a78bfa' }} />
            <span className="font-inter text-xs tracking-widest uppercase" style={{ color: tokens.textFaint }}>
              Version 2.0 — Coming Soon
            </span>
          </GlassCard>
          <BlurText
            text="This is just the beginning."
            className="font-instrument text-5xl md:text-7xl tracking-tight"
            style={{ color: tokens.textPrimary, fontStyle: 'italic' } as any}
          />
          <p className="font-inter text-base max-w-xl mx-auto mt-6 leading-relaxed" style={{ color: tokens.textDim }}>
            Version 1 is live. Version 2 will transform LifeOS from four powerful modules into one intelligent system that knows you better than any software ever has.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Globe, title: 'Universal Memory Engine', desc: 'Everything you do gets remembered and connected across all modules into one persistent knowledge layer.', badge: 'Q3 2026' },
            { icon: Smartphone, title: 'Mobile App (iOS & Android)', desc: 'Full LifeOS on your phone with push notifications, offline access, and native performance.', badge: 'Q3 2026' },
            { icon: BarChart3, title: 'Goal & Achievement System', desc: 'Set life goals and watch every action across all modules contribute toward measurable progress.', badge: 'Q4 2026' },
            { icon: Brain, title: 'AI Chief of Staff', desc: 'Proactive AI that guides you, recommends next actions, and acts like an executive assistant.', badge: 'Q4 2026' },
            { icon: Users, title: 'Team Collaboration', desc: 'Share agents with your team. Built for founders, agencies, and small businesses.', badge: 'Q1 2027' },
            { icon: Zap, title: 'Cross-Module Intelligence', desc: 'Agents that talk to each other. Email agent alerts job agent. Finance agent informs content agent.', badge: 'Q1 2027' },
          ].map(function(feature, i) {
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.08 }}
              >
                <GlassCard
                  className="rounded-[1.25rem] p-6 relative overflow-hidden h-full"
                  style={{ background: tokens.surface1 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(34,211,238,0.15))',
                        border: '1px solid rgba(167,139,250,0.15)',
                      }}
                    >
                      <feature.icon size={18} style={{ color: '#a78bfa' }} />
                    </div>
                    <span
                      className="font-inter text-xs rounded-full px-3 py-1"
                      style={{ border: '1px solid rgba(255,255,255,0.08)', color: tokens.textFaint }}
                    >
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="font-inter text-base font-medium mb-2" style={{ color: tokens.textDim }}>
                    {feature.title}
                  </h3>
                  <p className="font-inter text-sm leading-relaxed" style={{ color: tokens.textFaint }}>
                    {feature.desc}
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <Shield size={11} style={{ color: 'rgba(255,255,255,0.1)' }} />
                    <span className="font-inter text-xs" style={{ color: 'rgba(255,255,255,0.1)' }}>
                      Coming in V2
                    </span>
                  </div>
                </GlassCard>
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
      className="py-32 px-6"
      style={{ background: tokens.bg, borderTop: '1px solid rgba(255,255,255,0.06)' }}
      ref={ref}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <p className="font-inter text-xs tracking-widest uppercase" style={{ color: tokens.textFaint }}>
            // Loved by thousands
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
              >
                <GlassCard
                  className="rounded-2xl p-6 h-full"
                  style={{ background: tokens.surface1 }}
                >
                  <blockquote className="font-inter text-sm leading-relaxed" style={{ color: tokens.textDim }}>
                    "{t.quote}"
                  </blockquote>
                  <figcaption
                    className="mt-6 pt-5"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <p className="font-inter text-sm font-semibold" style={{ color: tokens.textPrimary }}>{t.name}</p>
                    <p className="font-inter text-xs mt-0.5" style={{ color: tokens.textFaint }}>{t.role}</p>
                    <p
                      className="font-inter text-xs font-semibold tracking-wide mt-1"
                      style={{
                        backgroundImage: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {t.company}
                    </p>
                  </figcaption>
                </GlassCard>
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
      features: ['All 4 AI Modules (limited)', '100 AI actions per month', 'Basic financial tracking', '10 email drafts per month', '5 job applications per month', '10 content posts per month'],
      accent: false,
    },
    {
      tag: 'Pro',
      price: yearly ? '$290' : '$29',
      period: yearly ? 'per year' : 'per month',
      desc: 'For power users who want AI assistance across all areas of life.',
      features: ['All 4 AI Modules (unlimited)', 'Unlimited AI actions', 'Advanced financial insights', 'Unlimited email drafting', 'Unlimited job applications', 'Unlimited content creation', 'Priority AI processing', 'Mobile responsive app'],
      accent: true,
    },
    {
      tag: 'Business',
      price: yearly ? '$990' : '$99',
      period: yearly ? 'per year' : 'per month',
      desc: 'For teams and agencies who want shared AI agents.',
      features: ['Everything in Pro', 'Up to 5 team members', 'Shared agent dashboard', 'Business email accounts', 'Advanced analytics', 'API access', 'Priority support', 'Custom agent training'],
      accent: false,
    },
  ]

  return (
    <section id="pricing" className="py-32 px-6 relative overflow-hidden" style={{ background: tokens.bg }} ref={ref}>

      {/* Cinematic watermark */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden">
        <div
          className="font-instrument font-bold leading-[0.9] text-center"
          style={{ fontSize: 'clamp(4rem, 12vw, 9rem)', letterSpacing: '-0.05em' }}
        >
          <div style={{ color: 'rgba(255,255,255,0.025)' }}>Your life.</div>
          <div
            style={{
              backgroundImage: 'linear-gradient(135deg, #a78bfa, #22d3ee, #f0abfc)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              opacity: 0.05,
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
          <p className="font-inter text-xs tracking-widest uppercase mb-4" style={{ color: tokens.textFaint }}>
            Pricing
          </p>
          <BlurText
            text="Simple pricing. Insane value."
            className="font-instrument text-5xl md:text-7xl tracking-tight"
            style={{ color: tokens.textPrimary, fontStyle: 'italic' } as any}
          />
          <p className="font-inter text-sm mt-4" style={{ color: tokens.textFaint }}>
            Start free. Upgrade when ready. Cancel anytime.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className="font-inter text-sm" style={{ color: tokens.textFaint }}>Monthly</span>
            <button
              type="button"
              onClick={function() { setYearly(!yearly) }}
              className="relative w-12 h-6 rounded-full transition-all duration-300"
              style={{ background: yearly ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.1)' }}
            >
              <div
                className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300"
                style={{ left: yearly ? '28px' : '4px' }}
              />
            </button>
            <span className="font-inter text-sm" style={{ color: tokens.textFaint }}>
              Yearly <span style={{ color: '#a78bfa' }}>(Save 17%)</span>
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
                className="rounded-[1.75rem] flex flex-col relative overflow-hidden"
                style={{
                  padding: '40px 24px',
                  minHeight: '560px',
                  background: plan.accent
                    ? 'linear-gradient(135deg, rgba(167,139,250,0.08), rgba(34,211,238,0.04))'
                    : tokens.surface1,
                  border: plan.accent
                    ? '1px solid rgba(167,139,250,0.3)'
                    : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: plan.accent
                    ? '0 0 40px rgba(167,139,250,0.1)'
                    : 'none',
                  transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                {/* Shine */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    borderRadius: 'inherit',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)',
                  }}
                />

                <p className="font-inter text-lg font-light mb-2 relative z-10" style={{ color: tokens.textFaint }}>
                  {plan.tag}
                </p>
                <div className="flex items-end gap-2 mb-4 relative z-10">
                  <p
                    className="font-instrument text-5xl"
                    style={{
                      letterSpacing: '-0.02em',
                      color: plan.accent ? 'transparent' : tokens.textPrimary,
                      backgroundImage: plan.accent ? 'linear-gradient(135deg, #a78bfa, #22d3ee)' : undefined,
                      WebkitBackgroundClip: plan.accent ? 'text' : undefined,
                      backgroundClip: plan.accent ? 'text' : undefined,
                      WebkitTextFillColor: plan.accent ? 'transparent' : undefined,
                    }}
                  >
                    {plan.price}
                  </p>
                  <p className="font-inter text-sm mb-2" style={{ color: tokens.textFaint }}>{plan.period}</p>
                </div>
                <p className="font-inter text-sm leading-relaxed mb-8 relative z-10" style={{ color: tokens.textFaint }}>
                  {plan.desc}
                </p>

                <ul className="space-y-3 mb-8 relative z-10 flex-1">
                  {plan.features.map(function(feature) {
                    return (
                      <li key={feature} className="flex items-start gap-3">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{
                            background: plan.accent
                              ? 'linear-gradient(135deg, rgba(167,139,250,0.3), rgba(34,211,238,0.3))'
                              : 'rgba(255,255,255,0.08)',
                          }}
                        >
                          <Check size={11} style={{ color: plan.accent ? '#a78bfa' : tokens.textFaint }} />
                        </div>
                        <span className="font-inter text-sm leading-snug" style={{ color: tokens.textDim }}>
                          {feature}
                        </span>
                      </li>
                    )
                  })}
                </ul>

                <motion.button
                  type="button"
                  onClick={function() { navigate('/sign-up') }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative z-10 rounded-full px-8 py-3 font-inter font-semibold text-sm self-center transition-all"
                  style={{
                    background: plan.accent
                      ? 'linear-gradient(135deg, #a78bfa, #22d3ee)'
                      : 'rgba(255,255,255,0.06)',
                    color: plan.accent ? '#000' : tokens.textPrimary,
                    border: plan.accent ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    boxShadow: plan.accent ? '0 0 20px rgba(167,139,250,0.3)' : 'none',
                  }}
                >
                  Choose Plan
                </motion.button>
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
    <section className="py-32 px-6" style={{ background: tokens.bg }} ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl px-8 py-24 text-center overflow-hidden"
          style={{
            background: tokens.surface1,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(600px circle at 50% 0%, rgba(167,139,250,0.12), transparent 70%)',
            }}
          />

          <div className="relative z-10">
            <h2
              className="font-instrument text-5xl md:text-7xl tracking-tight mb-6 leading-[0.9]"
              style={{ color: tokens.textPrimary, fontStyle: 'italic' }}
            >
              Your AI team.
              <br />
              <span style={{ color: tokens.textFaint }}>Always ready.</span>
            </h2>
            <p
              className="font-inter text-base max-w-md mx-auto mb-12 leading-relaxed"
              style={{ color: tokens.textFaint }}
            >
              Join people who use AI to work smarter on what matters. Start free. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                type="button"
                onClick={function() { navigate('/sign-up') }}
                whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(167,139,250,0.4)' }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-full px-10 py-4 font-inter font-semibold text-sm text-black"
                style={{ background: 'linear-gradient(135deg, #a78bfa, #22d3ee)' }}
              >
                <Rocket size={16} />
                Get Started Free
              </motion.button>
              <motion.button
                type="button"
                onClick={function() { navigate('/sign-in') }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 rounded-full px-10 py-4 font-inter text-sm"
                style={{ border: '1px solid rgba(255,255,255,0.1)', color: tokens.textDim }}
              >
                Sign In
                <ChevronRight size={14} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div
          className="mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #a78bfa, #22d3ee)' }}
            >
              <Brain size={12} className="text-white" />
            </div>
            <span className="font-inter text-sm" style={{ color: tokens.textFaint }}>LifeOS</span>
            <span className="font-inter text-xs" style={{ color: 'rgba(255,255,255,0.1)' }}>v1.0</span>
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
                  className="font-inter text-xs transition-colors cursor-pointer"
                  style={{ color: 'rgba(255,255,255,0.15)' }}
                  onMouseEnter={function(e) { e.currentTarget.style.color = tokens.textFaint }}
                  onMouseLeave={function(e) { e.currentTarget.style.color = 'rgba(255,255,255,0.15)' }}
                >
                  {link.label}
                </button>
              )
            })}
          </div>
          <span className="font-inter text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>
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
    <div style={{ background: tokens.bg, minHeight: '100vh' }}>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
      <BackgroundFX />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <DashboardPreview />
        <Features />
        <HowItWorks />
        <V2Section />
        <Testimonials />
        <Pricing />
        <FinalCTA />
      </div>
    </div>
  )
}
