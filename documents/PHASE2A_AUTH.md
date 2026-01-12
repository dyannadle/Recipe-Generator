# Phase 2A - Authentication Foundation

## Overview
This document covers the initial Phase 2 implementation focusing on user authentication and account management.

## Implemented Features

### Backend ✅

#### 1. Database Models
**File:** `Foodimg2Ing/models.py`

**Models Created:**
- `User` - User accounts with authentication
  - Email/password authentication
  - Dietary preferences (type, allergies, cuisines, spice level)
  - Password hashing with bcrypt
  - Relationships to recipes, ratings, favorites

- `Recipe` - User-saved recipes
  - Title, ingredients, instructions
  - Image URL
  - Public/private toggle
  - Average rating calculation

- `Rating` - Recipe ratings (1-5 stars)
  - User can rate each recipe once
  - Optional comment
  - Constraint validation

- `Favorite` - User favorites
  - One favorite per user per recipe

#### 2. Authentication System
**File:** `Foodimg2Ing/auth.py`

**Endpoints:**
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/preferences` - Update dietary preferences
- `PUT /api/auth/change-password` - Change password

**Security:**
- JWT token-based authentication
- Password hashing with bcrypt
- Email validation
- Rate limiting (3 registrations/hour, 5 logins/minute)

**File:** `Foodimg2Ing/utils/security.py`
- `generate_token()` - Create JWT tokens
- `decode_token()` - Validate JWT tokens
- `@token_required` - Decorator for protected routes
- `@optional_token` - Decorator for optional auth

#### 3. Database Configuration
**File:** `Foodimg2Ing/__init__.py`

**Added:**
- SQLAlchemy integration
- Flask-Migrate for database migrations
- Flask-Login for session management
- Database URI configuration (SQLite default, PostgreSQL ready)

---

### Frontend ✅

#### 1. Authentication Context
**File:** `frontend/src/contexts/AuthContext.jsx`

**Features:**
- Global authentication state
- Auto-fetch user on mount
- Token storage in localStorage
- Axios interceptor for auth headers

**Methods:**
- `login(email, password)` - Authenticate user
- `register(email, password, name)` - Create account
- `logout()` - Clear session
- `updatePreferences(prefs)` - Update user preferences

#### 2. Auth Modal
**File:** `frontend/src/components/Auth/AuthModal.jsx`

**Features:**
- Dual-mode modal (Login/Register)
- Form validation
- Loading states
- Error handling with toast notifications
- Beautiful gradient header

#### 3. User Menu
**File:** `frontend/src/components/Auth/UserMenu.jsx`

**Features:**
- User avatar with initial
- Dropdown menu with:
  - My Recipes (placeholder)
  - Favorites (placeholder)
  - Preferences (placeholder)
  - Sign Out

#### 4. Updated Components
**Files:**
- `frontend/src/components/Navbar.jsx` - Added auth button/menu
- `frontend/src/App.jsx` - Wrapped with AuthProvider

---

## Configuration

### Environment Variables
Added to `.env.example`:
```bash
# Database
DATABASE_URL=sqlite:///recipe_generator.db

# JWT
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ACCESS_TOKEN_EXPIRES=86400
```

### Dependencies Added
**Backend:**
```
SQLAlchemy==2.0.23
psycopg2-binary==2.9.9
Flask-SQLAlchemy==3.1.1
Flask-Migrate==4.0.5
Flask-Login==0.6.3
PyJWT==2.8.0
bcrypt==4.1.2
```

**Frontend:**
No new dependencies (used existing axios, react-hot-toast)

---

## Setup Instructions

### 1. Install Dependencies
```bash
# Backend
pip install -r requirements.txt

# Frontend (if needed)
cd frontend
npm install
```

### 2. Configure Environment
```bash
# Copy example
cp .env.example .env

# Edit .env and set:
# - SECRET_KEY (random string)
# - JWT_SECRET_KEY (random string)
# - DATABASE_URL (optional, defaults to SQLite)
```

### 3. Initialize Database
```bash
# Create database and tables
flask db init
flask db migrate -m "Initial schema"
flask db upgrade
```

### 4. Run Application
```bash
# Terminal 1: Backend
python run.py

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 5. Test Authentication
1. Open http://localhost:5173
2. Click "Sign In" button
3. Switch to "Create Account"
4. Register with email/password
5. Verify you're logged in (see user menu)
6. Test logout

---

## API Examples

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Database Schema

```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(100),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    dietary_type VARCHAR(50),
    allergies JSON,
    cuisine_preferences JSON,
    spice_level INTEGER DEFAULT 2
);

-- Recipes table
CREATE TABLE recipes (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    ingredients JSON NOT NULL,
    instructions JSON NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP,
    is_public BOOLEAN DEFAULT FALSE
);

-- Ratings table
CREATE TABLE ratings (
    id INTEGER PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(id),
    user_id INTEGER REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP,
    UNIQUE(recipe_id, user_id)
);

-- Favorites table
CREATE TABLE favorites (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    recipe_id INTEGER REFERENCES recipes(id),
    created_at TIMESTAMP,
    UNIQUE(user_id, recipe_id)
);
```

---

## What's Next (Phase 2B)

Remaining Phase 2 features to implement:
1. ✅ Recipe saving functionality
2. ✅ User dashboard
3. ✅ Dietary preferences UI
4. ✅ Rating system UI
5. ✅ Dark mode toggle

---

## Testing Checklist

- [ ] Register new user
- [ ] Login with credentials
- [ ] View user menu
- [ ] Logout
- [ ] Invalid login shows error
- [ ] Duplicate email shows error
- [ ] Token persists on page refresh
- [ ] Protected routes require auth

---

**Implementation Date:** January 12, 2026  
**Phase:** 2A (Auth Foundation)  
**Status:** ✅ Ready for Testing
