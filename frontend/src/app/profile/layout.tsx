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
      <div className="min-h-[calc(80vh-4rem)] bg-gradient-to-br from-amber-10 to-[#f7e8dc]">
        {children}
      </div>
    </RouteProtection>
  )
}