// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter as InterFont } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { DemoModeProvider } from '@/components/providers/demo-mode-provider'
import { NavBar } from '@/components/layout/nav-bar'
import { DemoBanner } from '@/components/layout/demo-banner'

const inter = InterFont({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  title: 'Atomic Habits Agent',
  description: 'Track and build better habits with Atomic Habits Agent',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={`font-sans antialiased min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DemoModeProvider>
            <DemoBanner />
            <NavBar />
            <main className="flex-1">
              {children}
            </main>
          </DemoModeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}