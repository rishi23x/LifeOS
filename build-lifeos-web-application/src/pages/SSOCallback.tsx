import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react'

export default function SSOCallback() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-8 h-8 rounded-full border-t border-white/60 animate-spin"
          style={{ border: '1px solid rgba(255,255,255,0.1)', borderTopColor: 'rgba(255,255,255,0.6)' }}
        />
        <p className="text-white/30 text-sm font-inter">Signing you in...</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  )
}
