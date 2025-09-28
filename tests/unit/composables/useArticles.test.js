/**
 * useArticles composable tests
 * Tests for article CRUD operations and data consistency
 */
import { describe, it, expect, beforeEach, vi, afterEach } from '@jest/globals'

// Mock Firebase functions
const mockDeleteDoc = vi.fn()
const mockWriteBatch = vi.fn()
const mockBatchDelete = vi.fn()
const mockBatchUpdate = vi.fn()
const mockBatchCommit = vi.fn()
const mockGetDocs = vi.fn()
const mockQuery = vi.fn()
const mockCollection = vi.fn()
const mockWhere = vi.fn()
const mockDoc = vi.fn()
const mockGetDoc = vi.fn()
const mockUpdateDoc = vi.fn()

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  deleteDoc: mockDeleteDoc,
  writeBatch: mockWriteBatch,
  getDocs: mockGetDocs,
  query: mockQuery,
  collection: mockCollection,
  where: mockWhere,
  doc: mockDoc,
  getDoc: mockGetDoc,
  updateDoc: mockUpdateDoc,
  increment: vi.fn((value) => ({ _increment: value }))
}))

// Mock Firebase composable
vi.mock('~/composables/useFirestore', () => ({
  useFirestore: () => ({
    db: 'mock-db'
  })
}))

// Mock Auth composable
vi.mock('~/composables/useAuth', () => ({
  useAuth: () => ({
    user: { value: { uid: 'test-user-id' } }
  })
}))

describe('useArticles - Delete Article Feature', () => {
  let useArticles

  beforeEach(async () => {
    vi.clearAllMocks()

    // Setup batch mock
    const mockBatch = {
      delete: mockBatchDelete,
      update: mockBatchUpdate,
      commit: mockBatchCommit
    }
    mockWriteBatch.mockReturnValue(mockBatch)

    // Mock successful document existence and ownership
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        authorId: 'test-user-id',
        title: 'Test Article',
        tags: ['tag1', 'tag2'],
        categoryId: 'frontend'
      })
    })

    // Import the composable after mocks are set
    const module = await import('~/composables/useArticles')
    useArticles = module.useArticles()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('deleteArticle', () => {
    it('should delete article with all related data', async () => {
      // Mock comments query result
      const mockCommentsSnapshot = {
        docs: [
          { id: 'comment1' },
          { id: 'comment2' }
        ]
      }

      // Mock likes query result
      const mockLikesSnapshot = {
        docs: [
          { id: 'like1' },
          { id: 'like2' }
        ]
      }

      mockGetDocs
        .mockResolvedValueOnce(mockCommentsSnapshot) // First call for comments
        .mockResolvedValueOnce(mockLikesSnapshot)    // Second call for likes

      await useArticles.deleteArticle('test-article-id')

      // Verify comments query
      expect(mockQuery).toHaveBeenCalledWith(
        expect.anything(), // collection
        expect.objectContaining({}) // where clause for articleId
      )

      // Verify likes query
      expect(mockQuery).toHaveBeenCalledWith(
        expect.anything(), // collection
        expect.objectContaining({}) // where clause for articleId
      )

      // Verify batch operations
      expect(mockWriteBatch).toHaveBeenCalled()
      expect(mockBatchDelete).toHaveBeenCalledTimes(5) // 2 comments + 2 likes + 1 article
      expect(mockBatchUpdate).toHaveBeenCalledTimes(3) // 2 tags + 1 category
      expect(mockBatchCommit).toHaveBeenCalled()
    })

    it('should check ownership before deletion', async () => {
      // Mock unauthorized user
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          authorId: 'other-user-id', // Different user
          title: 'Test Article',
          tags: ['tag1'],
          categoryId: 'frontend'
        })
      })

      await expect(useArticles.deleteArticle('test-article-id'))
        .rejects.toMatchObject({
          code: 'article/unauthorized'
        })

      // Should not proceed with deletion
      expect(mockWriteBatch).not.toHaveBeenCalled()
    })

    it('should handle non-existent article', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false
      })

      await expect(useArticles.deleteArticle('non-existent-id'))
        .rejects.toMatchObject({
          code: 'article/not-found'
        })
    })

    it('should handle articles without tags or category', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          authorId: 'test-user-id',
          title: 'Test Article',
          tags: [], // No tags
          categoryId: null // No category
        })
      })

      const mockCommentsSnapshot = { docs: [] }
      const mockLikesSnapshot = { docs: [] }
      mockGetDocs
        .mockResolvedValueOnce(mockCommentsSnapshot)
        .mockResolvedValueOnce(mockLikesSnapshot)

      await useArticles.deleteArticle('test-article-id')

      // Should still delete the article, but no tag/category updates
      expect(mockBatchDelete).toHaveBeenCalledTimes(1) // Only article
      expect(mockBatchUpdate).not.toHaveBeenCalled()
      expect(mockBatchCommit).toHaveBeenCalled()
    })

    it('should update tag statistics correctly', async () => {
      const mockCommentsSnapshot = { docs: [] }
      const mockLikesSnapshot = { docs: [] }
      mockGetDocs
        .mockResolvedValueOnce(mockCommentsSnapshot)
        .mockResolvedValueOnce(mockLikesSnapshot)

      await useArticles.deleteArticle('test-article-id')

      // Verify tag count decrements
      expect(mockBatchUpdate).toHaveBeenCalledWith(
        expect.anything(), // tag doc
        expect.objectContaining({
          articleCount: { _increment: -1 }
        })
      )
    })

    it('should update category statistics correctly', async () => {
      const mockCommentsSnapshot = { docs: [] }
      const mockLikesSnapshot = { docs: [] }
      mockGetDocs
        .mockResolvedValueOnce(mockCommentsSnapshot)
        .mockResolvedValueOnce(mockLikesSnapshot)

      await useArticles.deleteArticle('test-article-id')

      // Verify category count decrements
      expect(mockBatchUpdate).toHaveBeenCalledWith(
        expect.anything(), // category doc
        expect.objectContaining({
          articleCount: { _increment: -1 }
        })
      )
    })

    it('should handle batch commit failure', async () => {
      const mockCommentsSnapshot = { docs: [] }
      const mockLikesSnapshot = { docs: [] }
      mockGetDocs
        .mockResolvedValueOnce(mockCommentsSnapshot)
        .mockResolvedValueOnce(mockLikesSnapshot)

      mockBatchCommit.mockRejectedValue(new Error('Batch commit failed'))

      await expect(useArticles.deleteArticle('test-article-id'))
        .rejects.toThrow('Batch commit failed')
    })
  })
})