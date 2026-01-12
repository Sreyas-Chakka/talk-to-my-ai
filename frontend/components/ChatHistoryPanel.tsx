'use client'

import { useState, useEffect } from 'react'
import { useChatHistoryStore } from '@/lib/chat-history'
import { useChatStore } from '@/lib/store'

interface ChatHistoryPanelProps {
  onSelectSession: (id: string) => void
  currentSessionId: string | null
}

export default function ChatHistoryPanel({ onSelectSession, currentSessionId }: ChatHistoryPanelProps) {
  const { sessions, deleteSession, loadFromStorage } = useChatHistoryStore()
  const { messages } = useChatStore()
  const [showDelete, setShowDelete] = useState<string | null>(null)

  useEffect(() => {
    loadFromStorage()
  }, [])

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 w-64 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-bold text-gray-800 dark:text-white mb-2">Chat History</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">{sessions.length} conversations</p>
      </div>

      {sessions.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          No saved conversations yet
        </div>
      ) : (
        <div className="space-y-1 p-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`p-3 rounded-lg cursor-pointer group transition ${
                currentSessionId === session.id
                  ? 'bg-blue-100 dark:bg-blue-900'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div
                onClick={() => onSelectSession(session.id)}
                className="flex-1"
              >
                <p className="font-medium text-gray-800 dark:text-white text-sm truncate">
                  {session.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(session.createdAt)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {session.messages.length} messages
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDelete(showDelete === session.id ? null : session.id)
                }}
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-sm mt-1"
              >
                🗑️ Delete
              </button>
              {showDelete === session.id && (
                <div className="mt-2 text-xs space-y-1">
                  <button
                    onClick={() => {
                      deleteSession(session.id)
                      setShowDelete(null)
                    }}
                    className="w-full px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setShowDelete(null)}
                    className="w-full px-2 py-1 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
