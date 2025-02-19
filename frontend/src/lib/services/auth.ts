import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/auth';

const API_URL = 'http://localhost:8000/api';

export class AuthService {
  private static getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  /**
   * Handles user login and automatically fetches user data
   * @param credentials Login credentials (email/password)
   * @returns Promise containing auth response with token and user data
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const authData = await response.json();
      this.setToken(authData.access_token);
      const userData = await this.getCurrentUser();
      return {
        ...authData,
        user: userData
      };
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  static async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      // this.setToken(data.token);
      // this.setUser(data.full_name);
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async getCurrentUser(): Promise<User> {
    try {
      const response = await fetch(`${API_URL}/user`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const user = await response.json();
      this.setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  }

  static getToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  }

  static setToken(token: string): void {
    localStorage.setItem('token', token);
    console.log(token);
  }

  static removeToken(): void {
    localStorage.removeItem('token');
  }

  static getUser(): User | null {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    return userStr ? JSON.parse(userStr) : null;
  }

  static setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    console.log(user);
  }

  static removeUser(): void {
    localStorage.removeItem('user');
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static logout(): void {
    this.removeToken();
    this.removeUser();
  }
}