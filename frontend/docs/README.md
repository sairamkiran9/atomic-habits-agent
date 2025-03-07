# Atomic Habits Agent - Frontend

The frontend web application for Atomic Habits Agent, built with Next.js, TypeScript, and Tailwind CSS.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Development](#development)
  - [Folder Structure](#folder-structure)
  - [Styling](#styling)
  - [State Management](#state-management)
  - [API Integration](#api-integration)
  - [Authentication](#authentication)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)

## Overview

The Atomic Habits Agent frontend is a responsive web application that provides an intuitive user interface for habit tracking and management. It connects to the backend API to provide a seamless user experience for building better habits.

## Features

- **User Authentication**: Secure login, signup, and user profile management
- **Dashboard**: Overview of habit progress and streaks
- **Habit Management**: Create, edit, and delete habits
- **Habit Tracking**: Mark habits as complete and visualize progress
- **Analytics**: View habit completion trends and statistics
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Component Library**: Custom components built with Radix UI primitives
- **State Management**: React Context API and hooks
- **Authentication**: NextAuth.js
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React and Heroicons
- **Animation**: Framer Motion
- **UI Utilities**: 
  - clsx & tailwind-merge for conditional styling
  - class-variance-authority for component variants

## Project Structure

```
frontend/
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── habits/       # Habit management pages
│   │   ├── login/        # Authentication pages
│   │   ├── profile/      # User profile pages
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/       # React components
│   │   ├── auth/         # Authentication components
│   │   ├── habit/        # Habit-related components
│   │   ├── layout/       # Layout components
│   │   ├── ui/           # UI primitives and design system
│   │   └── shared/       # Shared components
│   ├── lib/              # Utility functions and helpers
│   │   ├── auth/         # Authentication utilities
│   │   ├── hooks/        # Custom React hooks
│   │   ├── utils/        # General utility functions
│   │   └── validations/  # Form validation schemas
│   ├── services/         # API service functions
│   │   ├── api.ts        # API client setup
│   │   ├── auth.ts       # Authentication API
│   │   └── habits.ts     # Habits API
│   └── types/            # TypeScript type definitions
├── .gitignore            # Git ignore file
├── next.config.js        # Next.js configuration
├── package.json          # Node dependencies
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/atomic-habits-agent.git
   cd atomic-habits-agent/frontend
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

### Running the Application

1. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

## Development

### Folder Structure

The frontend follows a feature-based organization:

- **app/**: Next.js app router pages
- **components/**: React components organized by feature
- **lib/**: Utility functions and hooks
- **services/**: API service functions
- **types/**: TypeScript type definitions

### Styling

- Styling is primarily handled using Tailwind CSS
- Component variants are created using `class-variance-authority`
- Conditional class merging is done with `clsx` and `tailwind-merge`
- Dark mode is supported through `next-themes`

Example component styling:
```tsx
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        // ...other variants
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

### State Management

- Global state is managed using React Context API
- Local component state is managed using React hooks (useState, useReducer)
- Custom hooks are used to encapsulate complex logic

### API Integration

- API requests are made using Axios
- API service functions are organized by feature
- Responses and errors are properly typed

Example API service:
```typescript
import { api } from './api';
import { Habit, CreateHabitDto, UpdateHabitDto } from '@/types';

export const habitsService = {
  async getAllHabits(): Promise<Habit[]> {
    const response = await api.get('/api/habits');
    return response.data;
  },
  
  async getHabit(id: string): Promise<Habit> {
    const response = await api.get(`/api/habits/${id}`);
    return response.data;
  },
  
  async createHabit(data: CreateHabitDto): Promise<Habit> {
    const response = await api.post('/api/habits', data);
    return response.data;
  },
  
  async updateHabit(id: string, data: UpdateHabitDto): Promise<Habit> {
    const response = await api.put(`/api/habits/${id}`, data);
    return response.data;
  },
  
  async deleteHabit(id: string): Promise<void> {
    await api.delete(`/api/habits/${id}`);
  }
};
```

### Authentication

- Authentication is handled using NextAuth.js
- JWT tokens are stored in HTTP-only cookies
- Protected routes redirect to login page

## Building for Production

```bash
npm run build
# or
yarn build
```

This will generate an optimized production build in the `.next` directory.

## Deployment

### Static Export

For static site hosting:

```bash
npm run build
npm run export
# or
yarn build
yarn export
```

### Vercel Deployment

The easiest way to deploy the Next.js app is with Vercel:

1. Push your code to a Git repository (GitHub, GitLab, BitBucket)
2. Import the project on Vercel
3. Configure environment variables
4. Deploy

### Other Hosting Options

- **Docker**: Use the official Next.js Docker image
- **Node.js Server**: Deploy as a Node.js application
- **AWS/GCP/Azure**: Deploy to cloud platforms
