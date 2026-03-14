import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HabitForm } from '@/components/habits/habit-form'
import { Habit } from '@/lib/types/habit'

const mockHabit: Habit = {
  id: 1,
  title: 'Morning Run',
  description: 'Run 5km every morning',
  frequency: 'daily',
  time_of_day: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  streak: 3,
  completed: false,
  category: 'Fitness',
  reminder_time: null,
  is_archived: false,
  last_completed: null,
}

describe('HabitForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('without trigger (inline form)', () => {
    it('renders_create_mode_title_fields_when_no_initial_data', () => {
      const onSubmit = jest.fn()
      render(<HabitForm onSubmit={onSubmit} />)

      expect(screen.getByLabelText(/habit title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    })

    it('submit_button_says_create_habit_in_create_mode', () => {
      render(<HabitForm onSubmit={jest.fn()} />)
      expect(screen.getByRole('button', { name: /create habit/i })).toBeInTheDocument()
    })

    it('submit_button_says_update_habit_in_edit_mode', () => {
      render(<HabitForm onSubmit={jest.fn()} initialData={mockHabit} />)
      expect(screen.getByRole('button', { name: /update habit/i })).toBeInTheDocument()
    })

    it('prefills_title_and_description_from_initialData', () => {
      render(<HabitForm onSubmit={jest.fn()} initialData={mockHabit} />)

      expect(screen.getByDisplayValue('Morning Run')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Run 5km every morning')).toBeInTheDocument()
    })

    it('shows_title_required_validation_error_on_empty_submit', async () => {
      const user = userEvent.setup()
      render(<HabitForm onSubmit={jest.fn()} />)

      await user.click(screen.getByRole('button', { name: /create habit/i }))

      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument()
      })
    })

    it('shows_description_required_validation_error_on_empty_submit', async () => {
      const user = userEvent.setup()
      render(<HabitForm onSubmit={jest.fn()} />)

      await user.type(screen.getByLabelText(/habit title/i), 'My Habit')
      await user.click(screen.getByRole('button', { name: /create habit/i }))

      await waitFor(() => {
        expect(screen.getByText(/description is required/i)).toBeInTheDocument()
      })
    })

    it('calls_onSubmit_with_form_data_when_valid', async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn()
      render(<HabitForm onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText(/habit title/i), 'New Habit')
      await user.type(screen.getByLabelText(/description/i), 'New habit description')
      await user.click(screen.getByRole('button', { name: /create habit/i }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1)
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New Habit',
            description: 'New habit description',
          })
        )
      })
    })
  })

  describe('with trigger (dialog mode)', () => {
    it('does_not_show_form_fields_before_trigger_clicked', () => {
      render(
        <HabitForm
          onSubmit={jest.fn()}
          trigger={<button>Open Form</button>}
        />
      )

      expect(screen.queryByLabelText(/habit title/i)).not.toBeInTheDocument()
    })

    it('shows_create_new_habit_dialog_title_when_no_initial_data', async () => {
      const user = userEvent.setup()
      render(
        <HabitForm
          onSubmit={jest.fn()}
          trigger={<button>Open Form</button>}
        />
      )

      await user.click(screen.getByRole('button', { name: 'Open Form' }))

      await waitFor(() => {
        expect(screen.getByText('Create New Habit')).toBeInTheDocument()
      })
    })

    it('shows_edit_habit_dialog_title_when_initial_data_provided', async () => {
      const user = userEvent.setup()
      render(
        <HabitForm
          onSubmit={jest.fn()}
          initialData={mockHabit}
          trigger={<button>Edit</button>}
        />
      )

      await user.click(screen.getByRole('button', { name: 'Edit' }))

      await waitFor(() => {
        expect(screen.getByText('Edit Habit')).toBeInTheDocument()
      })
    })
  })
})
