import React from 'react'

export const useTheme = jest.fn(() => ({
  theme: 'light',
  setTheme: jest.fn(),
}))

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => children
