"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { resetMockData } from '@/lib/services/mockData';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/services';

interface DemoModeContextProps {
  isDemoMode: boolean;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  resetDemo: () => void;
}

const DemoModeContext = createContext<DemoModeContextProps>({
  isDemoMode: false,
  enableDemoMode: () => {},
  disableDemoMode: () => {},
  resetDemo: () => {},
});

export const useDemoMode = () => useContext(DemoModeContext);

export const DemoModeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const router = useRouter();
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  useEffect(() => {
    // Check if demo mode is enabled via environment variable
    const envDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    
    // Check if URL has a demo parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlDemoMode = urlParams.has('demo');
    
    // Check localStorage
    const storedDemoMode = localStorage.getItem('demoMode') === 'true';
    
    // Set demo mode if any of the conditions are true
    const shouldEnableDemo = envDemoMode || urlDemoMode || storedDemoMode;
    setIsDemoMode(shouldEnableDemo);
    
    // If demo mode is enabled, initialize it
    if (shouldEnableDemo) {
      localStorage.setItem('demoMode', 'true');
      resetMockData();
      
      // Set demo token if not already set
      if (!auth.getToken()) {
        auth.setToken('demo_mock_jwt_token');
      }
    }
    
    // If URL has demo parameter, clean it up
    if (urlDemoMode && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('demo');
      window.history.replaceState({}, '', url);
    }
  }, []);
  
  const enableDemoMode = () => {
    localStorage.setItem('demoMode', 'true');
    setIsDemoMode(true);
    resetMockData();
    auth.setToken('demo_mock_jwt_token');
    
    // Redirect to habits page in demo mode
    router.push('/habits');
  };
  
  const disableDemoMode = () => {
    localStorage.removeItem('demoMode');
    // Also clean up other demo storage
    localStorage.removeItem('demo_habits');
    localStorage.removeItem('demo_user');
    localStorage.removeItem('demo_token');
    localStorage.removeItem('demo_habits_completed');
    
    setIsDemoMode(false);
    
    // Redirect to home
    router.push('/');
  };
  
  const resetDemo = () => {
    resetMockData();
    // Refresh the current page
    window.location.reload();
  };
  
  return (
    <DemoModeContext.Provider value={{ 
      isDemoMode, 
      enableDemoMode, 
      disableDemoMode,
      resetDemo
    }}>
      {children}
    </DemoModeContext.Provider>
  );
};