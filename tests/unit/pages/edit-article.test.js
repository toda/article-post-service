/**
 * Article Edit Page tests
 * Tests for delete functionality and author avatar display
 */
import { describe, it, expect, beforeEach, vi } from '@jest/globals'
import { mount } from '@vue/test-utils'

// Mock Vue Router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { id: 'test-article-id' }
  }),
  useRouter: () => ({
    push: mockPush
  })
}))

// Mock composables
const mockDeleteArticle = vi.fn()
const mockGetArticle = vi.fn()
const mockUpdateArticle = vi.fn()
const mockListCategories = vi.fn()

vi.mock('~/composables/useAuth', () => ({
  useAuth: () => ({
    isLoggedIn: { value: true },
    currentUser: { value: { uid: 'current-user-id' } },
    authLoading: { value: false }
  })
}))

vi.mock('~/composables/useArticles', () => ({
  useArticles: () => ({
    getArticle: mockGetArticle,
    updateArticle: mockUpdateArticle,
    listCategories: mockListCategories,
    deleteArticle: mockDeleteArticle,
    articlesLoading: { value: false }
  })
}))

vi.mock('~/composables/useMarkdown', () => ({
  useMarkdown: () => ({
    renderMarkdown: (content) => `<p>${content}</p>`
  })
}))

// Mock Nuxt components
vi.mock('#components', () => ({
  NuxtLink: {
    template: '<router-link :to="to"><slot /></router-link>',
    props: ['to']
  }
}))

describe('Article Edit Page - Delete Functionality', () => {
  let EditPage

  beforeEach(async () => {
    vi.clearAllMocks()
    mockPush.mockClear()

    // Setup default mocks
    mockGetArticle.mockResolvedValue({
      id: 'test-article-id',
      title: 'Test Article',
      content: 'Test content',
      categoryId: 'frontend',
      tags: ['test'],
      isPublic: true,
      author: {
        displayName: 'Test Author',
        avatarUrl: 'https://example.com/avatar.jpg'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    })

    mockListCategories.mockResolvedValue([
      { id: 'frontend', name: 'フロントエンド' },
      { id: 'backend', name: 'バックエンド' }
    ])

    // Dynamic import to ensure mocks are applied
    const module = await import('~/pages/articles/edit-[id].vue')
    EditPage = module.default
  })

  describe('Delete Button Rendering', () => {
    it('should render delete button', async () => {
      const wrapper = mount(EditPage, {
        global: {
          stubs: ['NuxtLink']
        }
      })

      // Wait for async data loading
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const deleteButton = wrapper.find('button:contains("記事を削除")')
      expect(deleteButton.exists()).toBe(true)
      expect(deleteButton.attributes('type')).toBe('button')
    })

    it('should disable delete button during loading states', async () => {
      const wrapper = mount(EditPage, {
        global: {
          stubs: ['NuxtLink']
        }
      })

      await wrapper.vm.$nextTick()

      // Set loading state
      wrapper.vm.loading = true
      await wrapper.vm.$nextTick()

      const deleteButton = wrapper.find('button:contains("記事を削除")')
      expect(deleteButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('Delete Confirmation Dialog', () => {
    it('should show confirmation dialog when delete button is clicked', async () => {
      const wrapper = mount(EditPage, {
        global: {
          stubs: ['NuxtLink']
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Click delete button
      const deleteButton = wrapper.find('button:contains("記事を削除")')
      await deleteButton.trigger('click')

      // Check if confirmation dialog is shown
      const modal = wrapper.find('.fixed.inset-0.bg-gray-600')
      expect(modal.exists()).toBe(true)

      const confirmText = wrapper.find('h3:contains("記事を削除")')
      expect(confirmText.exists()).toBe(true)

      const warningText = wrapper.text()
      expect(warningText).toContain('本当にこの記事を削除しますか？')
      expect(warningText).toContain('この操作は取り消すことができません')
    })

    it('should show article title in confirmation dialog', async () => {
      const wrapper = mount(EditPage, {
        global: {
          stubs: ['NuxtLink']
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Click delete button
      const deleteButton = wrapper.find('button:contains("記事を削除")')
      await deleteButton.trigger('click')

      // Check if article title is displayed
      const titleText = wrapper.text()
      expect(titleText).toContain('Test Article')
    })

    it('should close dialog when cancel is clicked', async () => {
      const wrapper = mount(EditPage, {
        global: {
          stubs: ['NuxtLink']
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Open dialog
      const deleteButton = wrapper.find('button:contains("記事を削除")')
      await deleteButton.trigger('click')

      // Click cancel
      const cancelButton = wrapper.find('button:contains("キャンセル")')
      await cancelButton.trigger('click')

      // Dialog should be closed
      const modal = wrapper.find('.fixed.inset-0.bg-gray-600')
      expect(modal.exists()).toBe(false)
    })
  })

  describe('Delete Operation', () => {
    it('should call deleteArticle when confirmed', async () => {
      mockDeleteArticle.mockResolvedValue()

      const wrapper = mount(EditPage, {
        global: {
          stubs: ['NuxtLink']
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Open dialog and confirm
      const deleteButton = wrapper.find('button:contains("記事を削除")')
      await deleteButton.trigger('click')

      const confirmButton = wrapper.find('button:contains("削除する")')
      await confirmButton.trigger('click')

      expect(mockDeleteArticle).toHaveBeenCalledWith('test-article-id')
    })

    it('should redirect to home after successful deletion', async () => {
      mockDeleteArticle.mockResolvedValue()

      const wrapper = mount(EditPage, {
        global: {
          stubs: ['NuxtLink']
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Perform deletion
      const deleteButton = wrapper.find('button:contains("記事を削除")')
      await deleteButton.trigger('click')

      const confirmButton = wrapper.find('button:contains("削除する")')
      await confirmButton.trigger('click')

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('should show error message on deletion failure', async () => {
      const errorMessage = 'Deletion failed'
      mockDeleteArticle.mockRejectedValue(new Error(errorMessage))

      const wrapper = mount(EditPage, {
        global: {
          stubs: ['NuxtLink']
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Perform deletion
      const deleteButton = wrapper.find('button:contains("記事を削除")')
      await deleteButton.trigger('click')

      const confirmButton = wrapper.find('button:contains("削除する")')
      await confirmButton.trigger('click')

      // Wait for error handling
      await new Promise(resolve => setTimeout(resolve, 100))

      // Check for error message
      const errorAlert = wrapper.find('.bg-red-50')
      expect(errorAlert.exists()).toBe(true)
    })

    it('should show loading state during deletion', async () => {
      // Mock slow deletion
      mockDeleteArticle.mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 1000))
      )

      const wrapper = mount(EditPage, {
        global: {
          stubs: ['NuxtLink']
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Start deletion
      const deleteButton = wrapper.find('button:contains("記事を削除")')
      await deleteButton.trigger('click')

      const confirmButton = wrapper.find('button:contains("削除する")')
      await confirmButton.trigger('click')

      // Check loading state
      const loadingText = wrapper.text()
      expect(loadingText).toContain('削除中...')

      // Button should be disabled
      const disabledButton = wrapper.find('button[disabled]:contains("削除中...")')
      expect(disabledButton.exists()).toBe(true)
    })
  })

  describe('Author Avatar Display', () => {
    it('should display author avatar in form actions', async () => {
      const wrapper = mount(EditPage, {
        global: {
          stubs: ['NuxtLink']
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const avatar = wrapper.find('.bg-gray-50 img')
      expect(avatar.exists()).toBe(true)
      expect(avatar.attributes('src')).toBe('https://example.com/avatar.jpg')
      expect(avatar.attributes('alt')).toBe('Test Author')
    })

    it('should show fallback avatar when no avatarUrl', async () => {
      // Mock article without avatar
      mockGetArticle.mockResolvedValue({
        id: 'test-article-id',
        title: 'Test Article',
        content: 'Test content',
        categoryId: 'frontend',
        tags: ['test'],
        isPublic: true,
        author: {
          displayName: 'Test Author',
          avatarUrl: null
        },
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const wrapper = mount(EditPage, {
        global: {
          stubs: ['NuxtLink']
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const avatar = wrapper.find('.bg-gray-50 img')
      expect(avatar.exists()).toBe(false)

      const fallback = wrapper.find('.bg-gray-300')
      expect(fallback.exists()).toBe(true)
      expect(fallback.text()).toBe('T') // First letter of 'Test Author'
    })

    it('should display author name next to avatar', async () => {
      const wrapper = mount(EditPage, {
        global: {
          stubs: ['NuxtLink']
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const authorName = wrapper.find('.text-gray-700.font-medium')
      expect(authorName.exists()).toBe(true)
      expect(authorName.text()).toBe('Test Author')
    })
  })
})