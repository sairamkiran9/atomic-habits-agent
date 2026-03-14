const mockPush = jest.fn()
const mockReplace = jest.fn()

export const useRouter = jest.fn(() => ({
  push: mockPush,
  replace: mockReplace,
  prefetch: jest.fn(),
  back: jest.fn(),
}))

export const usePathname = jest.fn(() => '/')
export const useSearchParams = jest.fn(() => new URLSearchParams())
