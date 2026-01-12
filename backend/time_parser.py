from datetime import datetime, timedelta
import re
from typing import Optional


def parse_natural_time(text: str) -> Optional[datetime]:
    """
    Parse natural language time expressions into datetime objects.
    Examples:
    - "tomorrow at 2pm" -> tomorrow at 14:00
    - "next monday" -> next monday at 09:00
    - "in 3 hours" -> current time + 3 hours
    - "january 15 at 3:30pm" -> Jan 15 at 15:30
    """
    text = text.lower().strip()
    now = datetime.now()
    
    # "in X minutes/hours/days/weeks"
    match = re.search(r'in (\d+)\s*(minute|hour|day|week)s?', text)
    if match:
        amount = int(match.group(1))
        unit = match.group(2)
        
        if unit == 'minute':
            return now + timedelta(minutes=amount)
        elif unit == 'hour':
            return now + timedelta(hours=amount)
        elif unit == 'day':
            return now + timedelta(days=amount)
        elif unit == 'week':
            return now + timedelta(weeks=amount)
    
    # Extract time if present (e.g., "2pm", "14:30", "3:45 pm")
    time_match = re.search(r'(\d{1,2})(?::(\d{2}))?\s*(am|pm)?', text)
    target_hour = 9  # default to 9am
    target_minute = 0
    
    if time_match:
        hour = int(time_match.group(1))
        minute = int(time_match.group(2)) if time_match.group(2) else 0
        meridiem = time_match.group(3)
        
        if meridiem == 'pm' and hour != 12:
            hour += 12
        elif meridiem == 'am' and hour == 12:
            hour = 0
        
        target_hour = hour
        target_minute = minute
    
    # "tomorrow"
    if 'tomorrow' in text:
        target = now + timedelta(days=1)
        return target.replace(hour=target_hour, minute=target_minute, second=0, microsecond=0)
    
    # "today"
    if 'today' in text:
        target = now.replace(hour=target_hour, minute=target_minute, second=0, microsecond=0)
        if target < now:  # if time already passed today, assume tomorrow
            target += timedelta(days=1)
        return target
    
    # Days of the week
    weekdays = {
        'monday': 0, 'tuesday': 1, 'wednesday': 2, 'thursday': 3,
        'friday': 4, 'saturday': 5, 'sunday': 6
    }
    
    for day_name, day_num in weekdays.items():
        if day_name in text:
            days_ahead = day_num - now.weekday()
            if days_ahead <= 0:  # Target day already happened this week
                days_ahead += 7
            target = now + timedelta(days=days_ahead)
            return target.replace(hour=target_hour, minute=target_minute, second=0, microsecond=0)
    
    # "next week", "next month"
    if 'next week' in text:
        target = now + timedelta(weeks=1)
        return target.replace(hour=target_hour, minute=target_minute, second=0, microsecond=0)
    
    if 'next month' in text:
        # Approximate next month as +30 days
        target = now + timedelta(days=30)
        return target.replace(hour=target_hour, minute=target_minute, second=0, microsecond=0)
    
    # Specific date patterns (e.g., "january 15", "jan 15")
    month_names = {
        'january': 1, 'jan': 1, 'february': 2, 'feb': 2, 'march': 3, 'mar': 3,
        'april': 4, 'apr': 4, 'may': 5, 'june': 6, 'jun': 6,
        'july': 7, 'jul': 7, 'august': 8, 'aug': 8, 'september': 9, 'sep': 9,
        'october': 10, 'oct': 10, 'november': 11, 'nov': 11, 'december': 12, 'dec': 12
    }
    
    for month_name, month_num in month_names.items():
        pattern = rf'{month_name}\s+(\d{{1,2}})'
        match = re.search(pattern, text)
        if match:
            day = int(match.group(1))
            year = now.year
            # If the date has passed this year, assume next year
            try:
                target = datetime(year, month_num, day, target_hour, target_minute)
                if target < now:
                    target = datetime(year + 1, month_num, day, target_hour, target_minute)
                return target
            except ValueError:
                continue
    
    # ISO date format "2026-01-15"
    iso_match = re.search(r'(\d{4})-(\d{2})-(\d{2})', text)
    if iso_match:
        year, month, day = map(int, iso_match.groups())
        try:
            return datetime(year, month, day, target_hour, target_minute)
        except ValueError:
            pass
    
    # Default: if we couldn't parse, return tomorrow at 9am
    return (now + timedelta(days=1)).replace(hour=9, minute=0, second=0, microsecond=0)
