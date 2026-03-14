import { MockHabitsService } from '@/lib/services/mockHabitsService'
import { Habit } from '@/lib/types/habit'

describe('MockHabitsService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getHabits', () => {
    it('getHabits_returns_initialized_habits', async () => {
      const habits = await MockHabitsService.getHabits()

      expect(Array.isArray(habits)).toBe(true)
      expect(habits.length).toBeGreaterThan(0)
    })
  })

  describe('createHabit', () => {
    it('createHabit_adds_to_list', async () => {
      // Initialize with a fresh state
      await MockHabitsService.getHabits()

      await MockHabitsService.createHabit({
        title: 'Brand New Habit',
        description: 'Testing creation',
        frequency: 'daily',
        category: 'Health',
      })

      const habits = await MockHabitsService.getHabits()
      const found = habits.find(h => h.title === 'Brand New Habit')
      expect(found).toBeDefined()
    })

    it('createHabit_assigns_unique_id', async () => {
      await MockHabitsService.getHabits()

      const habit1 = await MockHabitsService.createHabit({
        title: 'Habit One',
        description: 'First',
        frequency: 'daily',
        category: 'Health',
      })

      const habit2 = await MockHabitsService.createHabit({
        title: 'Habit Two',
        description: 'Second',
        frequency: 'daily',
        category: 'Fitness',
      })

      expect(habit1.id).not.toBe(habit2.id)
    })
  })

  describe('getHabit', () => {
    it('getHabit_returns_correct_habit', async () => {
      await MockHabitsService.getHabits()

      const created = await MockHabitsService.createHabit({
        title: 'Specific Habit',
        description: 'For lookup',
        frequency: 'weekly',
        category: 'Learning',
      })

      const found = await MockHabitsService.getHabit(created.id)
      expect(found).toBeDefined()
      expect(found.id).toBe(created.id)
      expect(found.title).toBe('Specific Habit')
    })

    it('getHabit_throws_on_missing_id', async () => {
      await expect(MockHabitsService.getHabit(99999)).rejects.toThrow()
    })
  })

  describe('updateHabit', () => {
    it('updateHabit_completing_increments_streak', async () => {
      await MockHabitsService.getHabits()

      const created = await MockHabitsService.createHabit({
        title: 'Streak Test',
        description: 'Test streak',
        frequency: 'daily',
        category: 'Health',
      })

      expect(created.streak).toBe(0)

      const updated = await MockHabitsService.updateHabit(created.id, { completed: true })
      expect(updated.streak).toBe(1)
      expect(updated.completed).toBe(true)
    })

    it('updateHabit_uncompleting_decrements_streak', async () => {
      await MockHabitsService.getHabits()

      const created = await MockHabitsService.createHabit({
        title: 'Uncomplete Test',
        description: 'Decrement streak',
        frequency: 'daily',
        category: 'Health',
      })

      // Complete it first
      await MockHabitsService.updateHabit(created.id, { completed: true })

      // Then uncomplete
      const uncompleted = await MockHabitsService.updateHabit(created.id, { completed: false })
      expect(uncompleted.streak).toBe(0)
      expect(uncompleted.completed).toBe(false)
    })

    it('updateHabit_streak_never_goes_negative', async () => {
      await MockHabitsService.getHabits()

      const created = await MockHabitsService.createHabit({
        title: 'Zero Streak',
        description: 'Should not go negative',
        frequency: 'daily',
        category: 'Health',
      })

      expect(created.streak).toBe(0)
      expect(created.completed).toBe(false)

      // Uncomplete when streak is 0 and already not completed — no change
      const result = await MockHabitsService.updateHabit(created.id, { completed: false })
      expect(result.streak).toBeGreaterThanOrEqual(0)
    })
  })

  describe('deleteHabit', () => {
    it('deleteHabit_removes_from_list', async () => {
      await MockHabitsService.getHabits()

      const created = await MockHabitsService.createHabit({
        title: 'To Delete',
        description: 'Will be deleted',
        frequency: 'daily',
        category: 'Other',
      })

      await MockHabitsService.deleteHabit(created.id)

      const habits = await MockHabitsService.getHabits()
      const found = habits.find(h => h.id === created.id)
      expect(found).toBeUndefined()
    })
  })

  describe('checkAndResetHabits', () => {
    it('archived_habits_not_reset_by_checkAndReset', async () => {
      await MockHabitsService.getHabits()

      // Create a habit and archive it with completed=true and old last_completed
      const created = await MockHabitsService.createHabit({
        title: 'Archived Completed',
        description: 'Should not be reset',
        frequency: 'daily',
        category: 'Health',
      })

      // Complete it
      await MockHabitsService.updateHabit(created.id, { completed: true })

      // Archive it
      await MockHabitsService.toggleArchiveHabit(created.id)

      // Manually set an old last_completed date in the habits store by manipulating localStorage
      const habitsStr = localStorage.getItem('demo_habits')
      if (habitsStr) {
        const habits: Habit[] = JSON.parse(habitsStr)
        const idx = habits.findIndex(h => h.id === created.id)
        if (idx !== -1) {
          habits[idx].last_completed = '2020-01-01T00:00:00.000Z'
          localStorage.setItem('demo_habits', JSON.stringify(habits))
        }
      }

      // Run checkAndResetHabits
      await MockHabitsService.checkAndResetHabits()

      // The archived habit should still be marked as completed
      const archived = await MockHabitsService.getHabit(created.id)
      expect(archived.is_archived).toBe(true)
      // Archived habits are skipped in reset — completed state preserved
      expect(archived.completed).toBe(true)
    })
  })
})
