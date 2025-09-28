<template>
  <div class="space-y-8">
    <!-- Hero Section -->
    <section class="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl">
      <div class="max-w-4xl mx-auto px-4">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          技術記事を<span class="text-blue-600">共有</span>しよう
        </h1>
        <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          開発者のためのナレッジプラットフォーム。あなたの知識を記事にして、コミュニティと共有しましょう。
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink
            v-if="!isLoggedIn"
            to="/signup"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            今すぐ始める
          </NuxtLink>
          <NuxtLink
            v-else
            to="/write"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            記事を書く
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
        <NuxtLink
          v-for="tag in (popularTags || [])"
          :key="tag.id"
          :to="`/tags/${tag.id}`"
          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
        >
          #{{ tag.name }}
          <span class="ml-1 text-xs text-gray-500">({{ tag.count || 0 }})</span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

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

// Mock data for now - no composables to avoid errors
const user = ref(null)
const isLoggedIn = ref(false)

// State
const categories = ref([])
const popularTags = ref([])

// Methods
const loadData = async () => {
  // Mock categories data
  categories.value = [
    { id: 'tech', name: 'Technology', color: '#3B82F6', articleCount: 45 },
    { id: 'javascript', name: 'JavaScript', color: '#F59E0B', articleCount: 32 },
    { id: 'react', name: 'React', color: '#06B6D4', articleCount: 28 },
    { id: 'vue', name: 'Vue.js', color: '#10B981', articleCount: 25 },
    { id: 'nodejs', name: 'Node.js', color: '#84CC16', articleCount: 20 },
    { id: 'python', name: 'Python', color: '#8B5CF6', articleCount: 18 }
  ]

  // Mock popular tags
  popularTags.value = [
    { id: 'javascript', name: 'JavaScript', count: 150 },
    { id: 'typescript', name: 'TypeScript', count: 120 },
    { id: 'react', name: 'React', count: 100 },
    { id: 'vue', name: 'Vue.js', count: 90 },
    { id: 'nodejs', name: 'Node.js', count: 85 },
    { id: 'python', name: 'Python', count: 80 },
    { id: 'docker', name: 'Docker', count: 60 },
    { id: 'kubernetes', name: 'Kubernetes', count: 45 },
    { id: 'aws', name: 'AWS', count: 40 },
    { id: 'nextjs', name: 'Next.js', count: 35 }
  ]
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>