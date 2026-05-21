import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Brain, ArrowLeft } from 'lucide-react'

export default function Privacy() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-black min-h-screen px-6 py-12"
    >
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <button
            type="button"
            onClick={function() { navigate('/') }}
            className="liquid-glass rounded-full p-2 text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <Brain size={20} className="text-white" />
            <span className="text-white font-semibold font-inter">LifeOS</span>
          </div>
        </div>

        <h1 className="font-instrument text-5xl text-white mb-4">Privacy Policy</h1>
        <p className="text-white/40 text-sm font-inter mb-12">Last updated: May 2026</p>

        <div className="space-y-10">
          {[
            {
              title: '1. Information We Collect',
              content: `We collect information you provide directly to us when you create an account, including your name and email address. We also collect data you add to LifeOS such as financial transactions, job applications, email drafts, and content posts. This data is stored securely in our database and is never sold to third parties.`
            },
            {
              title: '2. How We Use Your Information',
              content: `We use your information to provide, maintain, and improve LifeOS. Your data is used by our AI agents to generate personalized insights, draft emails, analyze spending patterns, and create content. We do not share your personal information with third parties except as necessary to provide our services (e.g., Supabase for database, Clerk for authentication, Groq for AI processing).`
            },
            {
              title: '3. Data Security',
              content: `We implement industry-standard security measures to protect your data. All data is encrypted in transit using HTTPS. Authentication is handled by Clerk, which uses bank-level security. Your financial data is stored with row-level security ensuring only you can access your information.`
            },
            {
              title: '4. Gmail Integration',
              content: `When you connect your Gmail account, LifeOS requests read-only access to your emails. We only read emails to generate AI draft replies and categorize your inbox. We never send emails on your behalf without your explicit approval. You can disconnect Gmail at any time from the Email module.`
            },
            {
              title: '5. Data Retention',
              content: `We retain your data for as long as your account is active. You can delete your account and all associated data at any time by contacting us at privacy@lifeos.app. We will permanently delete your data within 30 days of your request.`
            },
            {
              title: '6. Cookies',
              content: `LifeOS uses essential cookies only for authentication and session management. We do not use tracking cookies or advertising cookies. You can disable cookies in your browser settings but this may affect your ability to log in.`
            },
            {
              title: '7. Third Party Services',
              content: `LifeOS integrates with the following third-party services: Clerk (authentication), Supabase (database), Groq (AI processing), Adzuna (job listings), and Google (Gmail API). Each of these services has their own privacy policy. We only share the minimum data necessary for these services to function.`
            },
            {
              title: '8. Your Rights',
              content: `You have the right to access, correct, or delete your personal data at any time. You can export your data by contacting us. You can disconnect any integrations (Gmail, etc.) at any time from within the app. For any privacy concerns, contact us at privacy@lifeos.app.`
            },
            {
              title: '9. Changes to This Policy',
              content: `We may update this Privacy Policy from time to time. We will notify you of any significant changes by email or through the app. Continued use of LifeOS after changes constitutes acceptance of the updated policy.`
            },
            {
              title: '10. Contact Us',
              content: `For any privacy-related questions or concerns, please contact us at privacy@lifeos.app. We aim to respond to all inquiries within 48 hours.`
            },
          ].map(function(section) {
            return (
              <div key={section.title} className="liquid-glass rounded-3xl p-8">
                <h2 className="text-white text-lg font-medium mb-4 font-inter">
                  {section.title}
                </h2>
                <p className="text-white/50 text-sm leading-relaxed font-inter">
                  {section.content}
                </p>
              </div>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={function() { navigate('/') }}
            className="liquid-glass rounded-full px-6 py-3 text-white/60 text-sm font-inter hover:bg-white/5 transition-all"
          >
            ← Back to LifeOS
          </button>
        </div>
      </div>
    </motion.div>
  )
}
