from typing import Dict, List, Optional, Literal
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class RespondRequest(BaseModel):
    text: str = Field(..., min_length=1)
    history: Optional[List[Message]] = Field(default_factory=list)
    recruiter_mode: bool = True
    task: Optional[str] = None


class Intent(BaseModel):
    label: str
    confidence: float


class Latency(BaseModel):
    nlu: int
    llm: int
    total: int


class RespondResponse(BaseModel):
    reply: str
    intent: Intent
    entities: Dict[str, str]
    tool_trace: List[str]
    latency_ms: Latency
    reminder_id: Optional[int] = None


class Reminder(BaseModel):
    id: int
    user_id: str
    title: str
    description: Optional[str] = ""
    reminder_time: str
    created_at: str
    completed: int


class CreateReminderRequest(BaseModel):
    title: str
    description: Optional[str] = ""
    reminder_time: str


class Settings(BaseSettings):
    openai_api_key: Optional[str] = None
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:3006",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3006",
    ]
    model_name: str = "gpt-4o-mini"
    max_tokens: int = 350

    class Config:
        env_file = ".env"
        env_prefix = ""
