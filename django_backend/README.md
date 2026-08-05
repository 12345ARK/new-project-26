# FastMart Django REST Framework Backend

This directory contains the complete **Django REST Framework** backend and database setup for FastMart.

## 🚀 Quickstart Guide for VS Code

### 1. Prerequisites
Ensure you have Python 3.9+ installed on your computer.

### 2. Setup Virtual Environment & Install Dependencies
Open your terminal in VS Code and run:
```bash
cd django_backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Run Migrations & Create Superuser
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 4. Start the Django Server
```bash
python manage.py runserver 8000
```
Your Django REST API is now live at `http://127.0.0.1:8000/api/`!
- **Admin Dashboard**: `http://127.0.0.1:8000/admin/`
- **Products API**: `http://127.0.0.1:8000/api/products/`
- **Orders API**: `http://127.0.0.1:8000/api/orders/`
- **Users API**: `http://127.0.0.1:8000/api/users/`
- **Feedback API**: `http://127.0.0.1:8000/api/feedback/`

## 🔗 Connecting React Frontend to Django Backend
In your React app (`/src/context/AppContext.tsx`), you can point your fetch calls to `http://localhost:8000/api/` to query your Django SQLite / PostgreSQL database directly!
