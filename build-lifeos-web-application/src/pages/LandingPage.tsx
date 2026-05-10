import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignInButton, SignUpButton, useAuth } from '@clerk/clerk-react'
import {
  Brain, Zap, ArrowRight, DollarSign, Mail, Briefcase, PenTool,
  Link, TrendingUp, Check
} from 'lucide-react'

function useAnimateInView() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  return { ref, isInView }
}

// ─── Navbar ───
function Navbar() {
  const navigate = useNavigate()
  return (
    <nav className="w-full px-6 py-6 relative z-20">
      <div className="liquid-glass rounded-full max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <Brain size={24} className="text-white" />
          <span className="text-white font-semibold text-lg font-inter">LifeOS</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-white/70 hover:text-white text-sm transition-colors font-inter">Features</a>
          <a href="#pricing" className="text-white/70 hover:text-white text-sm transition-colors font-inter">Pricing</a>
          <a href="#about" className="text-white/70 hover:text-white text-sm transition-colors font-inter">About</a>
        </div>
       <div className="flex items-center gap-4">
  <SignInButton mode="modal">
    <span className="text-white text-sm font-medium cursor-pointer hover:text-white/80 transition-colors font-inter hidden sm:block">
      Sign In
    </span>
  </SignInButton>
  <SignUpButton mode="modal">
    <button className="liquid-glass rounded-full px-6 py-2.5 text-white text-sm hover:scale-102 transition-transform font-inter">
      Get Started Free
    </button>
  </SignUpButton>
</div>
      </div>
    </nav>
  )
}

// ─── Hero ───
function Hero() {
  return (
    <section className="min-h-screen bg-black relative">
      {/* Orbs */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl"
        animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/6 rounded-full blur-3xl"
        animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="liquid-glass rounded-full px-4 py-1.5 inline-flex items-center gap-2 mb-8"
        >
          <Zap size={12} className="text-white/60" />
          <span className="text-white/60 text-xs tracking-widest uppercase font-inter">Agentic AI Platform — 2026</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-instrument text-7xl md:text-9xl text-white tracking-tight leading-none mb-6"
        >
          Your life,
          <br />
          <em className="italic text-white/50">automated.</em>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-inter"
        >
          LifeOS is your personal AI agent that manages your finances, emails, job search, and content — autonomously, 24/7, while you focus on living.
        </motion.p>

        {/* Email Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-lg w-full mx-auto"
        >
          <div className="liquid-glass rounded-full pl-6 pr-2 py-2.5 flex items-center gap-3">
            <input
              type="email"
              placeholder="Enter your email address"
              className="bg-transparent text-white placeholder:text-white/30 outline-none flex-1 text-sm font-inter"
            />
            <SignUpButton mode="modal">
  <button className="bg-white rounded-full p-3 hover:scale-105 transition-transform flex-shrink-0">
    <ArrowRight size={20} className="text-black" />
  </button>
</SignUpButton>
          </div>
          <p className="text-white/30 text-xs mt-3 font-inter">Free forever · No credit card required</p>
        </motion.div>

        {/* Module Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-12">
          {[
            { icon: DollarSign, label: 'Financial Manager' },
            { icon: Mail, label: 'Email Assistant' },
            { icon: Briefcase, label: 'Job Application Bot' },
            { icon: PenTool, label: 'Content Manager' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + i * 0.1 }}
              className="liquid-glass rounded-full px-5 py-2.5 flex items-center gap-2 hover:scale-102 transition-transform cursor-pointer"
            >
              <item.icon size={16} className="text-white/60" />
              <span className="text-white/60 text-sm font-inter">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Features ───
function Features() {
  const { ref, isInView } = useAnimateInView()

  const cards = [
    {
      icon: DollarSign, tag: 'FINANCE', title: 'AI Financial Manager',
      desc: 'Connects to your bank, categorizes spending, detects wasted subscriptions, and gives you a full financial health report every week. Automatically.',
      pills: ['Auto Categorization', 'Bill Negotiation', 'Investment Alerts', 'Weekly Reports'],
    },
    {
      icon: Mail, tag: 'COMMUNICATION', title: 'AI Email & DM Assistant',
      desc: 'Reads, categorizes, and drafts replies in your voice. Surfaces only what matters. Handles the rest silently.',
      pills: ['Smart Inbox', 'Auto Draft', 'DM Integration', 'Tone Analyzer'],
    },
    {
      icon: Briefcase, tag: 'CAREER', title: 'AI Job Application Bot',
      desc: 'Parses your resume, matches it to job descriptions, rewrites it for each role, generates cover letters, and tracks every application.',
      pills: ['Resume Parser', 'Cover Letters', 'Interview Prep', 'Application Tracker'],
    },
    {
      icon: PenTool, tag: 'CONTENT', title: 'AI Content Manager',
      desc: 'Generates 30 days of content in your voice, schedules posts at optimal times, and analyzes what performs best.',
      pills: ['30-Day Calendar', 'Auto Schedule', 'Analytics', 'Multi-Platform'],
    },
  ]

  return (
    <section id="features" className="pt-40 pb-20 px-6 bg-black" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-white/40 text-sm tracking-widest uppercase mb-4 text-center font-inter"
        >
          What LifeOS Does
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-instrument text-6xl md:text-7xl text-white tracking-tight mb-16 text-center"
        >
          Four agents.
          <br />
          <em className="italic text-white/40">One life.</em>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.tag}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 * i }}
              whileHover={{ scale: 1.01 }}
              className="liquid-glass rounded-3xl p-8 group hover:bg-white/[0.02] transition-all duration-500 cursor-pointer"
            >
              <div className="liquid-glass rounded-2xl p-4 inline-flex mb-6 w-fit">
                <card.icon size={28} className="text-white/80" />
              </div>
              <p className="text-white/30 text-xs tracking-widest uppercase mb-3 font-inter">{card.tag}</p>
              <h3 className="font-instrument text-2xl text-white mb-4 tracking-tight">{card.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-6 font-inter">{card.desc}</p>
              <div className="flex flex-wrap gap-2">
                {card.pills.map((pill) => (
                  <span key={pill} className="liquid-glass rounded-full px-3 py-1 text-white/40 text-xs font-inter">{pill}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ───
function HowItWorks() {
  const { ref, isInView } = useAnimateInView()

  const steps = [
    { num: '01', icon: Link, title: 'Connect Everything', body: 'Link your bank, email, LinkedIn, and social accounts in under 5 minutes. Bank-level security.' },
    { num: '02', icon: Brain, title: 'Agents Take Over', body: 'Your four AI agents start working immediately. No setup. No configuration. Just results from day one.' },
    { num: '03', icon: TrendingUp, title: 'You Just Live', body: 'Review what your agents did. Approve actions. Watch your life run itself.' },
  ]

  return (
    <section className="py-40 px-6 bg-black" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="font-instrument text-5xl md:text-7xl text-white tracking-tight text-center mb-20"
        >
          Simple to start.
          <br />
          <em className="italic text-white/40">Impossible to leave.</em>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 * i }}
              whileHover={{ scale: 1.01 }}
              className="liquid-glass rounded-3xl p-8 relative overflow-hidden"
            >
              <span className="absolute top-6 right-8 text-8xl font-bold text-white/5 font-instrument select-none">{step.num}</span>
              <div className="liquid-glass rounded-xl p-3 inline-flex mb-6 w-fit">
                <step.icon size={24} className="text-white/70" />
              </div>
              <h3 className="text-white text-xl font-medium mb-3 font-inter">{step.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed font-inter">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Philosophy ───
function Philosophy() {
  const { ref, isInView } = useAnimateInView()

  return (
    <section id="about" className="py-40 px-6 bg-black" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="font-instrument text-6xl md:text-8xl text-white tracking-tight mb-16"
        >
          Automation
          <em className="italic text-white/40"> x </em>
          Freedom.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="liquid-glass rounded-3xl p-10"
          >
            <p className="text-white/40 text-xs tracking-widest uppercase mb-4 font-inter">OUR BELIEF</p>
            <p className="text-white/70 text-lg leading-relaxed font-inter">
              The future is not about working harder or even smarter. It is about delegating the mechanical parts of life to AI agents who never sleep, never forget, and never ask for a raise.
            </p>
            <div className="w-full h-px bg-white/10 my-8" />
            <p className="text-white/40 text-xs tracking-widest uppercase mb-4 font-inter">OUR MISSION</p>
            <p className="text-white/70 text-base leading-relaxed font-inter">
              LifeOS exists to give every person on Earth access to the kind of leverage that only the ultra-wealthy used to have — a team of experts running their life around the clock.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="liquid-glass rounded-3xl p-10 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Brain size={64} className="text-white/20 mb-6" />
              </motion.div>
              <span className="font-instrument text-8xl text-white/10">24/7</span>
              <span className="text-white/30 text-sm font-inter mt-2">Always working. Never stopping.</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ───
function Pricing() {
  const { ref, isInView } = useAnimateInView()
  const navigate = useNavigate()

  const plans = [
    {
      tag: 'FREE FOREVER', price: '$0', featured: false,
      features: [
        'All 4 AI Modules (limited)', '100 AI actions per month', 'Basic financial tracking',
        '10 email drafts per month', '5 job applications per month', '10 content posts per month',
      ],
      btn: 'Get Started Free',
    },
    {
      tag: 'PRO', price: '$29', featured: true, popular: true,
      features: [
        'All 4 AI Modules (unlimited)', 'Unlimited AI actions', 'Advanced financial insights',
        'Unlimited email drafting', 'Unlimited job applications', 'Unlimited content creation',
        'Priority AI processing', 'Mobile responsive app',
      ],
      btn: 'Start Pro — $29/mo',
    },
    {
      tag: 'BUSINESS', price: '$99', featured: false,
      features: [
        'Everything in Pro', 'Up to 5 team members', 'Shared agent dashboard',
        'Business email accounts', 'Advanced analytics', 'API access',
        'Priority support', 'Custom agent training',
      ],
      btn: 'Start Business',
    },
  ]

  return (
    <section id="pricing" className="py-40 px-6 bg-black" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-white/40 text-sm tracking-widest uppercase text-center mb-4 font-inter"
        >
          PRICING
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-instrument text-5xl md:text-7xl text-white tracking-tight text-center mb-20"
        >
          Simple pricing.
          <br />
          <em className="italic text-white/40">Insane value.</em>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.tag}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ scale: 1.01 }}
              className={`liquid-glass rounded-3xl p-8 ${plan.featured ? 'ring-1 ring-white/15 md:scale-105' : ''}`}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-white/40 text-xs tracking-widest uppercase font-inter">{plan.tag}</span>
                {plan.popular && (
                  <span className="liquid-glass rounded-full px-3 py-1 text-white/60 text-xs font-inter">Most Popular</span>
                )}
              </div>

              <div className="flex items-end mb-2">
                <span className="font-instrument text-6xl text-white font-light">{plan.price}</span>
                <span className="text-white/40 text-base ml-2 mb-2 font-inter">/month</span>
              </div>

              <div className="w-full h-px bg-white/10 my-6" />

              <div className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <Check size={16} className="text-white/50 flex-shrink-0" />
                    <span className="text-white/60 text-sm font-inter">{f}</span>
                  </div>
                ))}
              </div>

              <button
                ={() => navigate('/dashboard')}
                className={`w-full rounded-full px-8 py-3.5 text-sm font-medium transition-all hover:scale-102 cursor-pointer ${
                  plan.featured
                    ? 'bg-white text-black font-semibold hover:bg-white/90'
                    : 'liquid-glass text-white hover:bg-white/5'
                }`}
              >
                {plan.btn}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Footer CTA ───
function FooterCTA() {
  const { ref, isInView } = useAnimateInView()

  return (
    <section className="py-40 px-6 bg-black text-center" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="font-instrument text-6xl md:text-8xl text-white tracking-tight mb-6"
        >
          Your life on
          <br />
          <em className="italic text-white/40">autopilot.</em>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white/40 text-lg max-w-lg mx-auto mb-12 font-inter"
        >
          Start free. No credit card. Your agents are ready right now.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-lg w-full mx-auto"
        >
          <div className="liquid-glass rounded-full pl-6 pr-2 py-2.5 flex items-center gap-3">
            <input
              type="email"
              placeholder="Enter your email address"
              className="bg-transparent text-white placeholder:text-white/30 outline-none flex-1 text-sm font-inter"
            />
            <button className="bg-white rounded-full p-3 hover:scale-105 transition-transform flex-shrink-0">
              <ArrowRight size={20} className="text-black" />
            </button>
          </div>
        </motion.div>

        {/* Footer bar */}
        <div className="mt-20 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-white/30 text-sm font-inter">LifeOS</span>
            <div className="flex gap-8">
              <a href="#" className="text-white/20 text-xs hover:text-white/40 transition-colors font-inter">Privacy</a>
              <a href="#" className="text-white/20 text-xs hover:text-white/40 transition-colors font-inter">Terms</a>
              <a href="#" className="text-white/20 text-xs hover:text-white/40 transition-colors font-inter">Contact</a>
            </div>
            <span className="text-white/20 text-xs font-inter">© 2026 LifeOS. All rights reserved.</span>
          </div>
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
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Philosophy />
      <Pricing />
      <FooterCTA />
    </motion.div>
  )
}
