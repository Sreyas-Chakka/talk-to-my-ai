import sqlite3
from datetime import datetime
from typing import List, Optional, Dict
from pathlib import Path

DB_PATH = Path(__file__).parent / "reminders.db"


def init_db():
    """Initialize the reminders database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            reminder_time TEXT NOT NULL,
            created_at TEXT NOT NULL,
            completed INTEGER DEFAULT 0
        )
    """)
    
    conn.commit()
    conn.close()


def create_reminder(user_id: str, title: str, reminder_time: datetime, description: str = "") -> int:
    """Create a new reminder"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO reminders (user_id, title, description, reminder_time, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (user_id, title, description, reminder_time.isoformat(), datetime.now().isoformat()))
    
    reminder_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return reminder_id


def get_reminders(user_id: str, include_completed: bool = False) -> List[Dict]:
    """Get all reminders for a user"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    if include_completed:
        cursor.execute("""
            SELECT * FROM reminders 
            WHERE user_id = ? 
            ORDER BY reminder_time ASC
        """, (user_id,))
    else:
        cursor.execute("""
            SELECT * FROM reminders 
            WHERE user_id = ? AND completed = 0 
            ORDER BY reminder_time ASC
        """, (user_id,))
    
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]


def get_due_reminders(user_id: str) -> List[Dict]:
    """Get reminders that are due (past current time and not completed)"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    now = datetime.now().isoformat()
    cursor.execute("""
        SELECT * FROM reminders 
        WHERE user_id = ? AND completed = 0 AND reminder_time <= ?
        ORDER BY reminder_time ASC
    """, (user_id, now))
    
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]


def complete_reminder(reminder_id: int, user_id: str) -> bool:
    """Mark a reminder as completed"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE reminders 
        SET completed = 1 
        WHERE id = ? AND user_id = ?
    """, (reminder_id, user_id))
    
    success = cursor.rowcount > 0
    conn.commit()
    conn.close()
    
    return success


def delete_reminder(reminder_id: int, user_id: str) -> bool:
    """Delete a reminder"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        DELETE FROM reminders 
        WHERE id = ? AND user_id = ?
    """, (reminder_id, user_id))
    
    success = cursor.rowcount > 0
    conn.commit()
    conn.close()
    
    return success


# Initialize DB on import
init_db()
