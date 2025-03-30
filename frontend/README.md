# Atomic Habits Agent - Frontend Architecture Overview

## Project Structure

The frontend of the Atomic Habits Agent is built using Next.js with TypeScript and follows modern best practices. Here's a breakdown of the architecture:

### Key Technologies
- **Next.js 14.1.0**: For server-side rendering and routing
- **React 18**: For UI components
- **TypeScript**: For type safety
- **Tailwind CSS**: For styling
- **Radix UI**: For accessible UI primitives
- **React Hook Form**: For form handling and validation
- **Next-Auth**: For authentication management

### Directory Structure

```
frontend/
├── public/             # Static assets
├── src/
│   ├── app/            # Next.js App Router pages
│   ├── components/     # Reusable React components
│   │   ├── auth/       # Authentication components
│   │   ├── habits/     # Habit-related components
│   │   ├── layout/     # Layout components
│   │   ├── providers/  # Context providers
│   │   └── ui/         # UI components
│   └── lib/            # Utility functions, types, and services
│       ├── services/   # API service modules
│       └── types/      # TypeScript interfaces and types
```

## Core Features

### Authentication
- User registration with form validation
- Login with email/password
- JWT token-based authentication 
- Secure token storage in localStorage
- Protection of authenticated routes

### Habit Management
- Create, read, update, and delete habits
- Categorize habits by type (Mindfulness, Learning, Productivity, etc.)
- Set frequency (daily, weekly, monthly)
- Track completion status and streaks
- Habit archiving functionality
- Filtering habits by category

### UI/UX
- Modern, clean interface with Tailwind CSS
- Dark mode support via next-themes
- Responsive design for different screen sizes
- Accessible components using Radix UI
- Loading states and error handling
- Animation support via Framer Motion

## Architecture Patterns

### Service Layer
The application implements a service layer pattern that encapsulates all API calls:

- `AuthService`: Handles authentication operations (login, register, token management)
- `HabitsService`: Manages CRUD operations for habits

### Component Structure
Components follow a hierarchical organization:

1. **Page components** (`app/habits/page.tsx`): Contain page-level state and logic
2. **Feature components** (`components/habits/habit-list.tsx`): Implement specific features
3. **UI components** (`components/ui/button.tsx`): Reusable UI elements

### State Management
The application uses React's built-in state management with:
- `useState` for component-level state
- `useEffect` for side effects like data fetching
- Custom hooks for reusable logic
- Context API via providers for theme management

### Data Flow
1. User interacts with the UI
2. Event handlers process the interaction
3. Service layer communicates with the backend API
4. State is updated with the response
5. UI re-renders with the new state

## API Integration

The frontend communicates with a Python backend API running on `http://localhost:8000/api`. Key endpoints include:

- `/api/auth/register`: User registration
- `/api/auth/login`: User authentication
- `/api/habits`: CRUD operations for habits
- `/api/habits/reset`: Reset habit completion status
- `/api/habits/{id}/archive`: Toggle habit archive status

## Security Considerations

- JWT tokens for authenticated requests
- Form validation for user inputs
- Protected routes requiring authentication
- Proper error handling for API requests
- Secure storage of sensitive information

## Future Enhancement Opportunities

1. Implement more detailed analytics and visualizations
2. Add social sharing features for habit progress
3. Enhance notification system for habit reminders
4. Implement offline functionality
5. Add more detailed reporting and statistics