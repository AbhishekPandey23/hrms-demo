# HRMS Lite

A modern Human Resource Management System (HRMS) built with a robust **Next.js** frontend and a high-performance **FastAPI** backend.

## 🚀 Features

- **Employee Management**: comprehensive CRUD operations for employee records.
- **Attendance Tracking**: efficient marking and tracking of employee daily attendance.
- **Dashboard**: real-time statistics and overview of HR metrics.
- **Modern UI**: responsive and accessible interface built with Radix UI and Tailwind CSS.

## 🛠 Tech Stack

### Client-Side (Frontend)

- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS v4, Lucide React (Icons)
- **Components**: Radix UI (Primitives), Sonner (Toasts)
- **Data Fetching/State**: React Hook Form, Zod (Validation)
- **Visualization**: Recharts, TanStack Table

### Server-Side (Backend)

- **Framework**: FastAPI
- **Database**: PostgreSQL (NeonDB)
- **ORM**: Prisma (Python)
- **Validation**: Pydantic

## 📂 Project Structure

```
hrms/
├── client-side/       # Next.js Frontend Application
└── server-side/       # FastAPI Backend Application
```

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- **Node.js**: v18 or later
- **Python**: v3.9 or later
- **PostgreSQL Database**: A connection string (e.g., from NeonDB)

### 1. Backend Setup

Navigate to the server directory and set up the Python environment.

```bash
cd server-side

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure Environment Variables
# Create a .env file based on .env.example (if available) or create one with your DB url:
# DATABASE_URL="postgresql://user:password@host:port/dbname"

# Generate Prisma Client
prisma generate

# Push Schema to Database
prisma db push

# Start the Server
uvicorn main:app --reload
```

The backend server will start at `http://localhost:8000`.  
API Documentation is available at `http://localhost:8000/docs`.

### 2. Frontend Setup

Open a new terminal, navigate to the client directory, and start the development server.

```bash
cd client-side

# Install dependencies
npm install
