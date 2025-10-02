<template>
  <div class="max-w-6xl mx-auto">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">記事を書く</h1>
      <p class="text-gray-600">あなたの知識を記事にして、コミュニティと共有しましょう。</p>
    </div>

    <!-- Loading State -->
    <div v-if="!isLoggedIn && authLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Email Verification Required -->
    <div v-else-if="isLoggedIn && user && !user.emailVerified" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-yellow-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">メール認証が必要です</h3>
      <p class="text-gray-500 mb-6">記事を投稿するには、メールアドレスの認証が必要です。<br>登録時に送信されたメールの認証リンクをクリックしてください。</p>
      <div class="space-x-4">
        <NuxtLink
          to="/login"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
        >
          ログインページへ
        </NuxtLink>
      </div>
    </div>

    <!-- Authentication Required -->
    <div v-else-if="!isLoggedIn" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">ログインが必要です</h3>
      <p class="text-gray-500 mb-6">記事を投稿するにはログインが必要です。</p>
      <div class="space-x-4">
        <NuxtLink
          to="/login"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          ログイン
        </NuxtLink>
        <NuxtLink
          to="/signup"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          新規登録
        </NuxtLink>
      </div>
    </div>

    <!-- Article Editor -->
    <div v-else-if="isLoggedIn && user && user.emailVerified" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                v-model="tagInput"
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

          <!-- Meta Description -->
          <div class="mb-6">
            <label for="metaDescription" class="block text-sm font-medium text-gray-700 mb-2">
              説明文（SEO用）
            </label>
            <textarea
              id="metaDescription"
              v-model="form.metaDescription"
              rows="2"
              placeholder="記事の概要を150文字以内で入力してください"
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              maxlength="150"
            ></textarea>
            <p class="mt-1 text-sm text-gray-500 text-right">
              {{ form.metaDescription.length }}/150文字
            </p>
          </div>
        </div>

        <!-- Editor Area -->
        <div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
          <!-- Markdown Editor -->
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">マークダウン</h3>
              <div class="flex items-center space-x-2">
                <button
                  @click="insertMarkdown('**', '**')"
                  type="button"
                  class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="太字"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4h8a4 4 0 010 8H6z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h9a4 4 0 010 8H6z" />
                  </svg>
                </button>
                <button
                  @click="insertMarkdown('*', '*')"
                  type="button"
                  class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="斜体"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 4l4 16m-4-8h8" />
                  </svg>
                </button>
                <button
                  @click="insertMarkdown('`', '`')"
                  type="button"
                  class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="インラインコード"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </button>
                <button
                  @click="insertMarkdown('```\n', '\n```')"
                  type="button"
                  class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="コードブロック"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  @click="triggerImageUpload"
                  type="button"
                  class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="画像をアップロード"
                  :disabled="imageUploading"
                >
                  <svg v-if="!imageUploading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <input
                  ref="imageInputRef"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  @change="handleImageUpload"
                  class="hidden"
                />
              </div>
              <!-- Image Upload Message -->
              <div
                v-if="imageUploadMessage"
                :class="[
                  'mt-2 p-2 rounded text-sm',
                  imageUploadType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                ]"
              >
                {{ imageUploadMessage }}
              </div>
            </div>
            <textarea
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
            <div class="prose prose-sm max-w-none h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50" data-testid="preview-area">
              <div v-if="form.content" v-html="renderedContent"></div>
              <p v-else class="text-gray-500 italic">ここにプレビューが表示されます</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="p-6 border-t border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <!-- Publication Status -->
            <div class="flex items-center space-x-4">
              <label class="flex items-center">
                <input
                  v-model="form.isPublic"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  data-testid="public-checkbox"
                >
                <span class="ml-2 text-sm text-gray-700">記事を公開する</span>
              </label>
              <span v-if="!form.isPublic" class="text-sm text-gray-500">
                非公開として保存されます
              </span>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center space-x-3">
              <!-- Auto-save Status -->
              <span v-if="autoSaveStatus" class="text-sm text-gray-500">
                {{ autoSaveStatus }}
              </span>

              <!-- Save Draft -->
              <button
                @click="saveDraft"
                type="button"
                :disabled="loading"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                data-testid="save-draft"
              >
                下書き保存
              </button>

              <!-- Publish -->
              <button
                type="submit"
                :disabled="loading || !canPublish"
                class="px-6 py-2 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                data-testid="publish-button"
              >
                <span v-if="loading">保存中...</span>
                <span v-else-if="form.isPublic">記事を公開</span>
                <span v-else>下書きを保存</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useArticles } from '~/composables/useArticles'
import { useMarkdown } from '~/composables/useMarkdown'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

// SEO
useHead({
  title: '記事を書く - Article Platform',
  meta: [
    {
      name: 'description',
      content: '技術記事を投稿して、知識をコミュニティと共有しましょう。'
    }
  ]
})

// Composables
const { user, isLoggedIn, loading: authLoading } = useAuth()
const { createArticle, listCategories, loading } = useArticles()
const { renderMarkdown } = useMarkdown()

// Refs
const editorRef = ref(null)
const imageInputRef = ref(null)

// State
const form = ref({
  title: '',
  content: '',
  categoryId: '',
  tags: [],
  metaDescription: '',
  isPublic: true
})

const tagInput = ref('')
const categories = ref([])
const errors = ref({})
const autoSaveStatus = ref('')
const imageUploading = ref(false)
const imageUploadMessage = ref(null)
const imageUploadType = ref('success')

// Computed
const canPublish = computed(() => {
  return form.value.title.trim() &&
         form.value.content.trim() &&
         form.value.categoryId &&
         form.value.tags.length <= 5
})

const renderedContent = computed(() => {
  return renderMarkdown(form.value.content)
})

// Methods
const validateForm = () => {
  errors.value = {}

  if (!form.value.title.trim()) {
    errors.value.title = 'タイトルは必須です'
  }

  if (!form.value.content.trim()) {
    errors.value.content = '記事の内容は必須です'
  }

  if (!form.value.categoryId) {
    errors.value.categoryId = 'カテゴリは必須です'
  }

  if (form.value.tags.length > 5) {
    errors.value.tags = 'タグは最大5個までです'
  }

  return Object.keys(errors.value).length === 0
}

const processTags = (tagsString) => {
  if (!tagsString.trim()) return []
  return tagsString
    .split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0)
    .slice(0, 5) // 最大5個まで
}

const removeTag = (index) => {
  form.value.tags.splice(index, 1)
  tagInput.value = form.value.tags.join(', ')
}

const insertMarkdown = (before, after) => {
  const textarea = editorRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = textarea.value
  const selectedText = text.substring(start, end)

  const newText = text.substring(0, start) + before + selectedText + after + text.substring(end)
  form.value.content = newText

  // Focus and set cursor position
  nextTick(() => {
    textarea.focus()
    const newCursorPos = start + before.length + selectedText.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
  })
}

const triggerImageUpload = () => {
  imageInputRef.value?.click()
}

const handleImageUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Reset input
  event.target.value = ''

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    imageUploadMessage.value = '画像ファイルはJPEG、PNG、GIF、WebPのみアップロード可能です。'
    imageUploadType.value = 'error'
    setTimeout(() => { imageUploadMessage.value = null }, 5000)
    return
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    imageUploadMessage.value = '画像ファイルは5MB以下にしてください。'
    imageUploadType.value = 'error'
    setTimeout(() => { imageUploadMessage.value = null }, 5000)
    return
  }

  try {
    imageUploading.value = true
    imageUploadMessage.value = null

    // Upload to Firebase Storage
    const storage = getStorage()
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name}`
    const storagePath = `article-images/${user.value.uid}/${fileName}`
    const fileRef = storageRef(storage, storagePath)

    await uploadBytes(fileRef, file)
    const downloadURL = await getDownloadURL(fileRef)

    console.log('📸 画像アップロード成功:', {
      fileName: file.name,
      downloadURL,
      storagePath
    })

    // Insert image markdown into editor
    const textarea = editorRef.value
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = textarea.value

      const imageMarkdown = `![${file.name}](${downloadURL})`
      console.log('📝 挿入するマークダウン:', imageMarkdown)

      const newText = text.substring(0, start) + imageMarkdown + text.substring(end)
      form.value.content = newText

      // Focus and set cursor position after the inserted image
      nextTick(() => {
        textarea.focus()
        const newCursorPos = start + imageMarkdown.length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      })
    }

    imageUploadMessage.value = '画像をアップロードしました。'
    imageUploadType.value = 'success'
    setTimeout(() => { imageUploadMessage.value = null }, 5000)
  } catch (error) {
    console.error('画像のアップロードに失敗しました:', error)
    imageUploadMessage.value = '画像のアップロードに失敗しました。'
    imageUploadType.value = 'error'
    setTimeout(() => { imageUploadMessage.value = null }, 5000)
  } finally {
    imageUploading.value = false
  }
}

const saveDraft = async () => {
  try {
    form.value.isPublic = false
    await handleSubmit()
  } catch (error) {
    console.error('Failed to save draft:', error)
  }
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    const articleData = {
      title: form.value.title.trim(),
      content: form.value.content.trim(),
      categoryId: form.value.categoryId,
      tags: form.value.tags,
      metaDescription: form.value.metaDescription.trim(),
      isPublic: form.value.isPublic
    }

    const article = await createArticle(articleData)

    // Clear draft on successful publication
    if (form.value.isPublic) {
      clearDraft()
      console.log('✅ Article published, draft cleared')
    }

    // Redirect to the created article
    await navigateTo(`/articles/${article.id}`)
  } catch (error) {
    console.error('Failed to create article:', error)
    // Handle specific error cases
    if (error.code === 'article/title-required') {
      errors.value.title = 'タイトルは必須です'
    } else if (error.code === 'article/content-required') {
      errors.value.content = '記事の内容は必須です'
    } else if (error.code === 'article/category-invalid') {
      errors.value.categoryId = '無効なカテゴリです'
    }
  }
}

// Auto-save functionality
let autoSaveTimeout = null

const autoSave = () => {
  if (!canPublish.value) return

  clearTimeout(autoSaveTimeout)
  autoSaveTimeout = setTimeout(async () => {
    try {
      autoSaveStatus.value = '自動保存中...'
      // In a real implementation, this would save to localStorage or server
      localStorage.setItem('article-draft', JSON.stringify(form.value))
      autoSaveStatus.value = '自動保存完了'
      setTimeout(() => {
        autoSaveStatus.value = ''
      }, 2000)
    } catch (error) {
      autoSaveStatus.value = '自動保存失敗'
      setTimeout(() => {
        autoSaveStatus.value = ''
      }, 2000)
    }
  }, 2000)
}

// Load draft from localStorage
const loadDraft = () => {
  try {
    const draft = localStorage.getItem('article-draft')
    if (draft) {
      const parsedDraft = JSON.parse(draft)
      form.value = { ...form.value, ...parsedDraft }
    }
  } catch (error) {
    console.error('Failed to load draft:', error)
  }
}

// Watch tags input
watch(tagInput, (newValue) => {
  form.value.tags = processTags(newValue)
})

// Watch for changes and trigger auto-save
watch(
  () => [form.value.title, form.value.content, form.value.categoryId, form.value.tags],
  () => {
    autoSave()
  },
  { deep: true }
)

// Prevent accidental navigation
const beforeUnloadHandler = (event) => {
  if (form.value.title || form.value.content) {
    event.preventDefault()
    event.returnValue = ''
  }
}

// Clear form data
const clearForm = () => {
  form.value = {
    title: '',
    content: '',
    categoryId: '',
    tags: [],
    metaDescription: '',
    isPublic: true
  }
  errors.value = {}
  autoSaveStatus.value = ''
  console.log('📝 Form cleared')
}

// Clear draft from localStorage
const clearDraft = () => {
  try {
    localStorage.removeItem('article-draft')
    console.log('📝 Draft cleared from localStorage')
  } catch (error) {
    console.error('Failed to clear draft:', error)
  }
}

// Lifecycle
onMounted(async () => {
  try {
    console.log('🔄 Initializing write page...')

    // Always clear form first to ensure clean state
    clearForm()
    clearDraft() // Also clear any stored drafts to prevent old data

    // Load categories
    try {
      const loadedCategories = await listCategories()
      categories.value = loadedCategories
      console.log('✅ Categories loaded:', loadedCategories.length)

      if (!loadedCategories || loadedCategories.length === 0) {
        throw new Error('No categories returned from listCategories')
      }
    } catch (loadError) {
      console.error('❌ Failed to load categories:', loadError)
      throw new Error(`Category loading failed: ${loadError.message}`)
    }

    // Only load draft if query parameter explicitly requests it
    const route = useRoute()
    const loadDraftFlag = route?.query?.draft === 'true'

    if (loadDraftFlag) {
      loadDraft()
      console.log('📝 Draft loaded from localStorage (explicitly requested)')
    } else {
      console.log('📝 Starting with fresh form (no draft loading)')
    }

    // Add beforeunload listener
    window.addEventListener('beforeunload', beforeUnloadHandler)
  } catch (error) {
    console.error('❌ Failed to initialize editor:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      fullError: error
    })
    // Show user-friendly error with technical details for debugging
    errors.value.general = `エディタの初期化に失敗しました: ${error.message || error.code || '不明なエラー'}`
  }
})

onBeforeUnmount(() => {
  clearTimeout(autoSaveTimeout)
  window.removeEventListener('beforeunload', beforeUnloadHandler)
})
</script>

<style scoped>
.prose h1 {
  @apply text-2xl font-bold text-gray-900 mt-6 mb-4;
}

.prose h2 {
  @apply text-xl font-bold text-gray-900 mt-5 mb-3;
}

.prose h3 {
  @apply text-lg font-bold text-gray-900 mt-4 mb-2;
}

.prose p {
  @apply text-gray-700 mb-3 leading-relaxed;
}

.prose code {
  @apply bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm;
}

.prose pre {
  @apply bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto mb-3;
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