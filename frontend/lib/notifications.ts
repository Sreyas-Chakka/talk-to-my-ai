export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

export const showNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/notification-icon.png',
      badge: '/badge-icon.png',
      ...options,
    })
  }
}

export const checkAndNotifyReminders = async (reminders: Array<{
  id: number
  title: string
  reminder_time: string
  notified?: boolean
}>) => {
  const now = new Date()
  
  for (const reminder of reminders) {
    const reminderTime = new Date(reminder.reminder_time)
    
    // Notify if reminder is due (within the last minute and not already notified)
    if (reminderTime <= now && !reminder.notified) {
      showNotification('Reminder', {
        body: reminder.title,
        tag: `reminder-${reminder.id}`,
        requireInteraction: true,
      })
      
      // Mark as notified (you'd want to persist this)
      reminder.notified = true
    }
  }
}
