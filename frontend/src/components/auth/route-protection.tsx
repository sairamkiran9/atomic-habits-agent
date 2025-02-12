"use client"

import { usePathname } from 'next/navigation'

const publicRoutes = ['/', '/login']

export function RouteProtection({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isPublicRoute = publicRoutes.includes(pathname)

  // TODO: Add actual authentication check here
  const isAuthenticated = true // For development, always return true

  if (isPublicRoute || isAuthenticated) {
    return <>{children}</>
  }

  // TODO: Add redirect to login or authentication flow
  return null
}