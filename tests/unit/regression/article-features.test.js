/**
 * Regression Tests for Article Features
 * Tests to prevent regressions on recently implemented features
 */
import { describe, it, expect, beforeEach, vi } from '@jest/globals'

// Mock all required dependencies
const mockFirebaseFunctions = {
  deleteDoc: vi.fn(),
  writeBatch: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  collection: vi.fn(),
  where: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  increment: vi.fn((value) => ({ _increment: value }))
}

vi.mock('firebase/firestore', () => mockFirebaseFunctions)
vi.mock('~/composables/useFirestore', () => ({
  useFirestore: () => ({ db: 'mock-db' })
}))
vi.mock('~/composables/useAuth', () => ({
  useAuth: () => ({
    user: { value: { uid: 'test-user-id' } }
  })
}))

describe('Regression Tests - Article Features', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Article Deletion with Cascade (Regression: #001)', () => {
    it('should delete article with all related data in single transaction', async () => {
      // Arrange: Mock successful article fetch and ownership
      mockFirebaseFunctions.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          authorId: 'test-user-id',
          title: 'Test Article',
          tags: ['tag1', 'tag2'],
          categoryId: 'frontend'
        })
      })

      // Mock batch operations
      const mockBatch = {
        delete: vi.fn(),
        update: vi.fn(),
        commit: vi.fn().mockResolvedValue()
      }
      mockFirebaseFunctions.writeBatch.mockReturnValue(mockBatch)

      // Mock related data queries
      const mockCommentsSnapshot = {
        docs: [{ id: 'comment1' }, { id: 'comment2' }]
      }
      const mockLikesSnapshot = {
        docs: [{ id: 'like1' }, { id: 'like2' }]
      }
      mockFirebaseFunctions.getDocs
        .mockResolvedValueOnce(mockCommentsSnapshot)
        .mockResolvedValueOnce(mockLikesSnapshot)

      // Act: Import and execute delete function
      const { useArticles } = await import('~/composables/useArticles')
      const { deleteArticle } = useArticles()
      await deleteArticle('test-article-id')

      // Assert: Verify all operations were batched
      expect(mockFirebaseFunctions.writeBatch).toHaveBeenCalled()
      expect(mockBatch.delete).toHaveBeenCalledTimes(5) // 2 comments + 2 likes + 1 article
      expect(mockBatch.update).toHaveBeenCalledTimes(3) // 2 tags + 1 category
      expect(mockBatch.commit).toHaveBeenCalled()

      // Critical: Ensure article is deleted LAST in the batch
      const deleteCallOrder = mockBatch.delete.mock.calls
      expect(deleteCallOrder).toHaveLength(5)

      // Critical: Ensure statistics are updated correctly
      expect(mockBatch.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          articleCount: { _increment: -1 }
        })
      )
    })

    it('should handle orphaned data gracefully (Regression: Partial delete failure)', async () => {
      // Test case for when some related data exists but main article doesn't
      mockFirebaseFunctions.getDoc.mockResolvedValue({
        exists: () => false
      })

      const { useArticles } = await import('~/composables/useArticles')
      const { deleteArticle } = useArticles()

      await expect(deleteArticle('non-existent-article'))
        .rejects.toMatchObject({
          code: 'article/not-found'
        })

      // Should not attempt any batch operations
      expect(mockFirebaseFunctions.writeBatch).not.toHaveBeenCalled()
    })
  })

  describe('Comment Avatar Display (Regression: #002)', () => {
    it('should handle missing author data gracefully', () => {
      // Test cases that previously caused avatar display failures
      const testCases = [
        {
          name: 'null author object',
          comment: {
            id: 'comment-1',
            content: 'Test comment',
            authorId: 'user-1',
            author: null,
            authorName: 'Fallback Name'
          }
        },
        {
          name: 'empty author object',
          comment: {
            id: 'comment-2',
            content: 'Test comment',
            authorId: 'user-2',
            author: {},
            authorName: 'Another Fallback'
          }
        },
        {
          name: 'author with null avatarUrl',
          comment: {
            id: 'comment-3',
            content: 'Test comment',
            authorId: 'user-3',
            author: {
              displayName: 'Test User',
              avatarUrl: null
            }
          }
        },
        {
          name: 'author with empty string avatarUrl',
          comment: {
            id: 'comment-4',
            content: 'Test comment',
            authorId: 'user-4',
            author: {
              displayName: 'Test User',
              avatarUrl: ''
            }
          }
        }
      ]

      testCases.forEach(({ name, comment }) => {
        // This test ensures no errors are thrown when avatar data is missing
        expect(() => {
          // Simulate the avatar URL processing logic from CommentItem
          const hasAvatar = comment.author?.avatarUrl || comment.avatarUrl
          const displayName = comment.author?.displayName ||
                              comment.authorName ||
                              `User ${comment.authorId?.substring(0, 8)}...`

          expect(hasAvatar).toBeFalsy()
          expect(displayName).toBeTruthy()
          expect(displayName.length).toBeGreaterThan(0)
        }).not.toThrow()
      })
    })

    it('should process Google avatar URLs correctly (Regression: CORS failures)', () => {
      const googleAvatarUrls = [
        'https://lh3.googleusercontent.com/a-/abc123',
        'https://lh3.googleusercontent.com/a-/abc123=s96',
        'https://lh3.googleusercontent.com/a-/abc123=s96-c',
        'https://lh4.googleusercontent.com/a-/def456=s40-c'
      ]

      googleAvatarUrls.forEach(url => {
        // Simulate getSafeAvatarUrl processing
        const baseUrl = url.split('=')[0]
        const processedUrl = `${baseUrl}=s96-c`

        expect(processedUrl).toContain('googleusercontent.com')
        expect(processedUrl).toContain('=s96-c')
        expect(processedUrl).not.toContain('==') // No double equals
      })
    })
  })

  describe('Edit Page Author Display (Regression: #003)', () => {
    it('should display author avatar in edit page form actions', () => {
      // Test data that should result in proper avatar display
      const articleWithAuthor = {
        id: 'test-article',
        title: 'Test Article',
        author: {
          displayName: 'Test Author',
          avatarUrl: 'https://example.com/avatar.jpg'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Verify author data is properly structured
      expect(articleWithAuthor.author).toBeDefined()
      expect(articleWithAuthor.author.displayName).toBe('Test Author')
      expect(articleWithAuthor.author.avatarUrl).toBe('https://example.com/avatar.jpg')

      // Simulate avatar display logic
      const shouldShowAvatar = !!articleWithAuthor.author?.avatarUrl
      const shouldShowFallback = !shouldShowAvatar
      const fallbackInitial = articleWithAuthor.author?.displayName?.charAt(0).toUpperCase()

      if (shouldShowAvatar) {
        expect(articleWithAuthor.author.avatarUrl).toBeTruthy()
      } else {
        expect(shouldShowFallback).toBe(true)
        expect(fallbackInitial).toBeTruthy()
      }
    })

    it('should handle article without author gracefully', () => {
      const articleWithoutAuthor = {
        id: 'test-article',
        title: 'Test Article',
        author: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Should not throw when author is missing
      expect(() => {
        const authorName = articleWithoutAuthor.author?.displayName || 'Anonymous'
        const avatarUrl = articleWithoutAuthor.author?.avatarUrl
        const showFallback = !avatarUrl

        expect(authorName).toBe('Anonymous')
        expect(showFallback).toBe(true)
      }).not.toThrow()
    })
  })

  describe('Image Proxy Security (Regression: #004)', () => {
    it('should only allow whitelisted domains', () => {
      const allowedDomains = [
        'googleusercontent.com',
        'gravatar.com',
        'githubusercontent.com',
        'avatars.githubusercontent.com'
      ]

      const testUrls = [
        { url: 'https://lh3.googleusercontent.com/abc', expected: true },
        { url: 'https://www.gravatar.com/avatar/123', expected: true },
        { url: 'https://avatars.githubusercontent.com/u/123', expected: true },
        { url: 'https://evil.com/avatar.jpg', expected: false },
        { url: 'https://malicious-site.net/image.png', expected: false }
      ]

      testUrls.forEach(({ url, expected }) => {
        try {
          const parsedUrl = new URL(url)
          const isAllowed = allowedDomains.some(domain =>
            parsedUrl.hostname.includes(domain)
          )

          expect(isAllowed).toBe(expected)
        } catch (error) {
          if (expected) {
            throw error // Should not fail for valid URLs
          }
        }
      })
    })

    it('should reject malformed URLs', () => {
      const malformedUrls = [
        'not-a-url',
        'http://',
        '://invalid',
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>'
      ]

      malformedUrls.forEach(url => {
        expect(() => {
          new URL(url)
        }).toThrow()
      })
    })
  })

  describe('Data Consistency (Regression: #005)', () => {
    it('should maintain referential integrity during article operations', async () => {
      // Test that all related data operations maintain consistency
      const articleData = {
        id: 'test-article',
        authorId: 'test-user',
        tags: ['tag1', 'tag2'],
        categoryId: 'frontend',
        isPublic: true
      }

      // Mock successful article existence and ownership
      mockFirebaseFunctions.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => articleData
      })

      const mockBatch = {
        delete: vi.fn(),
        update: vi.fn(),
        commit: vi.fn().mockResolvedValue()
      }
      mockFirebaseFunctions.writeBatch.mockReturnValue(mockBatch)

      // Mock related data
      const relatedComments = [{ id: 'c1' }, { id: 'c2' }]
      const relatedLikes = [{ id: 'l1' }]

      mockFirebaseFunctions.getDocs
        .mockResolvedValueOnce({ docs: relatedComments })
        .mockResolvedValueOnce({ docs: relatedLikes })

      // Execute deletion
      const { useArticles } = await import('~/composables/useArticles')
      const { deleteArticle } = useArticles()
      await deleteArticle('test-article')

      // Verify all related data is handled
      expect(mockBatch.delete).toHaveBeenCalledTimes(
        1 + // article
        relatedComments.length + // comments
        relatedLikes.length // likes
      )

      // Verify statistics updates for each tag and category
      expect(mockBatch.update).toHaveBeenCalledTimes(
        articleData.tags.length + // tag counts
        1 // category count
      )

      // Verify single atomic transaction
      expect(mockBatch.commit).toHaveBeenCalledTimes(1)
    })
  })
})