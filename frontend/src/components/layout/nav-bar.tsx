"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Grid, User, Settings, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'

export function NavBar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const navigation = [
    { name: 'Habits', href: '/habits', icon: Grid },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  return (
    <div className="border-b border-amber-200/50 bg-white/90 backdrop-blur-sm dark:bg-gray-900/90 sticky top-0 z-10">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-semibold">
          <Link href="/" className="text-2xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-500">Atomic Habits</span>
          </Link>
        </div>
        <nav className="mx-6 flex items-center space-x-4 lg:space-x-6">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary flex items-center gap-2',
                  pathname === item.href
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-gray-600 dark:text-gray-400'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900/30"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900/30"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}