<template>
  <div class="max-w-6xl mx-auto py-8">
    <!-- Search Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">記事を検索</h1>

      <!-- Search Input -->
      <div class="relative">
        <input
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          type="text"
          placeholder="タイトル、本文、タグで検索..."
          class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg class="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Search Stats -->
      <div v-if="hasSearched" class="mt-4 text-sm text-gray-600">
        <span v-if="articles.length > 0">
          「{{ currentSearchQuery }}」の検索結果: {{ articles.length }}件
        </span>
        <span v-else>
          「{{ currentSearchQuery }}」に一致する記事が見つかりませんでした
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 6" :key="i" class="animate-pulse">
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div class="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>

    <!-- Search Results -->
    <div v-else-if="hasSearched && articles.length > 0">
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ArticleCard
          v-for="article in displayedArticles"
          :key="article.id"
          :article="article"
        />
      </div>

      <!-- Load More Button -->
      <div v-if="hasMoreResults" class="mt-8 text-center">
        <button
          @click="loadMore"
          :disabled="loadingMore"
          class="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="loadingMore" class="inline-flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            読み込み中...
          </span>
          <span v-else class="inline-flex items-center">
            さらに読み込む
            <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>
      </div>
    </div>

    <!-- Empty State - No Search -->
    <div v-else-if="!hasSearched" class="text-center py-20">
      <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">記事を検索</h3>
      <p class="text-gray-500">キーワードを入力して記事を検索できます</p>
    </div>

    <!-- Empty State - No Results -->
    <div v-else class="text-center py-20">
      <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">検索結果がありません</h3>
      <p class="text-gray-500 mb-6">別のキーワードで検索してみてください</p>
      <button
        @click="clearSearch"
        class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        検索をクリア
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticles } from '~/composables/useArticles'

// Router
const route = useRoute()
const router = useRouter()

// SEO
useHead({
  title: '記事検索 - Article Platform',
  meta: [
    {
      name: 'description',
      content: 'タイトル、本文、タグで記事を検索できます。'
    }
  ]
})

// Composables
const { searchArticles } = useArticles()

// State
const searchQuery = ref('')
const currentSearchQuery = ref('')
const articles = ref([])
const loading = ref(false)
const hasSearched = ref(false)
const loadingMore = ref(false)
const displayCount = ref(21)
const pageSize = 21

// Computed
const displayedArticles = computed(() => {
  return articles.value.slice(0, displayCount.value)
})

const hasMoreResults = computed(() => {
  return articles.value.length > displayCount.value
})

// Methods
const handleSearch = async () => {
  if (!searchQuery.value.trim()) return

  try {
    loading.value = true
    hasSearched.value = true
    currentSearchQuery.value = searchQuery.value
    displayCount.value = 21

    // Update URL with search query
    router.push({ query: { q: searchQuery.value } })

    const result = await searchArticles(searchQuery.value, {
      limit: 50
    })

    articles.value = result?.articles || []
  } catch (error) {
    console.error('Failed to search articles:', error)
  } finally {
    loading.value = false
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  currentSearchQuery.value = ''
  articles.value = []
  hasSearched.value = false
  displayCount.value = 21
  router.push({ query: {} })
}

const loadMore = () => {
  loadingMore.value = true
  setTimeout(() => {
    displayCount.value += pageSize
    loadingMore.value = false
  }, 300)
}

// Lifecycle
onMounted(() => {
  // Load search query from URL if present
  const queryParam = route.query.q
  if (queryParam) {
    searchQuery.value = queryParam
    handleSearch()
  }
})
</script>
