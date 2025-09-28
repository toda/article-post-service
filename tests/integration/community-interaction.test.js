/**
 * Integration Test: Community Interaction Flow
 *
 * Tests the complete community interaction and engagement flow
 * Based on User Story 3 from quickstart.md
 *
 * These tests MUST FAIL initially (TDD approach)
 * Implementation will be created to make these tests pass
 */

import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'

// Pages and components to be implemented
import ArticlePage from '../../pages/articles/[id].vue'
import CommentsSection from '../../components/CommentsSection.vue'
import CommentForm from '../../components/CommentForm.vue'
import CommentThread from '../../components/CommentThread.vue'
import UserProfilePage from '../../pages/users/[id].vue'

// Composables to be implemented
import { useComments } from '../../composables/useComments.js'
import { useAuth } from '../../composables/useAuth.js'
import { useUsers } from '../../composables/useUsers.js'
import { useArticles } from '../../composables/useArticles.js'

// Mock Firebase for testing
jest.mock('firebase/auth')
jest.mock('firebase/firestore')

describe('Community Interaction Flow Integration Test', () => {
  let router
  let pinia
  let wrapper

  beforeEach(() => {
    // Setup router
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/articles/:id', component: ArticlePage },
        { path: '/users/:id', component: UserProfilePage },
        { path: '/login', component: { template: '<div>Login</div>' } }
      ]
    })

    // Setup Pinia store
    pinia = createPinia()

    // Mock user authentication
    global.mockAuthenticatedUser = {
      uid: 'user-123',
      displayName: 'testuser',
      email: 'test@example.com'
    }

    global.mockCommentData = jest.fn()
    global.mockNotificationData = jest.fn()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Article Commenting Flow', () => {
    it('should allow authenticated user to comment on article', async () => {
      const mockArticle = {
        id: 'article-1',
        title: 'Vue.js 3の新機能解説',
        content: '# Vue.js 3の新機能\n\nVue.js 3について解説します。',
        authorId: 'author-123',
        commentCount: 5
      }

      const mockComments = [
        {
          id: 'comment-1',
          articleId: 'article-1',
          content: '素晴らしい記事ですね！',
          authorId: 'user-456',
          author: {
            displayName: 'commentuser',
            avatarUrl: 'https://example.com/avatar.jpg'
          },
          likeCount: 3,
          depth: 0,
          childCount: 1,
          createdAt: new Date('2024-01-15T10:00:00Z'),
          isDeleted: false,
          isEdited: false
        }
      ]

      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(global.mockAuthenticatedUser)

      const mockArticlesAPI = useArticles()
      mockArticlesAPI.getArticle = jest.fn().mockResolvedValue(mockArticle)

      const mockCommentsAPI = useComments()
      mockCommentsAPI.getArticleComments = jest.fn().mockResolvedValue({
        threads: mockComments.map(comment => ({
          comment,
          replies: [],
          totalReplies: 0,
          hasMoreReplies: false
        })),
        total: 1,
        hasNext: false
      })
      mockCommentsAPI.createComment = jest.fn().mockResolvedValue({
        id: 'new-comment-123',
        articleId: 'article-1',
        content: 'これは新しいコメントです。',
        authorId: 'user-123',
        author: {
          displayName: 'testuser'
        },
        likeCount: 0,
        depth: 0,
        childCount: 0,
        createdAt: new Date(),
        isDeleted: false,
        isEdited: false
      })

      wrapper = mount(ArticlePage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/articles/article-1')
      await wrapper.vm.$nextTick()

      // Step 1: Verify comments section exists
      const commentsSection = wrapper.find('[data-testid="comments-section"]')
      expect(commentsSection.exists()).toBe(true)

      // Step 2: Check existing comments are displayed
      const existingComments = wrapper.findAll('[data-testid="comment-item"]')
      expect(existingComments.length).toBe(1)

      // Step 3: Find comment form for authenticated user
      const commentForm = wrapper.find('[data-testid="comment-form"]')
      expect(commentForm.exists()).toBe(true)

      const commentTextarea = wrapper.find('[data-testid="comment-textarea"]')
      expect(commentTextarea.exists()).toBe(true)

      // Step 4: Write a new comment
      await commentTextarea.setValue('これは新しいコメントです。')

      // Step 5: Submit the comment
      const submitButton = wrapper.find('[data-testid="submit-comment"]')
      expect(submitButton.exists()).toBe(true)
      expect(submitButton.element.disabled).toBe(false)

      await submitButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Step 6: Verify comment creation API was called
      expect(mockCommentsAPI.createComment).toHaveBeenCalledWith({
        articleId: 'article-1',
        content: 'これは新しいコメントです。',
        parentId: undefined
      })

      // Step 7: Verify comment appears in list
      await wrapper.vm.$nextTick()
      const updatedComments = wrapper.findAll('[data-testid="comment-item"]')
      expect(updatedComments.length).toBe(2)

      // Step 8: Verify textarea is cleared
      expect(commentTextarea.element.value).toBe('')
    })

    it('should require authentication for commenting', async () => {
      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(null) // Not authenticated

      wrapper = mount(ArticlePage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/articles/article-1')
      await wrapper.vm.$nextTick()

      // Should show login prompt instead of comment form
      const loginPrompt = wrapper.find('[data-testid="login-to-comment"]')
      expect(loginPrompt.exists()).toBe(true)

      const commentForm = wrapper.find('[data-testid="comment-form"]')
      expect(commentForm.exists()).toBe(false)

      // Login button should navigate to login page
      const loginButton = wrapper.find('[data-testid="login-button"]')
      expect(loginButton.exists()).toBe(true)

      await loginButton.trigger('click')
      expect(router.currentRoute.value.path).toBe('/login')
    })
  })

  describe('Comment Threading and Replies', () => {
    it('should allow replying to comments with nested threading', async () => {
      const mockParentComment = {
        id: 'parent-comment-1',
        articleId: 'article-1',
        content: '親コメントです。',
        authorId: 'user-456',
        author: {
          displayName: 'parentuser',
          avatarUrl: 'https://example.com/avatar.jpg'
        },
        depth: 0,
        childCount: 0,
        createdAt: new Date('2024-01-15T10:00:00Z')
      }

      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(global.mockAuthenticatedUser)

      const mockCommentsAPI = useComments()
      mockCommentsAPI.getArticleComments = jest.fn().mockResolvedValue({
        threads: [{
          comment: mockParentComment,
          replies: [],
          totalReplies: 0,
          hasMoreReplies: false
        }],
        total: 1,
        hasNext: false
      })
      mockCommentsAPI.createComment = jest.fn().mockResolvedValue({
        id: 'reply-comment-123',
        articleId: 'article-1',
        parentId: 'parent-comment-1',
        content: 'これは返信です。',
        authorId: 'user-123',
        author: {
          displayName: 'testuser'
        },
        depth: 1,
        childCount: 0,
        createdAt: new Date()
      })

      wrapper = mount(CommentsSection, {
        props: {
          articleId: 'article-1'
        },
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      // Step 1: Find reply button on parent comment
      const replyButton = wrapper.find('[data-testid="reply-button"]')
      expect(replyButton.exists()).toBe(true)

      await replyButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Step 2: Reply form should appear
      const replyForm = wrapper.find('[data-testid="reply-form"]')
      expect(replyForm.exists()).toBe(true)

      const replyTextarea = wrapper.find('[data-testid="reply-textarea"]')
      expect(replyTextarea.exists()).toBe(true)

      // Step 3: Write reply content
      await replyTextarea.setValue('これは返信です。')

      // Step 4: Submit reply
      const submitReplyButton = wrapper.find('[data-testid="submit-reply"]')
      await submitReplyButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Step 5: Verify reply creation API called with parentId
      expect(mockCommentsAPI.createComment).toHaveBeenCalledWith({
        articleId: 'article-1',
        content: 'これは返信です。',
        parentId: 'parent-comment-1'
      })

      // Step 6: Reply form should be hidden after submission
      expect(wrapper.find('[data-testid="reply-form"]').exists()).toBe(false)
    })

    it('should load more replies when expand button is clicked', async () => {
      const mockParentComment = {
        id: 'parent-comment-1',
        articleId: 'article-1',
        content: '親コメントです。',
        childCount: 5
      }

      const mockReplies = [
        {
          id: 'reply-1',
          parentId: 'parent-comment-1',
          content: '返信1',
          depth: 1
        },
        {
          id: 'reply-2',
          parentId: 'parent-comment-1',
          content: '返信2',
          depth: 1
        }
      ]

      const mockCommentsAPI = useComments()
      mockCommentsAPI.getReplies = jest.fn().mockResolvedValue({
        comments: mockReplies,
        total: 5,
        hasNext: true
      })

      wrapper = mount(CommentThread, {
        props: {
          thread: {
            comment: mockParentComment,
            replies: [],
            totalReplies: 5,
            hasMoreReplies: true
          }
        },
        global: {
          plugins: [router, pinia]
        }
      })

      // Step 1: Find expand replies button
      const expandButton = wrapper.find('[data-testid="expand-replies"]')
      expect(expandButton.exists()).toBe(true)
      expect(expandButton.text()).toContain('5件の返信')

      await expandButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Step 2: Verify getReplies API called
      expect(mockCommentsAPI.getReplies).toHaveBeenCalledWith(
        'parent-comment-1',
        expect.objectContaining({
          page: 1,
          limit: expect.any(Number)
        })
      )

      // Step 3: Replies should be displayed
      const replyItems = wrapper.findAll('[data-testid="reply-item"]')
      expect(replyItems.length).toBe(2)

      // Step 4: Show more button should appear if hasNext
      const showMoreButton = wrapper.find('[data-testid="show-more-replies"]')
      expect(showMoreButton.exists()).toBe(true)
    })
  })

  describe('Comment Interactions', () => {
    it('should allow liking and unliking comments', async () => {
      const mockComment = {
        id: 'comment-1',
        content: 'いいね機能のテスト',
        likeCount: 5,
        isLiked: false
      }

      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(global.mockAuthenticatedUser)

      const mockCommentsAPI = useComments()
      mockCommentsAPI.likeComment = jest.fn().mockResolvedValue()
      mockCommentsAPI.unlikeComment = jest.fn().mockResolvedValue()

      wrapper = mount(CommentThread, {
        props: {
          thread: {
            comment: mockComment,
            replies: [],
            totalReplies: 0,
            hasMoreReplies: false
          }
        },
        global: {
          plugins: [router, pinia]
        }
      })

      // Step 1: Find like button
      const likeButton = wrapper.find('[data-testid="like-comment-button"]')
      expect(likeButton.exists()).toBe(true)

      const likeCount = wrapper.find('[data-testid="comment-like-count"]')
      expect(likeCount.text()).toContain('5')

      // Step 2: Click like button
      await likeButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Step 3: Verify like API called
      expect(mockCommentsAPI.likeComment).toHaveBeenCalledWith('comment-1')

      // Step 4: Like count should increase (optimistic update)
      expect(likeCount.text()).toContain('6')

      // Step 5: Click again to unlike
      await likeButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Step 6: Verify unlike API called
      expect(mockCommentsAPI.unlikeComment).toHaveBeenCalledWith('comment-1')

      // Step 7: Like count should decrease
      expect(likeCount.text()).toContain('5')
    })

    it('should allow editing own comments', async () => {
      const mockComment = {
        id: 'comment-1',
        content: '編集前のコメント',
        authorId: 'user-123', // Same as authenticated user
        isEdited: false
      }

      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(global.mockAuthenticatedUser)

      const mockCommentsAPI = useComments()
      mockCommentsAPI.updateComment = jest.fn().mockResolvedValue({
        ...mockComment,
        content: '編集後のコメント',
        isEdited: true,
        updatedAt: new Date()
      })

      wrapper = mount(CommentThread, {
        props: {
          thread: {
            comment: mockComment,
            replies: [],
            totalReplies: 0,
            hasMoreReplies: false
          }
        },
        global: {
          plugins: [router, pinia]
        }
      })

      // Step 1: Find edit button (should only show for own comments)
      const editButton = wrapper.find('[data-testid="edit-comment-button"]')
      expect(editButton.exists()).toBe(true)

      await editButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Step 2: Edit form should appear
      const editForm = wrapper.find('[data-testid="edit-comment-form"]')
      expect(editForm.exists()).toBe(true)

      const editTextarea = wrapper.find('[data-testid="edit-comment-textarea"]')
      expect(editTextarea.element.value).toBe('編集前のコメント')

      // Step 3: Update comment content
      await editTextarea.setValue('編集後のコメント')

      // Step 4: Save changes
      const saveButton = wrapper.find('[data-testid="save-edit-button"]')
      await saveButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Step 5: Verify update API called
      expect(mockCommentsAPI.updateComment).toHaveBeenCalledWith('comment-1', {
        content: '編集後のコメント'
      })

      // Step 6: Edit form should be hidden
      expect(wrapper.find('[data-testid="edit-comment-form"]').exists()).toBe(false)

      // Step 7: Updated content should be displayed
      const commentContent = wrapper.find('[data-testid="comment-content"]')
      expect(commentContent.text()).toContain('編集後のコメント')

      // Step 8: Edited indicator should show
      const editedIndicator = wrapper.find('[data-testid="edited-indicator"]')
      expect(editedIndicator.exists()).toBe(true)
    })

    it('should allow deleting own comments', async () => {
      const mockComment = {
        id: 'comment-1',
        content: '削除予定のコメント',
        authorId: 'user-123', // Same as authenticated user
        childCount: 0
      }

      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(global.mockAuthenticatedUser)

      const mockCommentsAPI = useComments()
      mockCommentsAPI.deleteComment = jest.fn().mockResolvedValue()

      wrapper = mount(CommentThread, {
        props: {
          thread: {
            comment: mockComment,
            replies: [],
            totalReplies: 0,
            hasMoreReplies: false
          }
        },
        global: {
          plugins: [router, pinia]
        }
      })

      // Step 1: Find delete button
      const deleteButton = wrapper.find('[data-testid="delete-comment-button"]')
      expect(deleteButton.exists()).toBe(true)

      await deleteButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Step 2: Confirmation dialog should appear
      const confirmDialog = wrapper.find('[data-testid="delete-confirmation"]')
      expect(confirmDialog.exists()).toBe(true)

      // Step 3: Confirm deletion
      const confirmButton = wrapper.find('[data-testid="confirm-delete"]')
      await confirmButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Step 4: Verify delete API called
      expect(mockCommentsAPI.deleteComment).toHaveBeenCalledWith('comment-1')

      // Step 5: Comment should be removed from display
      const commentItem = wrapper.find('[data-testid="comment-item"]')
      expect(commentItem.exists()).toBe(false)
    })
  })

  describe('Comment Moderation', () => {
    it('should allow reporting inappropriate comments', async () => {
      const mockComment = {
        id: 'comment-1',
        content: '不適切なコメント',
        authorId: 'other-user-456'
      }

      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(global.mockAuthenticatedUser)

      const mockCommentsAPI = useComments()
      mockCommentsAPI.reportComment = jest.fn().mockResolvedValue()

      wrapper = mount(CommentThread, {
        props: {
          thread: {
            comment: mockComment,
            replies: [],
            totalReplies: 0,
            hasMoreReplies: false
          }
        },
        global: {
          plugins: [router, pinia]
        }
      })

      // Step 1: Find report button
      const reportButton = wrapper.find('[data-testid="report-comment-button"]')
      expect(reportButton.exists()).toBe(true)

      await reportButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Step 2: Report modal should appear
      const reportModal = wrapper.find('[data-testid="report-modal"]')
      expect(reportModal.exists()).toBe(true)

      // Step 3: Select report reason
      const spamOption = wrapper.find('[data-testid="report-reason-spam"]')
      await spamOption.trigger('click')

      // Step 4: Submit report
      const submitReportButton = wrapper.find('[data-testid="submit-report"]')
      await submitReportButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Step 5: Verify report API called
      expect(mockCommentsAPI.reportComment).toHaveBeenCalledWith('comment-1', 'spam')

      // Step 6: Success message should appear
      const successMessage = wrapper.find('[data-testid="report-success"]')
      expect(successMessage.exists()).toBe(true)
    })
  })

  describe('Real-time Updates', () => {
    it('should receive real-time comment updates', async () => {
      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(global.mockAuthenticatedUser)

      const mockCommentsAPI = useComments()
      mockCommentsAPI.subscribeToComments = jest.fn()

      wrapper = mount(CommentsSection, {
        props: {
          articleId: 'article-1'
        },
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      // Verify real-time subscription was set up
      expect(mockCommentsAPI.subscribeToComments).toHaveBeenCalledWith({
        articleId: 'article-1',
        onCommentAdded: expect.any(Function),
        onCommentUpdated: expect.any(Function),
        onCommentDeleted: expect.any(Function),
        onLikeChanged: expect.any(Function)
      })
    })
  })

  describe('Author Profile Integration', () => {
    it('should navigate to author profile when clicking on author name', async () => {
      const mockComment = {
        id: 'comment-1',
        content: 'プロフィールテスト',
        authorId: 'author-456',
        author: {
          displayName: 'authoruser',
          avatarUrl: 'https://example.com/avatar.jpg'
        }
      }

      wrapper = mount(CommentThread, {
        props: {
          thread: {
            comment: mockComment,
            replies: [],
            totalReplies: 0,
            hasMoreReplies: false
          }
        },
        global: {
          plugins: [router, pinia]
        }
      })

      // Step 1: Find author link
      const authorLink = wrapper.find('[data-testid="comment-author-link"]')
      expect(authorLink.exists()).toBe(true)
      expect(authorLink.text()).toBe('authoruser')

      // Step 2: Click on author name
      await authorLink.trigger('click')

      // Step 3: Should navigate to author profile
      expect(router.currentRoute.value.path).toBe('/users/author-456')
    })
  })

  describe('Accessibility and UX', () => {
    it('should handle keyboard navigation for comments', async () => {
      const mockComment = {
        id: 'comment-1',
        content: 'キーボードナビゲーションテスト'
      }

      wrapper = mount(CommentThread, {
        props: {
          thread: {
            comment: mockComment,
            replies: [],
            totalReplies: 0,
            hasMoreReplies: false
          }
        },
        global: {
          plugins: [router, pinia]
        }
      })

      // Step 1: Comment should be focusable
      const commentItem = wrapper.find('[data-testid="comment-item"]')
      expect(commentItem.attributes('tabindex')).toBe('0')

      // Step 2: Action buttons should be keyboard accessible
      const likeButton = wrapper.find('[data-testid="like-comment-button"]')
      expect(likeButton.attributes('role')).toBe('button')

      // Step 3: Test keyboard activation
      await likeButton.trigger('keydown.enter')
      // Should trigger like action (same as click)
    })

    it('should show loading states during comment operations', async () => {
      const mockCommentsAPI = useComments()
      // Simulate slow comment creation
      mockCommentsAPI.createComment = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ id: 'new-comment' }), 1000))
      )

      wrapper = mount(CommentForm, {
        props: {
          articleId: 'article-1'
        },
        global: {
          plugins: [router, pinia]
        }
      })

      const textarea = wrapper.find('[data-testid="comment-textarea"]')
      await textarea.setValue('新しいコメント')

      const submitButton = wrapper.find('[data-testid="submit-comment"]')
      await submitButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Step 1: Submit button should show loading state
      expect(submitButton.element.disabled).toBe(true)
      const loadingIndicator = wrapper.find('[data-testid="comment-loading"]')
      expect(loadingIndicator.exists()).toBe(true)

      // Wait for operation to complete
      await new Promise(resolve => setTimeout(resolve, 1100))
      await wrapper.vm.$nextTick()

      // Step 2: Loading state should be cleared
      expect(submitButton.element.disabled).toBe(false)
      expect(wrapper.find('[data-testid="comment-loading"]').exists()).toBe(false)
    })
  })
})