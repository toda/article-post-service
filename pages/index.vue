<template>
  <div class="space-y-8">
    <!-- Hero Section (未ログインユーザーのみ表示) -->
    <section v-if="!isLoggedIn" class="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl">
      <div class="max-w-4xl mx-auto px-4">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          技術記事を<span class="text-blue-600">共有</span>しよう
        </h1>
        <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          開発者のためのナレッジプラットフォーム。あなたの知識を記事にして、コミュニティと共有しましょう。
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink
            to="/signup"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            今すぐ始める
          </NuxtLink>
          <NuxtLink
            to="/explore"
            class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            記事を探す
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Recent Articles Section -->
    <section>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900">最新の記事</h2>
        <NuxtLink
          to="/explore"
          class="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
        >
          すべて見る →
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-if="articlesLoading" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="animate-pulse">
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div class="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>

      <!-- Articles Grid -->
      <div v-else-if="recentArticles.length > 0" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ArticleCard
          v-for="article in recentArticles"
          :key="article.id"
          :article="article"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 bg-gray-50 rounded-lg">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">まだ記事がありません</h3>
        <p class="text-gray-500">最初の記事を投稿してみませんか？</p>
      </div>
    </section>

    <!-- Categories Section -->
    <section>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900">カテゴリ</h2>
        <NuxtLink
          to="/explore"
          class="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
        >
          すべて見る →
        </NuxtLink>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <NuxtLink
          v-for="category in (categories || [])"
          :key="category.id"
          :to="`/categories/${category.id}`"
          class="group bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all"
        >
          <div
            class="w-8 h-8 rounded-lg mb-3 flex items-center justify-center text-white text-sm font-bold"
            :style="{ backgroundColor: category.color }"
          >
            {{ category.name.charAt(0) }}
          </div>
          <h3 class="font-medium text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
            {{ category.name }}
          </h3>
          <p class="text-xs text-gray-500 mt-1">
            {{ category.articleCount || 0 }}記事
          </p>
        </NuxtLink>
      </div>
    </section>

    <!-- Popular Tags Section -->
    <section>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900">人気タグ</h2>
        <NuxtLink
          to="/tags"
          class="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
        >
          すべて見る →
        </NuxtLink>
      </div>

      <div class="flex flex-wrap gap-2">
        <template v-for="tag in (popularTags || [])" :key="tag.id">
          <NuxtLink
            v-if="tag.articleCount > 0"
            :to="`/tags/${tag.id}`"
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
          >
            #{{ tag.name }}
            <span class="ml-1 text-xs text-gray-500">({{ tag.articleCount }})</span>
          </NuxtLink>
        </template>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useArticles } from '~/composables/useArticles'

// SEO
useHead({
  title: 'Article Platform - 技術記事共有プラットフォーム',
  meta: [
    {
      name: 'description',
      content: '開発者のための技術記事共有プラットフォーム。あなたの知識を記事にして、コミュニティと共有しましょう。'
    }
  ]
})

// Composables
const { user, isLoggedIn } = useAuth()
const { getRecentArticles, listCategories, getPopularTags } = useArticles()

// State
const categories = ref([])
const popularTags = ref([])
const recentArticles = ref([])
const articlesLoading = ref(false)

// Methods
const loadData = async () => {
  try {
    articlesLoading.value = true

    // Load recent articles (sorted by publishedAt/createdAt)
    const articlesResult = await getRecentArticles(6)
    recentArticles.value = articlesResult || []

    // Load categories
    const categoriesResult = await listCategories()
    categories.value = categoriesResult || []

    // Load popular tags
    const tagsResult = await getPopularTags(10)
    console.log('📊 Popular tags result:', tagsResult)
    popularTags.value = tagsResult || []
  } catch (error) {
    console.error('Failed to load homepage data:', error)
  } finally {
    articlesLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>