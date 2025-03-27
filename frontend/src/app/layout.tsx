// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter as InterFont } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { DemoModeProvider } from '@/components/providers/demo-mode-provider'
import { NavBar } from '@/components/layout/nav-bar'
import { DemoBanner } from '@/components/layout/demo-banner'
import { ParticleBackground } from '@/components/layout/particle-background'

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
      <body className={`font-sans antialiased min-h-screen flex flex-col dot-pattern`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DemoModeProvider>
            <ParticleBackground /> 
            <DemoBanner />
            <NavBar />
            <main className="flex-1 w-full">
              {children}
            </main>
            <footer className="py-6 border-t border-amber-200">
              <div className="max-w-7xl mx-auto px-4 text-center text-amber-800">
                <p>&copy; {new Date().getFullYear()} Atomic Habits Tracker. All rights reserved.</p>
                <p className="mt-2 text-sm">Inspired by James Clear's "Atomic Habits" book.</p>
              </div>
            </footer>
          </DemoModeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}