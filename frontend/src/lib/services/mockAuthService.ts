// src/lib/services/mockAuthService.ts
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/auth';
import { initializeMockData, mockUser, resetMockData } from './mockData';

export class MockAuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Initialize mock data if it doesn't exist
    initializeMockData();

    // Simple validation - for demo, we accept any credentials or specific demo credentials
    if (credentials.email === 'demo@example.com' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      const authResponse: AuthResponse = {
        access_token: 'demo_mock_jwt_token',
        token_type: 'bearer'
      };
      
      this.setToken(authResponse.access_token);
      this.setUser(mockUser);
      
      return authResponse;
    }
    
    throw new Error('Invalid login credentials. For demo, use email: demo@example.com and any password.');
  }

  static async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    // For demo mode, just return success and reset to the demo state
    resetMockData();
    
    const authResponse: AuthResponse = {
      access_token: 'demo_mock_jwt_token',
      token_type: 'bearer'
    };
    
    return authResponse;
  }

  static async getCurrentUser(): Promise<User> {
    // Initialize mock data if it doesn't exist
    initializeMockData();
    
    // Get the user from localStorage or use the mockUser
    const userStr = localStorage.getItem('demo_user');
    return userStr ? JSON.parse(userStr) : mockUser;
  }

  static getToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('demo_token') : null;
  }

  static setToken(token: string): void {
    localStorage.setItem('demo_token', token);
  }

  static removeToken(): void {
    localStorage.removeItem('demo_token');
  }

  static getUser(): User | null {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('demo_user') : null;
    return userStr ? JSON.parse(userStr) : null;
  }

  static setUser(user: User): void {
    localStorage.setItem('demo_user', JSON.stringify(user));
  }

  static removeUser(): void {
    localStorage.removeItem('demo_user');
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static logout(): void {
    this.removeToken();
    this.removeUser();
  }
}