<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-4xl mx-auto px-4">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">テストページ</h1>
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <p class="text-lg text-gray-700">アプリケーションが正常に動作しています！</p>
        <div class="mt-4">
          <h2 class="text-xl font-semibold mb-2">ナビゲーションテスト</h2>
          <div class="space-x-4">
            <NuxtLink to="/" class="text-blue-600 hover:text-blue-800">ホーム</NuxtLink>
            <NuxtLink to="/explore" class="text-blue-600 hover:text-blue-800">発見</NuxtLink>
            <NuxtLink to="/login" class="text-blue-600 hover:text-blue-800">ログイン</NuxtLink>
            <NuxtLink to="/signup" class="text-blue-600 hover:text-blue-800">サインアップ</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'テストページ - Article Platform'
})
</script>