<template>
  <div class="max-w-4xl mx-auto">
    <!-- Loading State -->
    <div v-if="loading" class="animate-pulse">
      <div class="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div class="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
      <div class="space-y-3">
        <div class="h-4 bg-gray-200 rounded"></div>
        <div class="h-4 bg-gray-200 rounded w-5/6"></div>
        <div class="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>

    <!-- Article Content -->
    <article v-else-if="article && canViewArticle" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <!-- Article Header -->
      <header class="p-6 border-b border-gray-200">
        <!-- Category and Date -->
        <div class="flex items-center space-x-3 mb-4">
          <span
            v-if="article.categoryId"
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
            :style="{ backgroundColor: getCategoryColor(article.categoryId) }"
          >
            {{ getCategoryName(article.categoryId) }}
          </span>
          <span class="text-sm text-gray-500" data-testid="publish-date">
            {{ formatDate(article.publishedAt || article.createdAt, 'full') }}
          </span>
          <span v-if="article.readingTime" class="text-sm text-gray-500" data-testid="reading-time">
            {{ article.readingTime }}分で読めます
          </span>
        </div>

        <!-- Title -->
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6" data-testid="article-title">
          {{ article.title }}
        </h1>

        <!-- Author and Actions -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4" data-testid="author-info">
            <NuxtLink :to="`/users/${article.author?.username || article.author?.uid}`" class="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <img
                v-if="article.author?.avatarUrl || article.avatarUrl"
                :src="article.author?.avatarUrl || article.avatarUrl"
                :alt="article.author?.displayName || 'Author'"
                class="w-12 h-12 rounded-full object-cover border border-gray-200"
                @load="handleAvatarLoad"
                @error="handleAvatarError"
              >
              <div
                v-else
                class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center border border-blue-200"
              >
                <span class="text-blue-600 text-lg font-medium">
                  {{ article.author?.displayName?.charAt(0).toUpperCase() || '?' }}
                </span>
              </div>
              <div>
                <p class="font-semibold text-gray-900">{{ article.author?.displayName || 'Anonymous' }}</p>
                <p v-if="article.author?.bio" class="text-sm text-gray-500">{{ article.author.bio }}</p>
              </div>
            </NuxtLink>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center space-x-3">
            <!-- Like Button -->
            <button
              @click="toggleLike"
              :disabled="!isLoggedIn"
              class="flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors"
              :class="[
                article.isLiked
                  ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
                !isLoggedIn && 'opacity-50 cursor-not-allowed'
              ]"
              data-testid="like-button"
            >
              <svg class="w-5 h-5" :fill="article.isLiked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span data-testid="like-count">{{ formatNumber(likeCount) }}</span>
            </button>

            <!-- Edit Button (if owner) -->
            <NuxtLink
              v-if="canEdit"
              :to="`/articles/edit-${article.id}`"
              class="flex items-center space-x-2 px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>編集</span>
            </NuxtLink>


            <!-- Share Button -->
            <button
              @click="shareArticle"
              class="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span>共有</span>
            </button>
          </div>
        </div>

        <!-- Tags -->
        <div v-if="article.tags && article.tags.length > 0" class="flex flex-wrap gap-2 mt-6">
          <NuxtLink
            v-for="tag in article.tags"
            :key="tag"
            :to="`/tags/${tag}`"
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
            data-testid="article-tag"
          >
            #{{ tag }}
          </NuxtLink>
        </div>
      </header>

      <!-- Article Body -->
      <div class="p-6">
        <div class="prose prose-lg max-w-none" data-testid="article-content" v-html="renderedContent">
        </div>
      </div>

      <!-- Article Stats -->
      <footer class="p-6 border-t border-gray-200 bg-gray-50">
        <div class="flex items-center justify-between text-sm text-gray-600">
          <!-- ビュー数とコメント数の表示（非表示中）
          <div class="flex items-center space-x-6" data-testid="view-count">
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{{ formatNumber(article.viewCount || 0) }} ビュー</span>
            </div>
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{{ formatNumber(article.commentCount || 0) }} コメント</span>
            </div>
          </div>
          -->
          <div class="text-gray-500">
            最終更新: {{ formatDate(article.updatedAt, 'full') }}
          </div>
        </div>
      </footer>
    </article>

    <!-- Comments Section -->
    <div v-if="article && canViewArticle" class="mt-8">
      <CommentsSection :article-id="article.id" data-testid="comments-section" />
    </div>

    <!-- Author Profile Link -->
    <div v-if="article && canViewArticle && article.author" class="mt-8">
      <h2 class="text-xl font-bold text-gray-900 mb-4">この記事を書いた人</h2>
      <NuxtLink
        :to="`/users/${article.author?.username || article.author?.uid}`"
        class="block bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200"
      >
        <div class="flex items-center space-x-4">
          <img
            v-if="article.author?.avatarUrl"
            :src="article.author.avatarUrl"
            :alt="article.author?.displayName || 'Author'"
            class="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
          >
          <div
            v-else
            class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-200"
          >
            <span class="text-blue-600 text-2xl font-medium">
              {{ article.author?.displayName?.charAt(0).toUpperCase() || '?' }}
            </span>
          </div>
          <div class="flex-1">
            <p class="text-lg font-semibold text-gray-900 mb-1">{{ article.author?.displayName || 'Anonymous' }}</p>
            <p v-if="article.author?.bio" class="text-sm text-gray-600 line-clamp-2">{{ article.author.bio }}</p>
            <p v-else class="text-sm text-gray-500">この投稿者のプロフィールを見る</p>
          </div>
          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </NuxtLink>
    </div>

    <!-- Related Articles -->
    <div v-if="relatedArticles.length > 0 && canViewArticle" class="mt-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">関連記事</h2>
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ArticleCard
          v-for="relatedArticle in relatedArticles"
          :key="relatedArticle.id"
          :article="relatedArticle"
        />
      </div>
    </div>

    <!-- Private Article Error -->
    <div v-else-if="shouldShowPrivateError" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-yellow-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">非公開記事です</h3>
      <p class="text-gray-500 mb-4">この記事は非公開に設定されています。作成者のみがアクセスできます。</p>
      <div class="space-x-4">
        <NuxtLink
          to="/login"
          v-if="!isLoggedIn"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          ログイン
        </NuxtLink>
        <NuxtLink
          to="/"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          ホームに戻る
        </NuxtLink>
      </div>
    </div>

    <!-- General Not Found Error -->
    <div v-else-if="!loading && !article" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">記事が見つかりません</h3>
      <p class="text-gray-500 mb-4">指定された記事は存在しないか、削除された可能性があります。</p>
      <NuxtLink
        to="/"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        ホームに戻る
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useArticles } from '~/composables/useArticles'
import { useMarkdown } from '~/composables/useMarkdown'
import { formatDate } from '~/utils/dateFormatter'

// Import debug utility in development
if (process.dev) {
  import('~/utils/debugAvatar.js')
}

// Get route and article ID
const route = useRoute()
const articleId = route.params.id

// Composables
const { user, isLoggedIn } = useAuth()
const {
  getArticle,
  likeArticle,
  unlikeArticle,
  incrementViewCount,
  listArticles,
  loading,
  error,
  clearError
} = useArticles()
const { renderMarkdown } = useMarkdown()

// State
const article = ref(null)
const likeCount = ref(0)
const relatedArticles = ref([])
const accessDenied = ref(false)
const accessError = ref(null)

// Computed
const canEdit = computed(() => {
  return isLoggedIn.value && user.value && article.value && user.value.uid === article.value.authorId
})

const canViewArticle = computed(() => {
  if (!article.value) return false

  // 公開記事は誰でも閲覧可能
  if (article.value.isPublic) return true

  // 非公開記事は作成者のみ閲覧可能
  return isLoggedIn.value && user.value && user.value.uid === article.value.authorId
})

const shouldShowPrivateError = computed(() => {
  return article.value && !article.value.isPublic && !canViewArticle.value
})

const renderedContent = computed(() => {
  return renderMarkdown(article.value?.content)
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


const formatNumber = (num) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

const toggleLike = async () => {
  if (!isLoggedIn.value || !article.value) return

  try {
    if (article.value.isLiked) {
      await unlikeArticle(article.value.id)
      likeCount.value = Math.max(0, likeCount.value - 1)
      article.value.isLiked = false
    } else {
      await likeArticle(article.value.id)
      likeCount.value += 1
      article.value.isLiked = true
    }
  } catch (error) {
    console.error('Like toggle failed:', error)
  }
}

// Avatar handling functions
const handleAvatarLoad = () => {
  console.log('✅ Article author avatar loaded successfully:', {
    authorId: article.value?.author?.uid,
    displayName: article.value?.author?.displayName,
    avatarUrl: article.value?.author?.avatarUrl
  })
}

const handleAvatarError = (event) => {
  console.log('❌ Article author avatar load failed:', {
    authorId: article.value?.author?.uid,
    displayName: article.value?.author?.displayName,
    avatarUrl: article.value?.author?.avatarUrl,
    error: event
  })

  // Try proxy if it's a Google avatar
  const avatarUrl = article.value?.author?.avatarUrl
  if (avatarUrl && avatarUrl.includes('googleusercontent.com')) {
    console.log('🔄 Trying proxy for article author avatar...')
    const baseUrl = avatarUrl.split('=')[0]
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(baseUrl + '=s96-c')}`
    event.target.src = proxyUrl
  }
}

const shareArticle = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: article.value.title,
        text: article.value.excerpt,
        url: window.location.href
      })
    } catch (error) {
      console.error('Share failed:', error)
    }
  } else {
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href)
      // TODO: Show toast notification
      console.log('URL copied to clipboard')
    } catch (error) {
      console.error('Copy to clipboard failed:', error)
    }
  }
}


// SEO
watch(article, (newArticle) => {
  if (newArticle) {
    useHead({
      title: `${newArticle.title} - Article Platform`,
      meta: [
        {
          name: 'description',
          content: newArticle.excerpt
        },
        {
          property: 'og:title',
          content: newArticle.title
        },
        {
          property: 'og:description',
          content: newArticle.excerpt
        },
        {
          property: 'og:type',
          content: 'article'
        }
      ]
    })
  }
})


// Server-side data loading with proper error handling
console.log('📖 Starting article data loading for ID:', articleId)

let articleData
try {
  console.log('📖 Calling getArticle function...')
  articleData = await getArticle(articleId)
  console.log('📖 getArticle result:', articleData ? 'Found' : 'Not found')

  if (articleData) {
    // Set the article data
    article.value = articleData
    likeCount.value = articleData.likeCount || 0
  } else {
    // Article not found - don't throw error, just leave article as null
    // The template will show the "記事が見つかりません" message
    console.warn('⚠️ Article not found:', articleId)
  }
} catch (error) {
  console.error('📖 Error in getArticle:', error)
  // Don't throw error, just leave article as null
  // The template will show the "記事が見つかりません" message
}

// Client-side initialization
onMounted(async () => {
  // Only run non-critical operations on client side
  try {
    // Clear any previous errors since article loaded successfully
    clearError()

    // Increment view count (non-critical operation)
    try {
      await incrementViewCount(articleId)
    } catch (viewError) {
      console.warn('⚠️ Failed to increment view count:', viewError)
    }

    // Load related articles (non-critical operation)
    try {
      if (articleData.tags && articleData.tags.length > 0) {
        const related = await listArticles({
          tags: articleData.tags.slice(0, 2),
          limit: 3
        })
        relatedArticles.value = related.articles.filter(a => a.id !== articleId)
      }
    } catch (relatedError) {
      console.warn('⚠️ Failed to load related articles:', relatedError)
    }
  } catch (error) {
    console.error('Client-side initialization failed:', error)
  }
})
</script>

<style scoped>
.prose h1 {
  @apply text-3xl font-bold text-gray-900 mt-8 mb-4;
}

.prose h2 {
  @apply text-2xl font-bold text-gray-900 mt-6 mb-3;
}

.prose h3 {
  @apply text-xl font-bold text-gray-900 mt-4 mb-2;
}

.prose p {
  @apply text-gray-700 mb-4 leading-relaxed;
}

.prose code {
  @apply bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm;
}

.prose pre {
  @apply bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4;
}

.prose pre code {
  @apply bg-transparent text-inherit p-0;
}

.prose strong {
  @apply font-semibold text-gray-900;
}

.prose em {
  @apply italic;
}
</style>