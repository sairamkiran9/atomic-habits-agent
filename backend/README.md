# Atomic Habits Agent - Backend Architecture Overview

## Project Structure

The backend of the Atomic Habits Agent is built using FastAPI with SQLAlchemy for database management. It follows a clean, modular architecture with clear separation of concerns.

### Key Technologies
- **FastAPI**: Modern, high-performance web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **SQLite**: Database (currently using `atomic_habits.db`)
- **Pydantic**: Data validation and settings management
- **JWT**: Token-based authentication

### Directory Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── routes/       # API route handlers
│   │   │   ├── auth.py   # Authentication endpoints
│   │   │   ├── habits.py # Habits management endpoints
│   │   │   └── user.py   # User profile endpoints
│   │
│   ├── core/             # Core application components
│   │   ├── auth.py       # Authentication utilities
│   │   ├── config.py     # Application settings
│   │   └── security.py   # Password hashing, JWT functions
│   │
│   ├── db/               # Database configurations
│   │   ├── base_class.py # SQLAlchemy base class
│   │   └── session.py    # Database session management
│   │
│   ├── models/           # SQLAlchemy ORM models
│   │   ├── habit.py      # Habit table definition
│   │   ├── habit_log.py  # HabitLog table definition
│   │   └── user.py       # User table definition
│   │
│   └── schemas/          # Pydantic models for API
│       ├── habit.py      # Habit request/response models
│       └── user.py       # User request/response models
│
├── main.py               # Application entry point
└── requirements.txt      # Python dependencies
```

## Core Features

### Authentication System
- User registration with email and password
- JWT token-based authentication
- Password hashing with secure algorithms
- User login with email/password verification
- Protected routes requiring authentication

### Habit Management
- CRUD operations for habits
- Categorization by type (Mindfulness, Learning, Productivity, etc.)
- Frequency settings (daily, weekly, monthly)
- Streak tracking with automatic resets
- Archiving functionality
- Filtering and pagination for habit lists

### Automatic Habit Resetting
The system includes an intelligent habit reset mechanism that:
- Resets daily habits every 24 hours
- Resets weekly habits every week
- Resets monthly habits every month
- Preserves or resets streaks based on completion patterns

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login and receive JWT token

### User Management
- `GET /api/user`: Get current user information
- `PUT /api/user`: Update user profile

### Habit Management
- `GET /api/habits`: List habits with filtering options
- `POST /api/habits`: Create a new habit
- `GET /api/habits/{habit_id}`: Get a specific habit
- `PUT /api/habits/{habit_id}`: Update a habit
- `DELETE /api/habits/{habit_id}`: Delete a habit
- `POST /api/habits/reset`: Reset habits based on frequency
- `POST /api/habits/{habit_id}/archive`: Toggle archive status

## Database Schema

### User Table
- `id`: Primary key
- `email`: User email (unique)
- `hashed_password`: Securely hashed password
- `full_name`: User's full name
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### Habit Table
- `id`: Primary key
- `title`: Habit title
- `description`: Detailed description
- `frequency`: Frequency type (daily/weekly/monthly)
- `time_of_day`: Preferred time for the habit
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp
- `streak`: Current completion streak
- `completed`: Current completion status
- `category`: Habit category
- `reminder_time`: Time for reminders
- `is_archived`: Archive status
- `last_completed`: Last completion timestamp
- `user_id`: Foreign key to User

### Habit Log Table
- Tracks individual habit completions over time
- Enables historical analysis and reporting

## Architecture Patterns

### Repository Pattern
- Data access logic is encapsulated in SQLAlchemy models
- Clear separation between database and business logic

### Service Layer
- Business logic is separated from route handlers
- Authentication and security functions are centralized

### Dependency Injection
- FastAPI dependencies for database sessions and user authentication
- Makes testing and mocking easier

## Security Considerations

- Password hashing using bcrypt
- JWT token authentication
- Input validation with Pydantic models
- Proper error handling and status codes
- CORS configuration for frontend integration

## Performance Optimizations

- Async database operations
- Efficient query patterns with proper indexing
- Pagination for list endpoints
- Selective response models to reduce payload size

## Future Enhancement Opportunities

1. Add integration with notification services for reminders
2. Implement more detailed analytics and reporting
3. Add social features for habit sharing and accountability
4. Support for habit chains and dependencies
5. Backend support for data visualization