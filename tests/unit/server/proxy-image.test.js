/**
 * Image Proxy API tests
 * Tests for avatar image proxying and security
 */
import { describe, it, expect, beforeEach, vi, afterEach } from '@jest/globals'

// Mock fetch for Node.js environment
global.fetch = vi.fn()

// Mock Nuxt server utilities
const mockSetHeader = vi.fn()
const mockGetQuery = vi.fn()
const mockCreateError = vi.fn()

vi.mock('h3', () => ({
  defineEventHandler: (handler) => handler,
  getQuery: mockGetQuery,
  setHeader: mockSetHeader,
  createError: mockCreateError
}))

describe('Image Proxy API', () => {
  let proxyHandler

  beforeEach(async () => {
    vi.clearAllMocks()

    // Mock successful fetch response
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: {
        get: vi.fn((header) => {
          if (header === 'Content-Type') return 'image/jpeg'
          return null
        })
      },
      body: 'mock-image-data'
    }
    global.fetch.mockResolvedValue(mockResponse)

    // Import the handler
    const module = await import('~/server/api/proxy-image.js')
    proxyHandler = module.default
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('URL Validation', () => {
    it('should reject request without URL parameter', async () => {
      mockGetQuery.mockReturnValue({})
      mockCreateError.mockImplementation(({ statusCode, statusMessage }) => {
        const error = new Error(statusMessage)
        error.statusCode = statusCode
        throw error
      })

      const mockEvent = {}

      await expect(proxyHandler(mockEvent))
        .rejects.toMatchObject({
          statusCode: 400
        })

      expect(mockCreateError).toHaveBeenCalledWith({
        statusCode: 400,
        statusMessage: 'URL parameter is required'
      })
    })

    it('should reject invalid URL format', async () => {
      mockGetQuery.mockReturnValue({ url: 'invalid-url' })
      mockCreateError.mockImplementation(({ statusCode, statusMessage }) => {
        const error = new Error(statusMessage)
        error.statusCode = statusCode
        throw error
      })

      const mockEvent = {}

      await expect(proxyHandler(mockEvent))
        .rejects.toMatchObject({
          statusCode: 400
        })
    })

    it('should reject URLs from disallowed domains', async () => {
      mockGetQuery.mockReturnValue({
        url: 'https://malicious-site.com/image.jpg'
      })
      mockCreateError.mockImplementation(({ statusCode, statusMessage }) => {
        const error = new Error(statusMessage)
        error.statusCode = statusCode
        throw error
      })

      const mockEvent = {}

      await expect(proxyHandler(mockEvent))
        .rejects.toMatchObject({
          statusCode: 403
        })
    })

    it('should allow Google profile images', async () => {
      const testUrl = 'https://lh3.googleusercontent.com/abc123=s96-c'
      mockGetQuery.mockReturnValue({ url: testUrl })

      const mockEvent = {}

      const result = await proxyHandler(mockEvent)

      expect(global.fetch).toHaveBeenCalledWith(
        testUrl,
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': expect.any(String),
            'Referer': 'https://lh3.googleusercontent.com'
          })
        })
      )

      expect(result).toBe('mock-image-data')
    })

    it('should allow GitHub avatars', async () => {
      const testUrl = 'https://avatars.githubusercontent.com/u/12345?v=4'
      mockGetQuery.mockReturnValue({ url: testUrl })

      const mockEvent = {}

      await proxyHandler(mockEvent)

      expect(global.fetch).toHaveBeenCalledWith(
        testUrl,
        expect.anything()
      )
    })

    it('should allow Gravatar images', async () => {
      const testUrl = 'https://www.gravatar.com/avatar/abc123?s=96&d=identicon'
      mockGetQuery.mockReturnValue({ url: testUrl })

      const mockEvent = {}

      await proxyHandler(mockEvent)

      expect(global.fetch).toHaveBeenCalledWith(
        testUrl,
        expect.anything()
      )
    })
  })

  describe('Image Fetching', () => {
    it('should fetch image successfully', async () => {
      const testUrl = 'https://lh3.googleusercontent.com/abc123=s96-c'
      mockGetQuery.mockReturnValue({ url: testUrl })

      const mockEvent = {}

      const result = await proxyHandler(mockEvent)

      expect(global.fetch).toHaveBeenCalledWith(
        testUrl,
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': expect.stringContaining('Mozilla'),
            'Referer': 'https://lh3.googleusercontent.com'
          })
        })
      )

      expect(result).toBe('mock-image-data')
    })

    it('should set appropriate response headers', async () => {
      const testUrl = 'https://lh3.googleusercontent.com/abc123=s96-c'
      mockGetQuery.mockReturnValue({ url: testUrl })

      const mockEvent = {}

      await proxyHandler(mockEvent)

      expect(mockSetHeader).toHaveBeenCalledWith(mockEvent, 'Content-Type', 'image/jpeg')
      expect(mockSetHeader).toHaveBeenCalledWith(mockEvent, 'Cache-Control', 'public, max-age=86400')
      expect(mockSetHeader).toHaveBeenCalledWith(mockEvent, 'Access-Control-Allow-Origin', '*')
      expect(mockSetHeader).toHaveBeenCalledWith(mockEvent, 'Cross-Origin-Resource-Policy', 'cross-origin')
    })

    it('should handle fetch errors', async () => {
      const testUrl = 'https://lh3.googleusercontent.com/abc123=s96-c'
      mockGetQuery.mockReturnValue({ url: testUrl })

      // Mock fetch failure
      global.fetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      mockCreateError.mockImplementation(({ statusCode, statusMessage }) => {
        const error = new Error(statusMessage)
        error.statusCode = statusCode
        throw error
      })

      const mockEvent = {}

      await expect(proxyHandler(mockEvent))
        .rejects.toMatchObject({
          statusCode: 404
        })
    })

    it('should handle network errors', async () => {
      const testUrl = 'https://lh3.googleusercontent.com/abc123=s96-c'
      mockGetQuery.mockReturnValue({ url: testUrl })

      // Mock network error
      global.fetch.mockRejectedValue(new Error('Network error'))

      mockCreateError.mockImplementation(({ statusCode, statusMessage }) => {
        const error = new Error(statusMessage)
        error.statusCode = statusCode
        throw error
      })

      const mockEvent = {}

      await expect(proxyHandler(mockEvent))
        .rejects.toMatchObject({
          statusCode: 500
        })
    })

    it('should use default content type when not provided', async () => {
      const testUrl = 'https://lh3.googleusercontent.com/abc123=s96-c'
      mockGetQuery.mockReturnValue({ url: testUrl })

      // Mock response without content-type
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn(() => null) // No content-type header
        },
        body: 'mock-image-data'
      })

      const mockEvent = {}

      await proxyHandler(mockEvent)

      expect(mockSetHeader).toHaveBeenCalledWith(mockEvent, 'Content-Type', 'image/jpeg')
    })
  })

  describe('Security Features', () => {
    const maliciousDomains = [
      'https://evil.com/image.jpg',
      'https://phishing-site.net/avatar.png',
      'https://attacker.org/profile.gif'
    ]

    maliciousDomains.forEach(url => {
      it(`should block ${url}`, async () => {
        mockGetQuery.mockReturnValue({ url })
        mockCreateError.mockImplementation(({ statusCode }) => {
          const error = new Error('Domain not allowed')
          error.statusCode = statusCode
          throw error
        })

        const mockEvent = {}

        await expect(proxyHandler(mockEvent))
          .rejects.toMatchObject({
            statusCode: 403
          })

        expect(global.fetch).not.toHaveBeenCalled()
      })
    })

    it('should validate URL parsing', async () => {
      const malformedUrls = [
        'not-a-url',
        'http://',
        '://invalid',
        'javascript:alert(1)'
      ]

      for (const url of malformedUrls) {
        mockGetQuery.mockReturnValue({ url })
        mockCreateError.mockImplementation(({ statusCode }) => {
          const error = new Error('Invalid URL format')
          error.statusCode = statusCode
          throw error
        })

        const mockEvent = {}

        await expect(proxyHandler(mockEvent))
          .rejects.toMatchObject({
            statusCode: 400
          })
      }
    })

    it('should set proper CORS headers for browser access', async () => {
      const testUrl = 'https://lh3.googleusercontent.com/abc123=s96-c'
      mockGetQuery.mockReturnValue({ url: testUrl })

      const mockEvent = {}

      await proxyHandler(mockEvent)

      expect(mockSetHeader).toHaveBeenCalledWith(
        mockEvent,
        'Access-Control-Allow-Origin',
        '*'
      )
      expect(mockSetHeader).toHaveBeenCalledWith(
        mockEvent,
        'Cross-Origin-Resource-Policy',
        'cross-origin'
      )
    })
  })
})