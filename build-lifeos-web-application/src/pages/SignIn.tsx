import { useState } from 'react'
import { useSignIn, useSignUp } from '@clerk/clerk-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Brain, Mail, Lock, Eye, EyeOff, ArrowRight, Chrome } from 'lucide-react'

export default function SignInPage() {
  const navigate = useNavigate()
  const { signIn, isLoaded: signInLoaded } = useSignIn()
  const { signUp, isLoaded: signUpLoaded } = useSignUp()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [code, setCode] = useState('')

  const handleGoogleSignIn = async function() {
    if (!signInLoaded) return
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      })
    } catch (err: any) {
      setError(err.message || 'Google sign in failed')
    }
  }

  const handleEmailSignIn = async function() {
    if (!signInLoaded || !email || !password) return
    setLoading(true)
    setError('')
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })
      if (result.status === 'complete') {
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Sign in failed. Check your credentials.')
    }
    setLoading(false)
  }

  const handleEmailSignUp = async function() {
    if (!signUpLoaded || !email || !password || !firstName) return
    setLoading(true)
    setError('')
    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
      })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setVerifying(true)
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Sign up failed. Please try again.')
    }
    setLoading(false)
  }

  const handleVerifyCode = async function() {
    if (!signUpLoaded || !code) return
    setLoading(true)
    setError('')
    try {
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status === 'complete') {
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid code. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen bg-black flex items-center justify-center px-4"
      style={{
        background: 'radial-gradient(ellipse at top, rgba(59,130,246,0.05) 0%, #000000 60%)',
      }}
    >
      {/* Background orbs */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(59,130,246,0.06)' }}
        animate={{ x: [0, 80, 0], y: [0, 40, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(139,92,246,0.04)' }}
        animate={{ x: [0, -80, 0], y: [0, -40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        <div
          className="rounded-3xl p-8"
          style={{
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Brain size={24} className="text-white" />
            </div>
            <h1 className="font-instrument text-2xl text-white" style={{ fontStyle: 'italic' }}>
              LifeOS
            </h1>
            <p className="text-white/30 text-xs font-inter mt-1">
              {verifying
                ? 'Check your email for a code'
                : mode === 'signin'
                ? 'Welcome back'
                : 'Create your account'}
            </p>
          </div>

          <AnimatePresence mode="wait">

            {/* Verify Email Code */}
            {verifying && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <p className="text-white/50 text-sm font-inter text-center">
                  We sent a 6-digit code to {email}
                </p>
                <div
                  className="flex items-center gap-3 rounded-full px-5 py-3"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Mail size={16} className="text-white/30 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={function(e) { setCode(e.target.value) }}
                    maxLength={6}
                    className="bg-transparent text-white placeholder:text-white/20 outline-none flex-1 text-sm font-inter"
                  />
                </div>
                {error && (
                  <p className="text-red-400/70 text-xs font-inter text-center">{error}</p>
                )}
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={loading || !code}
                  className="w-full rounded-full py-3 text-black text-sm font-semibold bg-white hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-inter"
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                  <ArrowRight size={14} />
                </button>
              </motion.div>
            )}

            {/* Main Form */}
            {!verifying && (
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === 'signin' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'signin' ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {/* Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 rounded-full py-3 text-white text-sm font-medium transition-all hover:bg-white/5 font-inter"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <img
                    src="https://www.google.com/s2/favicons?domain=google.com&sz=32"
                    className="w-4 h-4"
                    alt="Google"
                  />
                  Continue with Google
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 py-2">
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <span className="text-white/20 text-xs font-inter">or</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                </div>

                {/* First Name (signup only) */}
                {mode === 'signup' && (
                  <div
                    className="flex items-center gap-3 rounded-full px-5 py-3"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <Brain size={16} className="text-white/30 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={function(e) { setFirstName(e.target.value) }}
                      className="bg-transparent text-white placeholder:text-white/20 outline-none flex-1 text-sm font-inter"
                    />
                  </div>
                )}

                {/* Email */}
                <div
                  className="flex items-center gap-3 rounded-full px-5 py-3"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Mail size={16} className="text-white/30 flex-shrink-0" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={function(e) { setEmail(e.target.value) }}
                    onKeyDown={function(e) {
                      if (e.key === 'Enter') {
                        mode === 'signin' ? handleEmailSignIn() : handleEmailSignUp()
                      }
                    }}
                    className="bg-transparent text-white placeholder:text-white/20 outline-none flex-1 text-sm font-inter"
                  />
                </div>

                {/* Password */}
                <div
                  className="flex items-center gap-3 rounded-full px-5 py-3"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Lock size={16} className="text-white/30 flex-shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={function(e) { setPassword(e.target.value) }}
                    onKeyDown={function(e) {
                      if (e.key === 'Enter') {
                        mode === 'signin' ? handleEmailSignIn() : handleEmailSignUp()
                      }
                    }}
                    className="bg-transparent text-white placeholder:text-white/20 outline-none flex-1 text-sm font-inter"
                  />
                  <button
                    type="button"
                    onClick={function() { setShowPassword(!showPassword) }}
                    className="text-white/20 hover:text-white/50 transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <p className="text-red-400/70 text-xs font-inter text-center px-2">
                    {error}
                  </p>
                )}

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={mode === 'signin' ? handleEmailSignIn : handleEmailSignUp}
                  disabled={loading || !email || !password}
                  className="w-full rounded-full py-3 text-black text-sm font-semibold bg-white hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-inter"
                >
                  {loading
                    ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
                    : (mode === 'signin' ? 'Sign In' : 'Create Account')}
                  <ArrowRight size={14} />
                </button>

                {/* Switch Mode */}
                <p className="text-center text-white/30 text-xs font-inter pt-2">
                  {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={function() {
                      setMode(mode === 'signin' ? 'signup' : 'signin')
                      setError('')
                    }}
                    className="text-white/60 hover:text-white transition-colors underline underline-offset-2"
                  >
                    {mode === 'signin' ? 'Sign up free' : 'Sign in'}
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-white/15 text-xs font-inter mt-6">
          By continuing you agree to our{' '}
          <button
            type="button"
            onClick={function() { window.location.href = '/terms' }}
            className="underline hover:text-white/30 transition-colors"
          >
            Terms
          </button>
          {' '}and{' '}
          <button
            type="button"
            onClick={function() { window.location.href = '/privacy' }}
            className="underline hover:text-white/30 transition-colors"
          >
            Privacy Policy
          </button>
        </p>
      </motion.div>
    </div>
  )
}
