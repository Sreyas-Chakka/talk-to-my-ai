'use client'

import { useState } from 'react'
import { useChatHistoryStore } from '@/lib/chat-history'
import { exportChat, downloadPDF } from '@/lib/export'

interface ExportMenuProps {
  messages: any[]
  onClose: () => void
}

export default function ExportMenu({ messages, onClose }: ExportMenuProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async (format: 'json' | 'txt' | 'csv' | 'pdf') => {
    setExporting(true)
    try {
      if (format === 'pdf') {
        downloadPDF(messages)
      } else {
        exportChat(messages, format)
      }
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExporting(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Export Chat</h2>
        <p className="text-gray-600 mb-6">Choose a format to export your conversation:</p>
        
        <div className="space-y-2">
          <button
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition disabled:opacity-50"
          >
            📄 JSON
          </button>
          <button
            onClick={() => handleExport('txt')}
            disabled={exporting}
            className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition disabled:opacity-50"
          >
            📝 Plain Text
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition disabled:opacity-50"
          >
            📊 CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition disabled:opacity-50"
          >
            📕 HTML (Print as PDF)
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
