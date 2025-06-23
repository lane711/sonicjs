import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock Cloudflare bindings for testing
global.DB = {
  prepare: jest.fn(() => ({
    bind: jest.fn(() => ({
      all: jest.fn(),
      first: jest.fn(),
      run: jest.fn(),
    })),
  })),
}