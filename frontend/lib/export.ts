export const exportChat = (messages: any[], format: 'json' | 'txt' | 'csv') => {
  let content = ''
  const timestamp = new Date().toISOString()

  if (format === 'json') {
    const data = {
      exportDate: timestamp,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: new Date().toISOString()
      }))
    }
    content = JSON.stringify(data, null, 2)
  } else if (format === 'txt') {
    content = messages.map(m => `[${m.role.toUpperCase()}]\n${m.content}\n`).join('\n---\n\n')
  } else if (format === 'csv') {
    content = 'Role,Message\n'
    content += messages.map(m => `"${m.role}","${m.content.replace(/"/g, '""')}"`).join('\n')
  }

  // Create blob and download
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `chat-${timestamp}.${format === 'json' ? 'json' : format === 'csv' ? 'csv' : 'txt'}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const downloadPDF = (messages: any[]) => {
  // For PDF, we'll create a simple HTML version
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .message { margin: 15px 0; padding: 10px; border-radius: 5px; }
        .user { background: #e3f2fd; margin-left: 20px; }
        .assistant { background: #f5f5f5; }
        .role { font-weight: bold; color: #555; }
        .content { margin-top: 5px; }
      </style>
    </head>
    <body>
      <h1>Chat Export</h1>
      <p>Exported: ${new Date().toLocaleString()}</p>
  `

  messages.forEach(m => {
    html += `
      <div class="message ${m.role}">
        <div class="role">${m.role.toUpperCase()}</div>
        <div class="content">${m.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
      </div>
    `
  })

  html += `
    </body>
    </html>
  `

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `chat-${new Date().toISOString()}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
