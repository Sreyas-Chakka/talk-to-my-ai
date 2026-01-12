# Frontend Components & Styling Guide

## Components Overview

### 1. LoginForm.tsx
Beautiful login page with email/password authentication.

**Features**:
- Email validation
- Password input with masking
- Error message display
- Link to signup page
- Gradient button with loading state
- Demo credentials hint

**Usage**:
```typescript
import LoginForm from '@/components/LoginForm'
export default function LoginPage() {
  return <LoginForm />
}
```

### 2. SignupForm.tsx
Registration page for new users.

**Features**:
- Name, email, password fields
- Password confirmation
- Validation (8+ char passwords)
- Password matching check
- Error handling
- Link back to login

**Usage**:
```typescript
import SignupForm from '@/components/SignupForm'
export default function SignupPage() {
  return <SignupForm />
}
```

### 3. ChatInterface.tsx
Main chat application with message history.

**Features**:
- Message input and sending
- Real-time message display
- Recruiter mode toggle
- Loading indicators
- Logout button
- User greeting
- Auto-scroll to latest message
- Beautiful gradient header

**Props**: None (uses Zustand stores)

**Usage**:
```typescript
import ChatInterface from '@/components/ChatInterface'
export default function Home() {
  return <ChatInterface />
}
```

### 4. MessageBubble.tsx
Individual message component.

**Props**:
```typescript
interface MessageBubbleProps {
  message: {
    role: 'user' | 'assistant'
    content: string
  }
}
```

**Features**:
- Different styles for user/assistant
- Smooth animation on appear
- Responsive width
- Text wrapping

**Usage**:
```typescript
<MessageBubble message={{ role: 'user', content: 'Hello!' }} />
```

---

## Styling System

### Colors Used
- **Primary**: Blue (`#3B82F6`, `from-blue-500 to-blue-600`)
- **Secondary**: Green (`#10B981`)
- **Accent**: Purple (`to-purple-600`)
- **Background**: Gray (`bg-gray-50`)
- **Gradient**: Purple to pink (`from-blue-500 via-purple-500 to-pink-500`)

### Tailwind Classes

#### Common Patterns

**Button**:
```html
<button class="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50">
  Button Text
</button>
```

**Card**:
```html
<div class="bg-white rounded-2xl shadow-2xl p-8">
  Content
</div>
```

**Input**:
```html
<input class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
```

**Glass Morphism**:
```html
<div class="bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20">
  Content
</div>
```

### Animations

**Message Appear** (in `globals.css`):
```css
.message-enter {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Loading Dots**:
```html
<div class="flex gap-2">
  <div class="w-3 h-3 bg-white rounded-full animate-bounce"></div>
  <div class="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
  <div class="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
</div>
```

---

## State Management (Zustand)

### Auth Store
```typescript
import { useAuthStore } from '@/lib/store'

const {
  token,           // JWT token
  user,            // User object
  loading,         // Loading state
  setToken,        // Set token
  setUser,         // Set user
  logout,          // Logout
  initialize,      // Initialize from cookies
} = useAuthStore()
```

### Chat Store
```typescript
import { useChatStore } from '@/lib/store'

const {
  messages,         // Message array
  loading,          // Loading state
  recruiterMode,    // Recruiter mode toggle
  addMessage,       // Add message
  setLoading,       // Set loading
  setRecruiterMode, // Toggle recruiter mode
  clearMessages,    // Clear all messages
} = useChatStore()
```

---

## API Integration

### Responding to Chat
```typescript
import { respond } from '@/lib/api'

const response = await respond({
  text: 'User message',
  history: messages,
  recruiter_mode: true
})

console.log(response.reply)      // AI response
console.log(response.intent)     // Intent detected
console.log(response.entities)   // Entities found
console.log(response.latency_ms) // Performance metrics
```

### Authentication
```typescript
import { login, signup, getProfile } from '@/lib/api'

// Login
const { access_token, user } = await login('test@example.com', 'password123')

// Signup
const result = await signup('test@example.com', 'password123', 'Test User')

// Get Profile
const profile = await getProfile()
```

---

## Customization Guide

### Changing Colors

**Update `tailwind.config.js`**:
```javascript
export default {
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",    // Change primary color
        secondary: "#10B981",   // Change secondary color
      },
    },
  },
}
```

### Changing Fonts

**Update `app/globals.css`**:
```css
body {
  font-family: "Your Font", sans-serif;
}
```

**Or use Google Fonts** in `app/layout.tsx`:
```typescript
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
export default function RootLayout({ children }) {
  return <html className={inter.className}>{children}</html>
}
```

### Responsive Breakpoints

Tailwind's responsive prefixes:
- `sm:` - 640px
- `md:` - 768px  (tablets)
- `lg:` - 1024px (desktops)
- `xl:` - 1280px

Example:
```html
<div class="text-sm md:text-lg lg:text-xl">
  Responsive text
</div>
```

### Dark Mode Support

**Enable in `tailwind.config.js`**:
```javascript
export default {
  darkMode: 'class',
  // ...
}
```

**Use in components**:
```html
<div class="bg-white dark:bg-gray-900">
  Content
</div>
```

---

## Performance Optimization

### Image Optimization
```typescript
import Image from 'next/image'

<Image src="/logo.png" alt="Logo" width={200} height={200} />
```

### Code Splitting
Next.js automatically splits code by page. For dynamic imports:
```typescript
import dynamic from 'next/dynamic'

const ChatInterface = dynamic(() => import('@/components/ChatInterface'), {
  loading: () => <p>Loading...</p>,
})
```

### Lazy Loading
```typescript
'use client'
import { lazy, Suspense } from 'react'

const Component = lazy(() => import('./Component'))

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Component />
    </Suspense>
  )
}
```

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

---

## Accessibility Features

- Semantic HTML tags
- ARIA labels for buttons
- Keyboard navigation support
- Color contrast ratios (WCAG AA)
- Focus states on interactive elements
- Alt text for images (when added)

Example:
```html
<button aria-label="Send message">
  Send
</button>
```

---

## Testing Components

### With React Testing Library
```typescript
import { render, screen } from '@testing-library/react'
import MessageBubble from '@/components/MessageBubble'

test('renders user message', () => {
  render(
    <MessageBubble message={{ role: 'user', content: 'Hello' }} />
  )
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
```

---

## Common Issues & Solutions

### Button Not Responding
- Ensure `disabled` prop is not always true
- Check for event handler issues
- Verify loading state logic

### Message Not Appearing
- Check that `addMessage()` is called
- Verify message object structure
- Ensure store is properly initialized

### Styles Not Applied
- Clear `.next` folder: `rm -rf .next`
- Check class names for typos
- Rebuild with `npm run build`
- Check Tailwind config paths

### Token Expiration on Refresh
- Token should be saved in cookies
- Check that `initialize()` is called on app load
- Verify cookie persists across tabs
