'use client'

import React, { useState } from 'react'
import { respond } from '@/lib/api'

export default function CoverLetter({ isDark, recruiterMode, onReply }: { isDark: boolean; recruiterMode: boolean; onReply: (text: string) => void }) {
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [highlights, setHighlights] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    if (!role || !company) return
    setLoading(true)
    setError(null)
    const text = `Create a tailored cover letter.\nRole: ${role}\nCompany: ${company}\nHighlights: ${highlights}\nJob Description: ${jobDescription}`
    try {
      const res = await respond(text, recruiterMode, 'cover_letter')
      onReply(res.reply)
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'Failed to generate cover letter. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='space-y-3'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <input className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`} placeholder='Role' value={role} onChange={(e) => setRole(e.target.value)} />
        <input className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`} placeholder='Company' value={company} onChange={(e) => setCompany(e.target.value)} />
      </div>
      <textarea className={`w-full h-24 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`} placeholder='Top Highlights (projects, impact, skills)' value={highlights} onChange={(e) => setHighlights(e.target.value)} />
      <textarea className={`w-full h-32 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`} placeholder='Paste job description (optional)' value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
      {error && <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>}
      <button onClick={generate} disabled={loading || !role || !company} className='px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'>
        {loading ? 'Generating…' : 'Generate Cover Letter'}
      </button>
    </div>
  )
}
