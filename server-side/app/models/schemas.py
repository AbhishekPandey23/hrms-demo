from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime
from typing import Optional, Literal, List, TYPE_CHECKING

# Employee Schemas
class EmployeeBase(BaseModel):
    employee_id: str = Field(..., min_length=1, max_length=50, description="Unique employee ID")
    full_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    department: str = Field(..., min_length=1, max_length=50)

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeResponse(EmployeeBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Attendance Schemas (moved before EmployeeWithStats to avoid forward reference)
class AttendanceBase(BaseModel):
    employee_id: str
    date: date
    status: Literal["PRESENT", "ABSENT"]

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceResponse(AttendanceBase):
    id: str
    created_at: datetime
    updated_at: datetime
    employee: Optional[EmployeeResponse] = None
    
    class Config:
        from_attributes = True

# Employee with stats (after AttendanceResponse is defined)
class EmployeeWithStats(EmployeeResponse):
    total_present: int = 0
    total_absent: int = 0
    attendance_percentage: float = 0.0
    attendances: List[AttendanceResponse] = []

# Dashboard Schemas
class DashboardStats(BaseModel):
    total_employees: int
    present_today: int
    absent_today: int
    not_marked_attendance: int
    total_departments: int

# Generic Response Schemas
class SuccessResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    errors: Optional[dict] = None
