import time
from typing import List, Tuple, Optional
from openai import OpenAI, OpenAIError
from models import Message, Settings

SYSTEM_PROMPT = """You are a concise, helpful AI assistant for recruiters. \
Keep replies to 1-3 short paragraphs. If asked for steps, keep them concise. \
When explaining technical topics, use approachable language."""

TASK_PROMPTS = {
    "mock_interview": (
        "You are conducting a mock interview. Ask one question at a time, wait for an answer, then provide brief feedback (2-3 bullets) and the next question. Maintain a professional tone."
    ),
    "cover_letter": (
        "You are drafting a tailored cover letter using provided inputs (role, company, job description, highlights). Output a ready-to-send letter with greeting, 3 short paragraphs (fit, impact, alignment), and a closing with a call to action."
    ),
    "resume_review": (
        "You are reviewing a resume. Provide concise feedback in bullets: strengths, improvements, and suggested accomplishment-driven bullet rewrites using metrics and action verbs."
    ),
    "message_templates": (
        "You are creating outreach templates (networking, recruiter reach-out, referral ask). Provide 2-3 short variants tailored to the role/company with placeholders for personalization."
    ),
}


async def generate_reply(
    text: str,
    history: List[Message],
    recruiter_mode: bool,
    settings: Settings,
    task: Optional[str] = None,
) -> Tuple[str, int, List[str]]:
    start = time.perf_counter()
    tool_trace: List[str] = []
    model_used = "fallback"

    if settings.openai_api_key:
        client = OpenAI(api_key=settings.openai_api_key)
        msgs = [{"role": "system", "content": SYSTEM_PROMPT}]
        if task and task in TASK_PROMPTS:
            msgs.append({"role": "system", "content": TASK_PROMPTS[task]})
        for m in history:
            msgs.append({"role": m.role, "content": m.content})
        msgs.append({"role": "user", "content": text})

        if recruiter_mode:
            msgs.append({"role": "system", "content": "You are in recruiter mode: keep it outcome-focused and non-technical."})

        try:
            resp = client.chat.completions.create(
                model=settings.model_name,
                messages=msgs,
                max_tokens=settings.max_tokens,
                temperature=0.6,
            )
            reply = resp.choices[0].message.content or ""
            model_used = settings.model_name
            tool_trace.append(f"llm:model={model_used}")
            if task:
                tool_trace.append(f"task={task}")
        except OpenAIError as e:
            reply = (
                "LLM unavailable right now. Here's a quick fallback: "
                "I can summarize requests, draft outreach, and answer tech questions in plain language."
            )
            tool_trace.append(f"llm:error={type(e).__name__}")
    else:
        reply = (
            "(Offline demo) I understood your request. I can summarize, set reminders, "
            "or explain topics simply. Ask me about scheduling an interview or clarifying a concept."
        )
        tool_trace.append("llm:fallback=offline")

    llm_ms = int((time.perf_counter() - start) * 1000)
    tool_trace.append(f"latency_llm_ms={llm_ms}")
    tool_trace.append(f"model_used={model_used}")
    return reply.strip(), llm_ms, tool_trace
