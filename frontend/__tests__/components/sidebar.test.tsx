import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Sidebar } from '@/components/habits/sidebar'

const defaultProps = {
  selectedCategory: null,
  showArchived: false,
  onSelectCategory: jest.fn(),
  onToggleArchived: jest.fn(),
  categoryCount: {
    All: 5,
    Archived: 2,
    Mindfulness: 2,
    Learning: 1,
    Productivity: 1,
    Health: 1,
    Fitness: 0,
    Career: 0,
    Social: 0,
    Other: 0,
  },
}

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    defaultProps.onSelectCategory.mockReset()
    defaultProps.onToggleArchived.mockReset()
  })

  it('clicking_all_calls_onSelectCategory_with_null', () => {
    const onSelectCategory = jest.fn()

    render(<Sidebar {...defaultProps} onSelectCategory={onSelectCategory} />)

    const allButton = screen.getByRole('button', { name: /All/i })
    fireEvent.click(allButton)

    expect(onSelectCategory).toHaveBeenCalledWith(null)
  })

  it('clicking_category_calls_handler_with_name', () => {
    const onSelectCategory = jest.fn()

    render(<Sidebar {...defaultProps} onSelectCategory={onSelectCategory} />)

    const mindfulnessButton = screen.getByRole('button', { name: /Mindfulness/i })
    fireEvent.click(mindfulnessButton)

    expect(onSelectCategory).toHaveBeenCalledWith('Mindfulness')
  })

  it('zero_count_category_is_disabled', () => {
    render(<Sidebar {...defaultProps} />)

    const fitnessButton = screen.getByRole('button', { name: /Fitness/i })
    expect(fitnessButton).toBeDisabled()
  })

  it('nonzero_count_category_is_enabled', () => {
    render(<Sidebar {...defaultProps} />)

    const mindfulnessButton = screen.getByRole('button', { name: /Mindfulness/i })
    expect(mindfulnessButton).not.toBeDisabled()
  })

  it('archive_button_calls_onToggleArchived', () => {
    const onToggleArchived = jest.fn()

    render(<Sidebar {...defaultProps} onToggleArchived={onToggleArchived} />)

    // The archive button shows "Archived" text when not showing archived
    const archiveButton = screen.getByRole('button', { name: /Archived/i })
    fireEvent.click(archiveButton)

    expect(onToggleArchived).toHaveBeenCalled()
  })

  it('selected_category_has_active_styling', () => {
    render(<Sidebar {...defaultProps} selectedCategory="Mindfulness" />)

    const mindfulnessButton = screen.getByRole('button', { name: /Mindfulness/i })
    // The selected category gets bg-amber-100 class
    expect(mindfulnessButton.className).toContain('bg-amber-100')
  })
})
