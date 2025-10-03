<template>
  <div class="max-w-6xl mx-auto py-8">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">カテゴリ一覧</h1>
      <p class="text-gray-600">興味のあるカテゴリから記事を探しましょう。</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      <div v-for="i in 7" :key="i" class="animate-pulse">
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <div class="w-8 h-8 bg-gray-200 rounded-lg mb-3"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Categories Grid -->
    <div v-else-if="categories.length > 0">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <NuxtLink
          v-for="category in categories"
          :key="category.id"
          :to="`/categories/${category.id}`"
          class="group bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 hover:shadow-md transition-all"
        >
          <div
            class="w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-white text-lg font-bold"
            :style="{ backgroundColor: category.color }"
          >
            {{ category.name.charAt(0) }}
          </div>
          <h3 class="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-lg mb-2">
            {{ category.name }}
          </h3>
          <p class="text-sm text-gray-500">
            {{ category.articleCount || 0 }}件の記事
          </p>
          <p v-if="category.description" class="text-xs text-gray-400 mt-2 line-clamp-2">
            {{ category.description }}
          </p>
        </NuxtLink>
      </div>

      <!-- Back to Home Link -->
      <div class="mt-8 text-center">
        <NuxtLink
          to="/"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          ← ホームに戻る
        </NuxtLink>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-gray-50 rounded-lg">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">カテゴリがありません</h3>
      <p class="text-gray-500">まだカテゴリが登録されていません。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useArticles } from '~/composables/useArticles'

// SEO
useHead({
  title: 'カテゴリ一覧 - Article Platform',
  meta: [
    {
      name: 'description',
      content: 'すべてのカテゴリを表示。興味のある技術分野から記事を探しましょう。'
    }
  ]
})

// Composables
const { listCategories } = useArticles()

// State
const categories = ref([])
const loading = ref(false)

// Methods
const loadCategories = async () => {
  try {
    loading.value = true
    const result = await listCategories()
    categories.value = result || []
  } catch (error) {
    console.error('Failed to load categories:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadCategories()
})
</script>
