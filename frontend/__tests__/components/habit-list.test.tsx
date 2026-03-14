import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { HabitList } from '@/components/habits/habit-list'
import { Habit } from '@/lib/types/habit'

// Mock HabitForm to avoid rendering its full complexity
jest.mock('@/components/habits/habit-form', () => ({
  HabitForm: ({ onSubmit, trigger }: any) => <div>{trigger}</div>
}))

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: Math.floor(Math.random() * 10000),
    title: 'Test Habit',
    description: 'A test habit description',
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

const defaultProps = {
  onHabitComplete: jest.fn(),
  onHabitUpdate: jest.fn(),
  onHabitDelete: jest.fn(),
  onArchiveHabit: jest.fn(),
}

describe('HabitList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders_all_habits', () => {
    const habits = [
      makeHabit({ id: 1, title: 'Habit One' }),
      makeHabit({ id: 2, title: 'Habit Two' }),
      makeHabit({ id: 3, title: 'Habit Three' }),
    ]

    render(<HabitList habits={habits} {...defaultProps} />)

    expect(screen.getByText('Habit One')).toBeInTheDocument()
    expect(screen.getByText('Habit Two')).toBeInTheDocument()
    expect(screen.getByText('Habit Three')).toBeInTheDocument()
  })

  it('complete_button_calls_handler_with_id', () => {
    const onHabitComplete = jest.fn()
    const habit = makeHabit({ id: 42, title: 'Complete Me' })

    render(
      <HabitList
        habits={[habit]}
        {...defaultProps}
        onHabitComplete={onHabitComplete}
      />
    )

    // The complete button uses Circle or CheckCircle2 icon - find the button wrapping it
    // It's a button that triggers onHabitComplete
    const buttons = screen.getAllByRole('button')
    // The complete button is the first button in the footer area (circle icon button)
    const completeBtn = buttons.find(btn => {
      const svg = btn.querySelector('svg')
      return svg !== null && !btn.textContent?.includes('Cancel') && !btn.textContent?.includes('Delete')
    })

    // Find the button that calls onHabitComplete - it has no text, just an SVG icon
    // Click the first icon button (circle/check icon)
    fireEvent.click(buttons[0])

    expect(onHabitComplete).toHaveBeenCalledWith(42)
  })

  it('archive_button_calls_handler', () => {
    const onArchiveHabit = jest.fn()
    const habit = makeHabit({ id: 7, title: 'Archive Me' })

    render(
      <HabitList
        habits={[habit]}
        {...defaultProps}
        onArchiveHabit={onArchiveHabit}
      />
    )

    // Archive button has Archive icon (lucide), it's the second-to-last button in each card
    const allButtons = screen.getAllByRole('button')
    // Archive button is typically the second button in the right group (before trash)
    // It's the button with the Archive icon — find it by iterating
    // There are buttons: complete, edit(inside HabitForm), archive, trash per card
    // The HabitForm mock renders its trigger button (edit)
    // So: complete, (edit in HabitForm), archive, trash
    // archive is at index 2 (0-based)
    fireEvent.click(allButtons[2])

    expect(onArchiveHabit).toHaveBeenCalledWith(7)
  })

  it('delete_button_shows_confirmation_dialog', () => {
    const habit = makeHabit({ id: 5, title: 'Delete Me' })

    render(<HabitList habits={[habit]} {...defaultProps} />)

    const allButtons = screen.getAllByRole('button')
    // Trash button is the last button in the card
    const deleteBtn = allButtons[allButtons.length - 1]
    fireEvent.click(deleteBtn)

    expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument()
  })

  it('confirm_delete_calls_handler', () => {
    const onHabitDelete = jest.fn()
    const habit = makeHabit({ id: 5, title: 'Delete Me' })

    render(
      <HabitList
        habits={[habit]}
        {...defaultProps}
        onHabitDelete={onHabitDelete}
      />
    )

    // Click trash button to show confirmation
    const allButtons = screen.getAllByRole('button')
    const deleteBtn = allButtons[allButtons.length - 1]
    fireEvent.click(deleteBtn)

    // Click the confirm Delete button in the dialog
    const confirmBtn = screen.getByRole('button', { name: /^Delete$/i })
    fireEvent.click(confirmBtn)

    expect(onHabitDelete).toHaveBeenCalledWith(5)
  })

  it('cancel_delete_hides_confirmation', () => {
    const habit = makeHabit({ id: 5, title: 'Delete Me' })

    render(<HabitList habits={[habit]} {...defaultProps} />)

    // Click trash button to show confirmation
    const allButtons = screen.getAllByRole('button')
    const deleteBtn = allButtons[allButtons.length - 1]
    fireEvent.click(deleteBtn)

    // Confirmation should be visible
    expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument()

    // Click Cancel
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelBtn)

    // Confirmation should be gone
    expect(screen.queryByText(/Are you sure you want to delete/i)).not.toBeInTheDocument()
  })

  it('displays_streak_count', () => {
    const habit = makeHabit({ id: 1, streak: 5 })

    render(<HabitList habits={[habit]} {...defaultProps} />)

    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders_nothing_for_empty_array', () => {
    const { container } = render(<HabitList habits={[]} {...defaultProps} />)

    // The grid wrapper should be empty (no cards)
    const cards = container.querySelectorAll('[class*="card"], [data-testid]')
    // No habit titles should be rendered
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })
})
