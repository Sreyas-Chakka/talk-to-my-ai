import os
from datetime import datetime, timedelta
from typing import Optional
import jwt
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import hashlib
import json
from pathlib import Path

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24  # 30 days

# Database file (simple JSON file for demo)
DATABASE_FILE = Path("users.json")

app = FastAPI(title="Auth Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3006", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class User(BaseModel):
    id: str
    email: str
    name: str
    password_hash: str

# Database helpers
def load_users():
    if DATABASE_FILE.exists():
        with open(DATABASE_FILE, "r") as f:
            return json.load(f)
    return {}

def save_users(users):
    with open(DATABASE_FILE, "w") as f:
        json.dump(users, f)

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, password_hash: str) -> bool:
    return hash_password(password) == password_hash

# JWT helpers
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(authorization: str = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Routes
@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/auth/signup", response_model=TokenResponse)
async def signup(request: SignupRequest):
    users = load_users()
    
    if request.email in users:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(hash(request.email))[:16]
    password_hash = hash_password(request.password)
    
    users[request.email] = {
        "id": user_id,
        "email": request.email,
        "name": request.name,
        "password_hash": password_hash,
    }
    save_users(users)
    
    access_token = create_access_token({"sub": request.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": request.email,
            "name": request.name,
        },
    }

@app.post("/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    users = load_users()
    
    if request.email not in users:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user = users[request.email]
    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token({"sub": request.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
        },
    }

@app.get("/auth/profile", response_model=UserResponse)
async def get_profile(authorization: str = Header(None)):
    payload = verify_token(authorization)
    email = payload.get("sub")
    
    users = load_users()
    if email not in users:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = users[email]
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
