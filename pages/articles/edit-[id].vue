<template>
  <div class="max-w-6xl mx-auto">
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">記事を編集</h1>
          <p class="text-gray-600">記事の内容を編集して更新しましょう。</p>
        </div>
        <NuxtLink
          :to="`/articles/${articleId}`"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          ← 記事に戻る
        </NuxtLink>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="!isLoggedIn && authLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Authentication Required -->
    <div v-else-if="!isLoggedIn" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">ログインが必要です</h3>
      <p class="text-gray-500 mb-6">記事を編集するにはログインが必要です。</p>
      <div class="space-x-4">
        <NuxtLink
          to="/login"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          ログイン
        </NuxtLink>
      </div>
    </div>

    <!-- Article Loading -->
    <div v-else-if="articlesLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Article Not Found -->
    <div v-else-if="!article" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">記事が見つかりません</h3>
      <p class="text-gray-500 mb-6">指定された記事が存在しないか、アクセス権限がありません。</p>
      <NuxtLink
        to="/"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        ホームに戻る
      </NuxtLink>
    </div>

    <!-- Article Editor -->
    <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <!-- General Error Message -->
      <div v-if="errors.general" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 mx-6 mt-6">
        <div class="flex">
          <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <span>{{ errors.general }}</span>
        </div>
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- Article Header -->
        <div class="p-6 border-b border-gray-200">
          <!-- Title -->
          <div class="mb-6">
            <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
              タイトル <span class="text-red-500">*</span>
            </label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              placeholder="記事のタイトルを入力してください"
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-300': errors.title }"
              data-testid="title-input"
              required
            >
            <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
          </div>

          <!-- Category and Tags Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Category -->
            <div>
              <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ <span class="text-red-500">*</span>
              </label>
              <select
                id="category"
                v-model="form.categoryId"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-300': errors.categoryId }"
                :disabled="loading || categories.length === 0"
                data-testid="category-select"
                required
              >
                <option value="" v-if="loading">読み込み中...</option>
                <option value="" v-else-if="categories.length === 0">カテゴリの読み込みに失敗しました</option>
                <option value="" v-else>カテゴリを選択してください</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
              <p v-if="errors.categoryId" class="mt-1 text-sm text-red-600">{{ errors.categoryId }}</p>
            </div>

            <!-- Tags -->
            <div>
              <label for="tags" class="block text-sm font-medium text-gray-700 mb-2">
                タグ（最大5個）
              </label>
              <input
                id="tags"
                v-model="tagsInput"
                type="text"
                placeholder="タグを入力（カンマ区切り）"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-300': errors.tags }"
                data-testid="tags-input"
              >
              <p v-if="errors.tags" class="mt-1 text-sm text-red-600">{{ errors.tags }}</p>
              <div v-if="form.tags.length > 0" class="flex flex-wrap gap-2 mt-2">
                <span
                  v-for="(tag, index) in form.tags"
                  :key="tag"
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  #{{ tag }}
                  <button
                    type="button"
                    @click="removeTag(index)"
                    class="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              </div>
            </div>
          </div>

        </div>

        <!-- Article Content -->
        <div class="grid grid-cols-1 lg:grid-cols-2">
          <!-- Editor -->
          <div class="p-6 border-b lg:border-b-0 lg:border-r border-gray-200">
            <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
              本文 <span class="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              ref="editorRef"
              v-model="form.content"
              placeholder="記事の内容をマークダウン形式で入力してください..."
              class="w-full h-96 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm"
              :class="{ 'border-red-300': errors.content }"
              data-testid="content-textarea"
              required
            ></textarea>
            <p v-if="errors.content" class="mt-1 text-sm text-red-600">{{ errors.content }}</p>
          </div>
          <!-- Preview -->
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">プレビュー</h3>
            <div class="prose prose-sm max-w-none">
              <div v-if="form.content" v-html="renderedContent"></div>
              <p v-else class="text-gray-500 italic">記事の内容を入力するとプレビューが表示されます</p>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <!-- Author Info -->
            <div v-if="article.author" class="flex items-center space-x-3">
              <img
                v-if="article.author?.avatarUrl"
                :src="article.author.avatarUrl"
                :alt="article.author.displayName"
                class="w-8 h-8 rounded-full object-cover"
              >
              <div
                v-else
                class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center"
              >
                <span class="text-gray-600 text-sm font-medium">
                  {{ article.author?.displayName?.charAt(0).toUpperCase() }}
                </span>
              </div>
              <span class="text-sm text-gray-700 font-medium">{{ article.author?.displayName || 'Anonymous' }}</span>
              <span class="text-sm text-gray-400">•</span>
            </div>
            <span class="text-sm text-gray-500">最終更新: {{ formatDate(article.updatedAt || article.createdAt) }}</span>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Publish Settings Checkbox -->
            <div class="flex items-center">
              <input
                id="isPublic"
                v-model="form.isPublic"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                data-testid="public-checkbox"
              >
              <label for="isPublic" class="ml-2 block text-sm text-gray-700">
                記事を公開する
              </label>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center space-x-3">
              <button
                type="button"
                @click="confirmDelete"
                :disabled="loading || loadingDraft || loadingDelete"
                class="px-4 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="loadingDelete" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="m100 50c0 28-17 41-36 41-36 0-36-36-36s0-36 36-36c19 0 28 13 35 22"></path>
                  </svg>
                  削除中...
                </span>
                <span v-else>記事を削除</span>
              </button>
              <NuxtLink
                :to="`/articles/${articleId}`"
                class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                キャンセル
              </NuxtLink>
              <button
                type="button"
                @click="saveDraft"
                :disabled="loading || loadingDelete"
                class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="loadingDraft" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="m100 50c0 28-17 41-36 41-36 0-36-36-36s0-36 36-36c19 0 28 13 35 22"></path>
                  </svg>
                  下書き保存中...
                </span>
                <span v-else>下書き保存</span>
              </button>
              <button
                type="submit"
                :disabled="loading || loadingDraft || loadingDelete"
                class="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="loading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="m100 50c0 28-17 41-36 41-36 0-36-36-36s0-36 36-36c19 0 28 13 35 22"></path>
                  </svg>
                  更新中...
                </span>
                <span v-else>{{ form.isPublic ? '記事を更新' : '下書きを更新' }}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 class="text-lg leading-6 font-medium text-gray-900 mt-4">記事を削除</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              本当にこの記事を削除しますか？この操作は取り消すことができません。
            </p>
            <p class="text-sm font-medium text-gray-900 mt-2">
              「{{ article?.title }}」
            </p>
          </div>
          <div class="flex items-center justify-center space-x-4 px-4 py-3">
            <button
              @click="cancelDelete"
              :disabled="loadingDelete"
              class="px-4 py-2 bg-gray-300 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              @click="handleDelete"
              :disabled="loadingDelete"
              class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              <span v-if="loadingDelete" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="m100 50c0 28-17 41-36 41-36 0-36-36-36s0-36 36-36c19 0 28 13 35 22"></path>
                </svg>
                削除中...
              </span>
              <span v-else>削除する</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// Composables
const { isLoggedIn, currentUser, authLoading } = useAuth()
const { getArticle, updateArticle, listCategories, deleteArticle, articlesLoading } = useArticles()
const { renderMarkdown } = useMarkdown()

// Route and Navigation
const route = useRoute()
const router = useRouter()
const articleId = route.params.id

// State
const article = ref(null)
const categories = ref([])
const loading = ref(false)
const loadingDraft = ref(false)
const loadingDelete = ref(false)
const tagsInput = ref('')
const showDeleteConfirm = ref(false)

// Form State
const form = ref({
  title: '',
  content: '',
  categoryId: '',
  tags: [],
  isPublic: false
})

// Error State
const errors = ref({
  general: '',
  title: '',
  content: '',
  categoryId: '',
  tags: ''
})

// Computed
const renderedContent = computed(() => {
  return form.value.content ? renderMarkdown(form.value.content) : ''
})

// Methods
const clearErrors = () => {
  errors.value = {
    general: '',
    title: '',
    content: '',
    categoryId: '',
    tags: ''
  }
}

const validateForm = () => {
  clearErrors()
  let isValid = true

  // Title validation
  if (!form.value.title.trim()) {
    errors.value.title = 'タイトルは必須です'
    isValid = false
  } else if (form.value.title.length > 100) {
    errors.value.title = 'タイトルは100文字以内で入力してください'
    isValid = false
  }

  // Content validation
  if (!form.value.content.trim()) {
    errors.value.content = '本文は必須です'
    isValid = false
  }

  // Category validation
  if (!form.value.categoryId) {
    errors.value.categoryId = 'カテゴリは必須です'
    isValid = false
  }

  // Tags validation
  if (form.value.tags.length > 5) {
    errors.value.tags = 'タグは5個まで設定できます'
    isValid = false
  }

  return isValid
}

const processTags = (tagsString) => {
  if (!tagsString.trim()) return []
  return tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .slice(0, 5) // 最大5個まで
}

const removeTag = (index) => {
  form.value.tags.splice(index, 1)
  tagsInput.value = form.value.tags.join(', ')
}

// Watch tags input
watch(tagsInput, (newValue) => {
  form.value.tags = processTags(newValue)
})

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    loading.value = true
    clearErrors()

    const updateRequest = {
      title: form.value.title.trim(),
      content: form.value.content.trim(),
      categoryId: form.value.categoryId,
      tags: form.value.tags,
      isPublic: form.value.isPublic
    }

    await updateArticle(articleId, updateRequest)

    // Success - redirect to article
    await router.push(`/articles/${articleId}`)
  } catch (error) {
    console.error('記事更新エラー:', error)
    errors.value.general = error.message || '記事の更新に失敗しました'
  } finally {
    loading.value = false
  }
}

const saveDraft = async () => {
  if (!form.value.title.trim()) {
    errors.value.title = 'タイトルは必須です'
    return
  }

  try {
    loadingDraft.value = true
    clearErrors()

    const updateRequest = {
      title: form.value.title.trim(),
      content: form.value.content.trim(),
      categoryId: form.value.categoryId,
      tags: form.value.tags,
      isPublic: false // 下書きとして保存
    }

    await updateArticle(articleId, updateRequest)

    // Success - show success message but stay on the page
    errors.value.general = ''
    // You could show a success toast notification here
    console.log('下書きが保存されました')

    // Update the article data with the saved draft
    await loadArticle()
  } catch (error) {
    console.error('下書き保存エラー:', error)
    errors.value.general = error.message || '下書きの保存に失敗しました'
  } finally {
    loadingDraft.value = false
  }
}

const handleDelete = async () => {
  try {
    loadingDelete.value = true
    clearErrors()

    await deleteArticle(articleId)

    // Success - redirect to home
    await router.push('/')
  } catch (error) {
    console.error('記事削除エラー:', error)
    errors.value.general = error.message || '記事の削除に失敗しました'
  } finally {
    loadingDelete.value = false
    showDeleteConfirm.value = false
  }
}

const confirmDelete = () => {
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
}

// Format date helper
const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('ja-JP')
}

// Data Loading
const loadArticle = async () => {
  try {
    const articleData = await getArticle(articleId)
    if (articleData) {
      article.value = articleData

      // Initialize form with article data
      form.value = {
        title: articleData.title || '',
        content: articleData.content || '',
        categoryId: articleData.categoryId || '',
        tags: articleData.tags || [],
        isPublic: articleData.isPublic !== false // デフォルトで公開状態
      }

      // Initialize tags input
      tagsInput.value = (articleData.tags || []).join(', ')
    }
  } catch (error) {
    console.error('記事取得エラー:', error)
    errors.value.general = '記事の取得に失敗しました'
  }
}

const loadCategories = async () => {
  try {
    const categoryList = await listCategories()
    categories.value = categoryList
  } catch (error) {
    console.error('カテゴリ取得エラー:', error)
  }
}

// Lifecycle
onMounted(async () => {
  if (isLoggedIn.value) {
    await Promise.all([
      loadArticle(),
      loadCategories()
    ])
  }
})

// Watch for auth changes
watch(isLoggedIn, async (newValue) => {
  if (newValue) {
    await Promise.all([
      loadArticle(),
      loadCategories()
    ])
  }
})

// SEO
useHead({
  title: computed(() => article.value ? `${article.value.title}を編集 - Article Platform` : '記事編集 - Article Platform')
})
</script>

<style scoped>
.prose {
  @apply text-gray-900;
}
.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  @apply text-gray-900 font-semibold;
}
.prose code {
  @apply bg-gray-100 px-1 py-0.5 rounded text-sm;
}
.prose pre {
  @apply bg-gray-100 p-4 rounded-lg overflow-x-auto;
}
.prose blockquote {
  @apply border-l-4 border-gray-300 pl-4 italic;
}
</style>