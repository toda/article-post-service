<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo and Brand -->
        <div class="flex items-center space-x-4">
          <NuxtLink to="/" class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">A</span>
            </div>
            <span class="text-xl font-bold text-gray-900 hidden sm:block">Article Platform</span>
          </NuxtLink>

          <!-- Navigation Links -->
          <nav class="hidden md:flex space-x-8 ml-8">
            <NuxtLink
              to="/trending"
              class="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              :class="{ 'text-blue-600': route.value?.path?.includes('trending') }"
            >
              トレンド
            </NuxtLink>
          </nav>
        </div>

        <!-- Search Bar -->
        <div class="flex-1 max-w-lg mx-8 hidden lg:block">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              type="text"
              placeholder="記事を検索..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
          </div>
        </div>

        <!-- Right Actions -->
        <div class="flex items-center space-x-4">
          <!-- Authenticated User Menu -->
          <div v-if="isLoggedIn && !authLoading" class="hidden md:flex items-center space-x-3">
            <NuxtLink
              to="/write"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              記事を書く
            </NuxtLink>
            <div class="relative flex items-center space-x-2">
              <!-- User Avatar -->
              <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <img
                  v-if="user?.avatarUrl"
                  :src="user.avatarUrl"
                  :alt="user.displayName || 'ユーザー'"
                  class="w-full h-full object-cover"
                >
                <svg
                  v-else
                  class="w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span class="text-gray-700 font-medium">{{ user?.displayName || 'ユーザー' }}</span>
            </div>
            <NuxtLink
              to="/settings"
              class="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              設定
            </NuxtLink>
            <button
              @click="handleLogout"
              class="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              ログアウト
            </button>
          </div>

          <!-- Guest User Menu -->
          <div v-else-if="!authLoading" class="hidden md:flex items-center space-x-3">
            <NuxtLink
              to="/login"
              class="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              ログイン
            </NuxtLink>
            <NuxtLink
              to="/signup"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              新規登録
            </NuxtLink>
          </div>

          <!-- Loading State -->
          <div v-else class="hidden md:flex items-center space-x-3">
            <div class="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
          </div>

          <!-- Mobile Menu Button -->
          <button
            @click="toggleMobileMenu"
            class="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            type="button"
            aria-label="メニューを開く"
          >
            <svg class="w-6 h-6 transition-transform duration-300" :class="{ 'rotate-90': showMobileMenu }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                v-if="!showMobileMenu"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
                class="transition-opacity duration-200"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
                class="transition-opacity duration-200"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="transform opacity-0 -translate-y-2"
        enter-to-class="transform opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="transform opacity-100 translate-y-0"
        leave-to-class="transform opacity-0 -translate-y-2"
      >
        <div v-if="showMobileMenu" class="md:hidden py-4 border-t border-gray-200 bg-white shadow-lg">
        <!-- Mobile Search -->
        <div class="px-4 mb-4">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              type="text"
              placeholder="記事を検索..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
          </div>
        </div>

        <!-- Mobile Navigation -->
        <nav class="px-4 space-y-1">
          <NuxtLink
            to="/trending"
            class="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-all duration-200 transform hover:translate-x-1"
            @click="closeMobileMenu"
          >
            トレンド
          </NuxtLink>

          <!-- Mobile Auth Buttons -->
          <div class="pt-4 mt-4 border-t border-gray-200 space-y-2">
            <!-- Authenticated User Menu -->
            <template v-if="isLoggedIn && !authLoading">
              <div class="px-3 py-2 text-gray-700 font-medium text-center bg-gray-50 rounded-lg flex items-center justify-center space-x-2">
                <!-- User Avatar -->
                <div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  <img
                    v-if="user?.avatarUrl"
                    :src="user.avatarUrl"
                    :alt="user.displayName || 'ユーザー'"
                    class="w-full h-full object-cover"
                  >
                  <svg
                    v-else
                    class="w-3 h-3 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span>{{ user?.displayName || 'ユーザー' }}</span>
              </div>
              <NuxtLink
                to="/write"
                class="block px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors text-center"
                @click="closeMobileMenu"
              >
                記事を書く
              </NuxtLink>
              <NuxtLink
                to="/settings"
                class="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors text-center"
                @click="closeMobileMenu"
              >
                設定
              </NuxtLink>
              <button
                @click="handleLogout"
                class="w-full px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors text-center"
              >
                ログアウト
              </button>
            </template>

            <!-- Guest User Menu -->
            <template v-else-if="!authLoading">
              <NuxtLink
                to="/login"
                class="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors text-center"
                @click="closeMobileMenu"
              >
                ログイン
              </NuxtLink>
              <NuxtLink
                to="/signup"
                class="block px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors text-center"
                @click="closeMobileMenu"
              >
                新規登録
              </NuxtLink>
            </template>

            <!-- Loading State -->
            <template v-else>
              <div class="px-3 py-2 text-center">
                <div class="animate-pulse bg-gray-200 h-4 w-20 rounded mx-auto"></div>
              </div>
            </template>
          </div>
        </nav>
        </div>
      </Transition>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'

// Router - safe handling for SSR
const route = computed(() => {
  if (process.client) {
    try {
      return useRoute() || { path: '/', query: {} }
    } catch {
      return { path: '/', query: {} }
    }
  }
  return { path: '/', query: {} }
})

// Authentication
const { user, isLoggedIn, authLoading, signOut } = useAuth()

// Watch authentication state changes (SSR-safe)
import { watch, onMounted } from 'vue'

// Only setup watchers on client side to avoid SSR issues
onMounted(() => {
  if (process.client) {
    watch(() => isLoggedIn?.value, (newValue, oldValue) => {
      console.log('🎭 APPHEADER - isLoggedIn changed:', { from: oldValue, to: newValue })
    }, { immediate: true })

    watch(() => user?.value, (newValue, oldValue) => {
      console.log('🎭 APPHEADER - user changed:', {
        from: oldValue ? oldValue.displayName : 'null',
        to: newValue ? newValue.displayName : 'null'
      })
    }, { immediate: true })

    watch(() => authLoading?.value, (newValue, oldValue) => {
      console.log('🎭 APPHEADER - authLoading changed:', { from: oldValue, to: newValue })
    }, { immediate: true })
  }
})

onMounted(() => {
  console.log('🎭 APPHEADER - Component mounted with auth state:', {
    isLoggedIn: isLoggedIn?.value || false,
    user: user?.value ? user.value.displayName : 'null',
    authLoading: authLoading?.value || false
  })
})

// Search
const searchQuery = ref('')

// Mobile menu state
const showMobileMenu = ref(false)

// Router
const router = useRouter()

// Methods
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchQuery.value.trim() }
    })
    searchQuery.value = ''
    closeMobileMenu()
  }
}

const toggleMobileMenu = () => {
  console.log('Hamburger menu clicked, current state:', showMobileMenu.value)
  showMobileMenu.value = !showMobileMenu.value
  console.log('Hamburger menu new state:', showMobileMenu.value)
}

const closeMobileMenu = () => {
  console.log('Mobile menu closed')
  showMobileMenu.value = false
}

const handleLogout = async () => {
  try {
    await signOut()
    await router.push('/')
    closeMobileMenu()
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// Log when component is mounted
console.log('AppHeader component mounted')
</script>