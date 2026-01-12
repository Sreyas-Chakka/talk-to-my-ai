# Backend API Documentation

## Endpoints

### Chatbot API (Port 8000)

#### Health Check
```
GET /health
```
Returns server status and model information.

**Response**:
```json
{
  "status": "ok",
  "model": "gpt-4o-mini",
  "llm": true
}
```

#### Send Message
```
POST /api/respond
```

**Request Body**:
```json
{
  "text": "What is your availability?",
  "history": [
    {
      "role": "user",
      "content": "Hi there"
    },
    {
      "role": "assistant",
      "content": "Hello! How can I help?"
    }
  ],
  "recruiter_mode": true
}
```

**Response**:
```json
{
  "reply": "I'm available Monday through Friday, 9 AM to 5 PM EST.",
  "intent": {
    "label": "availability",
    "confidence": 0.92
  },
  "entities": {
    "time": "9 AM to 5 PM EST",
    "days": "Monday-Friday"
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

### Auth API (Port 8001)

#### Health Check
```
GET /health
```

#### Sign Up
```
POST /auth/signup
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "abc123def456",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### Login
```
POST /auth/login
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response**: Same as signup response

#### Get Profile
```
GET /auth/profile
Authorization: Bearer {access_token}
```

**Response**:
```json
{
  "id": "abc123def456",
  "email": "user@example.com",
  "name": "John Doe"
}
```

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

**Common Errors**:
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Invalid credentials or token
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## CORS

Both services have CORS enabled for:
- `http://localhost:3000`
- `http://localhost:3006`
- `*` (all origins in development)

Configure in respective `main.py` files.
