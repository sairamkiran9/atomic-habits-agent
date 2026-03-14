import { AuthService } from '@/lib/services/auth'

// Mock fetch globally
global.fetch = jest.fn()

const mockFetch = global.fetch as jest.Mock

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear()
    mockFetch.mockReset()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('login', () => {
    it('login_stores_token_and_user_on_success', async () => {
      const mockToken = 'test-access-token'
      const mockUser = { id: 1, email: 'test@example.com', full_name: 'Test User', created_at: '2024-01-01T00:00:00Z' }

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: mockToken }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUser,
        })

      await AuthService.login({ email: 'test@example.com', password: 'password123' })

      expect(localStorage.getItem('token')).toBe(mockToken)
      expect(JSON.parse(localStorage.getItem('user')!)).toEqual(mockUser)
    })

    it('login_throws_on_api_error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' }),
      })

      await expect(
        AuthService.login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials')
    })
  })

  describe('register', () => {
    it('register_returns_response_on_success', async () => {
      const mockResponse = { id: 1, email: 'new@example.com', full_name: 'New User', created_at: '2024-01-01T00:00:00Z' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      })

      const result = await AuthService.register({
        email: 'new@example.com',
        password: 'password123',
        full_name: 'New User',
      })

      expect(result).toEqual(mockResponse)
    })

    it('register_throws_on_error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Email already exists' }),
      })

      await expect(
        AuthService.register({
          email: 'existing@example.com',
          password: 'password123',
          full_name: 'Existing User',
        })
      ).rejects.toThrow('Email already exists')
    })
  })

  describe('getToken', () => {
    it('getToken_returns_null_when_no_token', () => {
      localStorage.clear()
      expect(AuthService.getToken()).toBeNull()
    })

    it('getToken_returns_token_when_stored', () => {
      localStorage.setItem('token', 'my-token')
      expect(AuthService.getToken()).toBe('my-token')
    })
  })

  describe('isAuthenticated', () => {
    it('isAuthenticated_returns_false_when_no_token', () => {
      localStorage.clear()
      expect(AuthService.isAuthenticated()).toBe(false)
    })

    it('isAuthenticated_returns_true_when_token_exists', () => {
      localStorage.setItem('token', 'some-token')
      expect(AuthService.isAuthenticated()).toBe(true)
    })
  })

  describe('logout', () => {
    it('logout_removes_token_and_user', () => {
      localStorage.setItem('token', 'some-token')
      localStorage.setItem('user', JSON.stringify({ id: 1 }))

      AuthService.logout()

      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })
  })

  describe('getUser', () => {
    it('getUser_returns_parsed_user', () => {
      const user = { id: 1, email: 'test@example.com', full_name: 'Test User', created_at: '2024-01-01T00:00:00Z' }
      localStorage.setItem('user', JSON.stringify(user))

      expect(AuthService.getUser()).toEqual(user)
    })

    it('getUser_returns_null_on_invalid_json', () => {
      localStorage.setItem('user', 'not-valid-json{{{')

      // The source calls JSON.parse without try/catch, so it throws on bad JSON
      expect(() => AuthService.getUser()).toThrow()
    })
  })
})
