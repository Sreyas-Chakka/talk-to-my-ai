import re
from typing import Dict, List, Tuple
from models import Intent

INTENT_KEYWORDS = {
    "greeting": ["hello", "hi", "hey", "good morning", "good evening"],
    "qa": ["what is", "explain", "how do", "why"],
    "reminder": ["remind", "follow up", "schedule", "ping", "set a reminder"],
    "open_app": ["open", "launch", "go to", "pull up", "show"],
    "summarize": ["summarize", "tl;dr", "recap"],
    "code_help": ["code", "bug", "error", "stack", "pull request", "deploy", "race condition"],
}

DEFAULT_INTENT = "unknown"


TIME_PATTERNS = [
    r"\b(?:today|tomorrow|next week|next month|next monday|next tuesday|next wednesday|next thursday|next friday)\b",
    r"\b(?:monday|tuesday|wednesday|thursday|friday)\b",
    r"\b(?:\d{1,2}:\d{2}\s?(?:am|pm)?)\b",
    r"\b(?:in \d+ (?:minutes|hours|days|weeks))\b",
]

APP_NAMES = ["linkedin", "calendly", "gmail", "slack", "notion", "jira"]
TOPIC_KEYWORDS = ["race condition", "resume", "interview", "offer", "salary", "voice assistant"]


def detect_intent(text: str) -> Tuple[str, float, List[str]]:
    lowered = text.lower()
    scores: Dict[str, int] = {}
    trace: List[str] = []

    for intent, keywords in INTENT_KEYWORDS.items():
        scores[intent] = sum(1 for kw in keywords if kw in lowered)
        if scores[intent] > 0:
            trace.append(f"intent_hit:{intent}:{scores[intent]}")

    if not any(scores.values()):
        return DEFAULT_INTENT, 0.2, trace

    best_intent = max(scores, key=scores.get)
    total_hits = sum(scores.values()) or 1
    confidence = min(0.9, 0.4 + (scores[best_intent] / total_hits))
    return best_intent, confidence, trace


def extract_entities(text: str) -> Dict[str, str]:
    entities: Dict[str, str] = {}
    lowered = text.lower()

    # Time phrases
    for pattern in TIME_PATTERNS:
        match = re.search(pattern, lowered)
        if match:
            entities.setdefault("time", match.group())
            break

    # App names
    for app in APP_NAMES:
        if app in lowered:
            entities.setdefault("app", app)
            break

    # Topics
    for topic in TOPIC_KEYWORDS:
        if topic in lowered:
            entities.setdefault("topic", topic)
            break

    # Date-like patterns
    date_match = re.search(r"\b\d{4}-\d{2}-\d{2}\b", text)
    if date_match:
        entities.setdefault("date", date_match.group())

    return entities


def run_nlu(text: str) -> Tuple[Intent, Dict[str, str], List[str]]:
    intent_label, confidence, trace = detect_intent(text)
    entities = extract_entities(text)
    intent = Intent(label=intent_label, confidence=round(confidence, 3))
    return intent, entities, trace
