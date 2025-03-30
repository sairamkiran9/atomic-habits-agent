// src/lib/services/index.ts
import { AuthService } from './auth';
import { HabitsService } from './habits';
import { MockAuthService } from './mockAuthService';
import { MockHabitsService } from './mockHabitsService';

// Determine if we're in demo mode
const isDemo = () => {
  // Check if demo mode is enabled via environment variable
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return true;
  }
  
  // Check if we're in a browser and demoMode is set in localStorage
  if (typeof window !== 'undefined') {
    return localStorage.getItem('demoMode') === 'true';
  }
  
  return false;
};

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