import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@clerk/clerk-react'
import { Brain, DollarSign, Briefcase, PenTool, Mail, ArrowRight, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function OnboardingModal() {
  const { user } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Check if onboarding is complete
  useEffect(() => {
    const hasCompleted = localStorage.getItem('onboarding_complete')
    if (!hasCompleted && user) {
      setIsOpen(true)
    }
  }, [user])

  const completeOnboarding = () => {
    localStorage.setItem('onboarding_complete', 'true')
    setIsOpen(false)
  }

  const saveGoalMemory = async (goal: string) => {
    setSaving(true)
    await supabase.from('memories').insert({
      user_id: user?.id,
      category: 'Personal',
      memory: `User's primary goal is to ${goal.toLowerCase()}`,
      auto_generated: true
    })
    setSaving(false)
    setStep(2)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg liquid-glass rounded-3xl p-8 overflow-hidden"
        style={{ background: '#0c0c12', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* Step 1: Welcome & Goal */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                <Brain size={32} className="text-white" />
              </div>
              <h2 className="font-instrument text-4xl text-white mb-2 italic">Welcome, {user?.firstName}.</h2>
              <p className="text-white/50 text-sm font-inter mb-8">
                Your AI agents are waking up. What is your #1 priority right now?
              </p>

              <div className="w-full space-y-3">
                {[
                  { icon: DollarSign, text: 'Take control of my finances', goal: 'Manage finances and save money' },
                  { icon: Briefcase, text: 'Find a new job', goal: 'Find a new job' },
                  { icon: PenTool, text: 'Grow my social audience', goal: 'Grow personal brand and create content' },
                  { icon: Mail, text: 'Automate my inbox', goal: 'Manage email and communication' }
                ].map((item) => (
                  <button
                    key={item.text}
                    onClick={() => saveGoalMemory(item.goal)}
                    disabled={saving}
                    className="w-full flex items-center gap-4 p-4 rounded-xl liquid-glass hover:bg-white/5 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <item.icon size={16} className="text-white/70" />
                    </div>
                    <span className="text-white/80 text-sm font-inter flex-1">{item.text}</span>
                    <ArrowRight size={16} className="text-white/20 group-hover:text-white/60 transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Connect Integration */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                <Mail size={32} className="text-white" />
              </div>
              <h2 className="font-instrument text-4xl text-white mb-2 italic">Connect Gmail</h2>
              <p className="text-white/50 text-sm font-inter mb-8 leading-relaxed">
                To let your Email Agent organize your inbox and draft replies, connect your account. 
                <br/><span className="text-white/30 text-xs">(Read-only access. You can do this later.)</span>
              </p>

              <button
                onClick={() => {
                  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&redirect_uri=https://life-os-eosin-gamma.vercel.app/dashboard/email&response_type=code&scope=https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify&access_type=offline&prompt=consent`
                }}
                className="w-full bg-white text-black font-semibold text-sm py-4 rounded-full hover:scale-105 transition-all mb-4"
              >
                Connect Gmail
              </button>
              
              <button
                onClick={completeOnboarding}
                className="text-white/40 text-sm font-inter hover:text-white/70 transition-colors"
              >
                Skip for now → Go to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
