'use client'

interface MessageBubbleProps {
  message: {
    role: 'user' | 'assistant'
    content: string
  }
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} message-enter`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-6 py-4 rounded-2xl ${
          isUser
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none'
            : 'bg-white bg-opacity-20 text-white backdrop-blur-sm rounded-bl-none border border-white border-opacity-30'
        }`}
      >
        <p className="text-base leading-relaxed">{message.content}</p>
      </div>
    </div>
  )
}
