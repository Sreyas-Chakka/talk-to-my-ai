# System Architecture & Flow Diagrams

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │           NEXT.JS FRONTEND (Port 3000)                         │ │
│  │                                                                 │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │  Auth Pages              Chat Interface                  │ │ │
│  │  │  ┌──────────────┐       ┌──────────────────────────────┐ │ │ │
│  │  │  │ Login Page   │       │ Chat Messages                │ │ │ │
│  │  │  │ Signup Page  │       │ Message Input                │ │ │ │
│  │  │  │              │       │ Recruiter Mode Toggle        │ │ │ │
│  │  │  │ (Protected   │       │ User Profile                 │ │ │ │
│  │  │  │  Routes)     │       │ Logout Button                │ │ │ │
│  │  │  └──────────────┘       └──────────────────────────────┘ │ │ │
│  │  │                                                            │ │ │
│  │  │  ┌──────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  Zustand Store                                       │ │ │ │
│  │  │  │  • Auth Store (token, user, login)                  │ │ │ │
│  │  │  │  • Chat Store (messages, recruiter mode)            │ │ │ │
│  │  │  └──────────────────────────────────────────────────────┘ │ │ │
│  │  │                                                            │ │ │
│  │  │  ┌──────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  API Client (Axios)                                  │ │ │ │
│  │  │  │  • Automatically adds JWT token to requests          │ │ │ │
│  │  │  │  • Handles auth & chat endpoints                     │ │ │ │
│  │  │  │  • Error handling & interceptors                     │ │ │ │
│  │  │  └──────────────────────────────────────────────────────┘ │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │                         ▲                                       │ │
│  │                         │                                       │ │
│  │                    HTTP Requests                               │ │
│  │                    (JWT Token in Header)                       │ │
│  │                         │                                       │ │
│  └────────────────────────┼────────────────────────────────────────┘ │
│                            │                                          │
└────────────────────────────┼──────────────────────────────────────────┘
                             │
                ┌────────────┴─────────────┐
                │                          │
           (Port 8001)                (Port 8000)
           Auth Service               Chat Service
                │                          │
         ┌──────▼────────┐         ┌──────▼────────┐
         │ AUTH.PY       │         │ MAIN.PY       │
         │ FastAPI       │         │ FastAPI       │
         │               │         │               │
         │ Endpoints:    │         │ Endpoints:    │
         │ • /signup     │         │ • /health     │
         │ • /login      │         │ • /respond    │
         │ • /profile    │         │               │
         │               │         │ Uses:         │
         │ Database:     │         │ • nlu.py      │
         │ users.json    │         │ • llm.py      │
         │ (JWT Tokens)  │         │ • OpenAI API  │
         └───────────────┘         │  (optional)   │
                                   └───────────────┘
```

---

## 🔐 Authentication Flow

```
User Signup/Login
       │
       ▼
┌─────────────────────────┐
│  Frontend Form          │
│  (LoginForm/SignupForm) │
└─────────────────────────┘
       │
       │ POST email/password
       ▼
┌─────────────────────────┐
│  Auth Service           │
│  (auth.py)              │
│                         │
│  1. Validate email      │
│  2. Hash password       │
│  3. Store/Check user    │
│  4. Create JWT token    │
└─────────────────────────┘
       │
       │ Return token + user
       ▼
┌─────────────────────────┐
│  Frontend Store         │
│  (Zustand)              │
│                         │
│  1. Save token to store │
│  2. Save to cookies     │
│  3. Save user profile   │
└─────────────────────────┘
       │
       │ Token persists
       ▼
┌─────────────────────────┐
│  Protected Routes       │
│  (Chat Page)            │
│                         │
│  All API calls include  │
│  token in header:       │
│  "Authorization:        │
│   Bearer {token}"       │
└─────────────────────────┘
```

---

## 💬 Chat Message Flow

```
User Sends Message
       │
       ▼
┌──────────────────────────────┐
│  ChatInterface Component     │
│  • User types message        │
│  • Clicks send button        │
└──────────────────────────────┘
       │
       ├─ Add to local store (optimistic UI)
       │
       └─ Call respond() API
       │
       ▼
┌──────────────────────────────┐
│  Frontend API Client         │
│  • Add JWT token to header   │
│  • Send to http://localhost  │
│    :8000/api/respond         │
└──────────────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Backend Chat Service        │
│  (main.py)                   │
│                              │
│  1. Process with NLU         │
│     • Intent detection       │
│     • Entity extraction      │
│                              │
│  2. Generate reply with LLM  │
│     • Check OpenAI key       │
│     • Call GPT API (if key)  │
│     • Fallback response      │
│                              │
│  3. Calculate latency metrics│
│  4. Return response          │
└──────────────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Response to Frontend        │
│  {                           │
│    "reply": "...",           │
│    "intent": {...},          │
│    "entities": {...},        │
│    "latency_ms": {...}       │
│  }                           │
└──────────────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  ChatInterface Updates UI    │
│  • Add assistant message     │
│  • Display in message bubble │
│  • Show loading = false      │
│  • Auto-scroll to bottom     │
└──────────────────────────────┘
```

---

## 🗄️ Data Models

### User Object
```
{
  "id": "unique-user-id",
  "email": "user@example.com",
  "name": "User Name",
  "password_hash": "hashed-password",
  "created_at": "2024-01-11T..."
}
```

### JWT Token Payload
```
{
  "sub": "user@example.com",  # Subject (user email)
  "exp": 1707619200,          # Expiration time
  "iat": 1705027200           # Issued at
}
```

### Message Object
```
{
  "role": "user" | "assistant",
  "content": "message text here"
}
```

### Chat Response
```
{
  "reply": "assistant response",
  "intent": {
    "label": "availability",
    "confidence": 0.92
  },
  "entities": {
    "time": "9 AM to 5 PM",
    "days": "Mon-Fri"
  },
  "tool_trace": [
    "nlu:intent=availability",
    "llm:model=gpt-4o-mini",
    "latency_llm_ms=523"
  ],
  "latency_ms": {
    "nlu": 12,
    "llm": 523,
    "total": 535
  }
}
```

---

## 📊 Request/Response Lifecycle

### 1. Initial Page Load
```
Browser → Load http://localhost:3000
         ↓
         Check for token in cookies
         ↓
         Token found? → Redirect to chat page
         Token not found? → Redirect to login page
```

### 2. Login Flow
```
User fills form and clicks "Log In"
         ↓
POST /auth/login {email, password}
         ↓
Backend validates
         ↓
Return {token, user} if valid
Return error if invalid
         ↓
Frontend stores token in cookies
Frontend redirects to chat page
```

### 3. Chat Message Flow
```
User types and sends message
         ↓
Message added to local store
         ↓
POST /api/respond {text, history, recruiter_mode}
+ Header: "Authorization: Bearer {token}"
         ↓
Backend processes
         ↓
Return response
         ↓
Add to local store & display
```

---

## 🔄 State Management

### Auth Store (Zustand)
```
useAuthStore({
  token: "jwt-token" | null,
  user: { id, email, name } | null,
  loading: boolean,
  
  setToken(token),
  setUser(user),
  logout(),
  initialize()  ← Called on app mount
})
```

### Chat Store (Zustand)
```
useChatStore({
  messages: [{ role, content }],
  loading: boolean,
  recruiterMode: boolean,
  
  addMessage(message),
  setLoading(boolean),
  setRecruiterMode(boolean),
  clearMessages()
})
```

---

## 🌐 API Endpoints

### Auth Service (Port 8001)
```
POST   /auth/signup
       Request: {email, password, name}
       Response: {access_token, user}

POST   /auth/login
       Request: {email, password}
       Response: {access_token, user}

GET    /auth/profile
       Headers: Authorization: Bearer {token}
       Response: {id, email, name}
```

### Chat Service (Port 8000)
```
GET    /health
       Response: {status, model, llm}

POST   /api/respond
       Headers: Authorization: Bearer {token}
       Request: {text, history, recruiter_mode}
       Response: {reply, intent, entities, latency_ms}
```

---

## 🔌 Technology Connections

```
┌──────────────────────────────────────────────────────────────┐
│                       FRONTEND                                │
│  React ←→ Next.js ←→ Tailwind CSS                             │
│     ↓                                                           │
│  Zustand (State)     Axios (HTTP)     js-cookie (Auth)       │
└──────┬───────────────────────────────────────────────────────┘
       │ HTTP/REST API
       │
┌──────▼───────────────────────────────────────────────────────┐
│                       BACKEND                                  │
│  FastAPI ←→ Uvicorn (ASGI)                                    │
│     ↓              ↓                    ↓                      │
│  Pydantic   PyJWT              OpenAI SDK                      │
│  (Validation) (Auth)           (LLM Integration)              │
│     ↓                           ↓                              │
│  Your NLU ←→ Your LLM ←→ GPT-4o-mini API                     │
│  (models.py)  (llm.py)  (openai.com)                          │
│                                                                │
│  Users Storage:                                                │
│  users.json (JSON file - replace with DB in production)      │
└────────────────────────────────────────────────────────────────┘
```

---

## 📈 Scaling Architecture (Future)

```
Currently:                      Production:
────────────                   ────────────

Frontend                       Frontend
  ↓ (Next.js)                    ↓
                              Vercel CDN
                              (Worldwide)

Auth Service                   Auth Service
  ↓ (FastAPI)                    ↓
  users.json                   PostgreSQL
                              (Managed)

Chat Service                   Chat Service
  ↓ (FastAPI)                    ↓
  OpenAI API                   OpenAI API
                              (with caching)
                                  ↓
                               Redis
                              (Message cache)
```

---

## 🚀 Deployment Topology

```
Local Development:
├── Frontend: localhost:3000
├── Auth: localhost:8001
└── Chat: localhost:8000

Docker Compose:
├── Frontend Container (Port 3000)
├── Backend Container (Ports 8000, 8001)
└── Shared Network

Cloud Deployment:
├── Vercel (Frontend)
├── Railway/Render (Auth Service)
└── Railway/Render (Chat Service)
    With environment variables & secrets
```

---

## 🎯 Security Model

```
Public Routes:
  /login     → Anyone can access
  /signup    → Anyone can access
  /health    → No auth needed

Protected Routes:
  /          → Requires valid token
  /auth/profile  → Requires valid token
  /api/respond   → Requires valid token

Token Storage:
  Browser Cookie → Secure, HTTPOnly
  Checked on every API request
  Verified by JWT on backend
  Auto-refreshed on page reload
```

---

## 🔧 Development Tools

```
Frontend Development:
├── VS Code
├── Next.js Dev Server (npm run dev)
├── React DevTools
└── Tailwind CSS IntelliSense

Backend Development:
├── VS Code
├── Python 3.11+
├── FastAPI auto-docs
│   ├── http://localhost:8000/docs
│   └── http://localhost:8001/docs
└── Uvicorn development server

Testing:
├── Frontend: Jest + React Testing Library
├── Backend: Pytest + httpx
└── Manual: Browser + API tools

Deployment:
├── Docker
├── Docker Compose
└── Cloud platforms (Vercel, Railway, etc.)
```

---

## 📊 Data Flow Summary

```
1. USER INITIATES ACTION
   ↓
2. FRONTEND CAPTURES INPUT
   ↓
3. FRONTEND ADDS JWT TOKEN
   ↓
4. SENDS TO BACKEND API
   ↓
5. BACKEND VALIDATES TOKEN
   ↓
6. BACKEND PROCESSES REQUEST
   ↓
7. BACKEND RETURNS RESPONSE
   ↓
8. FRONTEND UPDATES STATE
   ↓
9. FRONTEND RE-RENDERS UI
   ↓
10. USER SEES UPDATED PAGE
```

This architecture is:
✅ Secure (JWT tokens)
✅ Scalable (microservices)
✅ Modern (React, FastAPI)
✅ Maintainable (clean separation)
✅ Testable (all layers)
✅ Deployable (Docker ready)
