'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChatStore } from '@/lib/store'
import { respond, apiClient } from '@/lib/api'
import { useThemeStore } from '@/lib/theme-store'
import { useChatHistoryStore } from '@/lib/chat-history'
import MessageBubble from './MessageBubble'
import ReminderList from './ReminderList'
import ChatHistoryPanel from './ChatHistoryPanel'
import ExportMenu from './ExportMenu'
import { useAuth, UserButton } from '@clerk/nextjs'
import { requestNotificationPermission, checkAndNotifyReminders } from '@/lib/notifications'
import { startSpeechRecognition, stopSpeechRecognition, speakText, stopSpeech, isSpeaking } from '@/lib/voice'

interface Reminder {
  id: number
  title: string
  reminder_time: string
}

export default function ChatInterface() {
  const router = useRouter()
  const { user } = useAuth()
  const { messages, addMessage, loading, setLoading, recruiterMode, setRecruiterMode } = useChatStore()
  const { isDark, toggleTheme } = useThemeStore()
  const { sessions, addSession, updateSession, currentSessionId, setCurrentSession, loadFromStorage } = useChatHistoryStore()
  
  const [input, setInput] = useState('')
  const [showReminders, setShowReminders] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isListening, setIsListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission()
    loadFromStorage()
  }, [])

  // Poll for due reminders
  useEffect(() => {
    const checkReminders = async () => {
      try {
        const { data } = await apiClient.get<Reminder[]>('/api/reminders/due')
        await checkAndNotifyReminders(data)
      } catch (error) {
        console.error('Failed to check reminders:', error)
      }
    }

    // Check immediately and then every minute
    checkReminders()
    const interval = setInterval(checkReminders, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleMicClick = () => {
    if (isListening) {
      stopSpeechRecognition(recognitionRef.current)
      setIsListening(false)
    } else {
      setIsListening(true)
      recognitionRef.current = startSpeechRecognition(
        (text) => {
          setInput(text)
          setIsListening(false)
        },
        (error) => {
          console.error('Voice error:', error)
          setIsListening(false)
        }
      )
    }
  }

  const handleSpeakMessage = (text: string) => {
    if (speaking) {
      stopSpeech()
      setSpeaking(false)
    } else {
      setSpeaking(true)
      speakText(text, () => setSpeaking(false))
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    // Add user message
    const userMessage = { role: 'user' as const, content: input }
    addMessage(userMessage)
    setInput('')
    setLoading(true)

    try {
      const response = await respond({
        text: input,
        history: messages,
        recruiter_mode: recruiterMode,
      })

      // Add assistant message
      addMessage({
        role: 'assistant',
        content: response.reply,
      })

      // Update current session with messages
      if (currentSessionId) {
        updateSession(currentSessionId, [...messages, userMessage, { role: 'assistant', content: response.reply }])
      }
    } catch (error: any) {
      addMessage({
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = () => {
    const title = prompt('Chat title:', `Chat ${new Date().toLocaleDateString()}`)
    if (title) {
      useChatStore.setState({ messages: [] })
      addSession(title)
    }
  }

  const handleSelectSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      useChatStore.setState({ messages: session.messages })
      setCurrentSession(sessionId)
      setShowHistory(false)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Enter to send
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        const form = document.querySelector('form')
        if (form) form.dispatchEvent(new Event('submit', { bubbles: true }))
      }
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchQuery('')
      }
      // Escape to close sidebars
      if (e.key === 'Escape') {
        setShowHistory(false)
        setShowReminders(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filteredMessages = messages.filter(m =>
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={`h-screen flex ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Chat History Sidebar */}
      {showHistory && (
        <ChatHistoryPanel
          onSelectSession={handleSelectSession}
          currentSessionId={currentSessionId}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 shadow`}>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                📚 {showHistory ? 'Hide' : 'History'}
              </button>
              <button
                onClick={handleNewChat}
                className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
                  isDark
                    ? 'bg-blue-700 hover:bg-blue-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                ➕ New Chat
              </button>
            </div>

            <div>
              <h1 className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Voice Demo AI</h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {user?.firstName ? `Welcome, ${user.firstName}` : 'Chat with your AI assistant'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
                  isDark
                    ? 'bg-yellow-700 hover:bg-yellow-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-800 text-white'
                }`}
              >
                {isDark ? '☀️' : '🌙'}
              </button>

              {/* Export */}
              <button
                onClick={() => setShowExport(true)}
                className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                💾 Export
              </button>

              {/* Reminders */}
              <button
                onClick={() => setShowReminders(!showReminders)}
                className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                📋 Reminders
              </button>

              {/* Recruiter Mode */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <label className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Recruiter:</label>
                <button
                  onClick={() => setRecruiterMode(!recruiterMode)}
                  className={`px-3 py-1 rounded-lg font-semibold text-sm transition ${
                    recruiterMode
                      ? 'bg-green-500 text-white'
                      : isDark ? 'bg-gray-600 text-white' : 'bg-gray-400 text-white'
                  }`}
                >
                  {recruiterMode ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* User Menu */}
              <UserButton afterSignOutUrl="/sign-in" />
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {filteredMessages.length === 0 && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-6xl mb-4">💬</div>
                <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Start a Conversation</h2>
                <p className={`text-lg max-w-md ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Ask me anything! I can help with scheduling, answering questions, and more.
                </p>
              </div>
            )}
            {filteredMessages.length === 0 && messages.length > 0 && (
              <div className="text-center text-gray-500">
                <p>No messages match your search</p>
              </div>
            )}
            {filteredMessages.map((message, index) => (
              <div key={index} className="flex items-end gap-2 group">
                <MessageBubble message={message} />
                {message.role === 'assistant' && (
                  <button
                    onClick={() => handleSpeakMessage(message.content)}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity px-3 py-2 rounded-lg font-medium text-sm ${
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                    title="Speak message"
                  >
                    {speaking ? '⏸️' : '🔊'}
                  </button>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className={`rounded-2xl px-6 py-4 max-w-xs ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div className="flex gap-2">
                    <div className={`w-3 h-3 rounded-full animate-bounce ${
                      isDark ? 'bg-white' : 'bg-gray-800'
                    }`}></div>
                    <div className={`w-3 h-3 rounded-full animate-bounce ${
                      isDark ? 'bg-white' : 'bg-gray-800'
                    }`} style={{ animationDelay: '0.2s' }}></div>
                    <div className={`w-3 h-3 rounded-full animate-bounce ${
                      isDark ? 'bg-white' : 'bg-gray-800'
                    }`} style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Search Bar */}
        {messages.length > 0 && (
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t px-6 py-3`}>
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500'
                  : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-400'
              }`}
            />
          </div>
        )}

        {/* Input Area */}
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t px-6 py-6`}>
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or speak your message... (Cmd+Enter to send)"
              disabled={loading}
              className={`flex-1 px-6 py-4 rounded-full focus:outline-none focus:ring-2 transition ${
                isDark
                  ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 disabled:opacity-50'
                  : 'bg-gray-100 text-gray-900 placeholder-gray-500 focus:ring-blue-400 disabled:opacity-50'
              }`}
            />
            <button
              type="button"
              onClick={handleMicClick}
              disabled={loading}
              className={`px-6 py-4 rounded-full font-semibold transition ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Click to start/stop voice input"
            >
              {isListening ? '🎤 Listening...' : '🎤'}
            </button>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Reminders Sidebar */}
      {showReminders && (
        <div className={`w-80 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-l shadow-lg overflow-y-auto`}>
          <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
            <h2 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Reminders</h2>
            <button
              onClick={() => setShowReminders(false)}
              className={`${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ✕
            </button>
          </div>
          <ReminderList />
        </div>
      )}

      {/* Export Modal */}
      {showExport && (
        <ExportMenu messages={messages} onClose={() => setShowExport(false)} />
      )}
    </div>
  )
}
