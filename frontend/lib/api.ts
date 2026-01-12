import axios, { AxiosInstance } from 'axios'
import { getAuth } from '@clerk/nextjs/server'

const PRIMARY_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const ALT_API_URL = PRIMARY_API_URL.includes('localhost')
  ? PRIMARY_API_URL.replace('localhost', '127.0.0.1')
  : PRIMARY_API_URL.replace('127.0.0.1', 'localhost')
let currentBaseURL = PRIMARY_API_URL

// API Client for chatbot
export const apiClient: AxiosInstance = axios.create({
  baseURL: currentBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

function switchBaseURL(newBase: string) {
  currentBaseURL = newBase
  apiClient.defaults.baseURL = newBase
}

// Add Clerk token to requests (client-side)
if (typeof window !== 'undefined') {
  apiClient.interceptors.request.use(async (config) => {
    try {
      const response = await fetch('/api/auth/token')
      const data = await response.json()
      if (data.token) {
        config.headers.Authorization = `Bearer ${data.token}`
      }
    } catch (error) {
      console.error('Failed to get auth token:', error)
    }
    return config
  })
}

export interface RespondRequest {
  text: string
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
  recruiter_mode: boolean
  task?: string
}

export interface RespondResponse {
  reply: string
  intent: { label: string; confidence: number }
  entities: Record<string, string>
  tool_trace: string[]
  latency_ms: { nlu: number; llm: number; total: number }
}

// Overloads to support both legacy payload-based calls and new param-style calls
export async function respond(payload: RespondRequest): Promise<RespondResponse>
export async function respond(
  text: string,
  recruiter_mode?: boolean,
  task?: string,
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<RespondResponse>
export async function respond(
  arg1: string | RespondRequest,
  recruiter_mode: boolean = true,
  task?: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<RespondResponse> {
  const body: RespondRequest =
    typeof arg1 === 'string'
      ? { text: arg1, recruiter_mode, task, history }
      : arg1

  try {
    const { data } = await apiClient.post<RespondResponse>('/api/respond', body)
    return data
  } catch (err: any) {
    const message = err?.response?.data?.detail || err?.message || 'Unknown error'
    if (message?.toLowerCase().includes('network error')) {
      const tryURL = currentBaseURL === PRIMARY_API_URL ? ALT_API_URL : PRIMARY_API_URL
      switchBaseURL(tryURL)
      try {
        const { data } = await apiClient.post<RespondResponse>('/api/respond', body)
        return data
      } catch (err2: any) {
        const message2 = err2?.response?.data?.detail || err2?.message || message
        throw new Error(`API error: ${message2}`)
      }
    }
    throw new Error(`API error: ${message}`)
  }
}

export async function health(): Promise<any> {
  try {
    const { data } = await apiClient.get('/health')
    return data
  } catch (e) {
    return null
  }
}
