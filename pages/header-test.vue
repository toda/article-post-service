<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">ヘッダーリンクテスト</h1>

    <div class="bg-white p-6 rounded-lg shadow mb-6">
      <h2 class="text-lg font-semibold mb-4">テスト手順:</h2>
      <ol class="list-decimal pl-6 space-y-2">
        <li>ヘッダーの「ログイン」リンクをクリックしてください</li>
        <li>ヘッダーの「新規登録」リンクをクリックしてください</li>
        <li>ブラウザの開発者ツール（F12）のコンソールを確認してください</li>
        <li>各リンクがページ遷移するかどうかを確認してください</li>
      </ol>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-blue-50 p-4 rounded-lg">
        <h3 class="font-semibold text-blue-800">直接リンク</h3>
        <div class="mt-2 space-y-2">
          <NuxtLink to="/login" class="block text-blue-600 hover:text-blue-800">
            → /login ページ
          </NuxtLink>
          <NuxtLink to="/signup" class="block text-blue-600 hover:text-blue-800">
            → /signup ページ
          </NuxtLink>
        </div>
      </div>

      <div class="bg-green-50 p-4 rounded-lg">
        <h3 class="font-semibold text-green-800">ナビゲーション</h3>
        <div class="mt-2 space-y-2">
          <NuxtLink to="/" class="block text-green-600 hover:text-green-800">
            → ホーム
          </NuxtLink>
          <NuxtLink to="/explore" class="block text-green-600 hover:text-green-800">
            → 発見
          </NuxtLink>
          <NuxtLink to="/trending" class="block text-green-600 hover:text-green-800">
            → トレンド
          </NuxtLink>
        </div>
      </div>

      <div class="bg-yellow-50 p-4 rounded-lg">
        <h3 class="font-semibold text-yellow-800">ステータス</h3>
        <div class="mt-2 text-sm">
          <p>現在のページ: {{ route?.path }}</p>
          <p class="mt-1">日時: {{ new Date().toLocaleString() }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Router
const route = useRoute()

// Meta information
useHead({
  title: 'ヘッダーリンクテスト - Article Platform',
  meta: [
    { name: 'description', content: 'ヘッダーナビゲーションリンクの動作確認用ページ' }
  ]
})

console.log('Header test page loaded at:', new Date().toISOString())
</script>