import { motion } from 'framer-motion'
import { useState } from 'react'
import { Zap } from 'lucide-react'
import Sidebar from '../components/Sidebar'

const platforms = [
  { name: 'Twitter/X', status: 'Connected', followers: '2.4k followers', connected: true },
  { name: 'Instagram', status: 'Connected', followers: '8.7k followers', connected: true },
  { name: 'LinkedIn', status: 'Connected', followers: '1.2k followers', connected: true },
  { name: 'YouTube', status: 'Connect', followers: '', connected: false },
]

const contentIdeas = [
  {
    day: '01', platform: 'LinkedIn',
    text: 'The AI agent revolution is not coming. It is already here. Here is what that means for your career in 2026: 🧵',
  },
  {
    day: '02', platform: 'Twitter',
    text: 'Unpopular opinion: The people who will be richest in 2030 are not learning to code. They are learning to manage AI agents. Here is the difference:',
  },
  {
    day: '03', platform: 'Instagram',
    text: 'What if you never had to write another email again? Your AI does it in your voice. You just hit send. This is the future we built. #LifeOS',
  },
  {
    day: '04', platform: 'LinkedIn',
    text: 'I automated 80% of my work life. Here is exactly what my AI agents do every single day:',
  },
  {
    day: '05', platform: 'Twitter',
    text: 'The biggest skill of 2026 is not prompt engineering. It is knowing WHAT to delegate to AI agents and WHAT to keep human.',
  },
]

const platformSelectors = ['Twitter', 'Instagram', 'LinkedIn', 'All']

// Generate calendar data for June 2026
function generateCalendar() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  // June 2026 starts on Monday (day index 1)
  const startDay = 1
  const daysInMonth = 30

  const calendarCells: (number | null)[] = []
  for (let i = 0; i < startDay; i++) calendarCells.push(null)
  for (let i = 1; i <= daysInMonth; i++) calendarCells.push(i)
  while (calendarCells.length % 7 !== 0) calendarCells.push(null)

  // Scatter posts across days
  const postDays: Record<number, { platform: string; title: string }[]> = {
    1: [{ platform: 'LI', title: 'AI revolution' }],
    2: [{ platform: 'TW', title: 'Manage AI agents' }],
    3: [{ platform: 'IG', title: 'No more emails' }],
    5: [{ platform: 'LI', title: 'My AI agents' }],
    6: [{ platform: 'TW', title: 'Biggest skill' }],
    8: [{ platform: 'IG', title: 'Future of work' }],
    9: [{ platform: 'LI', title: 'Career tips' }],
    11: [{ platform: 'TW', title: 'AI tools list' }],
    13: [{ platform: 'IG', title: 'Behind scenes' }],
    14: [{ platform: 'LI', title: 'Leadership AI' }],
    16: [{ platform: 'TW', title: 'Hot take' }],
    18: [{ platform: 'IG', title: 'Product demo' }],
    19: [{ platform: 'LI', title: 'Case study' }],
    21: [{ platform: 'TW', title: 'Thread time' }],
    23: [{ platform: 'IG', title: 'Motivation' }],
    25: [{ platform: 'LI', title: 'Industry news' }],
    26: [{ platform: 'TW', title: 'Quick tip' }],
    28: [{ platform: 'IG', title: 'User story' }],
    30: [{ platform: 'LI', title: 'Month recap' }],
  }

  return { days, calendarCells, postDays }
}

export default function Content() {
  const [activePlatform, setActivePlatform] = useState(3) // "All" selected
  const { days, calendarCells, postDays } = generateCalendar()

  const platformColors: Record<string, string> = {
    TW: 'bg-blue-400/40',
    IG: 'bg-pink-400/40',
    LI: 'bg-blue-600/40',
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
          <h1 className="font-instrument text-4xl text-white mb-2">Content Manager</h1>
          <p className="text-white/40 text-sm font-inter">28 posts scheduled for the next 30 days.</p>
        </div>

        {/* Platform Row */}
        <div className="flex flex-wrap gap-4 mb-8">
          {platforms.map((p) => (
            <div key={p.name} className="liquid-glass rounded-2xl px-6 py-4 flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-white/10 flex-shrink-0" />
              <div>
                <span className="text-white/70 text-sm font-inter">{p.name}</span>
                {p.connected ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-green-400/60 text-xs font-inter">Connected</span>
                    {p.followers && <span className="text-white/30 text-xs font-inter">· {p.followers}</span>}
                  </div>
                ) : (
                  <div className="mt-0.5">
                    <span className="liquid-glass rounded-full px-3 py-1 text-white/40 text-xs font-inter cursor-pointer hover:text-white/60 transition-colors">Connect</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Generate Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="liquid-glass rounded-3xl p-6 md:p-8 mb-6"
        >
          <h2 className="text-white text-lg font-medium mb-6 font-inter">Generate Content</h2>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="liquid-glass rounded-full flex-1 px-5 py-3">
              <input
                placeholder="Your niche (e.g. AI, finance, fitness...)"
                className="bg-transparent text-white placeholder:text-white/30 outline-none w-full text-sm font-inter"
              />
            </div>
            <div className="liquid-glass rounded-full flex-1 px-5 py-3">
              <input
                placeholder="Your goal (e.g. grow followers, get clients...)"
                className="bg-transparent text-white placeholder:text-white/30 outline-none w-full text-sm font-inter"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex gap-2 flex-wrap">
              {platformSelectors.map((p, i) => (
                <button
                  key={p}
                  onClick={() => setActivePlatform(i)}
                  className={`liquid-glass rounded-full px-4 py-2 text-sm font-inter transition-all cursor-pointer ${
                    activePlatform === i ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button className="liquid-glass rounded-full px-8 py-3 flex items-center gap-2 text-white text-sm font-medium font-inter hover:bg-white/5 transition-all cursor-pointer">
              <Zap size={16} />
              Generate 30 Days of Content
            </button>
          </div>
        </motion.div>

        {/* Content Ideas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="liquid-glass rounded-3xl p-6 md:p-8 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-white text-lg font-medium font-inter">Generated Content Ideas</h2>
            <span className="text-white/40 text-xs font-inter">30 ideas ready to schedule</span>
          </div>

          <div className="space-y-3">
            {contentIdeas.map((item) => (
              <div
                key={item.day}
                className="liquid-glass rounded-2xl p-5 flex flex-col sm:flex-row items-start gap-4 hover:bg-white/[0.02] transition-all"
              >
                <div className="liquid-glass rounded-xl p-3 text-center flex-shrink-0 min-w-[60px]">
                  <span className="text-white/30 text-xs font-inter block">Day</span>
                  <span className="font-instrument text-2xl text-white">{item.day}</span>
                </div>
                <div className="flex-1">
                  <span className="liquid-glass rounded-full px-3 py-1 text-white/40 text-xs font-inter inline-block mb-2">
                    {item.platform}
                  </span>
                  <p className="text-white/70 text-sm leading-relaxed font-inter">{item.text}</p>
                  <div className="flex gap-2 mt-3">
                    <button className="liquid-glass rounded-full px-4 py-1.5 text-xs text-white/50 font-inter hover:bg-white/5 transition-all cursor-pointer">Edit</button>
                    <button className="liquid-glass rounded-full px-4 py-1.5 text-xs text-white/60 font-inter hover:bg-white/5 transition-all cursor-pointer">Schedule</button>
                    <button className="liquid-glass rounded-full px-4 py-1.5 text-xs text-white/60 font-inter hover:bg-white/5 transition-all cursor-pointer">Post Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Content Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="liquid-glass rounded-3xl p-6 md:p-8"
        >
          <h2 className="text-white text-lg font-medium mb-6 font-inter">Content Calendar — June 2026</h2>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
            {days.map((d) => (
              <div key={d} className="text-white/30 text-xs tracking-widest text-center font-inter py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {calendarCells.map((day, i) => (
              <div
                key={i}
                className={`rounded-xl p-1 md:p-2 min-h-16 md:min-h-20 ${day ? 'liquid-glass' : ''}`}
              >
                {day && (
                  <>
                    <span className="text-white/30 text-xs font-inter block mb-1">{day}</span>
                    {postDays[day] && postDays[day].map((post, j) => (
                      <div key={j} className="liquid-glass rounded-lg px-1 md:px-2 py-1 text-white/50 text-xs truncate font-inter flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${platformColors[post.platform] || 'bg-white/30'}`} />
                        <span className="truncate hidden sm:inline">{post.title}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </motion.div>
  )
}
