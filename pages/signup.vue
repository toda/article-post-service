<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <!-- Success Modal Overlay -->
    <div v-if="successMessage" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-testid="success-modal">
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform transition-all">
        <div class="p-8 text-center">
          <!-- Success Icon -->
          <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <!-- Success Title -->
          <h3 class="text-2xl font-bold text-gray-900 mb-4">
            認証メール送信完了
          </h3>

          <!-- Success Message -->
          <div class="text-gray-700 mb-8 leading-relaxed whitespace-pre-line">
            {{ successMessage }}
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              @click="goToLogin"
              class="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              ログインページへ
            </button>
            <button
              @click="closeSuccessModal"
              class="flex-1 sm:flex-none px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              新しいアカウントを作成
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div>
        <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
          <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          新しいアカウントを作成
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          または
          <NuxtLink to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            既存のアカウントでログイン
          </NuxtLink>
        </p>
      </div>

      <!-- Signup Form -->
      <form @submit.prevent="handleSubmit" class="mt-8 space-y-6">
        <div class="space-y-4">
          <!-- Username -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">
              ユーザー名
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              autocomplete="username"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-300': errors.username, 'border-green-300': usernameStatus === 'available' }"
              placeholder="ユーザー名を入力"
              data-testid="username-input"
              @input="checkUsernameAvailability"
            />
            <p v-if="errors.username" class="mt-1 text-sm text-red-600" data-testid="username-error">
              {{ errors.username }}
            </p>
            <p v-if="usernameStatus === 'available'" class="mt-1 text-sm text-green-600">
              ✓ このユーザー名は利用可能です
            </p>
            <p v-if="usernameStatus === 'taken'" class="mt-1 text-sm text-red-600">
              ✗ このユーザー名は既に使用されています
            </p>
            <p v-if="usernameStatus === 'checking'" class="mt-1 text-sm text-gray-500">
              確認中...
            </p>
            <div class="mt-1 text-xs text-gray-500">
              • 3-20文字
              • 英数字、アンダースコア、ハイフンのみ
              • 最初と最後は英数字
            </div>
          </div>

          <!-- Display Name -->
          <div>
            <label for="displayName" class="block text-sm font-medium text-gray-700">
              表示名
            </label>
            <input
              id="displayName"
              v-model="form.displayName"
              type="text"
              required
              autocomplete="name"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-300': errors.displayName }"
              placeholder="表示名を入力"
              data-testid="displayname-input"
            />
            <p v-if="errors.displayName" class="mt-1 text-sm text-red-600" data-testid="displayname-error">
              {{ errors.displayName }}
            </p>
            <div class="mt-1 text-xs text-gray-500">
              プロフィールに表示される名前です
            </div>
          </div>

          <!-- Email -->
          <div>
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
              placeholder="your@email.com"
              data-testid="email-input"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600" data-testid="email-error">
              {{ errors.email }}
            </p>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              パスワード
            </label>
            <div class="mt-1 relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="new-password"
                class="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-300': errors.password }"
                placeholder="パスワードを入力"
                data-testid="password-input"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                data-testid="toggle-password"
              >
                <svg v-if="showPassword" class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
                <svg v-else class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600" data-testid="password-error">
              {{ errors.password }}
            </p>
            <div class="mt-1 text-xs text-gray-500">
              <span :class="{ 'text-green-600': form.password.length >= 8 }">
                • 8文字以上
              </span>
              <span :class="{ 'text-green-600': /[A-Z]/.test(form.password) }" class="ml-2">
                • 大文字を含む
              </span>
              <span :class="{ 'text-green-600': /[0-9]/.test(form.password) }" class="ml-2">
                • 数字を含む
              </span>
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              パスワード確認
            </label>
            <div class="mt-1 relative">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                autocomplete="new-password"
                class="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-300': errors.confirmPassword }"
                placeholder="パスワードを再入力"
                data-testid="confirm-password-input"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                data-testid="toggle-confirm-password"
              >
                <svg v-if="showConfirmPassword" class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
                <svg v-else class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600" data-testid="confirm-password-error">
              {{ errors.confirmPassword }}
            </p>
          </div>
        </div>

        <!-- Terms and Privacy -->
        <div class="flex items-center">
          <input
            id="accept-terms"
            v-model="form.acceptTerms"
            type="checkbox"
            required
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            data-testid="accept-terms"
          />
          <label for="accept-terms" class="ml-2 block text-sm text-gray-900">
            <NuxtLink to="/terms" class="text-blue-600 hover:text-blue-500">利用規約</NuxtLink>
            と
            <NuxtLink to="/privacy" class="text-blue-600 hover:text-blue-500">プライバシーポリシー</NuxtLink>
            に同意します
          </label>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            data-testid="signup-button"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? 'アカウント作成中...' : 'アカウントを作成' }}
          </button>
        </div>

        <!-- Social Signup -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-gray-50 text-gray-500">または</span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="signupWithGoogle"
              :disabled="socialLoading"
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              data-testid="google-signup"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span class="ml-2">Google</span>
            </button>

            <button
              type="button"
              @click="signupWithGitHub"
              :disabled="socialLoading"
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              data-testid="github-signup"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
              </svg>
              <span class="ml-2">GitHub</span>
            </button>
          </div>
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
                アカウント作成エラー
              </h3>
              <div class="mt-2 text-sm text-red-700">
                {{ generalError }}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useUsers } from '~/composables/useUsers'

// SEO
useHead({
  title: 'アカウント作成 - Article Platform',
  meta: [
    {
      name: 'description',
      content: 'Article Platformで新しいアカウントを作成してください'
    }
  ]
})

// Router
const router = useRouter()
const route = useRoute()

// Composables - Firebase Auth enabled (GitHub auth disabled for now)
const { signUp, signInWithProvider, isLoggedIn, loading } = useAuth()
const { checkUsernameAvailability: checkUsername } = useUsers()

// State
const form = ref({
  username: '',
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

// Initialize form for SSR safety
if (process.server) {
  form.value = {
    username: '',
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  }
}

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const socialLoading = ref(false)
const errors = ref({
  username: '',
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: ''
})
const generalError = ref('')
const successMessage = ref('')
const usernameStatus = ref('') // '', 'checking', 'available', 'taken'
const usernameCheckTimeout = ref(null)

// Methods
const validateForm = () => {
  errors.value = {}

  if (!form.value.username.trim()) {
    errors.value.username = 'ユーザー名は必須です'
  } else if (!isValidUsername(form.value.username.trim())) {
    errors.value.username = 'ユーザー名の形式が正しくありません'
  } else if (usernameStatus.value !== 'available') {
    errors.value.username = 'ユーザー名の利用可能性を確認してください'
  }

  if (!form.value.displayName.trim()) {
    errors.value.displayName = '表示名は必須です'
  } else if (form.value.displayName.trim().length > 50) {
    errors.value.displayName = '表示名は50文字以内で入力してください'
  }

  if (!form.value.email) {
    errors.value.email = 'メールアドレスは必須です'
  } else if (!isValidEmail(form.value.email)) {
    errors.value.email = '有効なメールアドレスを入力してください'
  }

  if (!form.value.password) {
    errors.value.password = 'パスワードは必須です'
  } else if (!isValidPassword(form.value.password)) {
    errors.value.password = 'パスワードは8文字以上で、大文字と数字を含む必要があります'
  }

  if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'パスワードが一致しません'
  }

  if (!form.value.acceptTerms) {
    errors.value.acceptTerms = '利用規約とプライバシーポリシーに同意してください'
  }

  return Object.keys(errors.value).length === 0
}

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const isValidPassword = (password) => {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)
}

const isValidUsername = (username) => {
  // 3-20文字、英数字、アンダースコア、ハイフンのみ、最初と最後は英数字
  const usernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_-]{1,18}[a-zA-Z0-9]$/
  return username.length >= 3 && username.length <= 20 && usernameRegex.test(username)
}

const checkUsernameAvailability = async () => {
  const username = form.value.username.trim().toLowerCase()

  // タイマーをクリア
  if (usernameCheckTimeout.value) {
    clearTimeout(usernameCheckTimeout.value)
  }

  if (!username || !isValidUsername(username)) {
    usernameStatus.value = ''
    return
  }

  usernameStatus.value = 'checking'

  // デバウンス（500ms待機）
  usernameCheckTimeout.value = setTimeout(async () => {
    try {
      const available = await checkUsername(username)
      usernameStatus.value = available ? 'available' : 'taken'
    } catch (error) {
      console.error('Username check failed:', error)
      usernameStatus.value = ''
    }
  }, 500)
}

const handleSubmit = async () => {
  generalError.value = ''
  successMessage.value = ''

  if (!validateForm()) return

  // Additional check: ensure username is not taken
  if (usernameStatus.value === 'taken') {
    generalError.value = 'このユーザー名は既に使用されています。別のユーザー名を選択してください。'
    return
  }

  // Final username availability check before submission
  if (usernameStatus.value !== 'available') {
    try {
      const available = await checkUsername(form.value.username.trim().toLowerCase())
      if (!available) {
        generalError.value = 'このユーザー名は既に使用されています。別のユーザー名を選択してください。'
        usernameStatus.value = 'taken'
        return
      }
    } catch (error) {
      generalError.value = 'ユーザー名の確認に失敗しました。しばらく時間をおいて再試行してください。'
      return
    }
  }

  loading.value = true

  try {
    const result = await signUp({
      email: form.value.email,
      password: form.value.password,
      username: form.value.username.trim().toLowerCase(),
      displayName: form.value.displayName.trim()
    })

    // Show success message with email verification notice
    successMessage.value = `メールアドレスの認証メールを送付しました。
まだ、アカウントの作成は完了していません。

${form.value.email} に送信された認証メールを確認し、
認証リンクをクリックしてアカウント作成を完了してください。

認証完了後、ログインが可能になります。`

    // Success message is shown in modal - no automatic redirect
  } catch (error) {
    console.error('Signup failed:', error)

    // Firebase エラーコードを日本語メッセージに変換
    if (error.code === 'auth/email-already-in-use') {
      errors.value.email = 'このメールアドレスは既に使用されています'
      generalError.value = 'このメールアドレスは既に登録されています。ログインするか、別のメールアドレスを使用してください。'
    } else if (error.code === 'auth/username-already-exists' || error.message.includes('Username is already taken')) {
      errors.value.username = 'このユーザー名は既に使用されています'
      usernameStatus.value = 'taken'
      generalError.value = 'このユーザー名は既に使用されています。別のユーザー名を選択してください。'
    } else if (error.message.includes('Unable to verify username uniqueness')) {
      generalError.value = 'ユーザー名の確認に失敗しました。データベース接続を確認してから再試行してください。'
    } else if (error.code === 'auth/weak-password') {
      errors.value.password = 'パスワードが弱すぎます。8文字以上、大文字・数字を含めてください。'
      generalError.value = 'パスワードは8文字以上で、大文字と数字を含める必要があります。'
    } else if (error.code === 'auth/invalid-email') {
      errors.value.email = '有効なメールアドレスを入力してください'
      generalError.value = 'メールアドレスの形式が正しくありません。'
    } else if (error.code === 'auth/operation-not-allowed') {
      generalError.value = 'メール/パスワード認証が有効になっていません。管理者にお問い合わせください。'
    } else if (error.code === 'auth/network-request-failed') {
      generalError.value = 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
    } else {
      // その他のエラーは一般的なメッセージを表示（Firebaseの生エラーを表示しない）
      generalError.value = 'アカウント作成に失敗しました。入力内容を確認して再試行してください。'
    }
  } finally {
    loading.value = false
  }
}

const signupWithGoogle = async () => {
  if (!form.value.acceptTerms) {
    generalError.value = '利用規約とプライバシーポリシーに同意してください'
    return
  }

  socialLoading.value = true
  generalError.value = ''

  try {
    await signInWithProvider({ providerId: 'google' })

    const redirectTo = route?.query?.redirect || '/'
    await router.push(redirectTo)
  } catch (error) {
    console.error('Google signup failed:', error)
    generalError.value = 'Googleアカウントでの登録に失敗しました'
  } finally {
    socialLoading.value = false
  }
}

const signupWithGitHub = async () => {
  if (!form.value.acceptTerms) {
    generalError.value = '利用規約とプライバシーポリシーに同意してください'
    return
  }

  socialLoading.value = true
  generalError.value = ''

  try {
    // GitHub provider temporarily disabled
    throw new Error('GitHubログインは現在無効化されています')

    const redirectTo = route?.query?.redirect || '/'
    await router.push(redirectTo)
  } catch (error) {
    console.error('GitHub signup failed:', error)
    generalError.value = 'GitHubアカウントでの登録に失敗しました'
  } finally {
    socialLoading.value = false
  }
}

// Modal action methods
const goToLogin = async () => {
  await router.push('/login')
}

const closeSuccessModal = () => {
  successMessage.value = ''
  // Reset form for new signup
  form.value = {
    username: '',
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  }
  usernameStatus.value = ''
}

// Redirect if already logged in
onMounted(() => {
  if (isLoggedIn.value) {
    const redirectTo = route?.query?.redirect || '/'
    router.push(redirectTo)
  }
})
</script>