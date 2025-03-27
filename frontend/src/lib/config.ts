// src/lib/config.ts

/**
 * Application configuration settings that can be environment-specific
 */
const config = {
  /**
   * API base URL used for all backend requests
   * Uses the NEXT_PUBLIC_API_URL environment variable or falls back to localhost
   */
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  
  /**
   * Determines if the application is running in demo mode
   * Can be set via NEXT_PUBLIC_DEMO_MODE environment variable or localStorage
   */
  isDemo: () => {
    // Check if demo mode is enabled via environment variable
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      return true;
    }
    
    // Check if we're in a browser and demoMode is set in localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('demoMode') === 'true';
    }
    
    return false;
  }
};

export default config;
