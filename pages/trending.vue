<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">トレンド記事</h1>
        <p class="text-gray-600">人気の記事やトレンドをチェックしよう</p>
      </div>

      <!-- Trending Categories -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div class="flex items-center mb-4">
            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 class="ml-3 text-lg font-semibold text-gray-900">急上昇</h3>
          </div>
          <p class="text-gray-600 text-sm">今最も注目されている記事</p>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div class="flex items-center mb-4">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 class="ml-3 text-lg font-semibold text-gray-900">週間人気</h3>
          </div>
          <p class="text-gray-600 text-sm">この1週間で人気の記事</p>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div class="flex items-center mb-4">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 class="ml-3 text-lg font-semibold text-gray-900">編集部おすすめ</h3>
          </div>
          <p class="text-gray-600 text-sm">編集部が厳選した記事</p>
        </div>
      </div>

      <!-- Trending Articles -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">トレンド記事一覧</h2>
        </div>

        <div class="p-6">
          <div class="space-y-6">
            <!-- Sample trending articles -->
            <article class="flex items-start space-x-4 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0">
              <div class="flex-shrink-0">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold text-lg">1</span>
                </div>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                  Vue.js 3の新機能を徹底解説！Composition APIの使い方
                </h3>
                <p class="text-gray-600 text-sm mb-2">
                  Vue.js 3で追加されたComposition APIについて、実際のコード例を交えながら詳しく解説します。
                </p>
                <div class="flex items-center text-sm text-gray-500 space-x-4">
                  <span>👀 2.1k views</span>
                  <span>❤️ 156 likes</span>
                  <span>💬 23 comments</span>
                  <span>📅 2日前</span>
                </div>
              </div>
            </article>

            <article class="flex items-start space-x-4 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0">
              <div class="flex-shrink-0">
                <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold text-lg">2</span>
                </div>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                  TypeScriptで始めるフロントエンド開発
                </h3>
                <p class="text-gray-600 text-sm mb-2">
                  TypeScriptの基本から実践的な使い方まで、フロントエンド開発での活用方法を紹介します。
                </p>
                <div class="flex items-center text-sm text-gray-500 space-x-4">
                  <span>👀 1.8k views</span>
                  <span>❤️ 142 likes</span>
                  <span>💬 18 comments</span>
                  <span>📅 3日前</span>
                </div>
              </div>
            </article>

            <article class="flex items-start space-x-4 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0">
              <div class="flex-shrink-0">
                <div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold text-lg">3</span>
                </div>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                  Nuxt 3で構築するモダンWebアプリケーション
                </h3>
                <p class="text-gray-600 text-sm mb-2">
                  Nuxt 3の新機能を使って、パフォーマンスの高いWebアプリケーションを構築する方法を解説。
                </p>
                <div class="flex items-center text-sm text-gray-500 space-x-4">
                  <span>👀 1.5k views</span>
                  <span>❤️ 98 likes</span>
                  <span>💬 15 comments</span>
                  <span>📅 4日前</span>
                </div>
              </div>
            </article>
          </div>

          <!-- Load More Button -->
          <div class="mt-8 text-center">
            <button class="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              さらに読み込む
              <svg class="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Meta information
useHead({
  title: 'トレンド記事 - Article Platform',
  meta: [
    { name: 'description', content: '人気のトレンド記事をチェックして、最新の技術情報をキャッチアップしましょう。' }
  ]
})
</script>