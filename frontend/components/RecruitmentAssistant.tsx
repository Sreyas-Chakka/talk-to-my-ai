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
import { speakText } from '@/lib/voice'

export default function RecruitmentAssistant() {
  const router = useRouter()
  const { user } = useAuth()
  const { isDark, toggleTheme } = useThemeStore()
  const { recruiterMode, setRecruiterMode } = useChatStore()
  const [active, setActive] = useState<RecruitSection>('cover_letter')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (output) speakText(output, () => {})
  }, [output])

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <header className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 shadow`}> 
        <div className='max-w-6xl mx-auto flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => router.push('/')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                isDark
                  ? 'bg-blue-700 hover:bg-blue-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              🤖 Virtual Assistant
            </button>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recruitment Assistant</h1>
            <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tailored tools for job search</span>
          </div>
          <div className='flex items-center gap-3'>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}> 
              <label className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Recruiter Mode</label>
              <button onClick={() => setRecruiterMode(!recruiterMode)} className={`px-3 py-1 rounded-lg font-semibold text-sm ${recruiterMode ? 'bg-green-500 text-white' : isDark ? 'bg-gray-600 text-white' : 'bg-gray-400 text-white'}`}>{recruiterMode ? 'ON' : 'OFF'}</button>
            </div>
            <button onClick={toggleTheme} className={`px-3 py-2 rounded-lg text-sm font-semibold ${isDark ? 'bg-yellow-700 text-white' : 'bg-gray-700 text-white'}`}>{isDark ? '☀️' : '🌙'}</button>
            <UserButton afterSignOutUrl='/sign-in' />
          </div>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-6 py-6 space-y-6'>
        <SectionTabs active={active} onChange={setActive} isDark={isDark} />

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow`}> 
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
          <div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-xl p-6 shadow`}> 
            <h3 className='font-bold mb-2'>Result</h3>
            <pre className='whitespace-pre-wrap'>{output}</pre>
          </div>
        )}
      </main>
    </div>
  )
}
