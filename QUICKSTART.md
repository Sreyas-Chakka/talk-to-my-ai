# Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Create Backend Environment
```bash
# Create .env file in backend directory
OPENAI_API_KEY=sk-your-key-here
SECRET_KEY=your-secret-key
```

### Step 3: Install Frontend Dependencies
```bash
cd frontend
npm install
```

### Step 4: Start Services (3 Terminals)

**Terminal 1 - Auth Service**:
```bash
cd backend
python auth.py
# Visit: http://localhost:8001/docs
```

**Terminal 2 - Chatbot Service**:
```bash
cd backend
python main.py
# Visit: http://localhost:8000/docs
```

**Terminal 3 - Frontend**:
```bash
cd frontend
npm run dev
# Visit: http://localhost:3000
```

### Step 5: Login or Sign Up
- **Option 1**: Create new account on signup page
- **Option 2**: Use demo credentials
  - Email: `test@example.com`
  - Password: `password123`

---

## 🎨 What You Get

### Login/Signup Pages
- Beautiful gradient design
- Form validation
- Error messages
- Smooth transitions

### Chat Interface
- Real-time messaging
- Auto-scrolling
- Loading indicators
- Recruiter mode toggle
- User profile
- Logout button

### Features Included
✅ JWT Authentication
✅ Message History
✅ Recruiter Mode
✅ Intent Detection
✅ Entity Recognition
✅ Performance Metrics
✅ Error Handling
✅ Responsive Design
✅ Modern UI/UX
✅ Production Ready

---

## 📁 Project Structure

```
voice-demo/
├── backend/
│   ├── auth.py          ← Authentication service (8001)
│   ├── main.py          ← Chat service (8000)
│   ├── llm.py           ← LLM integration
│   ├── nlu.py           ← NLU processing
│   ├── models.py        ← Data models
│   ├── requirements.txt  ← Python dependencies
│   └── users.json       ← User database (auto-created)
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx     ← Home/chat page
│   │   ├── login/       ← Login page
│   │   ├── signup/      ← Signup page
│   │   └── globals.css  ← Styles
│   ├── components/      ← React components
│   ├── lib/             ← Utilities & API
│   └── package.json     ← NPM dependencies
│
├── README.md            ← Overview
├── DEPLOYMENT.md        ← Deploy to cloud
├── FRONTEND_SETUP.md    ← Frontend details
└── setup.sh             ← Automated setup
```

---

## 🔧 Configuration

### Backend Environment Variables
Create `backend/.env`:
```
OPENAI_API_KEY=sk-your-api-key
SECRET_KEY=your-very-secret-key
MODEL_NAME=gpt-4o-mini
MAX_TOKENS=350
```

### Frontend Environment Variables
Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_AUTH_URL=http://localhost:8001
```

---

## 🔑 Authentication Flow

1. User enters email/password on login/signup page
2. Frontend sends to auth service (port 8001)
3. Auth service validates and returns JWT token
4. Token stored in browser cookies
5. All chat requests include token in header
6. Token verified on each request
7. Token persists on page refresh

---

## 💬 Chat Flow

1. User types message and clicks send
2. Message added to local store
3. Request sent to chat API with message history
4. Backend processes through NLU + LLM
5. Response includes reply, intent, entities
6. Assistant message displayed in chat
7. Everything stays in browser (session-based)

---

## 🎯 Key Features

### Recruiter Mode
Toggle on/off in chat header to switch between:
- **Normal**: General assistance
- **Recruiter**: Focused on recruiting/interviews

### Intent Detection
Automatically detects user intent:
- `availability` - Schedule/availability questions
- `technical` - Technical questions
- `greeting` - Greetings
- `etc.` - Other intents

### Entity Recognition
Extracts key information:
- Times and dates
- Location names
- Person names
- Technical terms
- etc.

### Performance Metrics
Shows timing for:
- NLU processing
- LLM response generation
- Total response time

---

## 🚀 Development Commands

### Backend
```bash
cd backend

# Run auth service
python auth.py

# Run chat service
python main.py

# View API docs (after starting service)
# http://localhost:8001/docs  (auth)
# http://localhost:8000/docs  (chat)
```

### Frontend
```bash
cd frontend

# Development
npm run dev

# Build
npm run build

# Production
npm start

# Lint
npm run lint
```

---

## 🐛 Troubleshooting

### "Cannot connect to server"
- Check all 3 services are running
- Verify port numbers: 3000, 8000, 8001
- Check firewall settings

### "CORS Error"
- Ensure CORS is enabled in both backend services
- Check `allowed_origins` in `main.py` and `auth.py`

### "Token expired"
- Log out and log back in
- Token expires after 30 days
- Adjust `ACCESS_TOKEN_EXPIRE_MINUTES` in `auth.py`

### "Module not found"
- Backend: `pip install -r requirements.txt`
- Frontend: `npm install`

### "Port already in use"
- Change port in:
  - `auth.py`: `uvicorn.run(app, port=8001)`
  - `main.py`: `uvicorn.run(app, port=8000)`
  - Frontend: `npm run dev -- -p 3000`

---

## 📚 Learn More

- **Frontend Guide**: See `FRONTEND_SETUP.md`
- **Backend API**: See `BACKEND_API.md`
- **Components**: See `frontend/COMPONENTS.md`
- **Deployment**: See `DEPLOYMENT.md`
- **Full README**: See `README.md`

---

## 🎯 Next Steps

1. ✅ Run the app locally
2. ✅ Test login/signup
3. ✅ Send messages
4. ✅ Try recruiter mode
5. ✅ Add OpenAI API key (optional)
6. ✅ Deploy to cloud (see DEPLOYMENT.md)

---

## 💡 Pro Tips

### Adding OpenAI Integration
1. Get API key from https://platform.openai.com/api-keys
2. Add to `backend/.env`: `OPENAI_API_KEY=sk-...`
3. Restart backend services
4. Now LLM will use real OpenAI responses

### Customizing Appearance
- Edit colors in `frontend/tailwind.config.js`
- Change fonts in `frontend/app/globals.css`
- Modify component styles directly in components

### Scaling to Production
1. Set strong `SECRET_KEY` in production
2. Use real database (PostgreSQL, MongoDB)
3. Deploy frontend to Vercel
4. Deploy backend to Railway/Render
5. Set up monitoring and logging
6. Enable HTTPS everywhere
7. Update CORS to specific domains

---

## 📞 Support

**Common URLs**:
- App: http://localhost:3000
- Chat API Docs: http://localhost:8000/docs
- Auth API Docs: http://localhost:8001/docs

**File Structure Reminders**:
- Frontend code is in `/frontend` folder
- Backend code is in `/backend` folder
- Config files in root directory
- Each has its own `package.json` / `requirements.txt`

---

## 🎉 You're All Set!

You now have a complete, production-ready voice demo application with:
- ✅ Beautiful frontend with React/Next.js
- ✅ Secure authentication with JWT
- ✅ FastAPI backend with NLU/LLM
- ✅ Message history
- ✅ Recruiter mode
- ✅ Docker support
- ✅ Cloud deployment ready

Happy coding! 🚀
