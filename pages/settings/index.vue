<template>
  <div class="max-w-4xl mx-auto">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">設定</h1>
      <p class="text-gray-600">アカウント設定とプライバシー設定を管理します。</p>
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
      <p class="text-gray-500 mb-6">設定にアクセスするにはログインが必要です。</p>
      <NuxtLink
        to="/login"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        ログイン
      </NuxtLink>
    </div>

    <!-- Settings Content -->
    <div v-else class="space-y-6">
      <!-- Profile Information Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">プロフィール情報</h2>

        <div class="space-y-6">
          <!-- User Icon Section -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              アイコン画像（任意）
            </label>
            <div class="flex items-center space-x-6">
              <!-- Current Icon Display -->
              <div class="flex-shrink-0">
                <div class="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  <img
                    v-if="user?.avatarUrl"
                    :src="user.avatarUrl"
                    :alt="user.displayName || 'ユーザー'"
                    class="w-full h-full object-cover"
                  >
                  <svg
                    v-else
                    class="w-8 h-8 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>

              <!-- Icon Actions -->
              <div class="flex-1">
                <div class="flex items-center space-x-3">
                  <!-- File Input -->
                  <label class="cursor-pointer">
                    <input
                      ref="iconFileInput"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      @change="handleIconFileSelect"
                      class="hidden"
                    >
                    <span class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      画像を選択
                    </span>
                  </label>

                  <!-- Upload Button -->
                  <button
                    v-if="selectedIconFile"
                    @click="uploadIcon"
                    :disabled="isUploadingIcon"
                    class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span v-if="isUploadingIcon" class="inline-flex items-center">
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      アップロード中...
                    </span>
                    <span v-else>アップロード</span>
                  </button>

                  <!-- Delete Button -->
                  <button
                    v-if="user?.avatarUrl"
                    @click="deleteIcon"
                    :disabled="isDeletingIcon"
                    class="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span v-if="isDeletingIcon" class="inline-flex items-center">
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-red-700" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      削除中...
                    </span>
                    <span v-else>削除</span>
                  </button>
                </div>

                <!-- File Info -->
                <div v-if="selectedIconFile" class="mt-2 text-sm text-gray-600">
                  選択中: {{ selectedIconFile.name }} ({{ formatFileSize(selectedIconFile.size) }})
                </div>

                <!-- Icon Upload Guidelines -->
                <div class="mt-2 text-xs text-gray-500">
                  対応形式: JPEG、PNG、GIF、WebP / 最大サイズ: 5MB
                </div>
              </div>
            </div>
          </div>

          <!-- Bio Section -->
          <div>
            <label for="bio" class="block text-sm font-medium text-gray-700 mb-2">
              自己紹介（任意）
            </label>
            <textarea
              id="bio"
              v-model="bioForm.bio"
              rows="4"
              maxlength="500"
              placeholder="あなたについて簡単に紹介してください（最大500文字）"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            ></textarea>
            <div class="mt-2 flex items-center justify-between">
              <p class="text-xs text-gray-500">
                {{ bioForm.bio?.length || 0 }} / 500文字
              </p>
              <button
                @click="updateBio"
                :disabled="isUpdatingBio"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="isUpdatingBio" class="inline-flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  更新中...
                </span>
                <span v-else>自己紹介を更新</span>
              </button>
            </div>
            <!-- Bio Update Message -->
            <div
              v-if="bioMessage"
              :class="[
                'mt-3 p-3 rounded-lg',
                bioMessageType === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              ]"
            >
              <p :class="['text-sm font-medium', bioMessageType === 'success' ? 'text-green-800' : 'text-red-800']">
                {{ bioMessage }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Username and Display Name Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">ユーザー名と表示名</h2>

        <div class="space-y-6">
          <!-- Username Section -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              ユーザー名
            </label>
            <div class="flex space-x-3">
              <div class="flex-1">
                <input
                  id="username"
                  v-model="usernameForm.username"
                  @input="handleUsernameInput"
                  type="text"
                  placeholder="username123"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{
                    'border-red-300': usernameForm.error,
                    'border-green-300': usernameForm.status === 'available'
                  }"
                >
                <div v-if="usernameForm.error" class="mt-1 text-sm text-red-600">
                  {{ usernameForm.error }}
                </div>
                <div v-else-if="usernameForm.status === 'checking'" class="mt-1 text-sm text-gray-500">
                  確認中...
                </div>
                <div v-else-if="usernameForm.status === 'available'" class="mt-1 text-sm text-green-600">
                  ✓ 利用可能です
                </div>
                <div v-else-if="usernameForm.status === 'taken'" class="mt-1 text-sm text-red-600">
                  このユーザー名は既に使用されています
                </div>
                <div class="mt-1 text-xs text-gray-500">
                  3-20文字、英数字・アンダースコア・ハイフンのみ（小文字）
                </div>
              </div>
              <button
                @click="updateUsername"
                :disabled="!canUpdateUsername || isUpdatingUsername"
                class="h-10 px-4 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="isUpdatingUsername" class="inline-flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  更新中...
                </span>
                <span v-else>更新</span>
              </button>
            </div>
            <!-- Username Update Message -->
            <div
              v-if="usernameMessage"
              :class="[
                'mt-3 p-3 rounded-lg',
                usernameMessageType === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              ]"
            >
              <p :class="['text-sm font-medium', usernameMessageType === 'success' ? 'text-green-800' : 'text-red-800']">
                {{ usernameMessage }}
              </p>
            </div>
          </div>

          <!-- Display Name Section -->
          <div>
            <label for="displayName" class="block text-sm font-medium text-gray-700 mb-2">
              表示名
            </label>
            <div class="flex space-x-3">
              <div class="flex-1">
                <input
                  id="displayName"
                  v-model="displayNameForm.displayName"
                  type="text"
                  placeholder="表示名"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-300': displayNameForm.error }"
                >
                <div v-if="displayNameForm.error" class="mt-1 text-sm text-red-600">
                  {{ displayNameForm.error }}
                </div>
                <div class="mt-1 text-xs text-gray-500">
                  1-50文字、プロフィールに表示される名前
                </div>
              </div>
              <button
                @click="updateDisplayName"
                :disabled="!canUpdateDisplayName || isUpdatingDisplayName"
                class="h-10 px-4 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="isUpdatingDisplayName" class="inline-flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 74 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  更新中...
                </span>
                <span v-else>更新</span>
              </button>
            </div>
            <!-- DisplayName Update Message -->
            <div
              v-if="displayNameMessage"
              :class="[
                'mt-3 p-3 rounded-lg',
                displayNameMessageType === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              ]"
            >
              <p :class="['text-sm font-medium', displayNameMessageType === 'success' ? 'text-green-800' : 'text-red-800']">
                {{ displayNameMessage }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Information -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-6">アカウント情報</h2>

        <!-- Current Email -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">現在のメールアドレス</label>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-3">
              <span class="text-gray-900" data-testid="current-email">{{ user?.email }}</span>
              <span
                v-if="user?.emailVerified"
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                認証済み
              </span>
              <span
                v-else
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                data-testid="email-verification-warning"
              >
                未認証
              </span>
            </div>
            <button
              v-if="!user?.emailVerified"
              @click="resendVerification"
              :disabled="authLoading"
              class="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              data-testid="resend-verification"
            >
              <span v-if="verificationSent">送信済み</span>
              <span v-else>認証メールを再送</span>
            </button>
          </div>
          <div v-if="verificationSent" class="mt-2 p-3 bg-blue-50 rounded-lg" data-testid="verification-sent">
            <p class="text-sm text-blue-800">認証メールを送信しました。メールをご確認ください。</p>
          </div>
        </div>

        <!-- Change Email -->
        <div class="mb-6">
          <label for="newEmail" class="block text-sm font-medium text-gray-700 mb-2">新しいメールアドレス</label>
          <form @submit.prevent="updateEmail" class="flex space-x-3">
            <input
              id="newEmail"
              v-model="emailForm.newEmail"
              type="email"
              placeholder="new@example.com"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              data-testid="new-email-input"
            >
            <button
              type="submit"
              :disabled="!emailForm.newEmail || authLoading"
              class="px-4 py-2 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              data-testid="update-email"
            >
              変更
            </button>
          </form>
        </div>

        <!-- Change Password -->
        <div>
          <h3 class="text-base font-medium text-gray-900 mb-4">パスワード変更</h3>
          <form @submit.prevent="updatePassword" class="space-y-4">
            <div>
              <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">現在のパスワード</label>
              <input
                id="currentPassword"
                v-model="passwordForm.currentPassword"
                type="password"
                autocomplete="current-password"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                data-testid="current-password"
              >
            </div>
            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">新しいパスワード</label>
              <input
                id="newPassword"
                v-model="passwordForm.newPassword"
                type="password"
                autocomplete="new-password"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                data-testid="new-password"
              >
            </div>
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">新しいパスワード（確認）</label>
              <input
                id="confirmPassword"
                v-model="passwordForm.confirmPassword"
                type="password"
                autocomplete="new-password"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                data-testid="confirm-password"
              >
            </div>
            <button
              type="submit"
              :disabled="!isPasswordFormValid || authLoading"
              class="px-4 py-2 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              data-testid="update-password"
            >
              パスワードを変更
            </button>

            <!-- Password Change Feedback -->
            <div
              v-if="passwordChangeMessage"
              :class="[
                'mt-4 p-4 rounded-lg',
                passwordChangeType === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              ]"
              data-testid="password-change-message"
            >
              <div class="flex items-start">
                <!-- Success Icon -->
                <svg
                  v-if="passwordChangeType === 'success'"
                  class="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <!-- Error Icon -->
                <svg
                  v-else
                  class="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <!-- Message Text -->
                <p
                  :class="[
                    'text-sm font-medium',
                    passwordChangeType === 'success' ? 'text-green-800' : 'text-red-800'
                  ]"
                >
                  {{ passwordChangeMessage }}
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="bg-white rounded-lg border border-red-200 p-6" data-testid="delete-account-section">
        <h2 class="text-lg font-medium text-red-900 mb-4">危険な操作</h2>

        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-red-900 mb-2">アカウントの削除</h3>
            <p class="text-red-700 text-sm mb-4">
              アカウントを削除すると、プロフィール、記事、コメントなどのすべてのデータが完全に削除され、復元できません。
            </p>

            <button
              @click="showDeleteConfirmation = true"
              class="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              data-testid="delete-account-button"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              アカウントを削除
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div
        v-if="showDeleteConfirmation"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showDeleteConfirmation = false"></div>
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" data-testid="delete-confirmation-modal">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    アカウントの削除
                  </h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      この操作は取り消せません。すべてのデータが完全に削除されます。
                    </p>
                    <p class="text-sm text-gray-500 mt-2">
                      続行するには「<strong>DELETE</strong>」と入力してください。
                    </p>
                    <input
                      v-model="deleteConfirmationText"
                      type="text"
                      placeholder="DELETE"
                      class="mt-3 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      data-testid="delete-confirmation-input"
                    >
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                @click="confirmDeleteAccount"
                :disabled="deleteConfirmationText !== 'DELETE' || authLoading"
                class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors"
                data-testid="confirm-delete-button"
              >
                <span v-if="authLoading">削除中...</span>
                <span v-else>削除する</span>
              </button>
              <button
                @click="showDeleteConfirmation = false"
                class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useUsers } from '~/composables/useUsers'

// SEO
useHead({
  title: '設定 - Article Platform',
  meta: [
    {
      name: 'description',
      content: 'アカウント設定とプライバシー設定を管理します。'
    }
  ]
})

// Router
const router = useRouter()

// Composables
const {
  user,
  isLoggedIn,
  updateEmail: updateUserEmail,
  updatePassword: updateUserPassword,
  sendEmailVerification,
  deleteAccount,
  reauthenticate,
  uploadUserIcon,
  deleteUserIcon,
  loading: authLoading
} = useAuth()
const {
  deleteUserData,
  getUserProfile,
  updateUserProfile,
  validateUsername,
  checkUsernameAvailability
} = useUsers()

// State
const emailForm = ref({
  newEmail: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const verificationSent = ref(false)
const showDeleteConfirmation = ref(false)
const deleteConfirmationText = ref('')

// Icon upload state
const selectedIconFile = ref(null)
const isUploadingIcon = ref(false)
const isDeletingIcon = ref(false)
const iconFileInput = ref(null)

// Bio form state
const bioForm = ref({
  bio: ''
})
const isUpdatingBio = ref(false)
const bioMessage = ref(null)
const bioMessageType = ref('success') // 'success' or 'error'

// Username form state
const usernameForm = ref({
  username: '',
  originalUsername: '',
  status: '', // 'checking', 'available', 'taken', 'unchanged'
  error: ''
})
const isUpdatingUsername = ref(false)
const usernameMessage = ref(null)
const usernameMessageType = ref('success') // 'success' or 'error'
let usernameCheckTimeout = null

// DisplayName form state
const displayNameForm = ref({
  displayName: '',
  originalDisplayName: '',
  error: ''
})
const isUpdatingDisplayName = ref(false)
const displayNameMessage = ref(null)
const displayNameMessageType = ref('success') // 'success' or 'error'

// Password change feedback
const passwordChangeMessage = ref(null)
const passwordChangeType = ref('success') // 'success' or 'error'

// Computed
const isPasswordFormValid = computed(() => {
  return passwordForm.value.currentPassword &&
         passwordForm.value.newPassword &&
         passwordForm.value.confirmPassword &&
         passwordForm.value.newPassword === passwordForm.value.confirmPassword &&
         passwordForm.value.newPassword.length >= 6
})

const canUpdateUsername = computed(() => {
  return usernameForm.value.username &&
         usernameForm.value.username !== usernameForm.value.originalUsername &&
         usernameForm.value.status === 'available' &&
         !usernameForm.value.error
})

const canUpdateDisplayName = computed(() => {
  return displayNameForm.value.displayName &&
         displayNameForm.value.displayName !== displayNameForm.value.originalDisplayName &&
         !displayNameForm.value.error
})

// Methods
const updateEmail = async () => {
  if (!emailForm.value.newEmail) return

  try {
    await updateUserEmail(emailForm.value.newEmail)
    emailForm.value.newEmail = ''
    // TODO: Show success message
    console.log('Email updated successfully')
  } catch (error) {
    console.error('Failed to update email:', error)
    // TODO: Show error message
  }
}

const updatePassword = async () => {
  if (!isPasswordFormValid.value) return

  // Clear previous messages
  passwordChangeMessage.value = null

  try {
    // Reauthenticate first
    await reauthenticate(passwordForm.value.currentPassword)

    // Update password
    await updateUserPassword(passwordForm.value.newPassword)

    // Clear form
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }

    // Show success message
    passwordChangeType.value = 'success'
    passwordChangeMessage.value = 'パスワードを変更しました。'

    // Auto-hide after 5 seconds
    setTimeout(() => {
      passwordChangeMessage.value = null
    }, 5000)
  } catch (error) {
    console.error('Failed to update password:', error)

    // Show error message
    passwordChangeType.value = 'error'

    // Determine error message based on error code
    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      passwordChangeMessage.value = '現在のパスワードが正しくありません。'
    } else if (error.code === 'auth/weak-password') {
      passwordChangeMessage.value = '新しいパスワードは6文字以上で設定してください。'
    } else if (error.code === 'auth/requires-recent-login') {
      passwordChangeMessage.value = 'セキュリティのため、再度ログインしてからパスワードを変更してください。'
    } else {
      passwordChangeMessage.value = 'パスワードの変更に失敗しました。'
    }

    // Auto-hide after 8 seconds
    setTimeout(() => {
      passwordChangeMessage.value = null
    }, 8000)
  }
}

const resendVerification = async () => {
  try {
    await sendEmailVerification()
    verificationSent.value = true
    setTimeout(() => {
      verificationSent.value = false
    }, 5000)
  } catch (error) {
    console.error('Failed to send verification email:', error)
  }
}

const confirmDeleteAccount = async () => {
  if (deleteConfirmationText.value !== 'DELETE' || !user.value) return

  try {
    // First delete user data from Firestore
    await deleteUserData(user.value.uid)

    // Then delete the auth account
    await deleteAccount()

    // Redirect to home page
    await router.push('/')
  } catch (error) {
    console.error('Failed to delete account:', error)
    // TODO: Show error message
  } finally {
    showDeleteConfirmation.value = false
    deleteConfirmationText.value = ''
  }
}

// Icon upload methods
const handleIconFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    selectedIconFile.value = file
  }
}

const uploadIcon = async () => {
  if (!selectedIconFile.value) return

  try {
    isUploadingIcon.value = true
    await uploadUserIcon(selectedIconFile.value)

    // Clear selected file and reset input
    selectedIconFile.value = null
    if (iconFileInput.value) {
      iconFileInput.value.value = ''
    }

    console.log('Icon uploaded successfully')
  } catch (error) {
    console.error('Failed to upload icon:', error)
    // TODO: Show error message
  } finally {
    isUploadingIcon.value = false
  }
}

const deleteIcon = async () => {
  try {
    isDeletingIcon.value = true
    await deleteUserIcon()
    console.log('Icon deleted successfully')
  } catch (error) {
    console.error('Failed to delete icon:', error)
    // TODO: Show error message
  } finally {
    isDeletingIcon.value = false
  }
}

// Bio update method
const updateBio = async () => {
  if (!user.value) return

  try {
    isUpdatingBio.value = true
    bioMessage.value = null

    await updateUserProfile(user.value.uid, {
      bio: bioForm.value.bio || ''
    })

    // Show success message
    bioMessageType.value = 'success'
    bioMessage.value = '自己紹介を更新しました。'

    // Auto-hide after 5 seconds
    setTimeout(() => {
      bioMessage.value = null
    }, 5000)
  } catch (error) {
    console.error('Failed to update bio:', error)

    // Show error message
    bioMessageType.value = 'error'
    bioMessage.value = '自己紹介の更新に失敗しました。'

    // Auto-hide after 8 seconds
    setTimeout(() => {
      bioMessage.value = null
    }, 8000)
  } finally {
    isUpdatingBio.value = false
  }
}

// Username methods
const handleUsernameInput = () => {
  const username = usernameForm.value.username.toLowerCase().trim()
  usernameForm.value.username = username
  usernameForm.value.error = ''
  usernameForm.value.status = ''

  // Clear previous timeout
  if (usernameCheckTimeout) {
    clearTimeout(usernameCheckTimeout)
  }

  // If username is the same as original, mark as unchanged
  if (username === usernameForm.value.originalUsername) {
    usernameForm.value.status = 'unchanged'
    return
  }

  // Validate format
  try {
    validateUsername(username)
  } catch (error) {
    if (error.message.includes('required')) {
      usernameForm.value.error = 'ユーザー名は必須です'
    } else if (error.message.includes('too-short')) {
      usernameForm.value.error = 'ユーザー名は3文字以上で入力してください'
    } else if (error.message.includes('too-long')) {
      usernameForm.value.error = 'ユーザー名は20文字以内で入力してください'
    } else if (error.message.includes('invalid')) {
      usernameForm.value.error = 'ユーザー名は英数字・アンダースコア・ハイフンのみ使用できます'
    }
    return
  }

  // Check availability with debouncing
  usernameForm.value.status = 'checking'
  usernameCheckTimeout = setTimeout(async () => {
    try {
      const isAvailable = await checkUsernameAvailability(username)
      if (usernameForm.value.username === username) { // Only update if username hasn't changed
        usernameForm.value.status = isAvailable ? 'available' : 'taken'
      }
    } catch (error) {
      console.error('Failed to check username availability:', error)
      usernameForm.value.error = 'ユーザー名の確認に失敗しました'
    }
  }, 500)
}

const updateUsername = async () => {
  if (!user.value || !canUpdateUsername.value) return

  try {
    isUpdatingUsername.value = true
    usernameMessage.value = null

    await updateUserProfile(user.value.uid, {
      username: usernameForm.value.username.toLowerCase()
    })

    // Update original username
    usernameForm.value.originalUsername = usernameForm.value.username.toLowerCase()
    usernameForm.value.status = 'unchanged'

    // Show success message
    usernameMessageType.value = 'success'
    usernameMessage.value = 'ユーザー名を更新しました。'

    // Auto-hide after 5 seconds
    setTimeout(() => {
      usernameMessage.value = null
    }, 5000)
  } catch (error) {
    console.error('Failed to update username:', error)

    // Show error message
    usernameMessageType.value = 'error'
    usernameMessage.value = 'ユーザー名の更新に失敗しました。'

    // Auto-hide after 8 seconds
    setTimeout(() => {
      usernameMessage.value = null
    }, 8000)
  } finally {
    isUpdatingUsername.value = false
  }
}

// DisplayName methods
const updateDisplayName = async () => {
  if (!user.value || !canUpdateDisplayName.value) return

  // Validate displayName
  if (!displayNameForm.value.displayName.trim()) {
    displayNameForm.value.error = '表示名は必須です'
    return
  }

  if (displayNameForm.value.displayName.trim().length > 50) {
    displayNameForm.value.error = '表示名は50文字以内で入力してください'
    return
  }

  try {
    isUpdatingDisplayName.value = true
    displayNameForm.value.error = ''
    displayNameMessage.value = null

    await updateUserProfile(user.value.uid, {
      displayName: displayNameForm.value.displayName.trim()
    })

    // Update original displayName
    displayNameForm.value.originalDisplayName = displayNameForm.value.displayName.trim()

    // Show success message
    displayNameMessageType.value = 'success'
    displayNameMessage.value = '表示名を更新しました。'

    // Auto-hide after 5 seconds
    setTimeout(() => {
      displayNameMessage.value = null
    }, 5000)
  } catch (error) {
    console.error('Failed to update display name:', error)

    // Show error message
    displayNameMessageType.value = 'error'
    displayNameMessage.value = '表示名の更新に失敗しました。'

    // Auto-hide after 8 seconds
    setTimeout(() => {
      displayNameMessage.value = null
    }, 8000)
  } finally {
    isUpdatingDisplayName.value = false
  }
}

// Utility function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Load user data
const loadUserData = async () => {
  if (!user.value) return

  try {
    console.log('📝 Loading user data for:', user.value.uid)
    const userProfile = await getUserProfile(user.value.uid)
    console.log('📝 User profile loaded:', userProfile)

    // Load bio
    if (userProfile && userProfile.bio) {
      bioForm.value.bio = userProfile.bio
      console.log('📝 Bio loaded:', userProfile.bio)
    } else {
      bioForm.value.bio = ''
      console.log('📝 No bio found, setting empty string')
    }

    // Load username
    if (userProfile && userProfile.username) {
      usernameForm.value.username = userProfile.username
      usernameForm.value.originalUsername = userProfile.username
      usernameForm.value.status = 'unchanged'
      console.log('📝 Username loaded:', userProfile.username)
    }

    // Load displayName
    if (userProfile && userProfile.displayName) {
      displayNameForm.value.displayName = userProfile.displayName
      displayNameForm.value.originalDisplayName = userProfile.displayName
      console.log('📝 DisplayName loaded:', userProfile.displayName)
    }
  } catch (error) {
    console.error('Failed to load user data:', error)
  }
}

// Watch user changes to load user data
watch(user, async (newUser) => {
  if (newUser) {
    console.log('👤 User changed, loading user data...')
    await loadUserData()
  }
}, { immediate: true })

// Lifecycle
onMounted(async () => {
  // Initial load if user is already available
  if (user.value) {
    console.log('📝 onMounted: User already available, loading user data')
    await loadUserData()
  }
})
</script>