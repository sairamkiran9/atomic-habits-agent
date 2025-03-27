import type { Metadata } from 'next'
import { RouteProtection } from '@/components/auth/route-protection'

export const metadata: Metadata = {
  title: 'My Habits - Atomic Habits Agent',
  description: 'Track and manage your habits',
}

export default function HabitsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteProtection>
      <div className="min-h-[calc(80vh-4rem)] bg-gradient-to-br from-purple-50 to-violet-100">
        {children}
      </div>
    </RouteProtection>
  )
}