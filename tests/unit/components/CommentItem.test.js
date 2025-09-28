/**
 * CommentItem component tests
 * Tests for avatar display and error handling
 */
import { describe, it, expect, beforeEach, vi } from '@jest/globals'
import { mount } from '@vue/test-utils'

// Mock composables
vi.mock('~/composables/useAuth', () => ({
  useAuth: () => ({
    user: { value: { uid: 'current-user-id' } },
    isLoggedIn: { value: true }
  })
}))

vi.mock('~/composables/useComments', () => ({
  useComments: () => ({
    updateComment: vi.fn(),
    deleteComment: vi.fn(),
    likeComment: vi.fn(),
    unlikeComment: vi.fn()
  })
}))

vi.mock('~/composables/useMarkdown', () => ({
  useMarkdown: () => ({
    renderMarkdown: (content) => `<p>${content}</p>`
  })
}))

vi.mock('~/utils/dateFormatter', () => ({
  formatDate: (date) => 'formatted date'
}))

// Dynamic import for component
const getCommentItem = async () => {
  const { default: CommentItem } = await import('~/components/CommentItem.vue')
  return CommentItem
}

describe('CommentItem - Avatar Display', () => {
  let CommentItem

  beforeEach(async () => {
    vi.clearAllMocks()
    CommentItem = await getCommentItem()
  })

  describe('Avatar URL Processing', () => {
    it('should display avatar image when author has avatarUrl', () => {
      const comment = {
        id: 'comment-1',
        content: 'Test comment',
        authorId: 'author-1',
        author: {
          displayName: 'Test Author',
          avatarUrl: 'https://example.com/avatar.jpg'
        },
        createdAt: new Date(),
        likeCount: 0
      }

      const wrapper = mount(CommentItem, {
        props: {
          comment,
          articleId: 'article-1'
        }
      })

      const avatar = wrapper.find('img')
      expect(avatar.exists()).toBe(true)
      expect(avatar.attributes('src')).toBe('https://example.com/avatar.jpg')
      expect(avatar.attributes('alt')).toBe('Test Author')
    })

    it('should process Google profile images correctly', () => {
      const comment = {
        id: 'comment-1',
        content: 'Test comment',
        authorId: 'author-1',
        author: {
          displayName: 'Test Author',
          avatarUrl: 'https://lh3.googleusercontent.com/abc123=s96-c'
        },
        createdAt: new Date(),
        likeCount: 0
      }

      const wrapper = mount(CommentItem, {
        props: {
          comment,
          articleId: 'article-1'
        }
      })

      const avatar = wrapper.find('img')
      expect(avatar.exists()).toBe(true)
      // Should transform Google avatar URL
      expect(avatar.attributes('src')).toBe('https://lh3.googleusercontent.com/abc123=s96-c')
    })

    it('should show fallback avatar when no avatarUrl', () => {
      const comment = {
        id: 'comment-1',
        content: 'Test comment',
        authorId: 'author-1',
        author: {
          displayName: 'Test Author',
          avatarUrl: null
        },
        createdAt: new Date(),
        likeCount: 0
      }

      const wrapper = mount(CommentItem, {
        props: {
          comment,
          articleId: 'article-1'
        }
      })

      const avatar = wrapper.find('img')
      expect(avatar.exists()).toBe(false)

      const fallback = wrapper.find('.bg-blue-100')
      expect(fallback.exists()).toBe(true)
      expect(fallback.text()).toBe('T') // First letter of 'Test Author'
    })

    it('should show fallback avatar when avatarUrl is empty', () => {
      const comment = {
        id: 'comment-1',
        content: 'Test comment',
        authorId: 'author-1',
        author: {
          displayName: 'Test Author',
          avatarUrl: ''
        },
        createdAt: new Date(),
        likeCount: 0
      }

      const wrapper = mount(CommentItem, {
        props: {
          comment,
          articleId: 'article-1'
        }
      })

      const avatar = wrapper.find('img')
      expect(avatar.exists()).toBe(false)

      const fallback = wrapper.find('.bg-blue-100')
      expect(fallback.exists()).toBe(true)
      expect(fallback.text()).toBe('T')
    })

    it('should handle missing author gracefully', () => {
      const comment = {
        id: 'comment-1',
        content: 'Test comment',
        authorId: 'author-1',
        author: null,
        authorName: 'Stored Author',
        createdAt: new Date(),
        likeCount: 0
      }

      const wrapper = mount(CommentItem, {
        props: {
          comment,
          articleId: 'article-1'
        }
      })

      const fallback = wrapper.find('.bg-blue-100')
      expect(fallback.exists()).toBe(true)
      expect(fallback.text()).toBe('S') // First letter of 'Stored Author'
    })

    it('should handle completely missing author info', () => {
      const comment = {
        id: 'comment-1',
        content: 'Test comment',
        authorId: 'author-1',
        author: null,
        authorName: null,
        createdAt: new Date(),
        likeCount: 0
      }

      const wrapper = mount(CommentItem, {
        props: {
          comment,
          articleId: 'article-1'
        }
      })

      const fallback = wrapper.find('.bg-blue-100')
      expect(fallback.exists()).toBe(true)
      // Should show first letter of fallback name
      expect(fallback.text()).toMatch(/[A-Z?]/)
    })
  })

  describe('Avatar Error Handling', () => {
    it('should switch to fallback when image fails to load', async () => {
      const comment = {
        id: 'comment-1',
        content: 'Test comment',
        authorId: 'author-1',
        author: {
          displayName: 'Test Author',
          avatarUrl: 'https://example.com/broken-avatar.jpg'
        },
        createdAt: new Date(),
        likeCount: 0
      }

      const wrapper = mount(CommentItem, {
        props: {
          comment,
          articleId: 'article-1'
        }
      })

      const avatar = wrapper.find('img')
      expect(avatar.exists()).toBe(true)

      // Simulate image load error
      await avatar.trigger('error')
      await wrapper.vm.$nextTick()

      // Should switch to fallback
      const fallback = wrapper.find('.bg-blue-100')
      expect(fallback.exists()).toBe(true)
      expect(fallback.text()).toBe('T')
    })

    it('should handle Google avatar retry logic', async () => {
      const comment = {
        id: 'comment-1',
        content: 'Test comment',
        authorId: 'author-1',
        author: {
          displayName: 'Test Author',
          avatarUrl: 'https://lh3.googleusercontent.com/abc123=s96'
        },
        createdAt: new Date(),
        likeCount: 0
      }

      const wrapper = mount(CommentItem, {
        props: {
          comment,
          articleId: 'article-1'
        }
      })

      const avatar = wrapper.find('img')

      // First error should trigger proxy retry for Google images
      await avatar.trigger('error')
      await wrapper.vm.$nextTick()

      // Should try proxy URL
      expect(wrapper.vm.useProxy).toBe(true)

      // Second error should show fallback
      await avatar.trigger('error')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.avatarError).toBe(true)
    })
  })

  describe('Comment Actions', () => {
    it('should show edit and delete buttons for comment author', () => {
      const comment = {
        id: 'comment-1',
        content: 'Test comment',
        authorId: 'current-user-id', // Same as mocked current user
        author: {
          displayName: 'Current User',
          avatarUrl: null
        },
        createdAt: new Date(),
        likeCount: 0
      }

      const wrapper = mount(CommentItem, {
        props: {
          comment,
          articleId: 'article-1'
        }
      })

      const editButton = wrapper.find('[data-testid="edit-button"]')
      const deleteButton = wrapper.find('[data-testid="delete-button"]')

      expect(editButton.exists()).toBe(true)
      expect(deleteButton.exists()).toBe(true)
    })

    it('should not show edit and delete buttons for other users', () => {
      const comment = {
        id: 'comment-1',
        content: 'Test comment',
        authorId: 'other-user-id', // Different from current user
        author: {
          displayName: 'Other User',
          avatarUrl: null
        },
        createdAt: new Date(),
        likeCount: 0
      }

      const wrapper = mount(CommentItem, {
        props: {
          comment,
          articleId: 'article-1'
        }
      })

      const editButton = wrapper.find('[data-testid="edit-button"]')
      const deleteButton = wrapper.find('[data-testid="delete-button"]')

      expect(editButton.exists()).toBe(false)
      expect(deleteButton.exists()).toBe(false)
    })
  })

  describe('Comment Rendering', () => {
    it('should render comment content correctly', () => {
      const comment = {
        id: 'comment-1',
        content: 'This is a test comment with **markdown**',
        authorId: 'author-1',
        author: {
          displayName: 'Test Author',
          avatarUrl: null
        },
        createdAt: new Date(),
        likeCount: 5
      }

      const wrapper = mount(CommentItem, {
        props: {
          comment,
          articleId: 'article-1'
        }
      })

      const content = wrapper.find('.prose')
      expect(content.exists()).toBe(true)
      expect(content.html()).toContain('<p>This is a test comment with **markdown**</p>')
    })

    it('should show like count', () => {
      const comment = {
        id: 'comment-1',
        content: 'Test comment',
        authorId: 'author-1',
        author: {
          displayName: 'Test Author',
          avatarUrl: null
        },
        createdAt: new Date(),
        likeCount: 5
      }

      const wrapper = mount(CommentItem, {
        props: {
          comment,
          articleId: 'article-1'
        }
      })

      const likeButton = wrapper.find('[data-testid="like-button"]')
      expect(likeButton.exists()).toBe(true)
      expect(likeButton.text()).toContain('5')
    })
  })
})