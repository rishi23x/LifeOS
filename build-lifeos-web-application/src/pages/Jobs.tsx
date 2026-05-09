import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { MapPin, DollarSign, Clock, Search } from 'lucide-react'
import Sidebar from '../components/Sidebar'

function useAnimateInView() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  return { ref, isInView }
}

const tabs = ['Find Jobs', 'My Resume', 'Applications', 'Interview Prep']

const jobs = [
  {
    company: 'Google',
    role: 'Senior Frontend Developer',
    match: '94%',
    location: 'San Francisco',
    salary: '$180k-$220k',
    type: 'Full-time',
    desc: 'We are looking for an experienced developer to join our Chrome team and help build the next generation of web experiences.',
  },
  {
    company: 'Stripe',
    role: 'Full Stack Engineer',
    match: '89%',
    location: 'Remote',
    salary: '$160k-$200k',
    type: 'Full-time',
    desc: 'Help us build the financial infrastructure of the internet. You will work on products that power millions of businesses.',
  },
  {
    company: 'Anthropic',
    role: 'AI Product Engineer',
    match: '85%',
    location: 'San Francisco',
    salary: '$200k-$250k',
    type: 'Full-time',
    desc: 'Work on cutting-edge AI products that will shape the future of how humans interact with artificial intelligence.',
  },
]

const applications = [
  { company: 'Google', role: 'Sr. Frontend Dev', status: 'Interview', statusColor: 'text-green-400/70', applied: '2 days ago', next: 'Prep Interview' },
  { company: 'Stripe', role: 'Full Stack Eng', status: 'Applied', statusColor: 'text-yellow-400/70', applied: '5 days ago', next: 'Follow Up' },
  { company: 'Meta', role: 'React Engineer', status: 'Reviewing', statusColor: 'text-blue-400/70', applied: '1 week ago', next: 'Wait' },
  { company: 'Netflix', role: 'UI Engineer', status: 'Rejected', statusColor: 'text-red-400/70', applied: '2 weeks ago', next: 'Apply Again' },
  { company: 'Anthropic', role: 'AI Engineer', status: 'Applied', statusColor: 'text-yellow-400/70', applied: 'Today', next: 'Wait' },
]

export default function Jobs() {
  const [activeTab, setActiveTab] = useState(0)
  const { ref, isInView } = useAnimateInView()

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
          <h1 className="font-instrument text-4xl text-white mb-2">Job Application Bot</h1>
          <p className="text-white/40 text-sm font-inter">12 applications submitted this week.</p>
        </div>

        {/* Tabs */}
        <div className="liquid-glass rounded-full flex p-1 mb-8 w-fit">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`rounded-full px-6 py-2.5 text-sm font-inter transition-all cursor-pointer ${
                activeTab === i ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Find Jobs Tab */}
        {activeTab === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            ref={ref}
          >
            {/* Search Row */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="liquid-glass rounded-full flex-1 px-5 py-3 flex items-center gap-3">
                <Search size={16} className="text-white/30" />
                <input
                  placeholder="Job title or keyword..."
                  className="bg-transparent text-white placeholder:text-white/30 outline-none w-full text-sm font-inter"
                />
              </div>
              <div className="liquid-glass rounded-full px-5 py-3 w-full md:w-48">
                <input
                  placeholder="Location..."
                  className="bg-transparent text-white placeholder:text-white/30 outline-none w-full text-sm font-inter"
                />
              </div>
              <button className="liquid-glass rounded-full px-6 py-3 text-white text-sm font-inter hover:bg-white/5 transition-all cursor-pointer whitespace-nowrap">
                Search with AI
              </button>
            </div>

            {/* Job Cards */}
            <div className="space-y-4">
              {jobs.map((job, i) => (
                <motion.div
                  key={job.company}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
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
                  <div className="flex gap-3">
                    <button className="liquid-glass rounded-full px-5 py-2.5 text-white text-sm font-inter hover:bg-white/5 transition-all cursor-pointer">
                      Apply with AI
                    </button>
                    <button className="text-white/40 text-sm font-inter hover:text-white/60 transition-colors cursor-pointer px-3">
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Applications Tab */}
        {activeTab === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="liquid-glass rounded-3xl p-6 md:p-8"
          >
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-5 gap-4 px-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              {['Company', 'Role', 'Status', 'Applied', 'Next Action'].map((h) => (
                <span key={h} className="text-white/30 text-xs tracking-widest uppercase font-inter">{h}</span>
              ))}
            </div>

            {/* Table Rows */}
            {applications.map((app, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 px-4 py-5"
                style={{ borderBottom: i < applications.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
              >
                <span className="text-white/80 text-sm font-inter font-medium">{app.company}</span>
                <span className="text-white/60 text-sm font-inter">{app.role}</span>
                <span>
                  <span className={`liquid-glass rounded-full px-3 py-1 text-xs font-inter ${app.statusColor}`}>
                    {app.status}
                  </span>
                </span>
                <span className="text-white/40 text-sm font-inter">{app.applied}</span>
                <span className="text-white/50 text-sm font-inter cursor-pointer hover:text-white/70 transition-colors">{app.next}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* My Resume Tab */}
        {activeTab === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="liquid-glass rounded-3xl p-6 md:p-8"
          >
            <h2 className="text-white text-lg font-medium mb-6 font-inter">Your Resume</h2>
            <div className="liquid-glass rounded-2xl p-6 mb-6">
              <p className="text-white/70 text-sm leading-relaxed font-inter mb-4">Your AI agent keeps your resume updated and optimized for each application. It automatically adjusts keywords, reorders experience, and tailors your summary to match job descriptions.</p>
              <div className="space-y-4">
                <div>
                  <p className="text-white/40 text-xs tracking-widest uppercase mb-2 font-inter">SKILLS DETECTED</p>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'System Design', 'Leadership'].map(s => (
                      <span key={s} className="liquid-glass rounded-full px-3 py-1 text-white/50 text-xs font-inter">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-white/40 text-xs tracking-widest uppercase mb-2 font-inter">RESUME SCORE</p>
                  <p className="font-instrument text-4xl text-white font-light">92/100</p>
                  <p className="text-white/30 text-xs font-inter mt-1">Excellent — your resume is well optimized</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Interview Prep Tab */}
        {activeTab === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="liquid-glass rounded-3xl p-6 md:p-8"
          >
            <h2 className="text-white text-lg font-medium mb-6 font-inter">Interview Preparation</h2>
            <div className="space-y-4">
              {[
                { q: 'Tell me about yourself', hint: 'Focus on your recent experience and what drives you.' },
                { q: 'Why do you want to work at Google?', hint: 'Mention Chrome team, web standards, and scale.' },
                { q: 'Describe a challenging technical problem you solved', hint: 'Use the STAR method for structure.' },
              ].map((item, i) => (
                <div key={i} className="liquid-glass rounded-2xl p-6">
                  <p className="text-white/80 text-sm font-medium font-inter mb-2">{item.q}</p>
                  <p className="text-white/40 text-xs font-inter">AI Tip: {item.hint}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </motion.div>
  )
}
