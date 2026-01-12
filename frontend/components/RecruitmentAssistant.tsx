'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, UserButton } from '@clerk/nextjs'
import { useThemeStore } from '@/lib/theme-store'
import { useChatStore } from '@/lib/store'
import SectionTabs, { RecruitSection } from './recruitment/SectionTabs'
import CoverLetter from './recruitment/CoverLetter'
import ResumeReview from './recruitment/ResumeReview'
import MessageTemplates from './recruitment/MessageTemplates'
import MockInterview from './recruitment/MockInterview'
import { speakText, stopSpeech } from '@/lib/voice'

export default function RecruitmentAssistant() {
  const router = useRouter()
  const { user } = useAuth()
  const { isDark, toggleTheme } = useThemeStore()
  const { recruiterMode, setRecruiterMode } = useChatStore()
  const [active, setActive] = useState<RecruitSection>('cover_letter')
  const [output, setOutput] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    if (output) {
      setIsSpeaking(true)
      speakText(output, () => setIsSpeaking(false))
    }
  }, [output])

  const handleStopSpeaking = () => {
    stopSpeech()
    setIsSpeaking(false)
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDark ? '' : ''}`}>
      {/* Animated Background */}
      <div className={`absolute inset-0 -z-10 ${isDark ? 'bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900' : 'bg-gradient-to-br from-cyan-400 via-blue-400 to-purple-400'}`}>
        <div className={`absolute inset-0 opacity-30 ${isDark ? 'bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.3),transparent_50%)]' : 'bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.8),transparent_50%)]'}`}></div>
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      <header className={`${isDark ? 'bg-gray-800/80 backdrop-blur-xl border-gray-700/50' : 'bg-white/80 backdrop-blur-xl border-gray-200/50'} border-b px-6 py-4 shadow-lg`}> 
        <div className='max-w-6xl mx-auto flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => router.push('/')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 shadow-lg ${
                isDark
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
              }`}
            >
              🤖 Virtual Assistant
            </button>
            <h1 className={`text-2xl font-bold bg-gradient-to-r ${isDark ? 'from-blue-400 via-purple-400 to-pink-400' : 'from-blue-600 via-purple-600 to-pink-600'} bg-clip-text text-transparent`}>Recruitment Assistant</h1>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>✨ Tailored tools for job search</span>
          </div>
          <div className='flex items-center gap-3'>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md ${isDark ? 'bg-gray-700/80 backdrop-blur-sm' : 'bg-gray-100/80 backdrop-blur-sm'}`}> 
              <label className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Recruiter Mode</label>
              <button onClick={() => setRecruiterMode(!recruiterMode)} className={`px-3 py-1 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 shadow-md ${recruiterMode ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : isDark ? 'bg-gray-600 text-white' : 'bg-gray-300 text-gray-700'}`}>{recruiterMode ? 'ON' : 'OFF'}</button>
            </div>
            <button onClick={toggleTheme} className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-110 hover:rotate-12 shadow-lg ${isDark ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'}`}>{isDark ? '☀️' : '🌙'}</button>
            <UserButton afterSignOutUrl='/sign-in' />
          </div>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-6 py-6 space-y-6'>
        <SectionTabs active={active} onChange={setActive} isDark={isDark} />

        <div className={`${isDark ? 'bg-gray-800/80 backdrop-blur-xl border border-gray-700/50' : 'bg-white/80 backdrop-blur-xl border border-gray-200/50'} rounded-2xl p-8 shadow-2xl`}> 
          {active === 'cover_letter' && (
            <CoverLetter isDark={isDark} recruiterMode={recruiterMode} onReply={setOutput} />
          )}
          {active === 'resume_review' && (
            <ResumeReview isDark={isDark} recruiterMode={recruiterMode} onReply={setOutput} />
          )}
          {active === 'message_templates' && (
            <MessageTemplates isDark={isDark} recruiterMode={recruiterMode} onReply={setOutput} />
          )}
          {active === 'mock_interview' && (
            <MockInterview isDark={isDark} recruiterMode={recruiterMode} onReply={setOutput} />
          )}
        </div>

        {output && (
          <div className={`${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-700 text-white border border-gray-600/50' : 'bg-gradient-to-br from-white to-gray-50 text-gray-900 border border-gray-200'} rounded-2xl p-8 shadow-2xl backdrop-blur-xl`}> 
            <div className='flex items-center justify-between mb-4'>
              <h3 className='font-bold text-lg flex items-center gap-2'>
                <span className='text-2xl'>✨</span> Result
              </h3>
              {isSpeaking && (
                <button
                  onClick={handleStopSpeaking}
                  className='px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold text-sm transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2'
                >
                  ⏸️ Stop Voice
                </button>
              )}
            </div>
            <pre className='whitespace-pre-wrap text-sm leading-relaxed'>{output}</pre>
          </div>
        )}
      </main>
    </div>
  )
}
