# Deployment Guide

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm

### Quick Start (Automated)
```bash
chmod +x setup.sh
./setup.sh
```

Then follow the instructions in 3 separate terminals.

### Manual Setup

**Terminal 1 - Auth Service**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python auth.py
```

**Terminal 2 - Chatbot Service**:
```bash
cd backend
source venv/bin/activate
python main.py
```

**Terminal 3 - Frontend**:
```bash
cd frontend
npm install
npm run dev
```

Visit: `http://localhost:3000`

---

## Docker Deployment

### Using Docker Compose (Easiest)

1. **Create `.env` file** in root directory:
   ```
   OPENAI_API_KEY=sk-your-key
   SECRET_KEY=your-secret-key
   ```

2. **Start all services**:
   ```bash
   docker-compose up --build
   ```

3. **Access the app**:
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:8000`
   - Auth: `http://localhost:8001`

4. **Stop services**:
   ```bash
   docker-compose down
   ```

### Individual Docker Images

**Backend**:
```bash
cd backend
docker build -t voice-demo-backend .
docker run -p 8000:8000 -p 8001:8001 \
  -e OPENAI_API_KEY=sk-your-key \
  -e SECRET_KEY=your-secret \
  voice-demo-backend
```

**Frontend**:
```bash
cd frontend
docker build -t voice-demo-frontend .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8000 \
  -e NEXT_PUBLIC_AUTH_URL=http://localhost:8001 \
  voice-demo-frontend
```

---

## Cloud Deployment

### Frontend on Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select `frontend` as root directory
   - Add environment variables:
     - `NEXT_PUBLIC_API_URL=https://your-backend.com`
     - `NEXT_PUBLIC_AUTH_URL=https://your-auth.com`
   - Deploy

### Backend on Railway

1. **Push backend to separate GitHub repo** or use GitHub action

2. **Connect to Railway**:
   - Go to [railway.app](https://railway.app)
   - Create new project
   - Connect GitHub repo
   - Select Python environment
   - Add environment variables:
     - `OPENAI_API_KEY=sk-...`
     - `SECRET_KEY=your-secret`
   - Deploy

3. **Update frontend environment variables** with Railway URLs

### Backend on Render

1. **Create account** at [render.com](https://render.com)

2. **Create new Web Service**:
   - Connect GitHub repo
   - Select Python environment
   - Build command: `pip install -r requirements.txt`
   - Start command: `python main.py`
   - Add environment variables
   - Deploy

3. **Create second service** for auth.py similarly

### Backend on Heroku

1. **Install Heroku CLI**:
   ```bash
   brew tap heroku/brew && brew install heroku
   heroku login
   ```

2. **Create app**:
   ```bash
   cd backend
   heroku create your-app-name
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set OPENAI_API_KEY=sk-your-key
   heroku config:set SECRET_KEY=your-secret
   ```

4. **Create Procfile**:
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   worker: python auth.py
   ```

5. **Deploy**:
   ```bash
   git push heroku main
   ```

---

## Production Best Practices

### Security
- ✅ Change `SECRET_KEY` in production
- ✅ Use strong, random JWT secret
- ✅ Use HTTPS only in production
- ✅ Set CORS to specific domains only
- ✅ Store sensitive data in environment variables
- ✅ Use rate limiting on auth endpoints
- ✅ Implement CSRF protection

### Performance
- ✅ Enable gzip compression
- ✅ Use CDN for static assets
- ✅ Cache responses where appropriate
- ✅ Monitor API response times
- ✅ Use connection pooling

### Monitoring
- ✅ Set up error logging
- ✅ Monitor API latency
- ✅ Track authentication failures
- ✅ Monitor resource usage
- ✅ Set up alerts for critical errors

### Database (For Production)
Replace JSON file storage with:
- PostgreSQL
- MongoDB
- Firebase
- AWS DynamoDB

Example with PostgreSQL:
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
```

---

## Troubleshooting Deployment

### CORS Errors
Update `allowed_origins` in both `main.py` and `auth.py`:
```python
allow_origins=[
    "https://your-frontend.vercel.app",
    "https://your-api.railway.app",
    "https://your-auth.railway.app"
]
```

### Backend Connection Refused
- Check that backend URLs are correct in `.env`
- Ensure backend services are running
- Check firewall/network settings

### Token Expiration Issues
Adjust token expiration in `auth.py`:
```python
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24  # Days
```

### Database Issues
Use managed databases:
- **PostgreSQL**: Railway, Render, AWS RDS
- **MongoDB**: Atlas
- **Firebase**: Google Cloud

---

## Monitoring & Maintenance

### Health Checks
```bash
curl https://your-backend.com/health
curl https://your-auth.com/health
```

### Logs
- **Vercel**: Dashboard > Deployments > Logs
- **Railway**: Railway Dashboard > Logs
- **Render**: Render Dashboard > Service > Logs
- **Heroku**: `heroku logs --tail`

### Updates
Keep dependencies updated:
```bash
# Backend
pip list --outdated
pip install --upgrade package-name

# Frontend
npm outdated
npm update
```

---

## Scaling

As you grow:
1. Move to dedicated database (PostgreSQL/MongoDB)
2. Add message caching (Redis)
3. Use message queue (Bull, Celery)
4. Implement rate limiting
5. Add session management
6. Monitor and optimize hotspots
