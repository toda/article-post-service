<template>
  <div class="max-w-6xl mx-auto py-8">
    <!-- Category Header -->
    <div v-if="category" class="mb-8">
      <div class="flex items-center space-x-4 mb-4">
        <div
          class="w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl font-bold"
          :style="{ backgroundColor: category.color }"
        >
          {{ category.name.charAt(0) }}
        </div>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ category.name }}</h1>
          <p class="text-gray-600">{{ category.articleCount || 0 }}件の記事</p>
        </div>
      </div>
      <p v-if="category.description" class="text-gray-600">{{ category.description }}</p>
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

    <!-- Articles Grid -->
    <div v-else-if="articles.length > 0">
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ArticleCard
          v-for="article in articles"
          :key="article.id"
          :article="article"
        />
      </div>

      <!-- Load More Button -->
      <div v-if="hasMore" class="mt-8 text-center">
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

      <!-- Back to Categories Link -->
      <div class="mt-8 text-center">
        <NuxtLink
          to="/categories"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          ← カテゴリ一覧に戻る
        </NuxtLink>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-gray-50 rounded-lg">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">記事がありません</h3>
      <p class="text-gray-500 mb-6">このカテゴリにはまだ記事がありません。</p>
      <NuxtLink
        to="/categories"
        class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        ← カテゴリ一覧に戻る
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useArticles } from '~/composables/useArticles'

// Route
const route = useRoute()
const categoryId = route.params.id

// Composables
const { getArticlesByCategory, listCategories } = useArticles()

// State
const category = ref(null)
const articles = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const pageSize = 12
const lastDoc = ref(null)

// Computed
const categoryName = computed(() => category.value?.name || 'カテゴリ')

// SEO
useHead({
  title: computed(() => `${categoryName.value} - Article Platform`),
  meta: computed(() => [
    {
      name: 'description',
      content: `${categoryName.value}の技術記事一覧。最新の${categoryName.value}に関する情報をチェックしましょう。`
    }
  ])
})

// Methods
const loadCategory = async () => {
  try {
    const categories = await listCategories()
    category.value = categories.find(cat => cat.id === categoryId)
  } catch (error) {
    console.error('Failed to load category:', error)
  }
}

const loadArticles = async () => {
  try {
    loading.value = true

    // Load initial batch of articles for this category
    const result = await getArticlesByCategory(categoryId, pageSize)
    const articlesData = result?.articles || result || []

    articles.value = articlesData

    // Check if there are more articles
    hasMore.value = articlesData.length === pageSize

    // Store last document for pagination
    if (result?.lastDoc) {
      lastDoc.value = result.lastDoc
    }
  } catch (error) {
    console.error('Failed to load articles:', error)
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  try {
    loadingMore.value = true

    // Load next batch of articles using the last document
    const result = await getArticlesByCategory(categoryId, pageSize, lastDoc.value)
    const articlesData = result?.articles || result || []

    if (articlesData.length > 0) {
      // Add new articles
      articles.value = [...articles.value, ...articlesData]

      // Check if there are more articles
      hasMore.value = articlesData.length === pageSize

      // Update last document for next pagination
      if (result?.lastDoc) {
        lastDoc.value = result.lastDoc
      }
    } else {
      hasMore.value = false
    }
  } catch (error) {
    console.error('Failed to load more articles:', error)
  } finally {
    loadingMore.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await loadCategory()
  await loadArticles()
})
</script>
