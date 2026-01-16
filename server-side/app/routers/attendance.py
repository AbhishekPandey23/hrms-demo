from fastapi import APIRouter, HTTPException, status, Query
from app.database import get_prisma_client
db = get_prisma_client()
from app.models.schemas import (
    AttendanceCreate,
    AttendanceResponse,
    EmployeeResponse,
    SuccessResponse
)
from typing import List, Optional
from datetime import date, datetime

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])

@router.post("/", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def mark_attendance(attendance: AttendanceCreate):
    """Mark attendance for an employee"""
    try:
        # Check if employee exists
        employee = await db.employee.find_unique(where={"id": attendance.employee_id})
        
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found"
            )
        
        # Convert date to datetime for Prisma
        attendance_date = datetime.combine(attendance.date, datetime.min.time())
        
        # Check if attendance already exists for this date
        existing = await db.attendance.find_first(
            where={
                "employeeId": attendance.employee_id,
                "date": attendance_date
            }
        )
        
        if existing:
            # Update existing attendance
            updated = await db.attendance.update(
                where={"id": existing.id},
                data={"status": attendance.status}
            )
            
            return AttendanceResponse(
                id=updated.id,
                employee_id=updated.employeeId,
                date=updated.date.date(),
                status=updated.status,
                created_at=updated.createdAt,
                updated_at=updated.updatedAt
            )
        else:
            # Create new attendance
            new_attendance = await db.attendance.create(
                data={
                    "employeeId": attendance.employee_id,
                    "date": attendance_date,
                    "status": attendance.status
                }
            )
            
            return AttendanceResponse(
                id=new_attendance.id,
                employee_id=new_attendance.employeeId,
                date=new_attendance.date.date(),
                status=new_attendance.status,
                created_at=new_attendance.createdAt,
                updated_at=new_attendance.updatedAt
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error marking attendance: {str(e)}"
        )

@router.get("/", response_model=List[AttendanceResponse])
async def get_attendance_records(
    employee_id: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get attendance records with filters"""
    try:
        where_clause = {}
        
        if employee_id:
            where_clause["employeeId"] = employee_id
        
        if start_date and end_date:
            where_clause["date"] = {
                "gte": datetime.combine(start_date, datetime.min.time()),
                "lte": datetime.combine(end_date, datetime.min.time())
            }
        elif start_date:
            where_clause["date"] = {"gte": datetime.combine(start_date, datetime.min.time())}
        elif end_date:
            where_clause["date"] = {"lte": datetime.combine(end_date, datetime.min.time())}
        
        if status:
            where_clause["status"] = status.upper()
        
        records = await db.attendance.find_many(
            where=where_clause if where_clause else None,
            include={"employee": True},
            order={"date": "desc"},
            take=limit
        )
        
        return [
            AttendanceResponse(
                id=record.id,
                employee_id=record.employeeId,
                date=record.date,
                status=record.status,
                created_at=record.createdAt,
                updated_at=record.updatedAt,
                employee=EmployeeResponse(
                    id=record.employee.id,
                    employee_id=record.employee.employeeId,
                    full_name=record.employee.fullName,
                    email=record.employee.email,
                    department=record.employee.department,
                    created_at=record.employee.createdAt,
                    updated_at=record.employee.updatedAt
                ) if record.employee else None
            )
            for record in records
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching attendance records: {str(e)}"
        )

@router.get("/{attendance_id}", response_model=AttendanceResponse)
async def get_attendance(attendance_id: str):
    """Get single attendance record"""
    try:
        record = await db.attendance.find_unique(
            where={"id": attendance_id},
            include={"employee": True}
        )
        
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Attendance record not found"
            )
        
        return AttendanceResponse(
            id=record.id,
            employee_id=record.employeeId,
            date=record.date,
            status=record.status,
            created_at=record.createdAt,
            updated_at=record.updatedAt,
            employee=EmployeeResponse(
                id=record.employee.id,
                employee_id=record.employee.employeeId,
                full_name=record.employee.fullName,
                email=record.employee.email,
                department=record.employee.department,
                created_at=record.employee.createdAt,
                updated_at=record.employee.updatedAt
            ) if record.employee else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching attendance: {str(e)}"
        )

@router.delete("/{attendance_id}", response_model=SuccessResponse)
async def delete_attendance(attendance_id: str):
    """Delete an attendance record"""
    try:
        record = await db.attendance.find_unique(where={"id": attendance_id})
        
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Attendance record not found"
            )
        
        await db.attendance.delete(where={"id": attendance_id})
        
        return SuccessResponse(
            success=True,
            message="Attendance record deleted successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting attendance: {str(e)}"
        )
