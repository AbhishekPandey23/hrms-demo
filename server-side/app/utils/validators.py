import re
from typing import Optional

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_employee_id(employee_id: str) -> bool:
    """Validate employee ID format"""
    return len(employee_id.strip()) > 0

def generate_employee_id(last_id: Optional[str] = None) -> str:
    """Generate next employee ID"""
    if not last_id:
        return "EMP001"
    
    # Extract number from last ID (e.g., EMP001 -> 1)
    try:
        num = int(last_id.replace("EMP", ""))
        return f"EMP{num + 1:03d}"
    except:
        return "EMP001"
