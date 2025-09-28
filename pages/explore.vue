<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">記事を発見</h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          カテゴリやタグから記事を探したり、検索して興味のある技術記事を見つけましょう。
        </p>
      </div>

      <!-- Search Bar -->
      <div class="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div class="relative max-w-lg mx-auto">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="記事を検索..."
            class="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
        </div>
      </div>

      <!-- Categories Section -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">カテゴリ別に探す</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div
            v-for="category in categories"
            :key="category.id"
            class="bg-white rounded-lg border hover:border-gray-300 hover:shadow-sm transition-all p-4 text-left cursor-pointer"
          >
            <div
              class="w-8 h-8 rounded-lg mb-3 flex items-center justify-center text-white text-sm font-bold"
              :style="{ backgroundColor: category.color }"
            >
              {{ category.name.charAt(0) }}
            </div>
            <h3 class="font-medium text-gray-900 hover:text-blue-600 transition-colors text-sm">
              {{ category.name }}
            </h3>
            <p class="text-xs text-gray-500 mt-1">
              {{ category.articleCount }}記事
            </p>
          </div>
        </div>
      </section>

      <!-- Popular Tags -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">人気タグ</h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in popularTags"
            :key="tag.id"
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer transition-colors"
          >
            #{{ tag.name }}
            <span class="ml-1 text-xs">({{ tag.articleCount }})</span>
          </span>
        </div>
      </section>

      <!-- Featured Articles -->
      <section>
        <h2 class="text-2xl font-bold text-gray-900 mb-6">おすすめ記事</h2>
        <div class="space-y-6">
          <!-- Sample articles -->
          <article class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold">JS</span>
                </div>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                  JavaScript ES2024の新機能まとめ
                </h3>
                <p class="text-gray-600 text-sm mb-3">
                  JavaScript ES2024で追加された新機能について、実用的なコード例とともに解説します。
                </p>
                <div class="flex items-center text-sm text-gray-500 space-x-4">
                  <span class="inline-flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    1.2k
                  </span>
                  <span class="inline-flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    89
                  </span>
                  <span>3日前</span>
                </div>
              </div>
            </div>
          </article>

          <article class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold">VUE</span>
                </div>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                  Vue 3 Composition APIの実践的な使い方
                </h3>
                <p class="text-gray-600 text-sm mb-3">
                  Vue 3のComposition APIを使った効率的なコンポーネント開発手法を実例とともに紹介します。
                </p>
                <div class="flex items-center text-sm text-gray-500 space-x-4">
                  <span class="inline-flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    987
                  </span>
                  <span class="inline-flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    67
                  </span>
                  <span>5日前</span>
                </div>
              </div>
            </div>
          </article>

          <article class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold">TS</span>
                </div>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                  TypeScript 5.0の型安全性向上テクニック
                </h3>
                <p class="text-gray-600 text-sm mb-3">
                  TypeScript 5.0で強化された型システムを活用して、より安全なコードを書く方法を解説します。
                </p>
                <div class="flex items-center text-sm text-gray-500 space-x-4">
                  <span class="inline-flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    756
                  </span>
                  <span class="inline-flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    43
                  </span>
                  <span>1週間前</span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- Load More Button -->
        <div class="mt-8 text-center">
          <button class="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            さらに読み込む
            <svg class="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// SEO
useHead({
  title: '記事を発見 - Article Platform',
  meta: [
    {
      name: 'description',
      content: 'カテゴリやタグから技術記事を発見。あなたの興味のある技術分野の記事を見つけましょう。'
    }
  ]
})

// State
const searchQuery = ref('')

// Sample data
const categories = ref([
  { id: 'frontend', name: 'フロントエンド', color: '#3B82F6', articleCount: 234 },
  { id: 'backend', name: 'バックエンド', color: '#10B981', articleCount: 187 },
  { id: 'mobile', name: 'モバイル', color: '#8B5CF6', articleCount: 156 },
  { id: 'devops', name: 'DevOps', color: '#F59E0B', articleCount: 98 },
  { id: 'ai-ml', name: 'AI・機械学習', color: '#EF4444', articleCount: 143 },
  { id: 'security', name: 'セキュリティ', color: '#6B7280', articleCount: 67 },
  { id: 'other', name: 'その他', color: '#94A3B8', articleCount: 89 }
])

const popularTags = ref([
  { id: 'javascript', name: 'JavaScript', articleCount: 345 },
  { id: 'typescript', name: 'TypeScript', articleCount: 278 },
  { id: 'vue', name: 'Vue.js', articleCount: 189 },
  { id: 'react', name: 'React', articleCount: 267 },
  { id: 'node', name: 'Node.js', articleCount: 156 },
  { id: 'python', name: 'Python', articleCount: 198 },
  { id: 'docker', name: 'Docker', articleCount: 134 },
  { id: 'aws', name: 'AWS', articleCount: 112 }
])

// Methods
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    console.log('Searching for:', searchQuery.value)
    // TODO: Implement search functionality
  }
}
</script>