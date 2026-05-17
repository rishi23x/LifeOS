import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Zap, Trash2, Copy, Calendar } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { supabase } from '../lib/supabase'
import { useUser } from '@clerk/clerk-react'

const BUFFER_CLIENT_ID = import.meta.env.VITE_BUFFER_CLIENT_ID
const BUFFER_REDIRECT_URI = `${window.location.origin}/dashboard/content`
const BUFFER_AUTH_URL = `https://bufferapp.com/oauth2/authorize?client_id=${BUFFER_CLIENT_ID}&redirect_uri=${encodeURIComponent(BUFFER_REDIRECT_URI)}&response_type=code`

const platformSelectors = ['Twitter', 'Instagram', 'LinkedIn', 'All']

function generateCalendar() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const startDay = 1
  const daysInMonth = 30
  const calendarCells: (number | null)[] = []
  for (let i = 0; i < startDay; i++) calendarCells.push(null)
  for (let i = 1; i <= daysInMonth; i++) calendarCells.push(i)
  while (calendarCells.length % 7 !== 0) calendarCells.push(null)
  return { days, calendarCells }
}

export default function Content() {
  const { user } = useUser()
  const [bufferConnected, setBufferConnected] = useState(false)
const [bufferProfiles, setBufferProfiles] = useState<any[]>([])
const [bufferToken, setBufferToken] = useState<string | null>(
  localStorage.getItem('buffer_token')
)
const [publishingIndex, setPublishingIndex] = useState<number | null>(null)
const [publishSuccess, setPublishSuccess] = useState<number | null>(null)
  const [activePlatform, setActivePlatform] = useState(3)
  const [niche, setNiche] = useState('')
  const [goal, setGoal] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedPosts, setGeneratedPosts] = useState<any[]>([])
  const [savedPosts, setSavedPosts] = useState<any[]>([])
  const [loadingSaved, setLoadingSaved] = useState(true)
  const [savingIndex, setSavingIndex] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'generate' | 'saved' | 'calendar'>('generate')

  const { days, calendarCells } = generateCalendar()

  const platformColors: Record<string, string> = {
    Twitter: 'bg-blue-400/40',
    Instagram: 'bg-pink-400/40',
    LinkedIn: 'bg-blue-600/40',
  }
  useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')

  if (code && !bufferToken) {
    exchangeBufferCode(code)
    window.history.replaceState({}, '', '/dashboard/content')
  }

  if (bufferToken) {
    setBufferConnected(true)
    fetchBufferProfiles(bufferToken)
  }
}, [])

const exchangeBufferCode = async (code: string) => {
  try {
    const response = await fetch('https://api.bufferapp.com/1/oauth2/token.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: import.meta.env.VITE_BUFFER_CLIENT_ID,
        client_secret: import.meta.env.VITE_BUFFER_CLIENT_SECRET,
        redirect_uri: BUFFER_REDIRECT_URI,
        code,
        grant_type: 'authorization_code',
      }),
    })
    const data = await response.json()
    if (data.access_token) {
      localStorage.setItem('buffer_token', data.access_token)
      setBufferToken(data.access_token)
      setBufferConnected(true)
      fetchBufferProfiles(data.access_token)
    }
  } catch (error) {
    console.error('Buffer OAuth error:', error)
  }
}

const fetchBufferProfiles = async (token: string) => {
  try {
    const response = await fetch(
      `https://api.bufferapp.com/1/profiles.json?access_token=${token}`
    )
    const data = await response.json()
    if (Array.isArray(data)) {
      setBufferProfiles(data)
    }
  } catch (error) {
    console.error('Buffer profiles error:', error)
  }
}

const publishToBuffer = async (post: any, index: number) => {
  if (!bufferToken || bufferProfiles.length === 0) return
  setPublishingIndex(index)

  try {
    const profile = bufferProfiles.find(
      p => p.service.toLowerCase() === post.platform.toLowerCase()
    ) || bufferProfiles[0]

    const response = await fetch(
      'https://api.bufferapp.com/1/updates/create.json',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          access_token: bufferToken,
          text: post.text + '\n\n' + post.hashtags,
          'profile_ids[]': profile.id,
        }),
      }
    )
    const data = await response.json()
    if (data.success) {
      setPublishSuccess(index)
      setTimeout(() => setPublishSuccess(null), 3000)
      await savePost(post, index)
    }
  } catch (error) {
    console.error('Buffer publish error:', error)
  }
  setPublishingIndex(null)
}

const disconnectBuffer = () => {
  localStorage.removeItem('buffer_token')
  setBufferToken(null)
  setBufferConnected(false)
  setBufferProfiles([])
}
  // Fetch saved posts
  const fetchSavedPosts = async () => {
    if (!user) return
    setLoadingSaved(true)
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (!error && data) setSavedPosts(data)
    setLoadingSaved(false)
  }

  useEffect(() => {
    fetchSavedPosts()
  }, [user])

  // Call Groq
  const callGroq = async (prompt: string) => {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
      }),
    })
    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  }

  // Generate content
  const generateContent = async () => {
    if (!niche) return
    setGenerating(true)

    const selectedPlatform = activePlatform === 3
      ? 'Twitter, Instagram, and LinkedIn'
      : platformSelectors[activePlatform]

    const prompt = `You are a social media content expert.
Generate exactly 5 engaging social media posts for someone in the "${niche}" niche.
Their goal is: "${goal || 'grow their audience'}".
Platforms: ${selectedPlatform}.

Return ONLY a valid JSON array. No extra text. No markdown. Just the JSON array.
Each object must have exactly these keys:
- platform (string: "Twitter", "Instagram", or "LinkedIn")
- text (string: the actual post content, engaging and ready to publish)
- hashtags (string: 3-5 relevant hashtags)

Example format:
[{"platform":"Twitter","text":"Your post here","hashtags":"#AI #Tech #Future"}]`

    try {
      const reply = await callGroq(prompt)
      const cleaned = reply
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      const parsed = JSON.parse(cleaned)
      setGeneratedPosts(parsed)
    } catch {
      // Fallback if JSON parse fails
      setGeneratedPosts([
        {
          platform: 'LinkedIn',
          text: `The future of ${niche} is being rewritten right now. Here is what you need to know to stay ahead in 2026:`,
          hashtags: `#${niche.replace(/\s/g, '')} #Future #Innovation`
        },
        {
          platform: 'Twitter',
          text: `Hot take: Most people in ${niche} are still using 2020 strategies. Here is what actually works in 2026:`,
          hashtags: `#${niche.replace(/\s/g, '')} #Tips #Growth`
        },
        {
          platform: 'Instagram',
          text: `3 things I wish I knew earlier about ${niche}:\n\n1. Start before you feel ready\n2. Consistency beats perfection\n3. Your audience wants authenticity`,
          hashtags: `#${niche.replace(/\s/g, '')} #Motivation #Success`
        },
        {
          platform: 'LinkedIn',
          text: `I spent 30 days studying the top performers in ${niche}. Here is the one thing they all have in common:`,
          hashtags: `#${niche.replace(/\s/g, '')} #Leadership #Growth`
        },
        {
          platform: 'Twitter',
          text: `If you want to succeed in ${niche} in 2026, stop doing these 3 things immediately:`,
          hashtags: `#${niche.replace(/\s/g, '')} #Career #Advice`
        }
      ])
    }
    setGenerating(false)
  }

  // Save post to Supabase
  const savePost = async (post: any, index: number) => {
    if (!user) return
    setSavingIndex(index)
    const { error } = await supabase.from('content').insert({
      user_id: user.id,
      platform: post.platform,
      post_text: post.text + '\n\n' + post.hashtags,
      status: 'scheduled',
      scheduled_at: new Date(
        Date.now() + (index + 1) * 24 * 60 * 60 * 1000
      ).toISOString(),
    })
    if (!error) {
      fetchSavedPosts()
      setActiveTab('saved')
    }
    setSavingIndex(null)
  }

  // Delete saved post
  const deletePost = async (id: string) => {
    await supabase.from('content').delete().eq('id', id)
    fetchSavedPosts()
  }

  // Copy to clipboard
  const copyPost = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Get posts for calendar day
  const getPostsForDay = (day: number) => {
    return savedPosts.filter(post => {
      if (!post.scheduled_at) return false
      const postDay = new Date(post.scheduled_at).getDate()
      return postDay === day
    })
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
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="font-instrument text-4xl text-white mb-2">Content Manager</h1>
            <p className="text-white/40 text-sm font-inter">
              {savedPosts.length} posts saved in your database.
            </p>
          </div>
        </div>

        {/* Buffer Connection */}
<div className="liquid-glass rounded-3xl p-6 mb-8">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-white text-lg font-medium font-inter">
      Connected Platforms
    </h2>
    {bufferConnected ? (
      <button
        onClick={disconnectBuffer}
        className="liquid-glass rounded-full px-4 py-2 text-red-400/60 text-xs font-inter hover:bg-white/5 transition-all"
      >
        Disconnect Buffer
      </button>
    ) : (
      <a
        href={BUFFER_AUTH_URL}
        className="liquid-glass rounded-full px-5 py-2.5 text-white text-sm font-inter hover:bg-white/5 transition-all flex items-center gap-2"
      >
        <Zap size={14} />
        Connect via Buffer
      </a>
    )}
  </div>

  {bufferConnected && bufferProfiles.length > 0 ? (
    <div className="flex flex-wrap gap-4">
      {bufferProfiles.map((profile: any) => (
        <div
          key={profile.id}
          className="liquid-glass rounded-2xl px-6 py-4 flex items-center gap-3"
        >
          <div className="w-5 h-5 rounded-full bg-white/10 flex-shrink-0" />
          <div>
            <span className="text-white/70 text-sm font-inter capitalize">
              {profile.service}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-green-400/60 text-xs font-inter">
                Connected
              </span>
              <span className="text-white/30 text-xs font-inter">
                · {profile.formatted_username}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : bufferConnected ? (
    <p className="text-white/30 text-sm font-inter">
      Loading your connected accounts...
    </p>
  ) : (
    <div className="flex flex-wrap gap-4">
      {[
        { name: 'Twitter/X', msg: 'Connect via Buffer' },
        { name: 'Instagram', msg: 'Connect via Buffer' },
        { name: 'LinkedIn', msg: 'Connect via Buffer' },
        { name: 'YouTube', msg: 'Coming soon' },
      ].map((p) => (
        <div
          key={p.name}
          className="liquid-glass rounded-2xl px-6 py-4 flex items-center gap-3"
        >
          <div className="w-5 h-5 rounded-full bg-white/10 flex-shrink-0" />
          <div>
            <span className="text-white/70 text-sm font-inter">{p.name}</span>
            <div className="mt-0.5">
              <span className="text-white/30 text-xs font-inter">{p.msg}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

        {/* Tab Selector */}
        <div className="liquid-glass rounded-full flex p-1 mb-8 w-fit">
          {[
            { key: 'generate', label: '✨ Generate' },
            { key: 'saved', label: `📁 Saved (${savedPosts.length})` },
            { key: 'calendar', label: '📅 Calendar' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`rounded-full px-6 py-2.5 text-sm font-inter transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* GENERATE TAB */}
        {activeTab === 'generate' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Generate Form */}
            <div className="liquid-glass rounded-3xl p-6 md:p-8">
              <h2 className="text-white text-lg font-medium mb-6 font-inter">
                Generate Content with AI
              </h2>

              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="liquid-glass rounded-full flex-1 px-5 py-3">
                  <input
                    placeholder="Your niche (e.g. AI, finance, fitness...)"
                    value={niche}
                    onChange={e => setNiche(e.target.value)}
                    className="bg-transparent text-white placeholder:text-white/30 outline-none w-full text-sm font-inter"
                  />
                </div>
                <div className="liquid-glass rounded-full flex-1 px-5 py-3">
                  <input
                    placeholder="Your goal (e.g. grow followers, get clients...)"
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
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
                        activePlatform === i
                          ? 'bg-white/10 text-white'
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={generateContent}
                  disabled={generating || !niche}
                  className="liquid-glass rounded-full px-8 py-3 flex items-center gap-2 text-white text-sm font-medium font-inter hover:bg-white/5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Zap size={16} />
                  {generating ? 'Generating...' : 'Generate 5 Posts'}
                </button>
              </div>
            </div>

            {/* Generated Posts */}
            {generating && (
              <div className="text-center py-12">
                <p className="text-white/30 text-sm font-inter">
                  🧠 AI is writing posts in your voice...
                </p>
              </div>
            )}

            {!generating && generatedPosts.length > 0 && (
              <div className="liquid-glass rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-white text-lg font-medium font-inter">
                    Generated Posts
                  </h2>
                  <span className="text-white/40 text-xs font-inter">
                    {generatedPosts.length} posts ready
                  </span>
                </div>

                <div className="space-y-4">
                  {generatedPosts.map((post, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="liquid-glass rounded-2xl p-6"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`liquid-glass rounded-full px-3 py-1 text-white/60 text-xs font-inter`}>
                          {post.platform}
                        </span>
                        <span className="text-white/30 text-xs font-inter">
                          Day {i + 1}
                        </span>
                      </div>

                      <p className="text-white/70 text-sm leading-relaxed font-inter mb-2">
                        {post.text}
                      </p>

                      <p className="text-white/30 text-xs font-inter mb-4">
                        {post.hashtags}
                      </p>

                      <div className="flex gap-2 flex-wrap">
  <button
    onClick={() => copyPost(post.text + '\n\n' + post.hashtags)}
    className="liquid-glass rounded-full px-4 py-1.5 text-xs text-white/50 font-inter hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1"
  >
    <Copy size={12} />
    Copy
  </button>
  <button
    onClick={() => savePost(post, i)}
    disabled={savingIndex === i}
    className="liquid-glass rounded-full px-4 py-1.5 text-xs text-white/60 font-inter hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1"
  >
    <Calendar size={12} />
    {savingIndex === i ? 'Saving...' : 'Save'}
  </button>
  {bufferConnected ? (
    <button
      onClick={() => publishToBuffer(post, i)}
      disabled={publishingIndex === i}
      className={`liquid-glass rounded-full px-4 py-1.5 text-xs font-inter hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1 ${
        publishSuccess === i
          ? 'text-green-400/70'
          : 'text-white/60'
      }`}
    >
      <Zap size={12} />
      {publishingIndex === i
        ? 'Publishing...'
        : publishSuccess === i
        ? '✅ Published!'
        : 'Publish to Buffer'}
    </button>
  ) : (
    <a
      href={BUFFER_AUTH_URL}
      className="liquid-glass rounded-full px-4 py-1.5 text-xs text-white/40 font-inter hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1"
    >
      <Zap size={12} />
      Connect to Publish
    </a>
  )}
</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {!generating && generatedPosts.length === 0 && (
              <div className="text-center py-16">
                <Zap size={48} className="text-white/10 mx-auto mb-4" />
                <p className="text-white/30 text-sm font-inter mb-2">
                  Enter your niche and click Generate.
                </p>
                <p className="text-white/20 text-xs font-inter">
                  AI will write 5 ready-to-post pieces of content for you.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* SAVED TAB */}
        {activeTab === 'saved' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="liquid-glass rounded-3xl p-6 md:p-8"
          >
            <h2 className="text-white text-lg font-medium mb-6 font-inter">
              Saved Posts
            </h2>

            {loadingSaved ? (
              <p className="text-white/30 text-sm font-inter">Loading...</p>
            ) : savedPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/30 text-sm font-inter mb-4">
                  No saved posts yet.
                </p>
                <button
                  onClick={() => setActiveTab('generate')}
                  className="liquid-glass rounded-full px-6 py-3 text-white/60 text-sm font-inter hover:bg-white/5 transition-all"
                >
                  ✨ Generate your first post
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {savedPosts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="liquid-glass rounded-2xl p-5 hover:bg-white/[0.02] transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="liquid-glass rounded-full px-3 py-1 text-white/60 text-xs font-inter">
                            {post.platform}
                          </span>
                          <span className="text-white/30 text-xs font-inter">
                            Scheduled: {new Date(post.scheduled_at).toLocaleDateString()}
                          </span>
                          <span className="liquid-glass rounded-full px-2 py-0.5 text-green-400/60 text-xs font-inter">
                            {post.status}
                          </span>
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed font-inter">
                          {post.post_text}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => copyPost(post.post_text)}
                          className="liquid-glass rounded-full p-2 hover:bg-white/5 transition-all text-white/30 hover:text-white/60"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          onClick={() => deletePost(post.id)}
                          className="liquid-glass rounded-full p-2 hover:bg-white/5 transition-all text-white/20 hover:text-red-400/70"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* CALENDAR TAB */}
        {activeTab === 'calendar' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="liquid-glass rounded-3xl p-6 md:p-8"
          >
            <h2 className="text-white text-lg font-medium mb-6 font-inter">
              Content Calendar — June 2026
            </h2>

            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
              {days.map((d) => (
                <div key={d} className="text-white/30 text-xs tracking-widest text-center font-inter py-2">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {calendarCells.map((day, i) => {
                const dayPosts = day ? getPostsForDay(day) : []
                return (
                  <div
                    key={i}
                    className={`rounded-xl p-1 md:p-2 min-h-16 md:min-h-20 ${day ? 'liquid-glass' : ''}`}
                  >
                    {day && (
                      <>
                        <span className="text-white/30 text-xs font-inter block mb-1">{day}</span>
                        {dayPosts.map((post, j) => (
                          <div
                            key={j}
                            className={`liquid-glass rounded-lg px-1 md:px-2 py-1 text-white/50 text-xs truncate font-inter flex items-center gap-1 mb-1`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${platformColors[post.platform] || 'bg-white/30'}`} />
                            <span className="truncate hidden sm:inline">
                              {post.post_text.slice(0, 20)}...
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            {savedPosts.length === 0 && (
              <div className="text-center mt-8">
                <p className="text-white/30 text-sm font-inter">
                  No scheduled posts yet. Generate and save posts to see them here.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </motion.div>
  )
}
