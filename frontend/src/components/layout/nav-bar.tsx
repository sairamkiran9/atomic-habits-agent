"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Grid, User, Settings } from 'lucide-react'

export function NavBar() {
  const pathname = usePathname()

  const navigation = [
    { name: 'Habits', href: '/habits', icon: Grid },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  return (
    <div className="border-b bg-white">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-2 font-semibold">
          <Link href="/" className="text-primary text-xl">
            Atomic Habits
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
                    ? 'text-primary'
                    : 'text-muted-foreground'
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
            className="text-muted-foreground"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}