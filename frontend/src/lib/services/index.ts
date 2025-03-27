// src/lib/services/index.ts
import { AuthService } from './auth';
import { HabitsService } from './habits';
import { MockAuthService } from './mockAuthService';
import { MockHabitsService } from './mockHabitsService';
import config from '../config';

// Use the isDemo function from config
const isDemo = config.isDemo;

// For server-side rendering, we need dynamic imports
let authService: typeof AuthService | typeof MockAuthService = AuthService;
let habitsServiceImpl: typeof HabitsService | typeof MockHabitsService = HabitsService;

// Update services if we're in demo mode (client-side only)
if (typeof window !== 'undefined' && isDemo()) {
  authService = MockAuthService;
  habitsServiceImpl = MockHabitsService;
}

// Export the appropriate services
export const auth = authService;
export const habits = habitsServiceImpl;

// Also export dynamic getters for components that need to re-evaluate
export const getAuthService = () => {
  return isDemo() ? MockAuthService : AuthService;
};

export const getHabitsService = () => {
  return isDemo() ? MockHabitsService : HabitsService;
};