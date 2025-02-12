import type { Metadata } from 'next'
import { RouteProtection } from '@/components/auth/route-protection'

export const metadata: Metadata = {
  title: 'Profile - Atomic Habits Agent',
  description: 'View your habit statistics and progress',
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteProtection>
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-purple-50 to-violet-100">
        {children}
      </div>
    </RouteProtection>
  )
}