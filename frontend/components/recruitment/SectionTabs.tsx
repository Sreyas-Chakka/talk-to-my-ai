'use client'

import React from 'react'

export type RecruitSection = 'mock_interview' | 'cover_letter' | 'resume_review' | 'message_templates'

const labels: Record<RecruitSection, string> = {
  mock_interview: 'Mock Interview',
  cover_letter: 'Cover Letters',
  resume_review: 'Resume Review',
  message_templates: 'Message Templates',
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
    <div className={`flex gap-2 px-4 py-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}> 
      {sections.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            active === s
              ? 'bg-blue-600 text-white'
              : isDark
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          {labels[s]}
        </button>
      ))}
    </div>
  )
}
