from fastapi import APIRouter, HTTPException, status, Query
from app.database import db
from app.models.schemas import (
    EmployeeCreate, 
    EmployeeResponse, 
    EmployeeWithStats,
    SuccessResponse,
    AttendanceResponse
)
from typing import List, Optional
from prisma.errors import UniqueViolationError

router = APIRouter(prefix="/api/employees", tags=["Employees"])

@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(employee: EmployeeCreate):
    """Create a new employee"""
    try:
        # Check if employee ID or email already exists
        existing = await db.employee.find_first(
            where={
                "OR": [
                    {"employeeId": employee.employee_id},
                    {"email": employee.email}
                ]
            }
        )
        
        if existing:
            if existing.employeeId == employee.employee_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Employee ID already exists"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already exists"
                )
        
        # Create employee
        new_employee = await db.employee.create(
            data={
                "employeeId": employee.employee_id,
                "fullName": employee.full_name,
                "email": employee.email,
                "department": employee.department
            }
        )
        
        return EmployeeResponse(
            id=new_employee.id,
            employee_id=new_employee.employeeId,
            full_name=new_employee.fullName,
            email=new_employee.email,
            department=new_employee.department,
            created_at=new_employee.createdAt,
            updated_at=new_employee.updatedAt
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating employee: {str(e)}"
        )

@router.get("/", response_model=List[EmployeeResponse])
async def get_employees(
    department: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    """Get all employees with optional filters"""
    try:
        where_clause = {}
        
        if department:
            where_clause["department"] = department
        
        if search:
            where_clause["OR"] = [
                {"fullName": {"contains": search, "mode": "insensitive"}},
                {"employeeId": {"contains": search, "mode": "insensitive"}},
                {"email": {"contains": search, "mode": "insensitive"}}
            ]
        
        employees = await db.employee.find_many(
            where=where_clause if where_clause else None,
            order={"createdAt": "desc"}
        )
        
        return [
            EmployeeResponse(
                id=emp.id,
                employee_id=emp.employeeId,
                full_name=emp.fullName,
                email=emp.email,
                department=emp.department,
                created_at=emp.createdAt,
                updated_at=emp.updatedAt
            )
            for emp in employees
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching employees: {str(e)}"
        )

@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(employee_id: str):
    """Get a single employee by ID"""
    try:
        employee = await db.employee.find_unique(where={"id": employee_id})
        
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found"
            )
        
        return EmployeeResponse(
            id=employee.id,
            employee_id=employee.employeeId,
            full_name=employee.fullName,
            email=employee.email,
            department=employee.department,
            created_at=employee.createdAt,
            updated_at=employee.updatedAt
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching employee: {str(e)}"
        )

@router.delete("/{employee_id}", response_model=SuccessResponse)
async def delete_employee(employee_id: str):
    """Delete an employee"""
    try:
        employee = await db.employee.find_unique(where={"id": employee_id})
        
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found"
            )
        
        await db.employee.delete(where={"id": employee_id})
        
        return SuccessResponse(
            success=True,
            message="Employee deleted successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting employee: {str(e)}"
        )

@router.get("/{employee_id}/attendance", response_model=EmployeeWithStats)
async def get_employee_attendance(employee_id: str):
    """Get employee with attendance statistics"""
    try:
        employee = await db.employee.find_unique(
            where={"id": employee_id},
            include={"attendances": True}
        )
        
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found"
            )
        
        total_present = sum(1 for att in employee.attendances if att.status == "PRESENT")
        total_absent = sum(1 for att in employee.attendances if att.status == "ABSENT")
        total_days = len(employee.attendances)
        attendance_percentage = (total_present / total_days * 100) if total_days > 0 else 0.0
        
        return EmployeeWithStats(
            id=employee.id,
            employee_id=employee.employeeId,
            full_name=employee.fullName,
            email=employee.email,
            department=employee.department,
            created_at=employee.createdAt,
            updated_at=employee.updatedAt,
            total_present=total_present,
            total_absent=total_absent,
            attendance_percentage=round(attendance_percentage, 2),
            attendances=[
                AttendanceResponse(
                    id=att.id,
                    employee_id=att.employeeId,
                    date=att.date,
                    status=att.status,
                    created_at=att.createdAt,
                    updated_at=att.updatedAt
                ) for att in employee.attendances
            ]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching employee attendance: {str(e)}"
        )

@router.get("/suggest/next-id")
async def suggest_next_employee_id():
    """Suggest next available employee ID"""
    try:
        last_employee = await db.employee.find_first(
            order={"employeeId": "desc"}
        )
        
        from app.utils.validators import generate_employee_id
        next_id = generate_employee_id(last_employee.employeeId if last_employee else None)
        
        return {"suggested_id": next_id}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating employee ID: {str(e)}"
        )
