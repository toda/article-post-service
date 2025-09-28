<template>
  <div class="comment-thread">
    <!-- Main Comment -->
    <div class="p-6">
      <CommentItem
        :comment="thread.comment"
        :article-id="articleId"
        :can-reply="true"
        @reply="handleReply"
        @updated="$emit('comment-updated', $event)"
        @deleted="$emit('comment-deleted', $event)"
        data-testid="main-comment"
      />

      <!-- Reply Form -->
      <div v-if="showReplyForm" class="mt-4 ml-10">
        <CommentForm
          :article-id="articleId"
          :parent-id="thread.comment.id"
          :is-reply="true"
          placeholder="返信を入力..."
          @comment-added="handleReplyAdded"
          @cancel="showReplyForm = false"
          data-testid="reply-form"
        />
      </div>

      <!-- Replies -->
      <div v-if="thread.replies && thread.replies.length > 0" class="mt-4 ml-10 space-y-4">
        <CommentItem
          v-for="reply in visibleReplies"
          :key="reply.id"
          :comment="reply"
          :article-id="articleId"
          :is-reply="true"
          @updated="$emit('comment-updated', $event)"
          @deleted="$emit('comment-deleted', $event)"
          data-testid="reply-comment"
        />

        <!-- Load More Replies Button -->
        <div v-if="thread.hasMoreReplies" class="pt-2">
          <button
            @click="loadMoreReplies"
            class="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            data-testid="load-more-replies"
          >
            さらに{{ thread.totalReplies - visibleReplies.length }}件の返信を表示
          </button>
        </div>
      </div>

      <!-- Show Replies Button (if replies exist but are hidden) -->
      <div v-else-if="thread.totalReplies > 0" class="mt-4 ml-10">
        <button
          @click="loadReplies"
          class="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          data-testid="show-replies"
        >
          {{ thread.totalReplies }}件の返信を表示
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useComments } from '~/composables/useComments'

// Props
const props = defineProps({
  thread: {
    type: Object,
    required: true
  },
  articleId: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['comment-updated', 'comment-deleted', 'reply-added'])

// Composables
const { getReplies } = useComments()

// State
const showReplyForm = ref(false)
const loadingReplies = ref(false)

// Computed
const visibleReplies = computed(() => {
  return props.thread.replies || []
})

// Methods
const handleReply = () => {
  showReplyForm.value = true
}

const handleReplyAdded = (newReply) => {
  showReplyForm.value = false
  emit('reply-added', props.thread.comment.id, newReply)
}

const loadReplies = async () => {
  if (loadingReplies.value) return

  try {
    loadingReplies.value = true
    const replies = await getReplies(props.thread.comment.id, {
      limit: 10
    })

    // Update thread with replies (this would normally be handled by parent)
    props.thread.replies = replies.comments
    props.thread.hasMoreReplies = replies.hasNext

  } catch (error) {
    console.error('Failed to load replies:', error)
  } finally {
    loadingReplies.value = false
  }
}

const loadMoreReplies = async () => {
  if (loadingReplies.value) return

  try {
    loadingReplies.value = true
    const replies = await getReplies(props.thread.comment.id, {
      limit: 20,
      offset: visibleReplies.value.length
    })

    // Append new replies
    props.thread.replies.push(...replies.comments)
    props.thread.hasMoreReplies = replies.hasNext

  } catch (error) {
    console.error('Failed to load more replies:', error)
  } finally {
    loadingReplies.value = false
  }
}
</script>