# Talk to My AI 🤖

A full-stack AI-powered virtual assistant and recruitment tool suite built with Next.js, FastAPI, and OpenAI.

## Features

### 🎙️ Virtual Assistant
- Voice-first interaction with animated avatar
- Speech-to-text and text-to-speech capabilities
- Real-time conversation with OpenAI GPT-4o-mini
- Dark mode support
- Chat history and export functionality
- Reminder system with notifications

### 🧰 Career Tools
- **Cover Letter Generator**: Create tailored cover letters for specific roles and companies
- **Resume Review**: Get AI-powered feedback on your resume
- **Mock Interview**: Practice interviews with AI-generated questions and feedback
- **Message Templates**: Generate networking and outreach message templates

## Tech Stack

### Frontend
- **Next.js 14** with TypeScript
- **Tailwind CSS** for styling
- **Clerk** for authentication
- **Zustand** for state management
- **Web Speech API** for voice features
- **Axios** for API communication

### Backend
- **FastAPI** with Python
- **OpenAI API** (GPT-4o-mini)
- **SQLite** for reminders
- **Pydantic** for data validation
- **Uvicorn** as ASGI server

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- OpenAI API key
- Clerk account (for authentication)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Sreyas-Chakka/talk-to-my-ai.git
cd talk-to-my-ai
```

2. Set up the backend:
```bash
cd backend
python -m venv ../.venv
source ../.venv/bin/activate  # On Windows: ..\.venv\Scripts\activate
pip install -r requirements.txt

# Copy and configure environment variables
cp .env.example .env
# Edit .env and add your OpenAI API key
```

3. Set up the frontend:
```bash
cd ../frontend
npm install

# Copy and configure environment variables
cp .env.local.example .env.local
# Edit .env.local and add your Clerk keys and API URL
```

### Running the Application

1. Start the backend (from the `backend` directory):
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

2. Start the frontend (from the `frontend` directory):
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Environment Variables

### Backend (`backend/.env`)
```env
OPENAI_API_KEY=sk-...
MODEL_NAME=gpt-4o-mini
MAX_TOKENS=350
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

## Project Structure

```
talk-to-my-ai/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── llm.py               # OpenAI integration
│   ├── models.py            # Pydantic models
│   ├── nlu.py               # Natural language understanding
│   ├── reminders.py         # Reminder system
│   ├── time_parser.py       # Natural time parsing
│   └── requirements.txt
├── frontend/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   │   ├── VirtualAssistant.tsx
│   │   ├── RecruitmentAssistant.tsx
│   │   └── recruitment/     # Career tool components
│   ├── lib/                 # Utilities
│   │   ├── api.ts           # API client
│   │   ├── voice.ts         # Voice features
│   │   └── store.ts         # State management
│   └── package.json
└── README.md
```

## Features in Detail

### Voice Interaction
- **Microphone**: Tap to speak and convert speech to text
- **Auto-speak**: Assistant automatically speaks responses
- **Stop**: Stop speaking at any time
- Browser-based Web Speech API (no external dependencies)

### Recruitment Tools
All tools use the same OpenAI API key with task-specific prompts:
- **Cover Letter**: Input role, company, highlights, and job description
- **Resume Review**: Paste your resume for AI-powered feedback
- **Mock Interview**: Interactive Q&A with feedback after each answer
- **Message Templates**: Generate multiple outreach message variants

### Reminders
- Natural language time parsing ("tomorrow at 3pm")
- Browser notifications for due reminders
- CRUD operations via API

## API Endpoints

### Chat
- `POST /api/respond` - Send message and get AI response
- `GET /health` - Health check with model status

### Reminders
- `GET /api/reminders` - List all reminders
- `GET /api/reminders/due` - Get due reminders
- `POST /api/reminders` - Create reminder
- `PATCH /api/reminders/{id}/complete` - Mark complete
- `DELETE /api/reminders/{id}` - Delete reminder

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Author

Sreyas Chakka - [GitHub](https://github.com/Sreyas-Chakka)
