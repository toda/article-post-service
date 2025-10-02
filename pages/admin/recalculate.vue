<template>
  <div class="max-w-4xl mx-auto py-12 px-4">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">管理ツール</h1>

    <!-- Category Recalculation -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">カテゴリ記事数の再計算</h2>

      <p class="text-gray-600 mb-6">
        全ての記事を読み込み、各カテゴリの記事数を再計算します。
      </p>

      <button
        @click="handleRecalculateCategories"
        :disabled="isProcessing"
        class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {{ isProcessing ? '処理中...' : 'カテゴリを再計算' }}
      </button>

      <!-- Status Messages -->
      <div v-if="statusMessage" class="mt-6">
        <div
          :class="[
            'p-4 rounded-lg',
            statusType === 'success' ? 'bg-green-50 text-green-800' :
            statusType === 'error' ? 'bg-red-50 text-red-800' :
            'bg-blue-50 text-blue-800'
          ]"
        >
          <p class="font-medium">{{ statusMessage }}</p>
        </div>
      </div>

      <!-- Category Results -->
      <div v-if="categoryResults" class="mt-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">カテゴリ結果</h3>
        <div class="bg-gray-50 rounded-lg p-4">
          <div v-for="(count, categoryId) in categoryResults" :key="categoryId" class="flex justify-between py-2">
            <span class="text-gray-700">{{ getCategoryName(categoryId) }}</span>
            <span class="font-semibold text-gray-900">{{ count }}記事</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tag Recalculation -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">タグ記事数の再計算</h2>

      <p class="text-gray-600 mb-6">
        全ての記事を読み込み、各タグの記事数を再計算します。
      </p>

      <button
        @click="handleRecalculateTags"
        :disabled="isProcessing"
        class="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {{ isProcessing ? '処理中...' : 'タグを再計算' }}
      </button>

      <!-- Tag Results -->
      <div v-if="tagResults" class="mt-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">タグ結果</h3>
        <div class="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
          <div v-for="(count, tagName) in tagResults" :key="tagName" class="flex justify-between py-2 border-b border-gray-200 last:border-0">
            <span class="text-gray-700">#{{ tagName }}</span>
            <span class="font-semibold text-gray-900">{{ count }}記事</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useArticles } from '~/composables/useArticles'

// Apply admin authentication middleware
definePageMeta({
  middleware: 'admin-auth'
})

// SEO
useHead({
  title: '管理ツール - カテゴリ再計算',
  meta: [
    {
      name: 'robots',
      content: 'noindex, nofollow'
    }
  ]
})

// State
const isProcessing = ref(false)
const statusMessage = ref('')
const statusType = ref('info')
const categoryResults = ref(null)
const tagResults = ref(null)

// Composables
const { recalculateCategoryCounts, recalculateTagCounts } = useArticles()

// Category names
const CATEGORY_NAMES = {
  'frontend': 'フロントエンド',
  'backend': 'バックエンド',
  'mobile': 'モバイル',
  'devops': 'DevOps',
  'ai-ml': 'AI・機械学習',
  'security': 'セキュリティ',
  'other': 'その他'
}

const getCategoryName = (categoryId) => {
  return CATEGORY_NAMES[categoryId] || categoryId
}

// Handle category recalculation
const handleRecalculateCategories = async () => {
  try {
    isProcessing.value = true
    statusMessage.value = 'カテゴリ記事数を再計算しています...'
    statusType.value = 'info'
    categoryResults.value = null

    console.log('🔄 Starting category recalculation...')
    const counts = await recalculateCategoryCounts()

    categoryResults.value = counts
    statusMessage.value = 'カテゴリ記事数の再計算が完了しました！'
    statusType.value = 'success'

    console.log('✅ Category recalculation completed:', counts)
  } catch (error) {
    console.error('❌ Category recalculation failed:', error)
    statusMessage.value = `エラーが発生しました: ${error.message || 'Unknown error'}`
    statusType.value = 'error'
  } finally {
    isProcessing.value = false
  }
}

// Handle tag recalculation
const handleRecalculateTags = async () => {
  try {
    isProcessing.value = true
    statusMessage.value = 'タグ記事数を再計算しています...'
    statusType.value = 'info'
    tagResults.value = null

    console.log('🔄 Starting tag recalculation...')
    const counts = await recalculateTagCounts()

    tagResults.value = counts
    statusMessage.value = 'タグ記事数の再計算が完了しました！'
    statusType.value = 'success'

    console.log('✅ Tag recalculation completed:', counts)
  } catch (error) {
    console.error('❌ Tag recalculation failed:', error)
    statusMessage.value = `エラーが発生しました: ${error.message || 'Unknown error'}`
    statusType.value = 'error'
  } finally {
    isProcessing.value = false
  }
}
</script>
