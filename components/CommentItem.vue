<template>
  <div class="comment-item" :class="{ 'reply-comment': isReply }">
    <!-- Comment Header -->
    <div class="flex items-start space-x-3">
      <!-- User Avatar -->
      <div class="flex-shrink-0">
        <img
          v-if="(comment.author?.avatarUrl || comment.avatarUrl) && !avatarError"
          :src="getSafeAvatarUrl(comment.author?.avatarUrl || comment.avatarUrl)"
          :alt="getAuthorDisplayName()"
          class="w-8 h-8 rounded-full object-cover border border-gray-200"
          crossorigin="anonymous"
          referrerpolicy="no-referrer"
          @load="handleAvatarLoad"
          @error="handleAvatarError"
        >
        <div
          v-else
          class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border border-blue-200"
        >
          <span class="text-blue-600 text-xs font-medium">
            {{ getAuthorDisplayName()?.charAt(0).toUpperCase() || '?' }}
          </span>
        </div>
      </div>

      <!-- Comment Content -->
      <div class="flex-1 min-w-0">
        <!-- Author and Date -->
        <div class="flex items-center space-x-2 mb-1">
          <span class="text-sm font-medium text-gray-900">
            {{ getAuthorDisplayName() }}
          </span>
          <span class="text-xs text-gray-500">
            {{ formatDate(comment.createdAt) }}
          </span>
          <span v-if="comment.createdAt !== comment.updatedAt" class="text-xs text-gray-400">
            (編集済み)
          </span>
        </div>

        <!-- Comment Text -->
        <div v-if="!isEditing" class="text-gray-700 text-sm leading-relaxed">
          <div v-if="comment.isDeleted" class="italic text-gray-500">
            [削除されました]
          </div>
          <div v-else class="prose prose-sm max-w-none" v-html="renderedContent"></div>
        </div>

        <!-- Edit Form -->
        <div v-else class="mt-2">
          <textarea
            v-model="editText"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            data-testid="edit-textarea"
          ></textarea>
          <div class="flex items-center justify-end space-x-2 mt-2">
            <button
              @click="cancelEdit"
              class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              キャンセル
            </button>
            <button
              @click="saveEdit"
              :disabled="!editText.trim() || editText.trim() === comment.content"
              class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              保存
            </button>
          </div>
        </div>

        <!-- Comment Actions -->
        <div v-if="!comment.isDeleted" class="flex items-center space-x-4 mt-2">
          <!-- Like Button -->
          <button
            @click="toggleLike"
            :disabled="!isLoggedIn"
            class="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-600 transition-colors disabled:cursor-not-allowed"
            :class="{ 'text-blue-600': isLiked }"
            data-testid="like-button"
          >
            <svg class="w-4 h-4" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{{ comment.likeCount || 0 }}</span>
          </button>

          <!-- Reply Button -->
          <button
            v-if="canReply && !isReply"
            @click="$emit('reply')"
            :disabled="!isLoggedIn"
            class="text-xs text-gray-500 hover:text-blue-600 transition-colors disabled:cursor-not-allowed"
            data-testid="reply-button"
          >
            返信
          </button>

          <!-- Edit Button (for comment author) -->
          <button
            v-if="canEdit && !isEditing"
            @click="startEdit"
            class="text-xs text-gray-500 hover:text-blue-600 transition-colors"
            data-testid="edit-button"
          >
            編集
          </button>

          <!-- Delete Button (for comment author) -->
          <button
            v-if="canDelete"
            @click="deleteComment"
            class="text-xs text-gray-500 hover:text-red-600 transition-colors"
            data-testid="delete-button"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useComments } from '~/composables/useComments'
import { useMarkdown } from '~/composables/useMarkdown'
import { formatDate } from '~/utils/dateFormatter'

// Props
const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  articleId: {
    type: String,
    required: true
  },
  isReply: {
    type: Boolean,
    default: false
  },
  canReply: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['reply', 'updated', 'deleted'])

// Composables
const { user, isLoggedIn } = useAuth()
const { updateComment, deleteComment: deleteCommentApi, likeComment, unlikeComment } = useComments()
const { renderMarkdown } = useMarkdown()

// State
const isEditing = ref(false)
const editText = ref('')
const isLiked = ref(false) // This would come from the comment data
const avatarError = ref(false)
const useProxy = ref(false)
const isDev = process.dev


// Computed
const canEdit = computed(() => {
  return isLoggedIn.value && user.value && user.value.uid === props.comment.authorId
})

const canDelete = computed(() => {
  return isLoggedIn.value && user.value && user.value.uid === props.comment.authorId
})

const renderedContent = computed(() => {
  return renderMarkdown(props.comment.content)
})

// Methods

// Get author display name with comprehensive fallback
const getAuthorDisplayName = () => {
  console.log('🔍 Getting author display name for comment:', {
    commentId: props.comment.id,
    author: props.comment.author,
    authorName: props.comment.authorName,
    authorId: props.comment.authorId,
    avatarUrl: props.comment.author?.avatarUrl
  })

  // Try author object first (from Firestore user lookup)
  if (props.comment.author?.displayName) {
    console.log('✅ Using author.displayName:', props.comment.author.displayName)
    return props.comment.author.displayName
  }

  // Try stored authorName in comment (redundant data)
  if (props.comment.authorName) {
    console.log('✅ Using comment.authorName:', props.comment.authorName)
    return props.comment.authorName
  }

  // Try author object displayName even if empty
  if (props.comment.author?.displayName === '') {
    console.log('⚠️ Author displayName is empty string')
  }

  // Fallback to authorId if available
  if (props.comment.authorId) {
    console.log('🔄 Fallback to authorId:', props.comment.authorId)
    return `User ${props.comment.authorId.substring(0, 8)}...`
  }

  console.log('❌ No author info found, using Anonymous')
  return 'Anonymous'
}

const startEdit = () => {
  isEditing.value = true
  editText.value = props.comment.content
}

const cancelEdit = () => {
  isEditing.value = false
  editText.value = ''
}

const saveEdit = async () => {
  if (!editText.value.trim()) return

  try {
    const updatedComment = await updateComment(props.comment.id, {
      content: editText.value.trim()
    })

    isEditing.value = false
    emit('updated', updatedComment)

  } catch (error) {
    console.error('Failed to update comment:', error)
  }
}

const deleteComment = async () => {
  if (!confirm('このコメントを削除しますか？')) return

  try {
    await deleteCommentApi(props.comment.id)
    emit('deleted', props.comment.id)

  } catch (error) {
    console.error('Failed to delete comment:', error)
  }
}

const toggleLike = async () => {
  if (!isLoggedIn.value) return

  try {
    if (isLiked.value) {
      await unlikeComment(props.comment.id)
      isLiked.value = false
    } else {
      await likeComment(props.comment.id)
      isLiked.value = true
    }
  } catch (error) {
    console.error('Failed to toggle like:', error)
  }
}

// Avatar handling functions
const getSafeAvatarUrl = (url) => {
  if (!url) return null

  console.log('🖼️ Processing avatar URL:', url)

  // For Google profile images, use a more reliable format
  if (url.includes('googleusercontent.com')) {
    // Extract base URL and ensure proper sizing
    const baseUrl = url.split('=')[0]
    const directUrl = `${baseUrl}=s96-c`
    console.log('🔄 Google avatar URL transformed:', directUrl)

    // Use proxy if requested or if direct access failed
    if (useProxy.value) {
      console.log('🔄 Using proxy for avatar:', directUrl)
      return `/api/proxy-image?url=${encodeURIComponent(directUrl)}`
    }

    return directUrl
  }

  // For other URLs, use proxy if requested
  if (useProxy.value) {
    console.log('🔄 Using proxy for external avatar:', url)
    return `/api/proxy-image?url=${encodeURIComponent(url)}`
  }

  return url
}

const handleAvatarLoad = () => {
  console.log('✅ Avatar loaded successfully:', props.comment.author?.avatarUrl)
  avatarError.value = false
}

const handleAvatarError = (event) => {
  console.log('❌ Avatar load failed:', props.comment.author?.avatarUrl)
  console.log('Error details:', event)

  // If this is the first error and not already using proxy, try proxy
  if (!useProxy.value && props.comment.author?.avatarUrl?.includes('googleusercontent.com')) {
    console.log('🔄 Trying proxy image...')
    useProxy.value = true
    avatarError.value = false // Reset error state to try again
  } else {
    // Final failure - show fallback
    avatarError.value = true
  }
}
</script>