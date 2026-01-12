import time
from typing import List
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from models import RespondRequest, RespondResponse, Settings, Latency, Reminder, CreateReminderRequest
from nlu import run_nlu
from llm import generate_reply
from reminders import (
    create_reminder, get_reminders, get_due_reminders,
    complete_reminder, delete_reminder
)
from time_parser import parse_natural_time

settings = Settings()

app = FastAPI(title="Talk to My AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "model": settings.model_name, "llm": bool(settings.openai_api_key)}


@app.post("/api/respond", response_model=RespondResponse)
async def respond(payload: RespondRequest):
    total_start = time.perf_counter()

    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty text provided")

    # NLU
    nlu_start = time.perf_counter()
    intent, entities, nlu_trace = run_nlu(text)
    nlu_ms = int((time.perf_counter() - nlu_start) * 1000)

    # LLM
    reply, llm_ms, llm_trace = await generate_reply(
        text,
        payload.history or [],
        payload.recruiter_mode,
        settings,
        task=payload.task,
    )

    # Handle reminder creation if intent is reminder
    reminder_id = None
    if intent.label == "reminder":
        # Extract time from entities or parse from text
        time_str = entities.get("time", text)
        reminder_time = parse_natural_time(time_str)
        
        if reminder_time:
            # Extract title from text (remove time phrases)
            title = text
            for time_phrase in ["tomorrow", "today", "next week", "next month"]:
                title = title.replace(time_phrase, "")
            title = title.replace("remind me to", "").replace("remind me", "").strip()
            
            # Use a default user_id for now (in production, get from auth)
            user_id = "default_user"
            reminder_id = create_reminder(user_id, title, reminder_time, description=text)
            reply = f"✓ Reminder set for {reminder_time.strftime('%B %d at %I:%M %p')}: {title}"

    total_ms = int((time.perf_counter() - total_start) * 1000)

    tool_trace = []
    tool_trace.extend(nlu_trace)
    tool_trace.extend(llm_trace)
    tool_trace.append(f"recruiter_mode={payload.recruiter_mode}")
    if payload.task:
        tool_trace.append(f"task={payload.task}")
    tool_trace.append(f"entities={entities}")
    if reminder_id:
        tool_trace.append(f"reminder_created={reminder_id}")

    latency = Latency(nlu=nlu_ms, llm=llm_ms, total=total_ms)

    return RespondResponse(
        reply=reply,
        intent=intent,
        entities=entities,
        tool_trace=tool_trace,
        latency_ms=latency,
        reminder_id=reminder_id,
    )


@app.get("/api/reminders", response_model=List[Reminder])
async def list_reminders(user_id: str = "default_user"):
    """Get all reminders for the current user"""
    reminders = get_reminders(user_id)
    return reminders


@app.get("/api/reminders/due", response_model=List[Reminder])
async def list_due_reminders(user_id: str = "default_user"):
    """Get reminders that are currently due"""
    reminders = get_due_reminders(user_id)
    return reminders


@app.post("/api/reminders", response_model=Reminder)
async def create_reminder_endpoint(reminder: CreateReminderRequest, user_id: str = "default_user"):
    """Create a new reminder manually"""
    from datetime import datetime
    reminder_time = datetime.fromisoformat(reminder.reminder_time)
    reminder_id = create_reminder(user_id, reminder.title, reminder_time, reminder.description)
    
    reminders = get_reminders(user_id)
    created = next((r for r in reminders if r["id"] == reminder_id), None)
    if not created:
        raise HTTPException(status_code=500, detail="Failed to create reminder")
    
    return created


@app.patch("/api/reminders/{reminder_id}/complete")
async def complete_reminder_endpoint(reminder_id: int, user_id: str = "default_user"):
    """Mark a reminder as completed"""
    success = complete_reminder(reminder_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return {"success": True}


@app.delete("/api/reminders/{reminder_id}")
async def delete_reminder_endpoint(reminder_id: int, user_id: str = "default_user"):
    """Delete a reminder"""
    success = delete_reminder(reminder_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return {"success": True}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
