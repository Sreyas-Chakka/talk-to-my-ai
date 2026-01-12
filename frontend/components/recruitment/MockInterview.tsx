'use client'

import React, { useState } from 'react'
import { respond } from '@/lib/api'
import { speakText, stopSpeech } from '@/lib/voice'

export default function MockInterview({ isDark, recruiterMode, onReply }: { isDark: boolean; recruiterMode: boolean; onReply: (text: string) => void }) {
  const [topic, setTopic] = useState('Frontend Developer')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastQuestion, setLastQuestion] = useState<string>('Start a mock interview. Ask one question at a time.')
  const [error, setError] = useState<string | null>(null)

  const nextQuestion = async (userAnswer?: string) => {
    setLoading(true)
    setError(null)
    const text = `${lastQuestion}\nUser Answer: ${userAnswer || ''}\nPlease provide brief feedback and the next question.`
    try {
      const res = await respond(text, recruiterMode, 'mock_interview')
      setLastQuestion(res.reply)
      onReply(res.reply)
      speakText(res.reply, () => {})
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'Failed to get next question. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='space-y-3'>
      {error && <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>}
      <div className='flex gap-2'>
        <input className={`flex-1 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder='Role or topic' />
        <button onClick={() => { setLastQuestion(`Start a mock interview for ${topic}. Ask one question.`); nextQuestion('') }} className='px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white'>Begin</button>
      </div>
      <textarea className={`w-full h-24 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`} placeholder='Type your answer here' value={answer} onChange={(e) => setAnswer(e.target.value)} />
      <div className='flex gap-2'>
        <button onClick={() => nextQuestion(answer)} disabled={loading || !answer.trim()} className='px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-50'>Submit Answer</button>
        <button onClick={() => { stopSpeech() }} className='px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white'>Stop Voice</button>
      </div>
    </div>
  )
}
