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
    <div className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <input 
          className={`px-5 py-3 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-md ${isDark ? 'bg-gray-700/80 text-white placeholder-gray-400 border border-gray-600' : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-200'}`} 
          placeholder='Role (e.g., Frontend Engineer)' 
          value={role} 
          onChange={(e) => setRole(e.target.value)} 
        />
        <input 
          className={`px-5 py-3 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-md ${isDark ? 'bg-gray-700/80 text-white placeholder-gray-400 border border-gray-600' : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-200'}`} 
          placeholder='Company (e.g., Google)' 
          value={company} 
          onChange={(e) => setCompany(e.target.value)} 
        />
      </div>
      <textarea 
        className={`w-full h-28 px-5 py-3 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-pink-500 focus:outline-none shadow-md resize-none ${isDark ? 'bg-gray-700/80 text-white placeholder-gray-400 border border-gray-600' : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-200'}`} 
        placeholder='Top Highlights (e.g., Led team of 5, increased performance by 40%)' 
        value={highlights} 
        onChange={(e) => setHighlights(e.target.value)} 
      />
      <textarea 
        className={`w-full h-36 px-5 py-3 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-md resize-none ${isDark ? 'bg-gray-700/80 text-white placeholder-gray-400 border border-gray-600' : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-200'}`} 
        placeholder='Paste job description (optional)' 
        value={jobDescription} 
        onChange={(e) => setJobDescription(e.target.value)} 
      />
      {error && (
        <div className={`px-4 py-3 rounded-xl ${isDark ? 'bg-red-900/30 border border-red-700 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      <button 
        onClick={generate} 
        disabled={loading || !role || !company} 
        className='w-full px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating…
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            ✉️ Generate Cover Letter
          </span>
        )}
      </button>
    </div>
  )
}
