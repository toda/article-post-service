<template>
  <div class="max-w-4xl mx-auto">
    <!-- Loading State -->
    <div v-if="loading" class="animate-pulse">
      <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div class="flex items-start space-x-6">
          <div class="w-24 h-24 bg-gray-200 rounded-full"></div>
          <div class="flex-1">
            <div class="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Not Public (Privacy Setting) -->
    <div v-else-if="userProfile && !isProfileAccessible" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">このプロフィールは非公開です</h3>
      <p class="text-gray-500 mb-6">このユーザーはプロフィールを非公開に設定しています。</p>
      <NuxtLink
        to="/"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        ホームに戻る
      </NuxtLink>
    </div>

    <!-- User Profile -->
    <div v-else-if="userProfile && isProfileAccessible" class="space-y-6">
      <!-- Profile Header -->
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden" data-testid="profile-header">
        <!-- Cover/Background -->
        <div class="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

        <!-- Profile Content -->
        <div class="p-6 -mt-16 relative">
          <div class="flex flex-col md:flex-row md:items-end md:space-x-6">
            <!-- Avatar -->
            <div class="relative">
              <img
                v-if="userProfile.avatarUrl"
                :src="userProfile.avatarUrl"
                :alt="userProfile.displayName"
                class="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                data-testid="profile-avatar"
              >
              <div
                v-else
                class="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-300 flex items-center justify-center"
                data-testid="profile-avatar"
              >
                <span class="text-gray-600 text-2xl font-bold">
                  {{ userProfile.displayName?.charAt(0).toUpperCase() }}
                </span>
              </div>
            </div>

            <!-- Profile Info -->
            <div class="flex-1 mt-4 md:mt-0">
              <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 class="text-2xl font-bold text-gray-900" data-testid="profile-name">
                    {{ userProfile.displayName }}
                  </h1>
                  <p v-if="userProfile.bio" class="text-gray-600 mt-1" data-testid="profile-bio">
                    {{ userProfile.bio }}
                  </p>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center space-x-3 mt-4 md:mt-0">
                  <!-- Edit Profile Button (if own profile) -->
                  <NuxtLink
                    v-if="isOwnProfile"
                    to="/settings"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    data-testid="edit-profile-button"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    設定
                  </NuxtLink>

                  <!-- Follow/Unfollow Button (if other user and follow is allowed) -->
                  <button
                    v-else-if="isLoggedIn && isFollowAllowed"
                    @click="toggleFollow"
                    :disabled="followLoading"
                    class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                    :class="[
                      userProfile.isFollowing
                        ? 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500'
                        : 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                    ]"
                    data-testid="follow-button"
                  >
                    <svg v-if="!userProfile.isFollowing" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span v-if="followLoading">処理中...</span>
                    <span v-else-if="userProfile.isFollowing">フォロー中</span>
                    <span v-else>フォロー</span>
                  </button>

                  <!-- Share Profile Button -->
                  <button
                    @click="shareProfile"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    共有
                  </button>
                </div>
              </div>

              <!-- Profile Meta -->
              <div class="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
                <div v-if="userProfile.location" class="flex items-center space-x-1" data-testid="profile-location">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{{ userProfile.location }}</span>
                </div>

                <div v-if="userProfile.website" class="flex items-center space-x-1" data-testid="profile-website">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <a :href="userProfile.website" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 transition-colors">
                    {{ formatWebsiteUrl(userProfile.website) }}
                  </a>
                </div>

                <div v-if="userProfile.twitterHandle" class="flex items-center space-x-1" data-testid="profile-twitter">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                  <a :href="`https://twitter.com/${userProfile.twitterHandle.replace('@', '')}`" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 transition-colors">
                    {{ userProfile.twitterHandle }}
                  </a>
                </div>

                <div v-if="userProfile.githubHandle" class="flex items-center space-x-1" data-testid="profile-github">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
                  </svg>
                  <a :href="`https://github.com/${userProfile.githubHandle}`" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 transition-colors">
                    {{ userProfile.githubHandle }}
                  </a>
                </div>

                <div class="flex items-center space-x-1" data-testid="profile-joined">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{{ formatJoinDate(userProfile.joinedAt || userProfile.createdAt) }}に参加</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats (shown only if stats display is enabled or own profile) -->
      <div v-if="isStatsVisible" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg border border-gray-200 p-6 text-center" data-testid="stat-articles">
          <div class="text-2xl font-bold text-gray-900">{{ formatNumber(userProfile.articleCount || 0) }}</div>
          <div class="text-sm text-gray-600">記事</div>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-6 text-center" data-testid="stat-followers">
          <div class="text-2xl font-bold text-gray-900">{{ formatNumber(userProfile.followerCount || 0) }}</div>
          <div class="text-sm text-gray-600">フォロワー</div>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-6 text-center" data-testid="stat-following">
          <div class="text-2xl font-bold text-gray-900">{{ formatNumber(userProfile.followingCount || 0) }}</div>
          <div class="text-sm text-gray-600">フォロー中</div>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div class="text-2xl font-bold text-gray-900">{{ formatNumber(userProfile.totalLikes || 0) }}</div>
          <div class="text-sm text-gray-600">いいね</div>
        </div>
      </div>

      <!-- Activity Dashboard (if own profile) -->
      <div v-if="isOwnProfile && userStats" class="bg-white rounded-lg border border-gray-200 p-6" data-testid="activity-dashboard">
        <h2 class="text-xl font-bold text-gray-900 mb-6">アクティビティ</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Total Views -->
          <div data-testid="total-views">
            <div class="text-sm font-medium text-gray-500">総ビュー数</div>
            <div class="text-2xl font-bold text-gray-900">{{ formatNumber(userStats.totalViews) }}</div>
          </div>

          <!-- Total Likes -->
          <div data-testid="total-likes">
            <div class="text-sm font-medium text-gray-500">総いいね数</div>
            <div class="text-2xl font-bold text-gray-900">{{ formatNumber(userStats.totalLikes) }}</div>
          </div>
        </div>

        <!-- Activity Chart placeholder -->
        <div class="mt-6" data-testid="activity-chart">
          <div class="text-sm font-medium text-gray-500 mb-3">月別ビュー数</div>
          <div class="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <span class="text-gray-500">チャート表示エリア</span>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="mt-6" data-testid="recent-activity">
          <div class="text-sm font-medium text-gray-500 mb-3">最近のアクティビティ</div>
          <div v-if="userStats.recentActivity && userStats.recentActivity.length > 0" class="space-y-2">
            <div
              v-for="activity in userStats.recentActivity"
              :key="activity.timestamp"
              class="flex items-center space-x-3 text-sm"
            >
              <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span class="text-gray-600">{{ formatActivityDate(activity.timestamp) }}</span>
              <span class="text-gray-900">{{ activity.articleTitle }}を公開しました</span>
            </div>
          </div>
          <div v-else class="text-sm text-gray-500">最近のアクティビティはありません</div>
        </div>
      </div>

      <!-- User Articles -->
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden" data-testid="user-articles">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">記事一覧</h2>
        </div>

        <!-- Articles Loading -->
        <div v-if="articlesLoading" class="p-6">
          <div v-for="i in 3" :key="i" class="animate-pulse mb-4 last:mb-0">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-full mb-1"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>

        <!-- Articles List -->
        <div v-else-if="userArticles.length > 0">
          <div class="divide-y divide-gray-200">
            <ArticleListItem
              v-for="article in userArticles"
              :key="article.id"
              :article="article"
              data-testid="article-card"
            />
          </div>

          <!-- Load More Button -->
          <div v-if="hasMoreArticles" class="p-6 text-center border-t border-gray-200">
            <button
              @click="loadMoreArticles"
              :disabled="loadingMoreArticles"
              class="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="loadingMoreArticles" class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span v-if="loadingMoreArticles">読み込み中...</span>
              <span v-else>さらに読み込む</span>
            </button>
          </div>
        </div>

        <!-- Empty Articles -->
        <div v-else class="p-6 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">記事がありません</h3>
          <p class="text-gray-500 mb-4">
            <span v-if="isOwnProfile">まだ記事を投稿していません。最初の記事を書いてみませんか？</span>
            <span v-else>このユーザーはまだ記事を投稿していません。</span>
          </p>
          <NuxtLink
            v-if="isOwnProfile"
            to="/write"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            記事を書く
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">ユーザーが見つかりません</h3>
      <p class="text-gray-500 mb-4">指定されたユーザーは存在しないか、削除された可能性があります。</p>
      <NuxtLink
        to="/"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        ホームに戻る
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useUsers } from '~/composables/useUsers'
import { useArticles } from '~/composables/useArticles'

// Get route and username
const route = useRoute()
const username = route.params.username

// Composables
const { user, isLoggedIn } = useAuth()
const {
  getUserProfile,
  getUserProfileByUsername,
  followUser,
  unfollowUser,
  getUserStats,
  loading,
  error
} = useUsers()
const {
  getUserArticles,
  loading: articlesLoading
} = useArticles()

// State
const userProfile = ref(null)
const userStats = ref(null)
const userArticles = ref([])
const followLoading = ref(false)
const hasMoreArticles = ref(false)
const loadingMoreArticles = ref(false)
const lastArticleDoc = ref(null)

// Computed
const isOwnProfile = computed(() => {
  return isLoggedIn.value && user.value && userProfile.value && user.value.uid === userProfile.value.uid
})

// Check if profile is accessible (public or own profile)
const isProfileAccessible = computed(() => {
  if (!userProfile.value) return false

  // Own profile is always accessible
  if (isOwnProfile.value) return true

  // Check privacy settings
  const privacySettings = userProfile.value.privacySettings || {}

  // Default to true if privacy settings not set (for backward compatibility)
  return privacySettings.profilePublic !== false
})

// Check if follow is allowed
const isFollowAllowed = computed(() => {
  if (!userProfile.value || isOwnProfile.value) return false

  // Check privacy settings
  const privacySettings = userProfile.value.privacySettings || {}

  // Default to true if privacy settings not set (for backward compatibility)
  return privacySettings.allowFollow !== false
})

// Check if stats should be visible
const isStatsVisible = computed(() => {
  if (!userProfile.value) return false

  // Own profile stats are always visible
  if (isOwnProfile.value) return true

  // Check privacy settings
  const privacySettings = userProfile.value.privacySettings || {}

  // Default to true if privacy settings not set (for backward compatibility)
  return privacySettings.showStats !== false
})

// Methods
const formatNumber = (num) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

const formatJoinDate = (date) => {
  if (!date) return ''

  // Handle Firestore Timestamp
  let joinDate
  if (date?.toDate && typeof date.toDate === 'function') {
    joinDate = date.toDate()
  } else if (date?.seconds) {
    joinDate = new Date(date.seconds * 1000)
  } else if (date instanceof Date) {
    joinDate = date
  } else {
    joinDate = new Date(date)
  }

  // Check if valid date
  if (isNaN(joinDate.getTime())) {
    return ''
  }

  return joinDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long'
  })
}

const formatActivityDate = (date) => {
  if (!date) return ''

  // Handle Firestore Timestamp
  let activityDate
  if (date?.toDate && typeof date.toDate === 'function') {
    activityDate = date.toDate()
  } else if (date?.seconds) {
    activityDate = new Date(date.seconds * 1000)
  } else if (date instanceof Date) {
    activityDate = date
  } else {
    activityDate = new Date(date)
  }

  // Check if valid date
  if (isNaN(activityDate.getTime())) {
    return ''
  }

  return activityDate.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric'
  })
}

const formatWebsiteUrl = (url) => {
  if (!url) return ''
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

const toggleFollow = async () => {
  if (!isLoggedIn.value || !userProfile.value) return

  followLoading.value = true
  try {
    if (userProfile.value.isFollowing) {
      await unfollowUser(userProfile.value.uid)
      userProfile.value.isFollowing = false
      userProfile.value.followerCount = Math.max(0, (userProfile.value.followerCount || 0) - 1)
    } else {
      await followUser(userProfile.value.uid)
      userProfile.value.isFollowing = true
      userProfile.value.followerCount = (userProfile.value.followerCount || 0) + 1
    }
  } catch (error) {
    console.error('Follow toggle failed:', error)
  } finally {
    followLoading.value = false
  }
}

const shareProfile = async () => {
  const shareData = {
    title: `${userProfile.value.displayName}のプロフィール`,
    text: userProfile.value.bio || `${userProfile.value.displayName}さんをフォローしよう`,
    url: window.location.href
  }

  if (navigator.share) {
    try {
      await navigator.share(shareData)
    } catch (error) {
      console.error('Share failed:', error)
    }
  } else {
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href)
      // TODO: Show toast notification
      console.log('Profile URL copied to clipboard')
    } catch (error) {
      console.error('Copy to clipboard failed:', error)
    }
  }
}

const loadUserProfile = async () => {
  try {
    userProfile.value = await getUserProfileByUsername(username)

    // Load user stats if own profile
    if (isOwnProfile.value) {
      userStats.value = await getUserStats(userProfile.value.uid)
    }
  } catch (error) {
    console.error('Failed to load user profile:', error)
  }
}

const loadUserArticles = async () => {
  if (!userProfile.value) return

  try {
    // Always show only public articles
    const result = await getUserArticles(userProfile.value.uid, {
      isPublic: true,
      limit: 20
    })
    userArticles.value = result.articles
    hasMoreArticles.value = result.hasNext
    lastArticleDoc.value = result.nextCursor
  } catch (error) {
    console.error('Failed to load user articles:', error)
  }
}

const loadMoreArticles = async () => {
  if (!hasMoreArticles.value || loadingMoreArticles.value || !userProfile.value) return

  try {
    loadingMoreArticles.value = true
    // Always show only public articles
    const result = await getUserArticles(userProfile.value.uid, {
      isPublic: true,
      limit: 20,
      startAfter: lastArticleDoc.value
    })

    userArticles.value = [...userArticles.value, ...result.articles]
    hasMoreArticles.value = result.hasNext
    lastArticleDoc.value = result.nextCursor
  } catch (error) {
    console.error('Failed to load more articles:', error)
  } finally {
    loadingMoreArticles.value = false
  }
}

// SEO
watch(userProfile, (newProfile) => {
  if (newProfile) {
    useHead({
      title: `${newProfile.displayName} - Article Platform`,
      meta: [
        {
          name: 'description',
          content: newProfile.bio || `${newProfile.displayName}のプロフィールページ`
        },
        {
          property: 'og:title',
          content: `${newProfile.displayName}のプロフィール`
        },
        {
          property: 'og:description',
          content: newProfile.bio || `${newProfile.displayName}さんをフォローしよう`
        }
      ]
    })
  }
})

// Watch for route changes (user navigation or refresh)
watch(() => route.params.username, async (newUsername, oldUsername) => {
  if (newUsername && newUsername !== oldUsername) {
    await loadUserProfile()
    await loadUserArticles()
  }
})

// Watch for auth state changes
watch([user, isLoggedIn], async ([newUser, newIsLoggedIn]) => {
  // Reload profile when auth state changes to get correct follow status
  if (userProfile.value) {
    await loadUserProfile()
  }
})

// Lifecycle
onMounted(async () => {
  // Wait a bit for auth to initialize
  await new Promise(resolve => setTimeout(resolve, 100))

  await loadUserProfile()
  await loadUserArticles()
})
</script>