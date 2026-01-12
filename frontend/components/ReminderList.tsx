'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'

interface Reminder {
  id: number
  user_id: string
  title: string
  description: string
  reminder_time: string
  created_at: string
  completed: number
}

export default function ReminderList() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReminders = async () => {
    try {
      const { data } = await apiClient.get<Reminder[]>('/api/reminders')
      setReminders(data)
    } catch (error) {
      console.error('Failed to fetch reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReminders()
    // Refresh every 30 seconds
    const interval = setInterval(fetchReminders, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleComplete = async (id: number) => {
    try {
      await apiClient.patch(`/api/reminders/${id}/complete`)
      setReminders(reminders.filter(r => r.id !== id))
    } catch (error) {
      console.error('Failed to complete reminder:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/api/reminders/${id}`)
      setReminders(reminders.filter(r => r.id !== id))
    } catch (error) {
      console.error('Failed to delete reminder:', error)
    }
  }

  const getTimeDisplay = (reminderTime: string) => {
    const time = new Date(reminderTime)
    const now = new Date()
    
    if (time < now) {
      return <span className="text-red-500 font-semibold">Overdue!</span>
    }
    
    return <span className="text-gray-600">in {formatDistanceToNow(time)}</span>
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (reminders.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p className="text-sm">No upcoming reminders</p>
        <p className="text-xs mt-1">Say "remind me to..." to create one</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
      <h3 className="font-semibold text-gray-700 mb-3">Upcoming Reminders</h3>
      {reminders.map((reminder) => (
        <div
          key={reminder.id}
          className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium text-gray-800 text-sm">{reminder.title}</p>
              <p className="text-xs text-gray-500 mt-1">
                {getTimeDisplay(reminder.reminder_time)}
              </p>
            </div>
            <div className="flex gap-2 ml-3">
              <button
                onClick={() => handleComplete(reminder.id)}
                className="text-green-600 hover:text-green-700 text-xs px-2 py-1 rounded hover:bg-green-50"
                title="Mark as complete"
              >
                ✓
              </button>
              <button
                onClick={() => handleDelete(reminder.id)}
                className="text-red-600 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50"
                title="Delete"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
