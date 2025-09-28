<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div>
        <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
          <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          アカウントにログイン
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          または
          <NuxtLink to="/signup" class="font-medium text-blue-600 hover:text-blue-500">
            新しいアカウントを作成
          </NuxtLink>
        </p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleSubmit" class="mt-8 space-y-6">
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
                ログインエラー
              </h3>
              <div class="mt-2 text-sm text-red-700">
                {{ generalError }}
              </div>
            </div>
          </div>
        </div>

        <!-- Email Verification Section -->
        <div v-if="showEmailVerificationSection" class="rounded-md bg-yellow-50 p-4" data-testid="email-verification-section">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800">
                メール認証が必要です
              </h3>
              <div class="mt-2 text-sm text-yellow-700">
                <p>アカウントにログインするには、まずメールアドレスの認証を完了してください。</p>
                <p class="mt-1">メールボックスを確認し、認証リンクをクリックしてください。</p>
              </div>
              <div class="mt-4 flex space-x-3">
                <button
                  type="button"
                  @click="resendVerificationEmail"
                  :disabled="resendLoading || resendCooldown > 0"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="resend-verification-email"
                >
                  <svg v-if="resendLoading" class="animate-spin -ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ resendLoading ? '送信中...' : resendCooldown > 0 ? `再送信可能まで ${resendCooldown}秒` : '認証メールを再送信' }}
                </button>
                <button
                  type="button"
                  @click="checkVerificationStatus"
                  :disabled="verificationCheckLoading"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="check-verification-status"
                >
                  <svg v-if="verificationCheckLoading" class="animate-spin -ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ verificationCheckLoading ? '確認中...' : '認証状態を確認' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-4">
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
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
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
                autocomplete="current-password"
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
          </div>
        </div>

        <!-- Remember Me & Forgot Password -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="form.rememberMe"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              data-testid="remember-me"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              ログイン状態を保持
            </label>
          </div>

          <div class="text-sm">
            <NuxtLink to="/reset-password" class="font-medium text-blue-600 hover:text-blue-500">
              パスワードを忘れた方
            </NuxtLink>
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            data-testid="login-button"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? 'ログイン中...' : 'ログイン' }}
          </button>
        </div>

        <!-- Social Login -->
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
              @click="loginWithGoogle"
              :disabled="socialLoading"
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              data-testid="google-login"
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
              @click="loginWithGitHub"
              :disabled="socialLoading"
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              data-testid="github-login"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
              </svg>
              <span class="ml-2">GitHub</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

// SEO
useHead({
  title: 'ログイン - Article Platform',
  meta: [
    {
      name: 'description',
      content: 'Article Platformにログインしてください'
    }
  ]
})

// Router
const router = useRouter()
const route = useRoute()

// Composables - Re-enabled since Firebase authentication is now working
const { signIn, signInWithProvider, isLoggedIn, authLoading, sendEmailVerification, refreshEmailVerification } = useAuth()
const loading = authLoading

// State
const form = ref({
  email: '',
  password: '',
  rememberMe: false
})

// Initialize form for SSR safety
if (process.server) {
  form.value = {
    email: '',
    password: '',
    rememberMe: false
  }
}

const showPassword = ref(false)
const socialLoading = ref(false)
const errors = ref({})
const generalError = ref('')
const showEmailVerificationSection = ref(false)
const resendLoading = ref(false)
const resendCooldown = ref(0)
const resendTimer = ref(null)
const verificationCheckLoading = ref(false)

// Methods
const validateForm = () => {
  errors.value = {}

  if (!form.value.email) {
    errors.value.email = 'メールアドレスは必須です'
  } else if (!isValidEmail(form.value.email)) {
    errors.value.email = '有効なメールアドレスを入力してください'
  }

  if (!form.value.password) {
    errors.value.password = 'パスワードは必須です'
  } else if (form.value.password.length < 6) {
    errors.value.password = 'パスワードは6文字以上で入力してください'
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

  try {
    await signIn({
      email: form.value.email,
      password: form.value.password
    })

    // If signIn succeeds, user is verified and can be redirected
    const redirectTo = route?.query?.redirect || '/'
    await router.push(redirectTo)
  } catch (error) {
    console.error('Login failed:', error)

    if (error.code === 'auth/email-not-verified') {
      generalError.value = error.message || 'メールアドレスの認証が完了していません。メールを確認して認証を完了してからログインしてください。'
      showEmailVerificationSection.value = true
    } else if (error.code === 'auth/invalid-credential') {
      generalError.value = 'メールアドレスまたはパスワードが正しくありません'
    } else if (error.code === 'auth/user-disabled') {
      generalError.value = 'このアカウントは無効化されています'
    } else if (error.code === 'auth/too-many-requests') {
      generalError.value = 'ログイン試行回数が多すぎます。しばらく時間をおいて再試行してください'
    } else {
      generalError.value = 'ログインに失敗しました。しばらく時間をおいて再試行してください'
    }
  }
}

const loginWithGoogle = async () => {
  socialLoading.value = true
  generalError.value = ''

  try {
    await signInWithProvider({ providerId: 'google' })

    const redirectTo = route?.query?.redirect || '/'
    await router.push(redirectTo)
  } catch (error) {
    console.error('Google login failed:', error)
    if (error.code === 'auth/email-not-verified') {
      generalError.value = error.message || 'メールアドレスの認証が完了していません。メールを確認して認証を完了してからログインしてください。'
      showEmailVerificationSection.value = true
    } else {
      generalError.value = 'Googleログインに失敗しました'
    }
  } finally {
    socialLoading.value = false
  }
}

const loginWithGitHub = async () => {
  socialLoading.value = true
  generalError.value = ''

  try {
    await signInWithProvider({ providerId: 'github' })

    const redirectTo = route?.query?.redirect || '/'
    await router.push(redirectTo)
  } catch (error) {
    console.error('GitHub login failed:', error)
    if (error.code === 'auth/email-not-verified') {
      generalError.value = error.message || 'メールアドレスの認証が完了していません。メールを確認して認証を完了してからログインしてください。'
      showEmailVerificationSection.value = true
    } else {
      generalError.value = 'GitHubログインに失敗しました'
    }
  } finally {
    socialLoading.value = false
  }
}

// Check verification status
const checkVerificationStatus = async () => {
  verificationCheckLoading.value = true

  try {
    const result = await refreshEmailVerification()

    if (result.verified) {
      // Email verified! Redirect to home
      showEmailVerificationSection.value = false
      generalError.value = ''

      const redirectTo = route?.query?.redirect || '/'
      await router.push(redirectTo)
    } else {
      generalError.value = result.message || 'メール認証がまだ完了していません。'
    }
  } catch (error) {
    console.error('Failed to check verification status:', error)
    generalError.value = 'メール認証状態の確認に失敗しました。'
  } finally {
    verificationCheckLoading.value = false
  }
}

// Resend verification email
const resendVerificationEmail = async () => {
  if (resendCooldown.value > 0 || !form.value.email) return

  resendLoading.value = true

  try {
    await sendEmailVerification()

    // Start cooldown (60 seconds)
    resendCooldown.value = 60
    resendTimer.value = setInterval(() => {
      resendCooldown.value--
      if (resendCooldown.value <= 0) {
        clearInterval(resendTimer.value)
      }
    }, 1000)

    generalError.value = ''
    // Show success message briefly
    const originalError = generalError.value
    generalError.value = ''
    setTimeout(() => {
      if (showEmailVerificationSection.value) {
        generalError.value = 'メールアドレスが認証されていません。メールに送信された認証リンクをクリックしてください。'
      }
    }, 3000)

  } catch (error) {
    console.error('Failed to resend verification email:', error)
    generalError.value = '認証メールの再送信に失敗しました。しばらく時間をおいて再試行してください'
  } finally {
    resendLoading.value = false
  }
}

// Cleanup timer on unmount
onBeforeUnmount(() => {
  if (resendTimer.value) {
    clearInterval(resendTimer.value)
  }
})

// Redirect if already logged in
onMounted(() => {
  // Wait a moment for auth state to initialize properly
  setTimeout(() => {
    if (isLoggedIn.value) {
      console.log('🔄 User already logged in, redirecting...')
      const redirectTo = route?.query?.redirect || '/'
      router.push(redirectTo)
    }
  }, 500)
})
</script>