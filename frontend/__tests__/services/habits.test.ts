import { HabitsService } from '@/lib/services/habits'

// Mock fetch globally
global.fetch = jest.fn()

const mockFetch = global.fetch as jest.Mock

describe('HabitsService', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('token', 'test-token')
    mockFetch.mockReset()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getHabits', () => {
    it('getHabits_calls_reset_before_fetch', async () => {
      const mockHabits = [
        { id: 1, title: 'Test Habit', description: 'desc', frequency: 'daily', streak: 0, completed: false, category: 'Health', is_archived: false, last_completed: null, time_of_day: null, reminder_time: null, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
      ]

      mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => ({ reset_count: 0, message: 'ok' }) })
        .mockResolvedValueOnce({ ok: true, json: async () => mockHabits })

      await HabitsService.getHabits()

      expect(mockFetch).toHaveBeenCalledTimes(2)
      const firstCall = mockFetch.mock.calls[0]
      expect(firstCall[0]).toContain('/habits/reset')
      expect(firstCall[1]?.method).toBe('POST')
    })

    it('getHabits_includes_archived_true_in_url', async () => {
      const mockHabits: never[] = []

      mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => ({ reset_count: 0 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => mockHabits })

      await HabitsService.getHabits()

      const secondCall = mockFetch.mock.calls[1]
      expect(secondCall[0]).toContain('include_archived=true')
    })
  })

  describe('checkAndResetHabits', () => {
    it('checkAndResetHabits_returns_true_on_200', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ reset_count: 0 }) })

      const result = await HabitsService.checkAndResetHabits()

      expect(result).toBe(true)
    })

    it('checkAndResetHabits_returns_false_on_error_status', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })

      const result = await HabitsService.checkAndResetHabits()

      expect(result).toBe(false)
    })

    it('checkAndResetHabits_returns_false_on_network_error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await HabitsService.checkAndResetHabits()

      expect(result).toBe(false)
    })
  })

  describe('createHabit', () => {
    it('createHabit_posts_to_habits_endpoint', async () => {
      const newHabitData = {
        title: 'New Habit',
        description: 'A test habit',
        frequency: 'daily' as const,
        category: 'Health' as const,
      }
      const createdHabit = { id: 1, ...newHabitData, streak: 0, completed: false, is_archived: false, last_completed: null, time_of_day: null, reminder_time: null, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }

      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => createdHabit })

      const result = await HabitsService.createHabit(newHabitData)

      expect(mockFetch).toHaveBeenCalledTimes(1)
      const [url, options] = mockFetch.mock.calls[0]
      expect(url).toContain('/habits')
      expect(options.method).toBe('POST')
      expect(JSON.parse(options.body)).toMatchObject(newHabitData)
      expect(result).toEqual(createdHabit)
    })
  })

  describe('updateHabit', () => {
    it('updateHabit_sends_last_completed_when_completing', async () => {
      const updatedHabit = { id: 1, title: 'Habit', completed: true, last_completed: new Date().toISOString(), streak: 1, description: '', frequency: 'daily', category: 'Health', is_archived: false, time_of_day: null, reminder_time: null, created_at: '2024-01-01T00:00:00Z', updated_at: new Date().toISOString() }

      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => updatedHabit })

      await HabitsService.updateHabit(1, { completed: true })

      const [, options] = mockFetch.mock.calls[0]
      const body = JSON.parse(options.body)
      expect(body.completed).toBe(true)
      expect(body.last_completed).toBeTruthy()
      // Should be a valid ISO string
      expect(() => new Date(body.last_completed)).not.toThrow()
      expect(new Date(body.last_completed).toISOString()).toBe(body.last_completed)
    })

    it('updateHabit_sends_null_last_completed_when_uncompleting', async () => {
      const updatedHabit = { id: 1, title: 'Habit', completed: false, last_completed: null, streak: 0, description: '', frequency: 'daily', category: 'Health', is_archived: false, time_of_day: null, reminder_time: null, created_at: '2024-01-01T00:00:00Z', updated_at: new Date().toISOString() }

      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => updatedHabit })

      await HabitsService.updateHabit(1, { completed: false })

      const [, options] = mockFetch.mock.calls[0]
      const body = JSON.parse(options.body)
      expect(body.completed).toBe(false)
      expect(body.last_completed).toBeNull()
    })
  })

  describe('toggleArchiveHabit', () => {
    it('toggleArchiveHabit_calls_getHabit_after_toggle', async () => {
      const archiveResponse = { id: 1, title: 'Habit', is_archived: true, message: 'Archived' }
      const fullHabit = { id: 1, title: 'Habit', completed: false, last_completed: null, streak: 0, description: '', frequency: 'daily', category: 'Health', is_archived: true, time_of_day: null, reminder_time: null, created_at: '2024-01-01T00:00:00Z', updated_at: new Date().toISOString() }

      mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => archiveResponse })
        .mockResolvedValueOnce({ ok: true, json: async () => fullHabit })

      await HabitsService.toggleArchiveHabit(1)

      expect(mockFetch).toHaveBeenCalledTimes(2)
      const secondCall = mockFetch.mock.calls[1]
      expect(secondCall[0]).toContain('/habits/1')
      // Second call should be a GET (no method specified = default GET)
      expect(secondCall[1]?.method).toBeUndefined()
    })
  })

  describe('deleteHabit', () => {
    it('deleteHabit_throws_on_non_ok_response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 })

      await expect(HabitsService.deleteHabit(9999)).rejects.toThrow()
    })
  })

  describe('authorization headers', () => {
    it('all_requests_include_authorization_header', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => ({ reset_count: 0 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => [] })

      await HabitsService.getHabits()

      for (const call of mockFetch.mock.calls) {
        const [, options] = call
        expect(options?.headers).toMatchObject({
          Authorization: 'Bearer test-token',
        })
      }
    })
  })
})
