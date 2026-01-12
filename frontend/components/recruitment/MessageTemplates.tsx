'use client'

import React, { useState } from 'react'
import { respond } from '@/lib/api'

export default function MessageTemplates({ isDark, recruiterMode, onReply }: { isDark: boolean; recruiterMode: boolean; onReply: (text: string) => void }) {
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    setLoading(true)
    setError(null)
    const text = `Create outreach templates tailored to role/company. Context: ${context}\nRole: ${role}\nCompany: ${company}`
    try {
      const res = await respond(text, recruiterMode, 'message_templates')
      onReply(res.reply)
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'Failed to generate templates. Please try again.')
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
      <textarea className={`w-full h-24 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`} placeholder='Context (who you are, goal, constraints)' value={context} onChange={(e) => setContext(e.target.value)} />
      {error && <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>}
      <button onClick={generate} disabled={loading} className='px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50'>
        {loading ? 'Generating…' : 'Generate Templates'}
      </button>
    </div>
  )
}
