<template>
  <div class="max-w-6xl mx-auto py-8">
    <!-- Debug Info -->
    <div class="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
      <h3 class="font-bold">🟡 デバッグ情報 (tags2.vue):</h3>
      <p>Tags count: {{ tags.length }}</p>
      <p>Loading: {{ loading }}</p>
      <p>getPopularTags exists: {{ typeof getPopularTags }}</p>
      <p>Current time: {{ new Date().toISOString() }}</p>
    </div>

    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">タグ一覧 (TEST)</h1>
      <p class="text-gray-600">興味のあるタグから記事を探しましょう。</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-wrap gap-2">
      <div v-for="i in 20" :key="i" class="animate-pulse">
        <div class="bg-gray-200 rounded-full h-8 w-24"></div>
      </div>
    </div>

    <!-- Tags List -->
    <div v-else-if="tags.length > 0">
      <div class="flex flex-wrap gap-3">
        <NuxtLink
          v-for="tag in tags"
          :key="tag.id"
          :to="`/tags/${tag.id}`"
          class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
        >
          #{{ tag.name }}
          <span class="ml-2 text-xs text-gray-500">({{ tag.articleCount }})</span>
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
      <h3 class="text-lg font-medium text-gray-900 mb-2">タグがありません</h3>
      <p class="text-gray-500">まだタグが登録されていません。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useArticles } from '~/composables/useArticles'

console.log('🚀 [TAGS2] Script setup executing...')

// SEO
useHead({
  title: 'タグ一覧 TEST - Article Platform',
  meta: [
    {
      name: 'description',
      content: 'すべてのタグを表示。興味のある技術タグから記事を探しましょう。'
    }
  ]
})

// Composables
const { getPopularTags } = useArticles()

// State
const tags = ref([])
const loading = ref(false)

console.log('🚀 [TAGS2] State initialized')

// Methods
const loadTags = async () => {
  console.log('📊 [TAGS2] loadTags() called')
  try {
    loading.value = true
    console.log('📊 [TAGS2] Loading tags...')

    const result = await getPopularTags(100)

    console.log('📊 [TAGS2] Tags loaded:', result)
    console.log('📊 [TAGS2] Tags count:', result?.length || 0)

    tags.value = result || []
  } catch (error) {
    console.error('❌ [TAGS2] Failed to load tags:', error)
  } finally {
    loading.value = false
    console.log('📊 [TAGS2] Loading complete')
  }
}

// Lifecycle
onMounted(async () => {
  console.log('🚀 [TAGS2] Component mounted!')
  await loadTags()
})

console.log('🚀 [TAGS2] Script setup complete')
</script>
