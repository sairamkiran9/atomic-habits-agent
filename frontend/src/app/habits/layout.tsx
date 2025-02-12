import type { Metadata } from 'next'

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100">
      {children}
    </div>
  );
}