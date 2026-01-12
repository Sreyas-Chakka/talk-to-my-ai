import { create } from 'zustand'
import Cookie from 'js-cookie'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AuthState {
  token: string | null
  user: any | null
  loading: boolean
  setToken: (token: string | null) => void
  setUser: (user: any | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>((set) => {
  return {
    token: null,
    user: null,
    loading: true,
    setToken: (token: string | null) => {
      if (token) {
        Cookie.set('token', token, { expires: 7 })
      } else {
        Cookie.remove('token')
      }
      set({ token })
    },
    setUser: (user: any | null) => set({ user }),
    setLoading: (loading: boolean) => set({ loading }),
    logout: () => {
      Cookie.remove('token')
      set({ token: null, user: null })
    },
    initialize: () => {
      const token = Cookie.get('token')
      set({ token: token || null, loading: false })
    },
  }
})

interface ChatState {
  messages: Message[]
  loading: boolean
  recruiterMode: boolean
  addMessage: (message: Message) => void
  setLoading: (loading: boolean) => void
  setRecruiterMode: (recruiterMode: boolean) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  loading: false,
  recruiterMode: true,
  addMessage: (message: Message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setLoading: (loading: boolean) => set({ loading }),
  setRecruiterMode: (recruiterMode: boolean) => set({ recruiterMode }),
  clearMessages: () => set({ messages: [] }),
}))
