/**
 * Integration Test: Article Creation Flow
 *
 * Tests the complete article creation and publishing flow
 * Based on User Story 2 from quickstart.md
 *
 * These tests MUST FAIL initially (TDD approach)
 * Implementation will be created to make these tests pass
 */

import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'

// Components to be implemented
import ArticleCreatePage from '../../pages/articles/new.vue'
import ArticleEditPage from '../../pages/articles/edit/[id].vue'
import ArticleViewPage from '../../pages/articles/[id].vue'

// Composables to be implemented
import { useAuth } from '../../composables/useAuth.js'
import { useArticles } from '../../composables/useArticles.js'

// Mock Firebase for testing
jest.mock('firebase/auth')
jest.mock('firebase/firestore')

describe('Article Creation Flow Integration Test', () => {
  let router
  let pinia
  let wrapper
  let mockCurrentUser

  beforeEach(() => {
    // Setup authenticated user
    mockCurrentUser = {
      uid: 'test-user-123',
      email: 'testuser@example.com',
      displayName: 'testuser'
    }

    // Setup router
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/articles/new', component: ArticleCreatePage },
        { path: '/articles/edit/:id', component: ArticleEditPage },
        { path: '/articles/:id', component: ArticleViewPage },
        { path: '/login', component: { template: '<div>Login</div>' } }
      ]
    })

    // Setup Pinia store
    pinia = createPinia()

    // Mock functions
    global.loginAsUser = jest.fn().mockResolvedValue(mockCurrentUser)
    global.createTestArticle = jest.fn()
    global.getArticleByTitle = jest.fn()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Complete Article Creation Flow', () => {
    it('should successfully create and publish article with markdown preview', async () => {
      // Mock authentication
      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(mockCurrentUser)

      // Mock article creation
      const mockArticle = {
        id: 'article-123',
        title: 'My First Article',
        content: '# Hello World\n\nThis is my first article.',
        categoryId: 'frontend',
        tags: ['vue', 'nuxt', 'javascript'],
        authorId: mockCurrentUser.uid,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 0,
        likeCount: 0,
        commentCount: 0
      }

      const mockArticles = useArticles()
      mockArticles.createArticle = jest.fn().mockResolvedValue(mockArticle)
      mockArticles.listCategories = jest.fn().mockResolvedValue([
        { id: 'frontend', name: 'Frontend', color: '#3b82f6' },
        { id: 'backend', name: 'Backend', color: '#10b981' }
      ])

      // Prerequisites: User logged in
      await global.loginAsUser('testuser@example.com')

      // Mount article creation page
      wrapper = mount(ArticleCreatePage, {
        global: {
          plugins: [router, pinia]
        }
      })

      // Step 1: Navigate to create article
      await router.push('/articles/new')
      expect(router.currentRoute.value.path).toBe('/articles/new')
      await wrapper.vm.$nextTick()

      // Step 2: Fill article form
      const titleInput = wrapper.find('[data-testid="article-title"]')
      const contentTextarea = wrapper.find('[data-testid="article-content"]')

      expect(titleInput.exists()).toBe(true)
      expect(contentTextarea.exists()).toBe(true)

      await titleInput.setValue('My First Article')
      await contentTextarea.setValue('# Hello World\n\nThis is my first article.')

      // Step 3: Select category and tags
      const categorySelect = wrapper.find('[data-testid="category"]')
      const tagsInput = wrapper.find('[data-testid="tags"]')

      expect(categorySelect.exists()).toBe(true)
      expect(tagsInput.exists()).toBe(true)

      await categorySelect.setValue('frontend')
      await tagsInput.setValue('vue,nuxt,javascript')

      // Step 4: Preview article
      const previewTab = wrapper.find('[data-testid="preview-tab"]')
      expect(previewTab.exists()).toBe(true)

      await previewTab.trigger('click')
      await wrapper.vm.$nextTick()

      // Verify markdown is rendered in preview
      const previewContent = wrapper.find('[data-testid="preview-content"]')
      expect(previewContent.exists()).toBe(true)

      const previewTitle = previewContent.find('h1')
      expect(previewTitle.exists()).toBe(true)
      expect(previewTitle.text()).toBe('Hello World')

      const previewParagraph = previewContent.find('p')
      expect(previewParagraph.exists()).toBe(true)
      expect(previewParagraph.text()).toBe('This is my first article.')

      // Step 5: Publish article
      const publishButton = wrapper.find('[data-testid="publish-button"]')
      expect(publishButton.exists()).toBe(true)
      expect(publishButton.element.disabled).toBe(false)

      await publishButton.trigger('click')

      // Verify createArticle was called with correct data
      expect(mockArticles.createArticle).toHaveBeenCalledWith({
        title: 'My First Article',
        content: '# Hello World\n\nThis is my first article.',
        categoryId: 'frontend',
        tags: ['vue', 'nuxt', 'javascript'],
        isPublic: true
      })

      // Step 6: Verify article published
      await wrapper.vm.$nextTick()
      expect(router.currentRoute.value.path).toMatch(/^\/articles\/[a-zA-Z0-9]+$/)

      // Step 7: Verify article in database
      global.getArticleByTitle.mockResolvedValue(mockArticle)
      const savedArticle = await global.getArticleByTitle('My First Article')

      expect(savedArticle).toBeTruthy()
      expect(savedArticle.isPublic).toBe(true)
      expect(savedArticle.authorId).toBe(mockCurrentUser.uid)
      expect(savedArticle.title).toBe('My First Article')
      expect(savedArticle.categoryId).toBe('frontend')
      expect(savedArticle.tags).toEqual(['vue', 'nuxt', 'javascript'])
    })

    it('should save article as draft when not ready to publish', async () => {
      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(mockCurrentUser)

      const mockDraftArticle = {
        id: 'draft-article-123',
        title: 'Draft Article',
        content: '# Work in Progress',
        categoryId: 'frontend',
        tags: ['vue'],
        authorId: mockCurrentUser.uid,
        isPublic: false,
        createdAt: new Date()
      }

      const mockArticles = useArticles()
      mockArticles.createArticle = jest.fn().mockResolvedValue(mockDraftArticle)
      mockArticles.listCategories = jest.fn().mockResolvedValue([
        { id: 'frontend', name: 'Frontend', color: '#3b82f6' }
      ])

      wrapper = mount(ArticleCreatePage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/articles/new')
      await wrapper.vm.$nextTick()

      // Fill partial form
      await wrapper.find('[data-testid="article-title"]').setValue('Draft Article')
      await wrapper.find('[data-testid="article-content"]').setValue('# Work in Progress')
      await wrapper.find('[data-testid="category"]').setValue('frontend')
      await wrapper.find('[data-testid="tags"]').setValue('vue')

      // Save as draft
      const saveDraftButton = wrapper.find('[data-testid="save-draft-button"]')
      expect(saveDraftButton.exists()).toBe(true)

      await saveDraftButton.trigger('click')

      // Verify draft creation
      expect(mockArticles.createArticle).toHaveBeenCalledWith({
        title: 'Draft Article',
        content: '# Work in Progress',
        categoryId: 'frontend',
        tags: ['vue'],
        isPublic: false
      })
    })

    it('should validate required fields before publishing', async () => {
      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(mockCurrentUser)

      const mockArticles = useArticles()
      mockArticles.listCategories = jest.fn().mockResolvedValue([
        { id: 'frontend', name: 'Frontend', color: '#3b82f6' }
      ])

      wrapper = mount(ArticleCreatePage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/articles/new')
      await wrapper.vm.$nextTick()

      // Try to publish without filling required fields
      const publishButton = wrapper.find('[data-testid="publish-button"]')
      expect(publishButton.element.disabled).toBe(true)

      // Fill only title
      await wrapper.find('[data-testid="article-title"]').setValue('Title Only')
      await wrapper.vm.$nextTick()
      expect(publishButton.element.disabled).toBe(true)

      // Add content but no category
      await wrapper.find('[data-testid="article-content"]').setValue('Some content')
      await wrapper.vm.$nextTick()
      expect(publishButton.element.disabled).toBe(true)

      // Add category - should enable publish button
      await wrapper.find('[data-testid="category"]').setValue('frontend')
      await wrapper.vm.$nextTick()
      expect(publishButton.element.disabled).toBe(false)
    })

    it('should handle markdown syntax errors gracefully', async () => {
      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(mockCurrentUser)

      const mockArticles = useArticles()
      mockArticles.listCategories = jest.fn().mockResolvedValue([
        { id: 'frontend', name: 'Frontend', color: '#3b82f6' }
      ])

      wrapper = mount(ArticleCreatePage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/articles/new')
      await wrapper.vm.$nextTick()

      // Fill form with problematic markdown
      await wrapper.find('[data-testid="article-title"]').setValue('Test Article')
      await wrapper.find('[data-testid="article-content"]').setValue('# Title\n\n```javascript\n// Unclosed code block')
      await wrapper.find('[data-testid="category"]').setValue('frontend')

      // Switch to preview
      await wrapper.find('[data-testid="preview-tab"]').trigger('click')
      await wrapper.vm.$nextTick()

      // Preview should still render, even with malformed markdown
      const previewContent = wrapper.find('[data-testid="preview-content"]')
      expect(previewContent.exists()).toBe(true)

      // Should be able to publish despite markdown issues
      const publishButton = wrapper.find('[data-testid="publish-button"]')
      expect(publishButton.element.disabled).toBe(false)
    })
  })

  describe('Article Editing Flow', () => {
    it('should load existing article for editing', async () => {
      const existingArticle = {
        id: 'existing-article-123',
        title: 'Existing Article',
        content: '# Original Content',
        categoryId: 'backend',
        tags: ['node', 'express'],
        authorId: mockCurrentUser.uid,
        isPublic: true
      }

      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(mockCurrentUser)

      const mockArticles = useArticles()
      mockArticles.getArticle = jest.fn().mockResolvedValue(existingArticle)
      mockArticles.updateArticle = jest.fn().mockResolvedValue({
        ...existingArticle,
        title: 'Updated Article Title',
        updatedAt: new Date()
      })
      mockArticles.listCategories = jest.fn().mockResolvedValue([
        { id: 'frontend', name: 'Frontend', color: '#3b82f6' },
        { id: 'backend', name: 'Backend', color: '#10b981' }
      ])

      wrapper = mount(ArticleEditPage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/articles/edit/existing-article-123')
      await wrapper.vm.$nextTick()

      // Verify article data is loaded
      expect(mockArticles.getArticle).toHaveBeenCalledWith('existing-article-123')

      // Verify form is populated
      const titleInput = wrapper.find('[data-testid="article-title"]')
      const contentTextarea = wrapper.find('[data-testid="article-content"]')
      const categorySelect = wrapper.find('[data-testid="category"]')
      const tagsInput = wrapper.find('[data-testid="tags"]')

      expect(titleInput.element.value).toBe('Existing Article')
      expect(contentTextarea.element.value).toBe('# Original Content')
      expect(categorySelect.element.value).toBe('backend')
      expect(tagsInput.element.value).toBe('node,express')

      // Update title and save
      await titleInput.setValue('Updated Article Title')
      const saveButton = wrapper.find('[data-testid="save-article"]')
      await saveButton.trigger('click')

      // Verify update API call
      expect(mockArticles.updateArticle).toHaveBeenCalledWith('existing-article-123', {
        title: 'Updated Article Title',
        content: '# Original Content',
        categoryId: 'backend',
        tags: ['node', 'express'],
        isPublic: true
      })
    })

    it('should prevent unauthorized users from editing others articles', async () => {
      const othersArticle = {
        id: 'others-article-123',
        title: 'Others Article',
        authorId: 'different-user-456'
      }

      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(mockCurrentUser)

      const mockArticles = useArticles()
      mockArticles.getArticle = jest.fn().mockResolvedValue(othersArticle)

      wrapper = mount(ArticleEditPage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/articles/edit/others-article-123')
      await wrapper.vm.$nextTick()

      // Should show unauthorized message or redirect
      const unauthorizedMessage = wrapper.find('[data-testid="unauthorized-message"]')
      expect(unauthorizedMessage.exists()).toBe(true)

      // Edit form should not be visible
      const titleInput = wrapper.find('[data-testid="article-title"]')
      expect(titleInput.exists()).toBe(false)
    })
  })

  describe('Rich Text Features', () => {
    it('should support image upload and embedding', async () => {
      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(mockCurrentUser)

      const mockArticles = useArticles()
      mockArticles.uploadImage = jest.fn().mockResolvedValue('https://example.com/image.jpg')
      mockArticles.listCategories = jest.fn().mockResolvedValue([
        { id: 'frontend', name: 'Frontend', color: '#3b82f6' }
      ])

      wrapper = mount(ArticleCreatePage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/articles/new')
      await wrapper.vm.$nextTick()

      // Simulate image upload
      const imageUpload = wrapper.find('[data-testid="image-upload"]')
      expect(imageUpload.exists()).toBe(true)

      const mockFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
      const fileInput = imageUpload.find('input[type="file"]')

      Object.defineProperty(fileInput.element, 'files', {
        value: [mockFile],
        writable: false
      })

      await fileInput.trigger('change')
      await wrapper.vm.$nextTick()

      // Verify upload API call
      expect(mockArticles.uploadImage).toHaveBeenCalledWith(mockFile)

      // Verify markdown is inserted into content
      const contentTextarea = wrapper.find('[data-testid="article-content"]')
      const contentValue = contentTextarea.element.value
      expect(contentValue).toContain('![](https://example.com/image.jpg)')
    })

    it('should provide markdown toolbar with common formatting options', async () => {
      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(mockCurrentUser)

      const mockArticles = useArticles()
      mockArticles.listCategories = jest.fn().mockResolvedValue([
        { id: 'frontend', name: 'Frontend', color: '#3b82f6' }
      ])

      wrapper = mount(ArticleCreatePage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/articles/new')
      await wrapper.vm.$nextTick()

      // Check for markdown toolbar
      const toolbar = wrapper.find('[data-testid="markdown-toolbar"]')
      expect(toolbar.exists()).toBe(true)

      // Check for common formatting buttons
      const boldButton = wrapper.find('[data-testid="bold-button"]')
      const italicButton = wrapper.find('[data-testid="italic-button"]')
      const codeButton = wrapper.find('[data-testid="code-button"]')
      const linkButton = wrapper.find('[data-testid="link-button"]')

      expect(boldButton.exists()).toBe(true)
      expect(italicButton.exists()).toBe(true)
      expect(codeButton.exists()).toBe(true)
      expect(linkButton.exists()).toBe(true)

      // Test bold formatting
      const contentTextarea = wrapper.find('[data-testid="article-content"]')
      await contentTextarea.setValue('selected text')

      // Simulate text selection
      contentTextarea.element.setSelectionRange(0, 13)
      await boldButton.trigger('click')

      // Verify bold markdown is applied
      expect(contentTextarea.element.value).toBe('**selected text**')
    })
  })

  describe('Auto-save Functionality', () => {
    it('should auto-save draft periodically while editing', async () => {
      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(mockCurrentUser)

      const mockArticles = useArticles()
      mockArticles.createArticle = jest.fn().mockResolvedValue({ id: 'draft-123' })
      mockArticles.updateArticle = jest.fn().mockResolvedValue({ id: 'draft-123' })
      mockArticles.listCategories = jest.fn().mockResolvedValue([
        { id: 'frontend', name: 'Frontend', color: '#3b82f6' }
      ])

      wrapper = mount(ArticleCreatePage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/articles/new')
      await wrapper.vm.$nextTick()

      // Start typing
      const titleInput = wrapper.find('[data-testid="article-title"]')
      const contentTextarea = wrapper.find('[data-testid="article-content"]')

      await titleInput.setValue('Auto-save Test')
      await contentTextarea.setValue('Content being typed...')

      // Wait for auto-save interval (e.g., 30 seconds)
      await new Promise(resolve => setTimeout(resolve, 31000))

      // Verify auto-save occurred
      expect(mockArticles.createArticle).toHaveBeenCalledWith({
        title: 'Auto-save Test',
        content: 'Content being typed...',
        isPublic: false,
        categoryId: '',
        tags: []
      })

      // Verify auto-save indicator
      const autoSaveIndicator = wrapper.find('[data-testid="auto-save-status"]')
      expect(autoSaveIndicator.exists()).toBe(true)
      expect(autoSaveIndicator.text()).toContain('Draft saved')
    })
  })

  describe('Tag Management', () => {
    it('should provide auto-complete for existing tags', async () => {
      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(mockCurrentUser)

      const mockArticles = useArticles()
      mockArticles.searchTags = jest.fn().mockResolvedValue([
        { id: 'vue', name: 'Vue.js' },
        { id: 'vuex', name: 'Vuex' },
        { id: 'vue-router', name: 'Vue Router' }
      ])
      mockArticles.listCategories = jest.fn().mockResolvedValue([
        { id: 'frontend', name: 'Frontend', color: '#3b82f6' }
      ])

      wrapper = mount(ArticleCreatePage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/articles/new')
      await wrapper.vm.$nextTick()

      // Start typing in tags input
      const tagsInput = wrapper.find('[data-testid="tags"]')
      await tagsInput.setValue('vue')
      await tagsInput.trigger('input')

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 300))

      // Verify search API call
      expect(mockArticles.searchTags).toHaveBeenCalledWith('vue')

      // Check for auto-complete suggestions
      const suggestions = wrapper.find('[data-testid="tag-suggestions"]')
      expect(suggestions.exists()).toBe(true)

      const suggestionItems = suggestions.findAll('[data-testid="tag-suggestion"]')
      expect(suggestionItems.length).toBe(3)
      expect(suggestionItems[0].text()).toContain('Vue.js')
    })

    it('should limit the number of tags to maximum allowed (5)', async () => {
      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(mockCurrentUser)

      const mockArticles = useArticles()
      mockArticles.listCategories = jest.fn().mockResolvedValue([
        { id: 'frontend', name: 'Frontend', color: '#3b82f6' }
      ])

      wrapper = mount(ArticleCreatePage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/articles/new')
      await wrapper.vm.$nextTick()

      // Try to add 6 tags (exceeding limit)
      const tagsInput = wrapper.find('[data-testid="tags"]')
      await tagsInput.setValue('tag1,tag2,tag3,tag4,tag5,tag6')
      await tagsInput.trigger('blur')

      // Should show validation error
      const tagError = wrapper.find('[data-testid="tags-error"]')
      expect(tagError.exists()).toBe(true)
      expect(tagError.text()).toContain('maximum of 5 tags')

      // Publish button should be disabled
      const publishButton = wrapper.find('[data-testid="publish-button"]')
      expect(publishButton.element.disabled).toBe(true)
    })
  })
})