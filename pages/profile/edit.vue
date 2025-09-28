<template>
  <div class="max-w-4xl mx-auto">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">プロフィール編集</h1>
      <p class="text-gray-600">プロフィール情報を更新して、あなたのことをもっと知ってもらいましょう。</p>
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
      <p class="text-gray-500 mb-6">プロフィールを編集するにはログインが必要です。</p>
      <NuxtLink
        to="/login"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        ログイン
      </NuxtLink>
    </div>

    <!-- Profile Edit Form -->
    <div v-else class="space-y-6">
      <!-- Avatar Section -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">プロフィール画像</h2>
        <!-- AvatarUpload component temporarily disabled until component is created -->
        <div class="text-gray-500 text-sm">プロフィール画像のアップロード機能は開発中です</div>
        <!-- <AvatarUpload
          :current-avatar-url="form.avatarUrl"
          @avatar-updated="handleAvatarUpdate"
        /> -->
      </div>

      <!-- Profile Information -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-6">基本情報</h2>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Display Name -->
          <div>
            <label for="displayName" class="block text-sm font-medium text-gray-700 mb-2">
              表示名 <span class="text-red-500">*</span>
            </label>
            <input
              id="displayName"
              v-model="form.displayName"
              type="text"
              required
              placeholder="表示名を入力してください"
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-300': errors.displayName }"
            >
            <p v-if="errors.displayName" class="mt-1 text-sm text-red-600">{{ errors.displayName }}</p>
            <p class="mt-1 text-sm text-gray-500">ユーザー名として表示されます（変更不可）</p>
          </div>

          <!-- Bio -->
          <div>
            <label for="bio" class="block text-sm font-medium text-gray-700 mb-2" data-testid="bio-textarea">
              自己紹介
            </label>
            <textarea
              id="bio"
              v-model="form.bio"
              rows="4"
              placeholder="あなたについて教えてください..."
              maxlength="500"
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              :class="{ 'border-red-300': errors.bio }"
              data-testid="bio-textarea"
            ></textarea>
            <div class="flex justify-between mt-1">
              <p v-if="errors.bio" class="text-sm text-red-600" data-testid="bio-error">{{ errors.bio }}</p>
              <p class="text-sm text-gray-500 ml-auto">{{ form.bio.length }}/500文字</p>
            </div>
          </div>

          <!-- Website -->
          <div>
            <label for="website" class="block text-sm font-medium text-gray-700 mb-2">
              ウェブサイト
            </label>
            <input
              id="website"
              v-model="form.website"
              type="url"
              placeholder="https://example.com"
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-300': errors.website }"
              data-testid="website-input"
            >
            <p v-if="errors.website" class="mt-1 text-sm text-red-600" data-testid="website-error">{{ errors.website }}</p>
          </div>

          <!-- Location -->
          <div>
            <label for="location" class="block text-sm font-medium text-gray-700 mb-2">
              場所
            </label>
            <input
              id="location"
              v-model="form.location"
              type="text"
              placeholder="東京, 日本"
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              data-testid="location-input"
            >
          </div>

          <!-- Social Links -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Twitter -->
            <div>
              <label for="twitter" class="block text-sm font-medium text-gray-700 mb-2">
                Twitter
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 text-sm">@</span>
                </div>
                <input
                  id="twitter"
                  v-model="form.twitterHandle"
                  type="text"
                  placeholder="username"
                  class="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
            </div>

            <!-- GitHub -->
            <div>
              <label for="github" class="block text-sm font-medium text-gray-700 mb-2">
                GitHub
              </label>
              <input
                id="github"
                v-model="form.githubHandle"
                type="text"
                placeholder="username"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-between pt-6 border-t border-gray-200">
            <NuxtLink
              :to="`/users/${user?.uid}`"
              class="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              キャンセル
            </NuxtLink>

            <div class="flex items-center space-x-3">
              <button
                type="button"
                @click="resetForm"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                リセット
              </button>
              <button
                type="submit"
                :disabled="loading || !hasChanges"
                class="px-6 py-2 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                data-testid="save-profile"
              >
                <span v-if="loading">保存中...</span>
                <span v-else>変更を保存</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Privacy Settings -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-6">プライバシー設定</h2>

        <div class="space-y-4" data-testid="privacy-settings">
          <!-- Profile Public -->
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-gray-900">プロフィールを公開</div>
              <div class="text-sm text-gray-500">他のユーザーがあなたのプロフィールを閲覧できます</div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="privacyForm.profilePublic"
                type="checkbox"
                class="sr-only peer"
              >
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <!-- Show Email -->
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-gray-900">メールアドレスを表示</div>
              <div class="text-sm text-gray-500">プロフィールページでメールアドレスを公開します</div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="privacyForm.showEmail"
                type="checkbox"
                class="sr-only peer"
                data-testid="show-email-toggle"
              >
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <!-- Show Stats -->
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-gray-900">統計情報を表示</div>
              <div class="text-sm text-gray-500">記事数、フォロワー数などの統計を公開します</div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="privacyForm.showStats"
                type="checkbox"
                class="sr-only peer"
                data-testid="show-stats-toggle"
              >
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <!-- Allow Follow -->
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-gray-900">フォローを許可</div>
              <div class="text-sm text-gray-500">他のユーザーがあなたをフォローできます</div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="privacyForm.allowFollow"
                type="checkbox"
                class="sr-only peer"
              >
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <!-- Save Privacy Settings -->
          <div class="pt-4 border-t border-gray-200">
            <button
              @click="savePrivacySettings"
              :disabled="loading"
              class="px-4 py-2 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              data-testid="save-privacy-settings"
            >
              <span v-if="loading">保存中...</span>
              <span v-else>プライバシー設定を保存</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useUsers } from '~/composables/useUsers'

// SEO
useHead({
  title: 'プロフィール編集 - Article Platform',
  meta: [
    {
      name: 'description',
      content: 'プロフィール情報を編集して、あなたのことをもっと知ってもらいましょう。'
    }
  ]
})

// Router
const router = useRouter()

// Composables
const { user, isLoggedIn, loading: authLoading } = useAuth()
const {
  getUserProfile,
  updateUserProfile,
  updatePrivacySettings,
  loading
} = useUsers()

// State
const form = ref({
  displayName: '',
  bio: '',
  website: '',
  location: '',
  twitterHandle: '',
  githubHandle: '',
  avatarUrl: ''
})

const privacyForm = ref({
  profilePublic: true,
  showEmail: false,
  showStats: true,
  allowFollow: true
})

const originalForm = ref({})
const errors = ref({})

// Computed
const hasChanges = computed(() => {
  return JSON.stringify(form.value) !== JSON.stringify(originalForm.value)
})

// Methods
const validateForm = () => {
  errors.value = {}

  if (!form.value.displayName.trim()) {
    errors.value.displayName = '表示名は必須です'
  }

  if (form.value.bio.length > 500) {
    errors.value.bio = '自己紹介は500文字以内で入力してください'
  }

  if (form.value.website && !isValidUrl(form.value.website)) {
    errors.value.website = '有効なURLを入力してください'
  }

  return Object.keys(errors.value).length === 0
}

const isValidUrl = (string) => {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    const profileData = {
      bio: form.value.bio.trim(),
      website: form.value.website.trim(),
      location: form.value.location.trim(),
      twitterHandle: form.value.twitterHandle.trim(),
      githubHandle: form.value.githubHandle.trim()
    }

    if (form.value.avatarUrl !== originalForm.value.avatarUrl) {
      profileData.avatarUrl = form.value.avatarUrl
    }

    await updateUserProfile(profileData)

    // Update original form to reflect saved state
    originalForm.value = { ...form.value }

    // Redirect to profile page
    await router.push(`/users/${user.value.uid}`)
  } catch (error) {
    console.error('Failed to update profile:', error)
    if (error.code === 'profile/display-name-required') {
      errors.value.displayName = '表示名は必須です'
    } else if (error.code === 'profile/bio-too-long') {
      errors.value.bio = '自己紹介は500文字以内で入力してください'
    } else if (error.code === 'profile/invalid-url') {
      errors.value.website = '有効なURLを入力してください'
    }
  }
}

const resetForm = () => {
  form.value = { ...originalForm.value }
  errors.value = {}
}

const handleAvatarUpdate = (avatarUrl) => {
  form.value.avatarUrl = avatarUrl
}

const savePrivacySettings = async () => {
  try {
    await updatePrivacySettings(privacyForm.value)
    // TODO: Show success message
    console.log('Privacy settings saved')
  } catch (error) {
    console.error('Failed to save privacy settings:', error)
  }
}

const loadUserProfile = async () => {
  if (!user.value) return

  try {
    const profile = await getUserProfile(user.value.uid)

    form.value = {
      displayName: profile.displayName || '',
      bio: profile.bio || '',
      website: profile.website || '',
      location: profile.location || '',
      twitterHandle: profile.twitterHandle || '',
      githubHandle: profile.githubHandle || '',
      avatarUrl: profile.avatarUrl || ''
    }

    originalForm.value = { ...form.value }

    // Load privacy settings
    if (profile.privacySettings) {
      privacyForm.value = { ...privacyForm.value, ...profile.privacySettings }
    }
  } catch (error) {
    console.error('Failed to load user profile:', error)
  }
}

// Watch for user changes
watch(user, (newUser) => {
  if (newUser) {
    loadUserProfile()
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  if (user.value) {
    loadUserProfile()
  }
})
</script>