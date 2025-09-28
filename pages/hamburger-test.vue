<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">ハンバーガーメニューテスト</h1>

    <!-- Simple Hamburger Test -->
    <div class="border p-4 mb-4">
      <h2 class="text-lg font-semibold mb-2">シンプルテスト</h2>
      <button
        @click="simpleToggle"
        class="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            v-if="!showSimple"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        シンプルメニュー
      </button>
      <div v-if="showSimple" class="mt-2 p-2 bg-gray-100 rounded">
        メニューが表示されました！
      </div>
      <p class="mt-2 text-sm text-gray-600">状態: {{ showSimple ? '開いている' : '閉じている' }}</p>
    </div>

    <!-- Original Header Test -->
    <div class="border p-4">
      <h2 class="text-lg font-semibold mb-2">オリジナルヘッダーテスト</h2>
      <AppHeader />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showSimple = ref(false)

const simpleToggle = () => {
  console.log('Simple hamburger clicked')
  showSimple.value = !showSimple.value
}
</script>