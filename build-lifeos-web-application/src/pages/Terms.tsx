import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Brain, ArrowLeft } from 'lucide-react'

export default function Terms() {
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

        <h1 className="font-instrument text-5xl text-white mb-4">Terms of Service</h1>
        <p className="text-white/40 text-sm font-inter mb-12">Last updated: May 2026</p>

        <div className="space-y-10">
          {[
            {
              title: '1. Acceptance of Terms',
              content: `By accessing or using LifeOS, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service. These terms apply to all users of LifeOS including free and paid accounts.`
            },
            {
              title: '2. Description of Service',
              content: `LifeOS is an AI-powered personal management platform that provides four core modules: AI Financial Manager, AI Email and DM Assistant, AI Job Application Bot, and AI Content Manager. The service is provided on an "as is" basis and we reserve the right to modify, suspend, or discontinue any part of the service at any time.`
            },
            {
              title: '3. Account Registration',
              content: `You must create an account to use LifeOS. You are responsible for maintaining the security of your account credentials. You must provide accurate and complete information when creating your account. You must be at least 13 years old to use LifeOS.`
            },
            {
              title: '4. Acceptable Use',
              content: `You agree not to use LifeOS for any unlawful purpose or in any way that could harm, disable, or impair the service. You agree not to attempt to gain unauthorized access to any part of the service. You agree not to use automated tools to access the service beyond normal use. You agree not to use LifeOS to generate spam, illegal content, or content that violates others' rights.`
            },
            {
              title: '5. AI Generated Content',
              content: `LifeOS uses AI to generate content including email drafts, cover letters, social media posts, and financial insights. You are solely responsible for reviewing and approving any AI-generated content before using it. We make no guarantees about the accuracy or appropriateness of AI-generated content. Financial insights are for informational purposes only and do not constitute financial advice.`
            },
            {
              title: '6. Free and Paid Plans',
              content: `LifeOS offers a free plan with limited features and paid plans with additional features. Paid plans are billed monthly or annually. You can cancel your paid plan at any time. Refunds are provided at our discretion and are generally not provided for partial billing periods.`
            },
            {
              title: '7. Intellectual Property',
              content: `LifeOS and its original content, features, and functionality are owned by LifeOS and are protected by international copyright, trademark, and other intellectual property laws. You retain ownership of any content you create using LifeOS.`
            },
            {
              title: '8. Limitation of Liability',
              content: `LifeOS shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service. We are not responsible for any financial decisions made based on AI-generated insights. Our total liability to you shall not exceed the amount you paid for the service in the past 12 months.`
            },
            {
              title: '9. Termination',
              content: `We reserve the right to terminate or suspend your account at any time for violations of these terms. You may delete your account at any time. Upon termination, your right to use the service will immediately cease.`
            },
            {
              title: '10. Changes to Terms',
              content: `We reserve the right to modify these terms at any time. We will notify users of significant changes via email. Continued use of LifeOS after changes constitutes acceptance of the updated terms. If you do not agree to the updated terms, please stop using the service.`
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
