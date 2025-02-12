import type { Metadata } from 'next'
import { Inter as InterFont } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '../components/providers/theme-provider'

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
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}