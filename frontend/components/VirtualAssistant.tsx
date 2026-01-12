'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChatStore } from '@/lib/store'
import { respond, apiClient } from '@/lib/api'
import { useThemeStore } from '@/lib/theme-store'
import { useChatHistoryStore } from '@/lib/chat-history'
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

export default function VirtualAssistant() {
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
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [assistantAnimating, setAssistantAnimating] = useState(false)
  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    requestNotificationPermission()
    loadFromStorage()
  }, [loadFromStorage])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await apiClient.get('/api/reminders')
        setReminders(response.data)
        checkAndNotifyReminders(response.data)
      } catch (error) {
        console.error('Error fetching reminders:', error)
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const handleMicClick = () => {
    if (isListening) {
      stopSpeechRecognition()
      setIsListening(false)
    } else {
      setIsListening(true)
      startSpeechRecognition(
        (transcript) => {
          setInput(transcript)
          setIsListening(false)
        },
        (error) => {
          console.error('Speech recognition error:', error)
          setIsListening(false)
        }
      )
    }
  }

  const handleSpeakMessage = (text: string) => {
    if (isSpeaking) {
      stopSpeech()
      setIsSpeaking(false)
    } else {
      setIsSpeaking(true)
      setAssistantAnimating(true)
      speakText(text, () => {
        setIsSpeaking(false)
        setAssistantAnimating(false)
      })
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input
    setInput('')
    addMessage({ role: 'user', content: userMessage })
    setLoading(true)

    try {
      const response = await respond(userMessage, recruiterMode)
      addMessage({
        role: 'assistant',
        content: response.reply,
      })

      // Update session
      if (currentSessionId) {
        const session = sessions.find(s => s.id === currentSessionId)
        if (session) {
          updateSession(currentSessionId, {
            ...session,
            lastUpdated: new Date().toISOString(),
            messageCount: (session.messageCount || 0) + 2,
          })
        }
      }

      // Auto-speak the response
      setTimeout(() => {
        setIsSpeaking(true)
        setAssistantAnimating(true)
        speakText(response.reply, () => {
          setIsSpeaking(false)
          setAssistantAnimating(false)
        })
      }, 500)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = () => {
    const newSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      messageCount: 0,
    }
    addSession(newSession)
    setCurrentSession(newSession.id)
    useChatStore.setState({ messages: [] })
  }

  const handleSelectSession = async (sessionId: string) => {
    setCurrentSession(sessionId)
    // Load session messages
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      // This would load messages from localStorage based on session
      console.log('Loading session:', session.title)
    }
  }

  const filteredMessages = messages.filter(m =>
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={`h-screen flex flex-col relative overflow-hidden ${isDark ? 'dark' : ''}`}>
      {/* Animated Background */}
      <div className={`absolute inset-0 -z-10 ${isDark ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900' : 'bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400'}`}>
        <div className={`absolute inset-0 opacity-30 ${isDark ? 'bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]' : 'bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_50%)]'}`}></div>
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      {/* Header Bar */}
      <div className={`${isDark ? 'bg-gray-800/80 backdrop-blur-xl border-gray-700/50' : 'bg-white/80 backdrop-blur-xl border-gray-200/50'} border-b px-6 py-4 shadow-lg`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                isDark
                  ? 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white shadow-lg'
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 shadow-md'
              }`}
            >
              📚 {showHistory ? 'Hide' : 'History'}
            </button>
            <button
              onClick={handleNewChat}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 shadow-lg ${
                isDark
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
              }`}
            >
              ➕ New Chat
            </button>
          </div>

          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Virtual Assistant</h1>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-110 hover:rotate-12 shadow-lg ${
                isDark
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
              }`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Career Tools Link */}
            <button
              onClick={() => router.push('/recruitment')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 shadow-lg ${
                isDark
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
              }`}
            >
              🧰 Career Tools
            </button>

            <button
              onClick={() => setShowExport(true)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 shadow-md ${
                isDark
                  ? 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white'
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800'
              }`}
            >
              💾 Export
            </button>

            <button
              onClick={() => setShowReminders(!showReminders)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              📋 Reminders
            </button>

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

            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat History Sidebar */}
        {showHistory && (
          <ChatHistoryPanel
            onSelectSession={handleSelectSession}
            currentSessionId={currentSessionId}
          />
        )}

        {/* Center Assistant Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 overflow-y-auto">
          <div className="max-w-2xl w-full h-full flex flex-col items-center justify-center">
            {/* Virtual Assistant Avatar */}
            <div className="mb-12">
              <div
                className={`relative w-48 h-48 rounded-full transition-all duration-500 ${
                  assistantAnimating || isSpeaking
                    ? 'shadow-2xl shadow-blue-500/50 scale-110 ring-4 ring-blue-400/30'
                    : isDark
                    ? 'shadow-2xl shadow-blue-900/50'
                    : 'shadow-2xl shadow-blue-400/30'
                } ${isDark ? 'bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600' : 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500'}`}
              >
                {/* Eyes */}
                <div className="absolute top-14 left-12 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <div
                    className={`w-4 h-4 bg-gradient-to-br from-gray-800 to-black rounded-full transition-transform duration-200 ${
                      assistantAnimating ? 'animate-pulse' : ''
                    }`}
                  ></div>
                </div>
                <div className="absolute top-14 right-12 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <div
                    className={`w-4 h-4 bg-gradient-to-br from-gray-800 to-black rounded-full transition-transform duration-200 ${
                      assistantAnimating ? 'animate-pulse' : ''
                    }`}
                  ></div>
                </div>

                {/* Mouth */}
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
                  {isSpeaking ? (
                    <div className="flex gap-1.5">
                      <div
                        className="w-3 h-8 bg-gradient-to-t from-white to-gray-100 rounded-full animate-bounce shadow-md"
                        style={{ animationDelay: '0s' }}
                      ></div>
                      <div
                        className="w-3 h-8 bg-gradient-to-t from-white to-gray-100 rounded-full animate-bounce shadow-md"
                        style={{ animationDelay: '0.15s' }}
                      ></div>
                      <div
                        className="w-3 h-8 bg-gradient-to-t from-white to-gray-100 rounded-full animate-bounce shadow-md"
                        style={{ animationDelay: '0.3s' }}
                      ></div>
                    </div>
                  ) : (
                    <div className="w-14 h-3 bg-gradient-to-r from-white via-gray-100 to-white rounded-full shadow-md"></div>
                  )}
                </div>
              </div>

              {/* Status Text */}
              <div className="text-center mt-6">
                <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Hi, I'm Your Assistant
                </h2>
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isListening
                    ? '🎤 Listening...'
                    : isSpeaking
                    ? '💬 Speaking...'
                    : 'Ready to help!'}
                </p>
              </div>
            </div>

            {/* Conversation Display */}
            {messages.length > 0 && (
              <div className={`w-full mt-8 p-6 rounded-2xl ${
                isDark ? 'bg-gray-800/80 backdrop-blur-xl border border-gray-700/50' : 'bg-white/80 backdrop-blur-xl border border-gray-200/50'
              } shadow-2xl max-h-64 overflow-y-auto`}>
                <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Conversation
                </h3>
                <div className="space-y-4">
                  {filteredMessages.slice(-5).map((message, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                        message.role === 'user'
                          ? isDark
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-8 shadow-lg'
                            : 'bg-gradient-to-r from-blue-100 to-purple-100 text-gray-900 ml-8 shadow-md'
                          : isDark
                          ? 'bg-gradient-to-r from-gray-700 to-gray-600 text-white mr-8 shadow-lg'
                          : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900 mr-8 shadow-md'
                      }`}
                    >
                      <p className="text-sm">
                        {message.role === 'user' ? '👤 You' : '🤖 Assistant'}: {message.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Voice Input Controls */}
            <div className="mt-12 flex gap-4">
              <button
                onClick={handleMicClick}
                disabled={loading}
                className={`px-10 py-5 rounded-full font-bold text-xl transition-all duration-300 transform hover:scale-110 ${
                  isListening
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white animate-pulse scale-110 shadow-2xl shadow-red-500/50'
                    : isDark
                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl shadow-purple-500/30'
                    : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-2xl shadow-purple-400/30'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isListening ? '🎤 Listening' : '🎤 Tap to Speak'}
              </button>

              {isSpeaking && (
                <button
                  onClick={() => {
                    stopSpeech()
                    setIsSpeaking(false)
                    setAssistantAnimating(false)
                  }}
                  className="px-10 py-5 rounded-full font-bold text-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white transition-all duration-300 transform hover:scale-110 shadow-2xl shadow-red-500/30"
                >
                  ⏸️ Stop
                </button>
              )}
            </div>

            {/* Text Input as Backup */}
            <form onSubmit={handleSendMessage} className="mt-8 w-full max-w-xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Or type your message here..."
                  disabled={loading}
                  className={`flex-1 px-6 py-3 rounded-full focus:outline-none focus:ring-2 transition ${
                    isDark
                      ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 disabled:opacity-50'
                      : 'bg-gray-100 text-gray-900 placeholder-gray-500 focus:ring-blue-400 disabled:opacity-50'
                  }`}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-6 py-3 rounded-full font-bold bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
                >
                  Send
                </button>
              </div>
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
      </div>

      {/* Export Modal */}
      {showExport && (
        <ExportMenu messages={messages} onClose={() => setShowExport(false)} />
      )}
    </div>
  )
}
