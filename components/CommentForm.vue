<template>
  <div class="comment-form">
    <!-- Comment Input -->
    <div class="flex space-x-3">
      <!-- User Avatar -->
      <div class="flex-shrink-0">
        <img
          v-if="user?.avatarUrl"
          :src="user.avatarUrl"
          :alt="user.displayName"
          class="w-10 h-10 rounded-full object-cover"
        >
        <div
          v-else
          class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center"
        >
          <span class="text-gray-600 text-sm font-medium">
            {{ user?.displayName?.charAt(0).toUpperCase() }}
          </span>
        </div>
      </div>

      <!-- Comment Form -->
      <div class="flex-1">
        <form @submit.prevent="handleSubmit" class="space-y-3">
          <!-- Comment Text Area -->
          <div>
            <textarea
              v-model="commentText"
              :disabled="loading"
              placeholder="コメントを入力..."
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="{ 'border-red-300': error }"
              data-testid="comment-textarea"
            ></textarea>
            <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-end">
            <div class="flex items-center space-x-3">
              <button
                v-if="!isReply && commentText.trim()"
                @click="cancelComment"
                type="button"
                class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                :disabled="loading"
              >
                キャンセル
              </button>
              <button
                type="submit"
                :disabled="!commentText.trim() || loading"
                class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                data-testid="submit-comment"
              >
                <span v-if="loading">投稿中...</span>
                <span v-else>{{ isReply ? '返信' : 'コメント' }}</span>
              </button>
            </div>
          </div>
        </form>

        <!-- Preview -->
        <div v-if="commentText.trim() && showPreview" class="mt-3 p-3 bg-gray-50 rounded-lg border">
          <div class="text-sm text-gray-600 mb-2">プレビュー:</div>
          <div class="prose prose-sm max-w-none" v-html="renderedComment"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useComments } from '~/composables/useComments'
import { useMarkdown } from '~/composables/useMarkdown'

// Props
const props = defineProps({
  articleId: {
    type: String,
    required: true
  },
  parentId: {
    type: String,
    default: null
  },
  isReply: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: 'コメントを入力...'
  }
})

// Emits
const emit = defineEmits(['comment-added', 'cancel'])

// Composables
const { user } = useAuth()
const { createComment, loading } = useComments()
const { renderMarkdown } = useMarkdown()

// State
const commentText = ref('')
const error = ref('')
const showPreview = ref(false)

// Computed
const renderedComment = computed(() => {
  return renderMarkdown(commentText.value)
})

// Methods
const validateComment = () => {
  error.value = ''

  if (!commentText.value.trim()) {
    error.value = 'コメントを入力してください'
    return false
  }

  if (commentText.value.length > 2000) {
    error.value = 'コメントは2000文字以内で入力してください'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateComment()) return

  try {
    const commentData = {
      content: commentText.value.trim(),
      articleId: props.articleId,
      parentId: props.parentId
    }

    console.log('📝 Creating comment with data:', commentData)
    const newComment = await createComment(commentData)
    console.log('✅ Comment created successfully:', newComment?.id)

    // Reset form
    commentText.value = ''
    error.value = ''
    showPreview.value = false

    // Emit event
    emit('comment-added', newComment)

  } catch (err) {
    console.error('Failed to create comment:', err)
    console.error('Error details:', {
      code: err.code,
      message: err.message,
      stack: err.stack,
      fullError: err
    })
    error.value = 'コメントの投稿に失敗しました。もう一度お試しください。'
  }
}

const cancelComment = () => {
  commentText.value = ''
  error.value = ''
  showPreview.value = false
  emit('cancel')
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}
</script>