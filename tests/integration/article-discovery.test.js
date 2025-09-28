/**
 * Integration Test: Article Discovery Flow
 *
 * Tests the complete article discovery and browsing flow
 * Based on User Story 2 from quickstart.md
 *
 * These tests MUST FAIL initially (TDD approach)
 * Implementation will be created to make these tests pass
 */

import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'

// Pages to be implemented
import HomePage from '../../pages/index.vue'
import ExplorePage from '../../pages/explore.vue'
import ArticlePage from '../../pages/articles/[id].vue'

// Composables to be implemented
import { useArticles } from '../../composables/useArticles.js'
import { useAuth } from '../../composables/useAuth.js'
import { useUsers } from '../../composables/useUsers.js'

// Mock Firebase for testing
jest.mock('firebase/auth')
jest.mock('firebase/firestore')

describe('Article Discovery Flow Integration Test', () => {
  let router
  let pinia
  let wrapper

  beforeEach(() => {
    // Setup router
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: HomePage },
        { path: '/explore', component: ExplorePage },
        { path: '/articles/:id', component: ArticlePage },
        { path: '/categories/:id', component: { template: '<div>Category</div>' } },
        { path: '/tags/:id', component: { template: '<div>Tag</div>' } }
      ]
    })

    // Setup Pinia store
    pinia = createPinia()

    // Mock implementation functions
    global.mockArticleData = jest.fn()
    global.mockUserInteraction = jest.fn()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Home Page Article Browsing', () => {
    it('should display trending articles on home page', async () => {
      const mockArticles = [
        {
          id: 'article-1',
          title: 'Vue.js 3の新機能解説',
          excerpt: 'Vue.js 3の新しい機能について詳しく解説します。',
          categoryId: 'frontend',
          tags: ['vue', 'javascript'],
          author: {
            displayName: 'techexpert',
            avatarUrl: 'https://example.com/avatar.jpg'
          },
          likeCount: 45,
          viewCount: 1250,
          commentCount: 12,
          publishedAt: new Date('2024-01-15'),
          readingTime: 8
        },
        {
          id: 'article-2',
          title: 'Node.js最新動向2024',
          excerpt: '2024年のNode.js開発動向をまとめました。',
          categoryId: 'backend',
          tags: ['nodejs', 'backend'],
          author: {
            displayName: 'backenddev',
            avatarUrl: 'https://example.com/avatar2.jpg'
          },
          likeCount: 32,
          viewCount: 890,
          commentCount: 8,
          publishedAt: new Date('2024-01-14'),
          readingTime: 6
        }
      ]

      const mockArticlesAPI = useArticles()
      mockArticlesAPI.getPopularArticles = jest.fn().mockResolvedValue(mockArticles)
      mockArticlesAPI.getRecentArticles = jest.fn().mockResolvedValue(mockArticles)

      wrapper = mount(HomePage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/')
      await wrapper.vm.$nextTick()

      // Step 1: Check trending articles section
      const trendingSection = wrapper.find('[data-testid="trending-articles"]')
      expect(trendingSection.exists()).toBe(true)

      // Step 2: Verify article cards are displayed
      const articleCards = wrapper.findAll('[data-testid="article-card"]')
      expect(articleCards.length).toBeGreaterThan(0)

      if (articleCards.length > 0) {
        const firstCard = articleCards[0]
        expect(firstCard.find('[data-testid="article-title"]').exists()).toBe(true)
        expect(firstCard.find('[data-testid="article-excerpt"]').exists()).toBe(true)
        expect(firstCard.find('[data-testid="article-author"]').exists()).toBe(true)
        expect(firstCard.find('[data-testid="article-stats"]').exists()).toBe(true)
        expect(firstCard.find('[data-testid="article-tags"]').exists()).toBe(true)
      }

      // Step 3: Check recent articles section
      const recentSection = wrapper.find('[data-testid="recent-articles"]')
      expect(recentSection.exists()).toBe(true)

      // Step 4: Verify navigation links
      const exploreLink = wrapper.find('[data-testid="explore-link"]')
      expect(exploreLink.exists()).toBe(true)
    })

    it('should navigate to article detail when article card is clicked', async () => {
      const mockArticle = {
        id: 'article-1',
        title: 'Vue.js 3の新機能解説',
        content: '# Vue.js 3の新機能\n\nVue.js 3の新しい機能について詳しく解説します。',
        categoryId: 'frontend',
        tags: ['vue', 'javascript'],
        author: {
          displayName: 'techexpert',
          avatarUrl: 'https://example.com/avatar.jpg'
        },
        likeCount: 45,
        viewCount: 1250,
        commentCount: 12,
        publishedAt: new Date('2024-01-15'),
        readingTime: 8
      }

      const mockArticlesAPI = useArticles()
      mockArticlesAPI.getPopularArticles = jest.fn().mockResolvedValue([mockArticle])
      mockArticlesAPI.getArticle = jest.fn().mockResolvedValue(mockArticle)
      mockArticlesAPI.incrementViewCount = jest.fn().mockResolvedValue()

      wrapper = mount(HomePage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/')
      await wrapper.vm.$nextTick()

      // Click on article card
      const articleCard = wrapper.find('[data-testid="article-card"]')
      expect(articleCard.exists()).toBe(true)

      await articleCard.trigger('click')
      await wrapper.vm.$nextTick()

      // Should navigate to article detail page
      expect(router.currentRoute.value.path).toBe('/articles/article-1')
    })
  })

  describe('Category-based Discovery', () => {
    it('should filter articles by category', async () => {
      const mockCategories = [
        {
          id: 'frontend',
          name: 'フロントエンド',
          slug: 'frontend',
          color: '#3B82F6',
          articleCount: 156,
          isActive: true
        },
        {
          id: 'backend',
          name: 'バックエンド',
          slug: 'backend',
          color: '#10B981',
          articleCount: 89,
          isActive: true
        }
      ]

      const mockFrontendArticles = [
        {
          id: 'frontend-1',
          title: 'React vs Vue 2024',
          categoryId: 'frontend',
          tags: ['react', 'vue']
        }
      ]

      const mockArticlesAPI = useArticles()
      mockArticlesAPI.listCategories = jest.fn().mockResolvedValue(mockCategories)
      mockArticlesAPI.listArticles = jest.fn().mockResolvedValue({
        articles: mockFrontendArticles,
        total: 1,
        hasNext: false
      })

      wrapper = mount(ExplorePage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/explore')
      await wrapper.vm.$nextTick()

      // Step 1: Check categories are displayed
      const categoriesSection = wrapper.find('[data-testid="categories"]')
      expect(categoriesSection.exists()).toBe(true)

      const categoryButtons = wrapper.findAll('[data-testid="category-button"]')
      expect(categoryButtons.length).toBeGreaterThan(0)

      // Step 2: Click on frontend category
      const frontendCategory = categoryButtons.find(btn =>
        btn.text().includes('フロントエンド')
      )
      expect(frontendCategory).toBeDefined()

      await frontendCategory.trigger('click')
      await wrapper.vm.$nextTick()

      // Step 3: Verify API called with category filter
      expect(mockArticlesAPI.listArticles).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryId: 'frontend'
        })
      )

      // Step 4: Check filtered articles are displayed
      const articlesList = wrapper.find('[data-testid="articles-list"]')
      expect(articlesList.exists()).toBe(true)
    })
  })

  describe('Tag-based Discovery', () => {
    it('should display popular tags and filter by tag', async () => {
      const mockTags = [
        {
          id: 'vue',
          name: 'Vue.js',
          slug: 'vue',
          articleCount: 67,
          followCount: 234
        },
        {
          id: 'react',
          name: 'React',
          slug: 'react',
          articleCount: 89,
          followCount: 312
        }
      ]

      const mockVueArticles = [
        {
          id: 'vue-1',
          title: 'Vue 3 Composition API',
          tags: ['vue', 'composition-api']
        }
      ]

      const mockArticlesAPI = useArticles()
      mockArticlesAPI.getPopularTags = jest.fn().mockResolvedValue(mockTags)
      mockArticlesAPI.listArticles = jest.fn().mockResolvedValue({
        articles: mockVueArticles,
        total: 1,
        hasNext: false
      })

      wrapper = mount(ExplorePage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/explore')
      await wrapper.vm.$nextTick()

      // Step 1: Check popular tags section
      const tagsSection = wrapper.find('[data-testid="popular-tags"]')
      expect(tagsSection.exists()).toBe(true)

      const tagButtons = wrapper.findAll('[data-testid="tag-button"]')
      expect(tagButtons.length).toBeGreaterThan(0)

      // Step 2: Click on Vue.js tag
      const vueTag = tagButtons.find(btn =>
        btn.text().includes('Vue.js')
      )
      expect(vueTag).toBeDefined()

      await vueTag.trigger('click')
      await wrapper.vm.$nextTick()

      // Step 3: Verify API called with tag filter
      expect(mockArticlesAPI.listArticles).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['vue']
        })
      )

      // Step 4: Check filtered articles are displayed
      const articlesList = wrapper.find('[data-testid="articles-list"]')
      expect(articlesList.exists()).toBe(true)
    })
  })

  describe('Search Functionality', () => {
    it('should search articles and display results', async () => {
      const searchResults = [
        {
          id: 'search-1',
          title: 'Vue.js入門ガイド',
          excerpt: 'Vue.jsの基本的な使い方を学びます。',
          tags: ['vue', 'tutorial']
        }
      ]

      const mockArticlesAPI = useArticles()
      mockArticlesAPI.searchArticles = jest.fn().mockResolvedValue({
        articles: searchResults,
        total: 1,
        hasNext: false
      })

      wrapper = mount(ExplorePage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/explore')
      await wrapper.vm.$nextTick()

      // Step 1: Find search input
      const searchInput = wrapper.find('[data-testid="search-input"]')
      expect(searchInput.exists()).toBe(true)

      // Step 2: Enter search term
      await searchInput.setValue('Vue.js')
      await searchInput.trigger('input')

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 600))

      // Step 3: Verify search API called
      expect(mockArticlesAPI.searchArticles).toHaveBeenCalledWith(
        'Vue.js',
        expect.any(Object)
      )

      // Step 4: Check search results displayed
      const searchResults = wrapper.find('[data-testid="search-results"]')
      expect(searchResults.exists()).toBe(true)

      // Step 5: Clear search and show all articles
      const clearButton = wrapper.find('[data-testid="clear-search"]')
      if (clearButton.exists()) {
        await clearButton.trigger('click')
        await wrapper.vm.$nextTick()

        expect(searchInput.element.value).toBe('')
      }
    })
  })

  describe('Article Detail View', () => {
    it('should display full article content with interactions', async () => {
      const mockArticle = {
        id: 'article-1',
        title: 'Vue.js 3の新機能解説',
        content: '# Vue.js 3の新機能\n\n## Composition API\n\nComposition APIは新しいコンポーネント記述方法です。',
        categoryId: 'frontend',
        tags: ['vue', 'javascript'],
        author: {
          displayName: 'techexpert',
          avatarUrl: 'https://example.com/avatar.jpg'
        },
        likeCount: 45,
        viewCount: 1250,
        commentCount: 12,
        publishedAt: new Date('2024-01-15'),
        readingTime: 8,
        isLiked: false
      }

      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue({
        uid: 'user-123',
        displayName: 'testuser'
      })

      const mockArticlesAPI = useArticles()
      mockArticlesAPI.getArticle = jest.fn().mockResolvedValue(mockArticle)
      mockArticlesAPI.incrementViewCount = jest.fn().mockResolvedValue()
      mockArticlesAPI.likeArticle = jest.fn().mockResolvedValue()

      wrapper = mount(ArticlePage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/articles/article-1')
      await wrapper.vm.$nextTick()

      // Step 1: Verify article content is displayed
      const articleTitle = wrapper.find('[data-testid="article-title"]')
      expect(articleTitle.exists()).toBe(true)
      expect(articleTitle.text()).toBe(mockArticle.title)

      const articleContent = wrapper.find('[data-testid="article-content"]')
      expect(articleContent.exists()).toBe(true)

      // Step 2: Check article metadata
      const authorInfo = wrapper.find('[data-testid="author-info"]')
      expect(authorInfo.exists()).toBe(true)
      expect(authorInfo.text()).toContain('techexpert')

      const publishDate = wrapper.find('[data-testid="publish-date"]')
      expect(publishDate.exists()).toBe(true)

      const readingTime = wrapper.find('[data-testid="reading-time"]')
      expect(readingTime.exists()).toBe(true)

      // Step 3: Check article statistics
      const likeCount = wrapper.find('[data-testid="like-count"]')
      expect(likeCount.exists()).toBe(true)
      expect(likeCount.text()).toContain('45')

      const viewCount = wrapper.find('[data-testid="view-count"]')
      expect(viewCount.exists()).toBe(true)
      expect(viewCount.text()).toContain('1250')

      // Step 4: Test like functionality
      const likeButton = wrapper.find('[data-testid="like-button"]')
      expect(likeButton.exists()).toBe(true)

      await likeButton.trigger('click')
      await wrapper.vm.$nextTick()

      expect(mockArticlesAPI.likeArticle).toHaveBeenCalledWith('article-1')

      // Step 5: Check tags are clickable
      const tags = wrapper.findAll('[data-testid="article-tag"]')
      expect(tags.length).toBeGreaterThan(0)

      if (tags.length > 0) {
        await tags[0].trigger('click')
        // Should navigate to tag page or filter by tag
      }
    })

    it('should increment view count when article is loaded', async () => {
      const mockArticle = {
        id: 'article-1',
        title: 'Test Article',
        content: 'Test content',
        viewCount: 100
      }

      const mockArticlesAPI = useArticles()
      mockArticlesAPI.getArticle = jest.fn().mockResolvedValue(mockArticle)
      mockArticlesAPI.incrementViewCount = jest.fn().mockResolvedValue()

      wrapper = mount(ArticlePage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/articles/article-1')
      await wrapper.vm.$nextTick()

      // Verify view count increment was called
      expect(mockArticlesAPI.incrementViewCount).toHaveBeenCalledWith('article-1')
    })
  })

  describe('Responsive Design and Performance', () => {
    it('should handle loading states properly', async () => {
      const mockArticlesAPI = useArticles()
      // Simulate slow API response
      mockArticlesAPI.getPopularArticles = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([]), 1000))
      )

      wrapper = mount(HomePage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/')
      await wrapper.vm.$nextTick()

      // Should show loading indicators
      const loadingIndicator = wrapper.find('[data-testid="loading-articles"]')
      expect(loadingIndicator.exists()).toBe(true)

      // Wait for API response
      await new Promise(resolve => setTimeout(resolve, 1100))
      await wrapper.vm.$nextTick()

      // Loading should be hidden
      expect(wrapper.find('[data-testid="loading-articles"]').exists()).toBe(false)
    })

    it('should handle empty states gracefully', async () => {
      const mockArticlesAPI = useArticles()
      mockArticlesAPI.getPopularArticles = jest.fn().mockResolvedValue([])
      mockArticlesAPI.getRecentArticles = jest.fn().mockResolvedValue([])

      wrapper = mount(HomePage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/')
      await wrapper.vm.$nextTick()

      // Should show empty state message
      const emptyState = wrapper.find('[data-testid="no-articles"]')
      expect(emptyState.exists()).toBe(true)
      expect(emptyState.text()).toContain('記事がありません')
    })
  })

  describe('Pagination and Infinite Scroll', () => {
    it('should load more articles when reaching bottom of page', async () => {
      const firstBatch = [
        { id: 'article-1', title: 'Article 1' },
        { id: 'article-2', title: 'Article 2' }
      ]
      const secondBatch = [
        { id: 'article-3', title: 'Article 3' },
        { id: 'article-4', title: 'Article 4' }
      ]

      const mockArticlesAPI = useArticles()
      mockArticlesAPI.listArticles = jest.fn()
        .mockResolvedValueOnce({
          articles: firstBatch,
          total: 4,
          hasNext: true,
          nextCursor: 'cursor-1'
        })
        .mockResolvedValueOnce({
          articles: secondBatch,
          total: 4,
          hasNext: false
        })

      wrapper = mount(ExplorePage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/explore')
      await wrapper.vm.$nextTick()

      // Initial load should show first batch
      expect(wrapper.findAll('[data-testid="article-card"]').length).toBe(2)

      // Simulate scroll to bottom
      const loadMoreButton = wrapper.find('[data-testid="load-more"]')
      if (loadMoreButton.exists()) {
        await loadMoreButton.trigger('click')
        await wrapper.vm.$nextTick()

        // Should now show all articles
        expect(wrapper.findAll('[data-testid="article-card"]').length).toBe(4)
      }
    })
  })
})