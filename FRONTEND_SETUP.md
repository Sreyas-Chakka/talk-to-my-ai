# Frontend Setup Guide

## Installation

### Prerequisites
- Node.js 18+ and npm

### Steps

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file** (`.env.local`):
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and ensure:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_AUTH_URL=http://localhost:8001
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   ```
   http://localhost:3000
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run linter

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Home/chat page (protected)
│   ├── login/page.tsx     # Login page
│   ├── signup/page.tsx    # Signup page
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── ChatInterface.tsx  # Main chat UI
│   ├── LoginForm.tsx      # Login form
│   ├── SignupForm.tsx     # Signup form
│   └── MessageBubble.tsx  # Chat message bubble
├── lib/                   # Utilities and helpers
│   ├── api.ts            # Axios client and API functions
│   ├── store.ts          # Zustand stores for state
│   └── utils.ts          # Helper functions
├── public/               # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── next.config.js
```

## Key Files Explained

### `app/page.tsx` (Home/Chat Page)
- Protected route that redirects to login if not authenticated
- Renders the main chat interface
- Uses Zustand store for state management

### `components/ChatInterface.tsx`
- Main chat UI component
- Handles message sending and receiving
- Shows recruiter mode toggle
- Includes logout button

### `lib/store.ts`
- Zustand stores for auth and chat state
- Auto-saves token to cookies
- Manages user session and message history

### `lib/api.ts`
- Axios client with auth interceptors
- API functions for login, signup, and chat
- Automatically includes JWT token in requests

## Authentication Flow

1. **Check Session**: App checks for stored token on load
2. **Route Protection**: Unauthenticated users redirected to login
3. **Login/Signup**: User credentials sent to auth service
4. **Token Storage**: JWT token stored in HTTP-only cookie
5. **API Calls**: All subsequent requests include token
6. **Session Restore**: Token persists across page refreshes

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Gradient Backgrounds**: Purple and blue gradients
- **Animations**: Smooth transitions and message animations
- **Responsive**: Mobile-first design that works on all screens

## Development Tips

### Adding New Components
```typescript
'use client'  // Mark as client component if using hooks

import { useAuthStore } from '@/lib/store'

export default function MyComponent() {
  const { user } = useAuthStore()
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  )
}
```

### Using State Management
```typescript
import { useChatStore, useAuthStore } from '@/lib/store'

const { messages, addMessage } = useChatStore()
const { user, logout } = useAuthStore()
```

### Making API Calls
```typescript
import { respond, login } from '@/lib/api'

const response = await respond({
  text: 'Hello',
  history: [],
  recruiter_mode: true
})
```

## Troubleshooting

### "Cannot GET /"
- Ensure backend services are running (port 8000 and 8001)
- Check `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_AUTH_URL` in `.env.local`

### "401 Unauthorized"
- Token may have expired, try logging in again
- Check that auth service is running on port 8001

### "CORS Error"
- Ensure both backends have CORS enabled
- Update `allowed_origins` in backend `main.py` if needed

### Styles Not Loading
- Check that Tailwind CSS build is working: `npm run build`
- Clear `.next` folder: `rm -rf .next`

## Building for Production

```bash
# Build the project
npm run build

# Start production server
npm start
```

The production build will be optimized and minified.
