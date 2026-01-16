from fastapi import APIRouter, HTTPException, status
from app.database import db
from app.models.schemas import DashboardStats, EmployeeResponse
from datetime import date, datetime
from typing import List

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        # Total employees
        total_employees = await db.employee.count()
        
        # Today's attendance
        today = date.today()
        # Convert to datetime at midnight to match storage format
        today_datetime = datetime.combine(today, datetime.min.time())
        
        today_attendance = await db.attendance.find_many(
            where={"date": today_datetime}
        )
        
        present_today = sum(1 for att in today_attendance if att.status == "PRESENT")
        absent_today = sum(1 for att in today_attendance if att.status == "ABSENT")
        
        # Calculate not marked (Total - Marked)
        not_marked_attendance = total_employees - (present_today + absent_today)
        
        # Total departments (unique count)
        employees = await db.employee.find_many()
        departments = set(emp.department for emp in employees)
        total_departments = len(departments)
        
        return DashboardStats(
            total_employees=total_employees,
            present_today=present_today,
            absent_today=absent_today,
            not_marked_attendance=not_marked_attendance,
            total_departments=total_departments
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard stats: {str(e)}"
        )

@router.get("/not-marked", response_model=List[EmployeeResponse])
async def get_not_marked_employees():
    """Get list of employees who haven't marked attendance today"""
    try:
        from app.models.schemas import EmployeeResponse
        
        today = date.today()
        # Get all employees
        all_employees = await db.employee.find_many()
        
        # Get employees who have marked attendance today
        today_attendance = await db.attendance.find_many(
            where={
                "date": datetime.combine(today, datetime.min.time())
            }
        )
        
        marked_employee_ids = set(att.employeeId for att in today_attendance)
        
        # Filter employees
        not_marked_employees = [
            emp for emp in all_employees 
            if emp.id not in marked_employee_ids
        ]
        
        return [
            EmployeeResponse(
                id=emp.id,
                employee_id=emp.employeeId,
                full_name=emp.fullName,
                email=emp.email,
                department=emp.department,
                created_at=emp.createdAt,
                updated_at=emp.updatedAt
            ) for emp in not_marked_employees
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching not marked employees: {str(e)}"
        )
