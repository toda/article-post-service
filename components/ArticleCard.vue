<template>
  <article class="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group">
    <NuxtLink :to="`/articles/${article.id}`" class="block p-6">
      <!-- Article Meta -->
      <div class="flex items-center space-x-2 mb-3">
        <span
          v-if="article.categoryId"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
          :style="{ backgroundColor: getCategoryColor(article.categoryId) }"
        >
          {{ getCategoryName(article.categoryId) }}
        </span>
        <span class="text-xs text-gray-500">
          {{ formatDate(article.publishedAt || article.createdAt) }}
        </span>
      </div>

      <!-- Article Title -->
      <h3 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2" data-testid="article-title">
        {{ article.title }}
      </h3>

      <!-- Article Excerpt -->
      <p class="text-gray-600 text-sm mb-4 line-clamp-3" data-testid="article-excerpt">
        {{ article.excerpt }}
      </p>

      <!-- Tags -->
      <div v-if="article.tags && article.tags.length > 0" class="flex flex-wrap gap-1 mb-4" data-testid="article-tags">
        <span
          v-for="tag in article.tags.slice(0, 3)"
          :key="tag"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
          data-testid="article-tag"
        >
          #{{ tag }}
        </span>
        <span
          v-if="article.tags.length > 3"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500"
        >
          +{{ article.tags.length - 3 }}
        </span>
      </div>

      <!-- Author and Stats -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2" data-testid="article-author">
          <img
            v-if="article.author?.avatarUrl"
            :src="article.author.avatarUrl"
            :alt="article.author.displayName"
            class="w-6 h-6 rounded-full object-cover"
          >
          <div
            v-else
            class="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center"
          >
            <span class="text-gray-600 text-xs font-medium">
              {{ article.author?.displayName?.charAt(0).toUpperCase() }}
            </span>
          </div>
          <span class="text-sm text-gray-700 font-medium">
            {{ article.author?.displayName || 'Anonymous' }}
          </span>
        </div>

        <div class="flex items-center space-x-4 text-xs text-gray-500" data-testid="article-stats">
          <!-- Likes -->
          <div class="flex items-center space-x-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{{ formatNumber(article.likeCount || 0) }}</span>
          </div>

          <!-- Views -->
          <div class="flex items-center space-x-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{{ formatNumber(article.viewCount || 0) }}</span>
          </div>

          <!-- Comments -->
          <div class="flex items-center space-x-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{{ formatNumber(article.commentCount || 0) }}</span>
          </div>

          <!-- Reading Time -->
          <div v-if="article.readingTime" class="flex items-center space-x-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ article.readingTime }}分</span>
          </div>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  article: {
    type: Object,
    required: true
  }
})

// Category mapping
const CATEGORIES = {
  'frontend': { name: 'フロントエンド', color: '#3B82F6' },
  'backend': { name: 'バックエンド', color: '#10B981' },
  'mobile': { name: 'モバイル', color: '#8B5CF6' },
  'devops': { name: 'DevOps', color: '#F59E0B' },
  'ai-ml': { name: 'AI・機械学習', color: '#EF4444' },
  'security': { name: 'セキュリティ', color: '#6B7280' },
  'other': { name: 'その他', color: '#94A3B8' }
}

// Methods
const getCategoryName = (categoryId) => {
  return CATEGORIES[categoryId]?.name || 'その他'
}

const getCategoryColor = (categoryId) => {
  return CATEGORIES[categoryId]?.color || '#94A3B8'
}

const formatDate = (date) => {
  if (!date) return ''

  const now = new Date()
  const articleDate = date instanceof Date ? date : new Date(date)
  const diff = now - articleDate

  // Less than 1 minute
  if (diff < 60000) {
    return 'たった今'
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分前`
  }

  // Less than 1 day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}時間前`
  }

  // Less than 1 week
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000)
    return `${days}日前`
  }

  // Older than 1 week
  return articleDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatNumber = (num) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>