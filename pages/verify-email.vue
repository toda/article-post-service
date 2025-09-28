<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full" :class="statusIcon.bgClass">
          <svg class="h-6 w-6" :class="statusIcon.iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="statusIcon.path" />
          </svg>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ statusMessage.title }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ statusMessage.description }}
        </p>
      </div>

      <!-- Status Content -->
      <div class="mt-8 space-y-6">
        <!-- Loading State -->
        <div v-if="isVerifying" class="text-center">
          <div class="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p class="mt-2 text-sm text-gray-600">認証状態を確認中...</p>
        </div>

        <!-- Success State -->
        <div v-else-if="verificationResult === 'success'" class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">認証完了</h3>
              <div class="mt-2 text-sm text-green-700">
                <p>メールアドレスの認証が完了しました！</p>
                <p class="mt-1">まもなくホームページにリダイレクトします...</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="verificationResult === 'error'" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">認証エラー</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ errorMessage || 'メール認証の処理中にエラーが発生しました。' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Not Logged In State -->
        <div v-else-if="verificationResult === 'not-logged-in'" class="rounded-md bg-yellow-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800">ログインが必要です</h3>
              <div class="mt-2 text-sm text-yellow-700">
                <p>メール認証を完了するには、まずアカウントにログインしてください。</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-4">
          <button
            @click="goToLogin"
            class="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ログインページへ
          </button>
          <button
            v-if="verificationResult === 'error'"
            @click="retryVerification"
            class="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            再試行
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

// SEO
useHead({
  title: 'メール認証 - Article Platform',
  meta: [
    {
      name: 'description',
      content: 'メールアドレスの認証を行っています'
    }
  ]
})

// Router
const router = useRouter()

// Composables
const { refreshEmailVerification, isLoggedIn } = useAuth()

// State
const isVerifying = ref(true)
const verificationResult = ref(null) // 'success', 'error', 'not-logged-in'
const errorMessage = ref('')
const redirectCountdown = ref(5)
const redirectTimer = ref(null)

// Computed
const statusIcon = computed(() => {
  switch (verificationResult.value) {
    case 'success':
      return {
        bgClass: 'bg-green-100',
        iconClass: 'text-green-600',
        path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
      }
    case 'error':
      return {
        bgClass: 'bg-red-100',
        iconClass: 'text-red-600',
        path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z'
      }
    case 'not-logged-in':
      return {
        bgClass: 'bg-yellow-100',
        iconClass: 'text-yellow-600',
        path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z'
      }
    default:
      return {
        bgClass: 'bg-blue-100',
        iconClass: 'text-blue-600',
        path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
      }
  }
})

const statusMessage = computed(() => {
  switch (verificationResult.value) {
    case 'success':
      return {
        title: '認証完了',
        description: 'メールアドレスの認証が正常に完了しました'
      }
    case 'error':
      return {
        title: '認証エラー',
        description: 'メール認証の処理中に問題が発生しました'
      }
    case 'not-logged-in':
      return {
        title: 'ログインが必要',
        description: 'メール認証を完了するにはログインしてください'
      }
    default:
      return {
        title: 'メール認証',
        description: '認証状態を確認しています'
      }
  }
})

// Methods
const verifyEmail = async () => {
  console.log('🔄 Starting email verification process')

  try {
    isVerifying.value = true

    // Check if user is logged in
    if (!isLoggedIn.value) {
      console.log('❌ User not logged in')
      verificationResult.value = 'not-logged-in'
      return
    }

    console.log('✅ User is logged in, refreshing email verification')

    // Refresh email verification status
    const result = await refreshEmailVerification()

    if (result.verified) {
      console.log('✅ Email verification successful')
      verificationResult.value = 'success'

      // Redirect to home page immediately after successful verification
      setTimeout(() => {
        router.push('/')
      }, 1500) // Short delay to show success message
    } else {
      console.log('❌ Email verification failed')
      verificationResult.value = 'error'
      errorMessage.value = result.message || 'メール認証に失敗しました'
    }
  } catch (error) {
    console.error('❌ Email verification error:', error)
    verificationResult.value = 'error'
    errorMessage.value = error.message || 'メール認証処理中にエラーが発生しました'
  } finally {
    isVerifying.value = false
  }
}

const startRedirectCountdown = () => {
  redirectTimer.value = setInterval(() => {
    redirectCountdown.value--
    if (redirectCountdown.value <= 0) {
      clearInterval(redirectTimer.value)
      router.push('/login?verified=true')
    }
  }, 1000)
}

const goToLogin = () => {
  if (redirectTimer.value) {
    clearInterval(redirectTimer.value)
  }
  router.push('/login')
}

const retryVerification = () => {
  verificationResult.value = null
  errorMessage.value = ''
  verifyEmail()
}

// Lifecycle
onMounted(() => {
  // Wait a moment for auth state to initialize, then check verification
  setTimeout(() => {
    verifyEmail()
  }, 1000)
})

onBeforeUnmount(() => {
  if (redirectTimer.value) {
    clearInterval(redirectTimer.value)
  }
})
</script>