<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div>
        <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
          <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          パスワードをリセット
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          パスワードリセット用のリンクをメールでお送りします
        </p>
      </div>

      <!-- Success State -->
      <div v-if="emailSent" class="rounded-md bg-green-50 p-4" data-testid="success-message">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800">
              メールを送信しました
            </h3>
            <div class="mt-2 text-sm text-green-700">
              <p>{{ form.email }} にパスワードリセット用のリンクを送信しました。</p>
              <p class="mt-1">メールが届かない場合は、迷惑メールフォルダもご確認ください。</p>
            </div>
          </div>
        </div>
        <div class="mt-4">
          <button
            @click="resetForm"
            class="text-sm text-green-600 hover:text-green-500 font-medium"
          >
            別のメールアドレスで再送信
          </button>
        </div>
      </div>

      <!-- Reset Form -->
      <form v-else @submit.prevent="handleSubmit" class="mt-8 space-y-6">
        <div>
          <!-- Email -->
          <label for="email" class="block text-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            autocomplete="email"
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-300': errors.email }"
            placeholder="登録時のメールアドレス"
            data-testid="email-input"
          />
          <p v-if="errors.email" class="mt-1 text-sm text-red-600" data-testid="email-error">
            {{ errors.email }}
          </p>
          <p class="mt-1 text-sm text-gray-500">
            このメールアドレスでアカウントが見つかった場合、パスワードリセット用のリンクをお送りします。
          </p>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            data-testid="reset-button"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? '送信中...' : 'リセットリンクを送信' }}
          </button>
        </div>

        <!-- Back to Login -->
        <div class="text-center">
          <NuxtLink
            to="/login"
            class="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            ログインページに戻る
          </NuxtLink>
        </div>

        <!-- Error Display -->
        <div v-if="generalError" class="rounded-md bg-red-50 p-4" data-testid="error-message">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                エラーが発生しました
              </h3>
              <div class="mt-2 text-sm text-red-700">
                {{ generalError }}
              </div>
            </div>
          </div>
        </div>
      </form>

      <!-- Info Section -->
      <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800">
              パスワードリセットについて
            </h3>
            <div class="mt-2 text-sm text-blue-700">
              <ul class="list-disc list-inside space-y-1">
                <li>リセットリンクの有効期限は1時間です</li>
                <li>リンクは1回のみ使用可能です</li>
                <li>メールが届かない場合は迷惑メールフォルダもご確認ください</li>
                <li>セキュリティのため、リセット処理は必ずご本人が行ってください</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

// SEO
useHead({
  title: 'パスワードリセット - Article Platform',
  meta: [
    {
      name: 'description',
      content: 'パスワードをお忘れの方はこちらからリセットしてください'
    }
  ]
})

// Router
const router = useRouter()

// Composables
// Temporarily disabled for debugging
// const { resetPassword, isLoggedIn } = useAuth()
const resetPassword = ref(() => {})
const isLoggedIn = ref(false)

// State
const form = ref({
  email: ''
})

const loading = ref(false)
const emailSent = ref(false)
const errors = ref({})
const generalError = ref('')

// Methods
const validateForm = () => {
  errors.value = {}

  if (!form.value.email) {
    errors.value.email = 'メールアドレスは必須です'
  } else if (!isValidEmail(form.value.email)) {
    errors.value.email = '有効なメールアドレスを入力してください'
  }

  return Object.keys(errors.value).length === 0
}

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const handleSubmit = async () => {
  generalError.value = ''

  if (!validateForm()) return

  loading.value = true

  try {
    await resetPassword(form.value.email)
    emailSent.value = true
  } catch (error) {
    console.error('Password reset failed:', error)

    if (error.code === 'auth/user-not-found') {
      // セキュリティのため、ユーザーが存在しない場合でも成功として扱う
      emailSent.value = true
    } else if (error.code === 'auth/invalid-email') {
      errors.value.email = '有効なメールアドレスを入力してください'
    } else if (error.code === 'auth/too-many-requests') {
      generalError.value = 'リクエストが多すぎます。しばらく時間をおいて再試行してください'
    } else {
      generalError.value = 'パスワードリセットに失敗しました。しばらく時間をおいて再試行してください'
    }
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value.email = ''
  emailSent.value = false
  errors.value = {}
  generalError.value = ''
}

// Redirect if already logged in
onMounted(() => {
  if (isLoggedIn.value) {
    router.push('/')
  }
})
</script>