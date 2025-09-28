<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <!-- Comments Header -->
    <div class="p-6 border-b border-gray-200">
      <h2 class="text-xl font-bold text-gray-900 mb-2">
        コメント ({{ commentCount }})
      </h2>


      <!-- Comment Form (if logged in) -->
      <div v-if="isLoggedIn" class="mt-4">
        <CommentForm :article-id="articleId" data-testid="comment-form" />
      </div>

      <!-- Login Prompt (if not logged in) -->
      <div v-else class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200" data-testid="login-to-comment">
        <div class="flex items-center space-x-3">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span class="text-blue-900 font-medium">コメントを投稿するにはログインが必要です</span>
          <NuxtLink
            to="/login"
            class="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            data-testid="login-button"
          >
            ログイン →
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Comments List -->
    <div class="divide-y divide-gray-200">
      <!-- Loading State -->
      <div v-if="loading" class="p-6">
        <div v-for="i in 3" :key="i" class="animate-pulse mb-6 last:mb-0">
          <div class="flex space-x-3">
            <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div class="flex-1">
              <div class="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-full mb-1"></div>
              <div class="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Comments -->
      <div v-else-if="comments.length > 0">
        <CommentThread
          v-for="thread in sortedComments"
          :key="thread.comment.id"
          :thread="thread"
          :article-id="articleId"
          @comment-updated="handleCommentUpdated"
          @comment-deleted="handleCommentDeleted"
          @reply-added="handleReplyAdded"
          data-testid="comment-item"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="p-6 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">まだコメントがありません</h3>
        <p class="text-gray-500 mb-4">最初のコメントを投稿してみませんか？</p>
      </div>

      <!-- Load More Comments -->
      <div v-if="hasMoreComments" class="p-6 border-t border-gray-200">
        <button
          @click="loadMoreComments"
          :disabled="loading"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
        >
          <span v-if="loading">読み込み中...</span>
          <span v-else>さらにコメントを読み込む</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useComments } from '~/composables/useComments'
import { getFirebaseAuth, getFirebaseFirestore } from '~/utils/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'

// Props
const props = defineProps({
  articleId: {
    type: String,
    required: true
  }
})

// Composables
const { user, isLoggedIn, getCurrentUser } = useAuth()
const {
  getArticleComments,
  subscribeToComments,
  loading
} = useComments()

// State
const comments = ref([])
const commentCount = ref(0)
const hasMoreComments = ref(false)
const realtimeUnsubscribe = ref(null)
const isClient = ref(false)
const isDev = process.dev

// Computed
const sortedComments = computed(() => {
  const sorted = [...comments.value].sort((a, b) => {
    // Extract timestamp values safely
    const getTimestamp = (dateValue) => {
      if (!dateValue) return 0

      // Handle Firestore Timestamp with seconds property
      if (dateValue && typeof dateValue === 'object' && dateValue.seconds) {
        return dateValue.seconds * 1000
      }
      // Handle Firestore Timestamp with toDate method
      if (dateValue && typeof dateValue.toDate === 'function') {
        return dateValue.toDate().getTime()
      }
      // Handle Date objects or string dates
      return new Date(dateValue).getTime()
    }

    const timeA = getTimestamp(a.comment.createdAt)
    const timeB = getTimestamp(b.comment.createdAt)

    // Sort by creation date (newest first for top-level comments)
    return timeB - timeA
  })

  // Debug logging for sort order
  if (sorted.length > 0) {
    console.log('🔄 Sorted comments order:')
    sorted.forEach((thread, index) => {
      const timestamp = thread.comment.createdAt
      const displayTime = timestamp?.seconds
        ? new Date(timestamp.seconds * 1000).toISOString()
        : timestamp?.toDate?.()?.toISOString() || timestamp
      console.log(`  ${index + 1}. ${thread.comment.id} - ${displayTime} - "${thread.comment.content?.substring(0, 30)}..."`)
    })
  }

  return sorted
})

// Methods
const loadComments = async () => {
  try {
    console.log('🔄 CommentsSection: Loading comments for article ID:', props.articleId)
    console.log('👤 Current auth state - User:', user.value?.uid, 'Logged in:', isLoggedIn.value, 'Loading:', loading.value)

    const result = await getArticleComments(props.articleId, {
      sortBy: 'newest',
      limit: 20
    })

    console.log('✅ CommentsSection: Comments loaded successfully:', result)
    console.log('📝 Comments data:', result.threads?.map(t => ({ id: t.comment?.id, content: t.comment?.content?.substring(0, 50) })))
    comments.value = result.threads
    commentCount.value = result.total
    hasMoreComments.value = result.hasNext
    console.log('📊 CommentsSection: Updated state - count:', commentCount.value, 'threads:', comments.value.length)
  } catch (error) {
    console.error('❌ Failed to load comments:', error)
  }
}

const loadMoreComments = async () => {
  try {
    // In a real implementation, this would use pagination
    const result = await getArticleComments(props.articleId, {
      sortBy: 'newest',
      limit: 40 // Load more comments
    })

    comments.value = result.threads
    hasMoreComments.value = result.hasNext
  } catch (error) {
    console.error('Failed to load more comments:', error)
  }
}



// Handle realtime comment addition (from Firebase listener)
const handleCommentAdded = (newComment) => {
  // Check if comment already exists by ID
  const existingIndex = comments.value.findIndex(thread => thread.comment.id === newComment.id)
  if (existingIndex !== -1) {
    console.log('📝 Realtime comment already exists, skipping:', newComment.id)
    return
  }

  console.log('✨ Adding realtime comment to UI:', newComment.id)

  // Add new comment to the top of the list
  const newThread = {
    comment: newComment,
    replies: [],
    totalReplies: 0,
    hasMoreReplies: false
  }

  comments.value.unshift(newThread)
  commentCount.value += 1
}

const handleCommentUpdated = (updatedComment) => {
  // Find and update the comment
  const threadIndex = comments.value.findIndex(thread => thread.comment.id === updatedComment.id)
  if (threadIndex !== -1) {
    comments.value[threadIndex].comment = updatedComment
  } else {
    // Check in replies
    for (const thread of comments.value) {
      const replyIndex = thread.replies.findIndex(reply => reply.id === updatedComment.id)
      if (replyIndex !== -1) {
        thread.replies[replyIndex] = updatedComment
        break
      }
    }
  }
}

const handleCommentDeleted = (commentId) => {
  // Remove comment from list or mark as deleted
  const threadIndex = comments.value.findIndex(thread => thread.comment.id === commentId)
  if (threadIndex !== -1) {
    if (comments.value[threadIndex].totalReplies > 0) {
      // Soft delete - mark as deleted but keep in list
      comments.value[threadIndex].comment.isDeleted = true
      comments.value[threadIndex].comment.content = '[削除されました]'
    } else {
      // Hard delete - remove from list
      comments.value.splice(threadIndex, 1)
      commentCount.value -= 1
    }
  } else {
    // Check in replies
    for (const thread of comments.value) {
      const replyIndex = thread.replies.findIndex(reply => reply.id === commentId)
      if (replyIndex !== -1) {
        thread.replies.splice(replyIndex, 1)
        thread.totalReplies -= 1
        break
      }
    }
  }
}

const handleReplyAdded = (parentId, newReply) => {
  // Find parent thread and add reply
  const threadIndex = comments.value.findIndex(thread => thread.comment.id === parentId)
  if (threadIndex !== -1) {
    comments.value[threadIndex].replies.push(newReply)
    comments.value[threadIndex].totalReplies += 1
    comments.value[threadIndex].comment.childCount += 1
  }
  commentCount.value += 1
}


// Real-time updates
const setupRealtimeUpdates = () => {
  if (realtimeUnsubscribe.value) {
    realtimeUnsubscribe.value()
  }

  realtimeUnsubscribe.value = subscribeToComments({
    articleId: props.articleId,
    onCommentAdded: (comment) => {
      // Only add if it's a top-level comment
      if (!comment.parentId) {
        console.log('📱 Real-time comment added:', comment)
        handleCommentAdded(comment)
      }
    },
    onCommentUpdated: (comment) => {
      handleCommentUpdated(comment)
    },
    onCommentDeleted: (commentId) => {
      handleCommentDeleted(commentId)
    },
    onLikeChanged: (commentId, likeCount) => {
      // Update like count in comments
      for (const thread of comments.value) {
        if (thread.comment.id === commentId) {
          thread.comment.likeCount = likeCount
          break
        }
        for (const reply of thread.replies) {
          if (reply.id === commentId) {
            reply.likeCount = likeCount
            break
          }
        }
      }
    }
  })
}

// Lifecycle
// Watch for authentication state changes
watch(
  () => isLoggedIn.value,
  (newValue, oldValue) => {
    console.log('🔄 Auth state changed:', { oldValue, newValue })
    if (isClient.value && oldValue !== newValue) {
      console.log('♻️ Reloading comments due to auth state change')
      loadComments()
    }
  }
)

onMounted(() => {
  console.log('🚀 CommentsSection mounted for article:', props.articleId)
  isClient.value = true
  loadComments()
  setupRealtimeUpdates()
})

onUnmounted(() => {
  if (realtimeUnsubscribe.value) {
    realtimeUnsubscribe.value()
  }
})
</script>