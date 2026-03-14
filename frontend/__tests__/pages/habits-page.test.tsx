import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import HabitsPage from '@/app/habits/page'
import { auth, habits as habitsService } from '@/lib/services'
import { useRouter } from 'next/navigation'
import { Habit } from '@/lib/types/habit'

// Mock the service modules
jest.mock('@/lib/services', () => ({
  auth: {
    isAuthenticated: jest.fn(),
    logout: jest.fn(),
  },
  habits: {
    getHabits: jest.fn(),
    createHabit: jest.fn(),
    updateHabit: jest.fn(),
    deleteHabit: jest.fn(),
    toggleArchiveHabit: jest.fn(),
  },
}))

// Mock child components
jest.mock('@/components/habits/habit-list', () => ({
  HabitList: ({ habits }: any) => (
    <div data-testid="habit-list">
      {habits.map((h: any) => (
        <div key={h.id}>{h.title}</div>
      ))}
    </div>
  ),
}))

jest.mock('@/components/habits/sidebar', () => ({
  Sidebar: ({ onSelectCategory, onToggleArchived }: any) => (
    <div>
      <button onClick={() => onSelectCategory('Fitness')}>Fitness</button>
      <button onClick={onToggleArchived}>Toggle Archive</button>
    </div>
  ),
}))

jest.mock('@/components/habits/habit-form', () => ({
  HabitForm: ({ onSubmit }: any) => (
    <button
      onClick={() =>
        onSubmit({ title: 'New', description: 'Desc', frequency: 'daily', category: 'Fitness' })
      }
    >
      Add
    </button>
  ),
}))

jest.mock('@/components/layout/container', () => ({
  Container: ({ children }: any) => <div>{children}</div>,
}))

const mockAuth = auth as { isAuthenticated: jest.Mock; logout: jest.Mock }
const mockHabitsService = habitsService as {
  getHabits: jest.Mock
  createHabit: jest.Mock
  updateHabit: jest.Mock
  deleteHabit: jest.Mock
  toggleArchiveHabit: jest.Mock
}
const mockUseRouter = useRouter as jest.Mock
const mockPush = jest.fn()

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: Math.floor(Math.random() * 10000),
    title: 'Test Habit',
    description: 'A test habit',
    frequency: 'daily',
    time_of_day: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    streak: 0,
    completed: false,
    category: 'Health',
    reminder_time: null,
    is_archived: false,
    last_completed: null,
    ...overrides,
  }
}

describe('HabitsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    })
  })

  it('shows_loading_spinner_on_mount', () => {
    // Don't resolve the promise immediately so we can check loading state
    mockAuth.isAuthenticated.mockReturnValue(true)
    mockHabitsService.getHabits.mockReturnValue(new Promise(() => {})) // never resolves

    render(<HabitsPage />)

    expect(screen.getByText(/Loading your habits/i)).toBeInTheDocument()
  })

  it('redirects_to_login_when_not_authenticated', async () => {
    mockAuth.isAuthenticated.mockReturnValue(false)
    // getHabits won't be called since we redirect, but mock it anyway
    mockHabitsService.getHabits.mockResolvedValue([])

    render(<HabitsPage />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('renders_habits_after_fetch', async () => {
    const habits = [
      makeHabit({ id: 1, title: 'Morning Run', category: 'Fitness', is_archived: false }),
      makeHabit({ id: 2, title: 'Read Books', category: 'Learning', is_archived: false }),
    ]

    mockAuth.isAuthenticated.mockReturnValue(true)
    mockHabitsService.getHabits.mockResolvedValue(habits)

    render(<HabitsPage />)

    await waitFor(() => {
      expect(screen.getByText('Morning Run')).toBeInTheDocument()
      expect(screen.getByText('Read Books')).toBeInTheDocument()
    })
  })

  it('shows_error_banner_on_fetch_failure', async () => {
    mockAuth.isAuthenticated.mockReturnValue(true)
    mockHabitsService.getHabits.mockRejectedValue(new Error('Network error'))

    render(<HabitsPage />)

    await waitFor(() => {
      expect(screen.getByText(/Failed to load habits/i)).toBeInTheDocument()
    })
  })

  it('shows_empty_state_when_no_habits', async () => {
    mockAuth.isAuthenticated.mockReturnValue(true)
    mockHabitsService.getHabits.mockResolvedValue([])

    render(<HabitsPage />)

    await waitFor(() => {
      expect(screen.getByText(/No habits yet/i)).toBeInTheDocument()
    })
  })

  it('category_filter_applied', async () => {
    const habits = [
      makeHabit({ id: 1, title: 'Yoga Session', category: 'Fitness', is_archived: false }),
      makeHabit({ id: 2, title: 'Morning Read', category: 'Learning', is_archived: false }),
    ]

    mockAuth.isAuthenticated.mockReturnValue(true)
    mockHabitsService.getHabits.mockResolvedValue(habits)

    render(<HabitsPage />)

    // Wait for habits to load
    await waitFor(() => {
      expect(screen.getByTestId('habit-list')).toBeInTheDocument()
    })

    // Click the Fitness filter in the mocked Sidebar
    const fitnessBtn = screen.getByRole('button', { name: 'Fitness' })
    fireEvent.click(fitnessBtn)

    await waitFor(() => {
      expect(screen.getByText('Yoga Session')).toBeInTheDocument()
      expect(screen.queryByText('Morning Read')).not.toBeInTheDocument()
    })
  })
})
