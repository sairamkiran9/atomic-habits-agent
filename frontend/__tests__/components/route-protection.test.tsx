import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { RouteProtection } from '@/components/auth/route-protection'
import { usePathname, useRouter } from 'next/navigation'

const mockUsePathname = usePathname as jest.Mock
const mockUseRouter = useRouter as jest.Mock
const mockPush = jest.fn()

describe('RouteProtection', () => {
  beforeEach(() => {
    localStorage.clear()
    mockPush.mockReset()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders_children_on_public_root_route', () => {
    mockUsePathname.mockReturnValue('/')

    render(
      <RouteProtection>
        <div>Public Content</div>
      </RouteProtection>
    )

    expect(screen.getByText('Public Content')).toBeInTheDocument()
  })

  it('renders_children_on_login_route', () => {
    mockUsePathname.mockReturnValue('/login')

    render(
      <RouteProtection>
        <div>Login Page</div>
      </RouteProtection>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('renders_children_when_authenticated_on_protected_route', () => {
    localStorage.setItem('token', 'valid-token')
    mockUsePathname.mockReturnValue('/habits')

    render(
      <RouteProtection>
        <div>Protected Content</div>
      </RouteProtection>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects_to_login_on_protected_route_no_auth', async () => {
    mockUsePathname.mockReturnValue('/habits')

    await act(async () => {
      render(
        <RouteProtection>
          <div>Protected Content</div>
        </RouteProtection>
      )
    })

    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('returns_null_for_unauthenticated_protected_route', () => {
    mockUsePathname.mockReturnValue('/habits')

    const { container } = render(
      <RouteProtection>
        <div>Protected Content</div>
      </RouteProtection>
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(container.firstChild).toBeNull()
  })
})
