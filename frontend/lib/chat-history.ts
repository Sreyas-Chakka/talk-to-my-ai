import { create } from 'zustand'

export interface ChatSession {
  id: string
  title: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  createdAt: Date
  updatedAt: Date
}

interface ChatHistoryStore {
  sessions: ChatSession[]
  currentSessionId: string | null
  addSession: (title: string) => string
  deleteSession: (id: string) => void
  updateSession: (id: string, messages: any[]) => void
  setCurrentSession: (id: string) => void
  getSessions: () => ChatSession[]
  loadFromStorage: () => void
  saveToStorage: () => void
}

export const useChatHistoryStore = create<ChatHistoryStore>((set, get) => ({
  sessions: [],
  currentSessionId: null,

  addSession: (title: string) => {
    const id = Date.now().toString()
    const newSession: ChatSession = {
      id,
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    set((state) => ({
      sessions: [newSession, ...state.sessions],
      currentSessionId: id,
    }))
    get().saveToStorage()
    return id
  },

  deleteSession: (id: string) => {
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
      currentSessionId: state.currentSessionId === id ? null : state.currentSessionId,
    }))
    get().saveToStorage()
  },

  updateSession: (id: string, messages: any[]) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, messages, updatedAt: new Date() } : s
      ),
    }))
    get().saveToStorage()
  },

  setCurrentSession: (id: string) => {
    set({ currentSessionId: id })
  },

  getSessions: () => get().sessions,

  saveToStorage: () => {
    const { sessions, currentSessionId } = get()
    localStorage.setItem(
      'chat-history',
      JSON.stringify({ sessions: sessions.map(s => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })), currentSessionId })
    )
  },

  loadFromStorage: () => {
    const data = localStorage.getItem('chat-history')
    if (data) {
      try {
        const { sessions, currentSessionId } = JSON.parse(data)
        set({
          sessions: sessions.map((s: any) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            updatedAt: new Date(s.updatedAt),
          })),
          currentSessionId,
        })
      } catch (error) {
        console.error('Failed to load chat history:', error)
      }
    }
  },
}))
