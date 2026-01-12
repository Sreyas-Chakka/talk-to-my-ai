'use client'

import React, { useState } from 'react'
import { respond } from '@/lib/api'

export default function ResumeReview({ isDark, recruiterMode, onReply }: { isDark: boolean; recruiterMode: boolean; onReply: (text: string) => void }) {
  const [resumeText, setResumeText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const review = async () => {
    if (!resumeText.trim()) return
    setLoading(true)
    setError(null)
    const text = `Review my resume and provide concise feedback and improved bullet suggestions.\nResume:\n${resumeText}`
    try {
      const res = await respond(text, recruiterMode, 'resume_review')
      onReply(res.reply)
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'Failed to review resume. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='space-y-3'>
      <textarea className={`w-full h-48 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`} placeholder='Paste your resume text' value={resumeText} onChange={(e) => setResumeText(e.target.value)} />
      {error && <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>}
      <button onClick={review} disabled={loading || !resumeText.trim()} className='px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-50'>
        {loading ? 'Reviewing…' : 'Review Resume'}
      </button>
    </div>
  )
}
