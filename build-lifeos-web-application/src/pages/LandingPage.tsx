import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignInButton, SignUpButton } from '@clerk/clerk-react'
import {
  Brain, Zap, ArrowRight, DollarSign, Mail, Briefcase, PenTool,
  Link, TrendingUp, Check, Sparkles, Smartphone, Globe, Shield,
  BarChart3, Users, Rocket
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
        <div className="flex items-center gap-2 cursor-pointer" onClick={function() { navigate('/') }}>
          <Brain size={24} className="text-white" />
          <span className="text-white font-semibold text-lg font-inter">LifeOS</span>
          <span className="liquid-glass rounded-full px-2 py-0.5 text-white/40 text-xs font-inter ml-1">
            v1.0
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-white/70 hover:text-white text-sm transition-colors font-inter">Features</a>
          <a href="#v2" className="text-white/70 hover:text-white text-sm transition-colors font-inter">V2 Coming</a>
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
            <button className="liquid-glass rounded-full px-6 py-2.5 text-white text-sm hover:scale-105 transition-transform font-inter">
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
    <section className="min-h-[90vh] flex flex-col items-center justify-center relative px-6">
      <div className="bg-mesh" />
      
      {/* Status Badge */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium">
          The future is now live • v1.0
        </span>
      </motion.div>

      {/* Massive Heading */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
        className="text-center"
      >
        <h1 className="display-text text-[15vw] md:text-[12vw] font-light leading-[0.8]">
          Life<span className="italic text-white/20 font-light">OS</span>
        </h1>
        <p className="mt-8 text-white/30 text-lg md:text-xl font-light tracking-wide max-w-xl mx-auto font-inter">
          The first Agentic operating system for the high-performance individual. 
          Everything handled. While you slept.
        </p>
      </motion.div>

      {/* Obsidian CTA */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 flex flex-col items-center gap-6"
      >
        <SignUpButton mode="modal">
          <button className="px-10 py-4 bg-white text-black rounded-full font-semibold text-sm hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]">
            Begin Journey — Free
          </button>
        </SignUpButton>
        
        <div className="flex items-center gap-8 opacity-20 hover:opacity-100 transition-opacity duration-500">
           <img src="https://www.google.com/s2/favicons?domain=x.com&sz=32" className="grayscale invert" />
           <img src="https://www.google.com/s2/favicons?domain=google.com&sz=32" className="grayscale invert" />
           <img src="https://www.google.com/s2/favicons?domain=linkedin.com&sz=32" className="grayscale invert" />
        </div>
      </motion.div>
    </section>
  )
}

// ─── Stats Bar ───
function StatsBar() {
  const { ref, isInView } = useAnimateInView()
  return (
    <section className="py-16 px-6 bg-black" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="liquid-glass rounded-3xl max-w-4xl mx-auto p-8"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '4', label: 'AI Agents' },
            { value: '24/7', label: 'Always Working' },
            { value: '∞', label: 'Tasks Automated' },
            { value: '$0', label: 'To Get Started' },
          ].map(function(stat, i) {
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <p className="font-instrument text-4xl text-white mb-1">{stat.value}</p>
                <p className="text-white/40 text-xs font-inter tracking-widest uppercase">{stat.label}</p>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
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
              whileHover={{ scale: 1.01, y: -4 }}
              className="liquid-glass rounded-3xl p-8 group hover:bg-white/[0.02] transition-all duration-500 cursor-pointer"
            >
              <div className="liquid-glass rounded-2xl p-4 inline-flex mb-6 w-fit group-hover:scale-110 transition-transform duration-300">
                <card.icon size={28} className="text-white/80" />
              </div>
              <p className="text-white/30 text-xs tracking-widest uppercase mb-3 font-inter">{card.tag}</p>
              <h3 className="font-instrument text-2xl text-white mb-4 tracking-tight">{card.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-6 font-inter">{card.desc}</p>
              <div className="flex flex-wrap gap-2">
                {card.pills.map(function(pill) {
                  return (
                    <span key={pill} className="liquid-glass rounded-full px-3 py-1 text-white/40 text-xs font-inter">
                      {pill}
                    </span>
                  )
                })}
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
              whileHover={{ scale: 1.01, y: -4 }}
              className="liquid-glass rounded-3xl p-8 relative overflow-hidden"
            >
              <span className="absolute top-6 right-8 text-8xl font-bold text-white/5 font-instrument select-none">
                {step.num}
              </span>
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

// ─── V2 Coming Soon ───
function V2ComingSoon() {
  const { ref, isInView } = useAnimateInView()

  const v2Features = [
    {
      icon: Globe,
      title: 'Bank Account Connection',
      desc: 'Connect your real bank account. AI automatically tracks every transaction and detects subscriptions without manual entry.',
      badge: 'Q3 2026',
    },
    {
      icon: Smartphone,
      title: 'Mobile App (iOS & Android)',
      desc: 'Full LifeOS experience on your phone. Native apps with push notifications and offline access.',
      badge: 'Q3 2026',
    },
    {
      icon: PenTool,
      title: 'Real Social Media Posting',
      desc: 'Direct publishing to Twitter, Instagram, LinkedIn and YouTube. No copy paste. One click.',
      badge: 'Q4 2026',
    },
    {
      icon: Brain,
      title: 'AI That Learns Your Style',
      desc: 'The more you use LifeOS, the smarter it gets. Learns your writing style, spending habits, and career goals.',
      badge: 'Q4 2026',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      desc: 'Share agents with your team. Delegate tasks across departments. Built for founders and small teams.',
      badge: 'Q1 2027',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics Dashboard',
      desc: 'Deep insights into your life patterns. See trends in spending, productivity, and career growth over time.',
      badge: 'Q1 2027',
    },
  ]

  return (
    <section id="v2" className="py-40 px-6 bg-black" ref={ref}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="liquid-glass rounded-full px-4 py-1.5 inline-flex items-center gap-2 mb-6 border border-white/10">
            <Sparkles size={12} className="text-white/60" />
            <span className="text-white/60 text-xs tracking-widest uppercase font-inter">
              Version 2.0 — Coming Soon
            </span>
          </div>

          <h2 className="font-instrument text-5xl md:text-7xl text-white tracking-tight mb-6">
            This is just
            <br />
            <em className="italic text-white/40">the beginning.</em>
          </h2>

          <p className="text-white/40 text-lg max-w-2xl mx-auto font-inter leading-relaxed">
            Version 1 is live and working. Version 2 is going to make it feel like you have a full team working for you 24/7. Here is what is coming.
          </p>
        </motion.div>

        {/* V2 Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {v2Features.map(function(feature, i) {
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="liquid-glass rounded-3xl p-6 relative overflow-hidden group"
              >
                {/* Coming soon overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />

                <div className="flex items-start justify-between mb-4">
                  <div className="liquid-glass rounded-xl p-3 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon size={20} className="text-white/60" />
                  </div>
                  <span className="liquid-glass rounded-full px-3 py-1 text-white/30 text-xs font-inter border border-white/10">
                    {feature.badge}
                  </span>
                </div>

                <h3 className="text-white/80 text-base font-medium mb-2 font-inter">
                  {feature.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed font-inter">
                  {feature.desc}
                </p>

                {/* Lock indicator */}
                <div className="flex items-center gap-2 mt-4">
                  <Shield size={12} className="text-white/20" />
                  <span className="text-white/20 text-xs font-inter">Coming in V2</span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-white/30 text-sm font-inter mb-6">
            Start with V1 today. V2 upgrades automatically when it launches.
          </p>
          <SignUpButton mode="modal">
            <button className="liquid-glass rounded-full px-8 py-3.5 text-white text-sm font-inter hover:bg-white/5 transition-all hover:scale-105 flex items-center gap-2 mx-auto">
              <Rocket size={16} />
              Get Early Access — Free
            </button>
          </SignUpButton>
        </motion.div>
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

  const plans = [
    {
      tag: 'FREE FOREVER', price: '$0', featured: false,
      features: [
        'All 4 AI Modules (limited)',
        '100 AI actions per month',
        'Basic financial tracking',
        '10 email drafts per month',
        '5 job applications per month',
        '10 content posts per month',
      ],
      btn: 'Get Started Free',
      cta: 'signup',
    },
    {
      tag: 'PRO', price: '$29', featured: true, popular: true,
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
      btn: 'Start Pro — $29/mo',
      cta: 'signup',
    },
    {
      tag: 'BUSINESS', price: '$99', featured: false,
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
      btn: 'Start Business',
      cta: 'signup',
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
          className="font-instrument text-5xl md:text-7xl text-white tracking-tight text-center mb-6"
        >
          Simple pricing.
          <br />
          <em className="italic text-white/40">Insane value.</em>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white/30 text-center font-inter text-sm mb-20"
        >
          Start free. Upgrade when you are ready. Cancel anytime.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {plans.map(function(plan, i) {
            return (
              <motion.div
                key={plan.tag}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className={'liquid-glass rounded-3xl p-8 ' + (plan.featured ? 'ring-1 ring-white/15 md:scale-105' : '')}
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-white/40 text-xs tracking-widest uppercase font-inter">
                    {plan.tag}
                  </span>
                  {plan.popular && (
                    <span className="liquid-glass rounded-full px-3 py-1 text-white/60 text-xs font-inter">
                      Most Popular
                    </span>
                  )}
                </div>

                <div className="flex items-end mb-2">
                  <span className="font-instrument text-6xl text-white font-light">{plan.price}</span>
                  <span className="text-white/40 text-base ml-2 mb-2 font-inter">/month</span>
                </div>

                <div className="w-full h-px bg-white/10 my-6" />

                <div className="space-y-3 mb-8">
                  {plan.features.map(function(f) {
                    return (
                      <div key={f} className="flex items-center gap-3">
                        <Check size={16} className="text-white/50 flex-shrink-0" />
                        <span className="text-white/60 text-sm font-inter">{f}</span>
                      </div>
                    )
                  })}
                </div>

                <SignUpButton mode="modal">
                  <button
                    className={'w-full rounded-full px-8 py-3.5 text-sm font-medium transition-all hover:scale-102 cursor-pointer ' +
                      (plan.featured
                        ? 'bg-white text-black font-semibold hover:bg-white/90'
                        : 'liquid-glass text-white hover:bg-white/5')}
                  >
                    {plan.btn}
                  </button>
                </SignUpButton>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Footer CTA ───
function FooterCTA() {
  const { ref, isInView } = useAnimateInView()
  const navigate = useNavigate()

  return (
    <section className="py-40 px-6 bg-black text-center" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="liquid-glass rounded-full px-4 py-1.5 inline-flex items-center gap-2 mb-8 border border-white/10"
        >
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white/60 text-xs tracking-widest uppercase font-inter">
            Live Now — Version 1.0
          </span>
        </motion.div>

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
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <SignUpButton mode="modal">
            <button className="bg-white text-black rounded-full px-10 py-4 text-sm font-semibold hover:bg-white/90 transition-all hover:scale-105 font-inter flex items-center gap-2">
              <Rocket size={16} />
              Get Started Free
            </button>
          </SignUpButton>
          <SignInButton mode="modal">
            <button className="liquid-glass rounded-full px-10 py-4 text-white text-sm font-inter hover:bg-white/5 transition-all">
              Already have an account? Sign In
            </button>
          </SignInButton>
        </motion.div>

        {/* Footer bar */}
        <div className="mt-20 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-white/30" />
              <span className="text-white/30 text-sm font-inter">LifeOS</span>
              <span className="text-white/15 text-xs font-inter">v1.0</span>
            </div>
            <div className="flex gap-8">
              <button
                type="button"
                onClick={function() { navigate('/privacy') }}
                className="text-white/20 text-xs hover:text-white/40 transition-colors font-inter cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={function() { navigate('/terms') }}
                className="text-white/20 text-xs hover:text-white/40 transition-colors font-inter cursor-pointer"
              >
                Terms of Service
              </button>
              <button
                type="button"
                onClick={function() { navigate('/contact') }}
                className="text-white/20 text-xs hover:text-white/40 transition-colors font-inter cursor-pointer"
              >
                Contact
              </button>
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
      <StatsBar />
      <Features />
      <HowItWorks />
      <V2ComingSoon />
      <Philosophy />
      <Pricing />
      <FooterCTA />
    </motion.div>
  )
}
