"use client"

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const publicRoutes = ['/', '/login']

export function RouteProtection({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const isPublicRoute = publicRoutes.includes(pathname)
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('token')

  useEffect(() => {
    if (!isPublicRoute && !isAuthenticated) {
      router.push('/login')
    }
  }, [isPublicRoute, isAuthenticated, router])

  if (!isPublicRoute && !isAuthenticated) {
    return null
  }

  return <>{children}</>
}
