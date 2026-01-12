'use client'

import React from 'react'

export type RecruitSection = 'mock_interview' | 'cover_letter' | 'resume_review' | 'message_templates'

const labels: Record<RecruitSection, { text: string; emoji: string }> = {
  mock_interview: { text: 'Mock Interview', emoji: '🎤' },
  cover_letter: { text: 'Cover Letters', emoji: '✉️' },
  resume_review: { text: 'Resume Review', emoji: '📄' },
  message_templates: { text: 'Message Templates', emoji: '💬' },
}

export default function SectionTabs({
  active,
  onChange,
  isDark,
}: {
  active: RecruitSection
  onChange: (s: RecruitSection) => void
  isDark: boolean
}) {
  const sections: RecruitSection[] = ['mock_interview', 'cover_letter', 'resume_review', 'message_templates']
  return (
    <div className={`flex gap-3 px-6 py-4 rounded-2xl ${isDark ? 'bg-gray-800/80 backdrop-blur-xl border border-gray-700/50' : 'bg-white/80 backdrop-blur-xl border border-gray-200/50'} shadow-xl`}> 
      {sections.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
            active === s
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
              : isDark
                ? 'bg-gray-700/80 text-white hover:bg-gray-600 shadow-md'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-md'
          }`}
        >
          <span className="text-lg">{labels[s].emoji}</span>
          {labels[s].text}
        </button>
      ))}
    </div>
  )
}
