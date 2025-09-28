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
        </div>

        <!-- Navigation Links - Desktop -->
        <nav class="hidden md:flex space-x-8">
          <NuxtLink to="/" class="text-gray-600 hover:text-gray-900 font-medium">ホーム</NuxtLink>
          <NuxtLink to="/explore" class="text-gray-600 hover:text-gray-900 font-medium">発見</NuxtLink>
          <NuxtLink to="/trending" class="text-gray-600 hover:text-gray-900 font-medium">トレンド</NuxtLink>
        </nav>

        <!-- Right Actions -->
        <div class="flex items-center space-x-4">
          <!-- Login/Register Buttons -->
          <div class="hidden md:flex items-center space-x-3">
            <NuxtLink to="/login" class="text-gray-600 hover:text-gray-900 font-medium">ログイン</NuxtLink>
            <NuxtLink to="/signup" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">新規登録</NuxtLink>
          </div>

          <!-- Mobile Menu Button -->
          <button
            @click="toggleMenu"
            class="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg border-2 border-red-500"
            type="button"
            aria-label="メニューを開く"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!isMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="isMenuOpen" class="md:hidden py-4 border-t border-gray-200 bg-yellow-100">
        <nav class="px-4 space-y-2">
          <NuxtLink to="/" class="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg" @click="closeMenu">ホーム</NuxtLink>
          <NuxtLink to="/explore" class="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg" @click="closeMenu">発見</NuxtLink>
          <NuxtLink to="/trending" class="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg" @click="closeMenu">トレンド</NuxtLink>

          <div class="pt-4 mt-4 border-t border-gray-200 space-y-2">
            <NuxtLink to="/login" class="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-center" @click="closeMenu">ログイン</NuxtLink>
            <NuxtLink to="/signup" class="block px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-center" @click="closeMenu">新規登録</NuxtLink>
          </div>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'

// State
const isMenuOpen = ref(false)

// Methods
const toggleMenu = () => {
  console.log('Menu toggle clicked - before:', isMenuOpen.value)
  isMenuOpen.value = !isMenuOpen.value
  console.log('Menu toggle clicked - after:', isMenuOpen.value)
}

const closeMenu = () => {
  console.log('Menu closed')
  isMenuOpen.value = false
}

// Log when component is mounted
console.log('AppHeaderSimple component mounted')
</script>