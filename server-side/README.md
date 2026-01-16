# HRMS Lite Backend

Production-ready FastAPI backend with Prisma ORM and PostgreSQL.

## Quick Start

```bash
cd server-side

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your NeonDB connection string

# Generate Prisma client
prisma generate

# Push database schema
prisma db push

# Run server
uvicorn main:app --reload
```

Server runs on **http://localhost:8000**  
API docs at **http://localhost:8000/docs**

## API Endpoints

### Employees

- `POST /api/employees/` - Create employee
- `GET /api/employees/` - List employees (with filters)
- `GET /api/employees/{id}` - Get employee details
- `DELETE /api/employees/{id}` - Delete employee
- `GET /api/employees/{id}/attendance` - Employee stats
- `GET /api/employees/suggest/next-id` - Suggest next ID

### Attendance

- `POST /api/attendance/` - Mark attendance
- `GET /api/attendance/` - List records (with filters)
- `GET /api/attendance/{id}` - Get attendance record
- `DELETE /api/attendance/{id}` - Delete record

### Dashboard

- `GET /api/dashboard/stats` - Dashboard statistics

## Tech Stack

- **FastAPI** - Modern web framework
- **Prisma** - Type-safe ORM
- **NeonDB** - Serverless PostgreSQL
- **Pydantic** - Data validation
