<template>
  <div class="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center p-4">
    <div class="w-full max-w-4xl text-center">

      <!-- エラーアイコン -->
      <div class="mb-8">
        <div class="mx-auto w-32 h-32 bg-red-100 rounded-full flex items-center justify-center">
          <svg class="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
      </div>

      <!-- エラーコード -->
      <h1 class="text-8xl font-black text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text mb-4">
        {{ error.statusCode }}
      </h1>

      <!-- エラータイトル -->
      <h2 class="text-4xl font-bold text-gray-800 mb-6">
        {{ getErrorTitle() }}
      </h2>

      <!-- エラーメッセージ -->
      <p class="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
        {{ getErrorMessage() }}
      </p>

      <!-- アクションボタン -->
      <div class="flex flex-col sm:flex-row gap-6 justify-center max-w-2xl mx-auto mb-12">
        <NuxtLink
          to="/"
          class="flex-1 py-4 px-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          ホームに戻る
        </NuxtLink>
        <button
          @click="goBack"
          class="flex-1 py-4 px-8 bg-white text-gray-700 text-lg font-semibold rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          前のページに戻る
        </button>
      </div>

      <!-- 404の場合の追加リンク -->
      <div v-if="error.statusCode === 404" class="bg-white/70 backdrop-blur rounded-2xl p-8 max-w-2xl mx-auto">
        <h3 class="text-xl font-bold text-gray-800 mb-4">お探しのコンテンツを見つける</h3>
        <div class="flex flex-col sm:flex-row gap-4">
          <NuxtLink
            to="/explore"
            class="flex-1 py-3 px-6 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
          >
            記事を探す
          </NuxtLink>
          <NuxtLink
            to="/trending"
            class="flex-1 py-3 px-6 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors"
          >
            トレンド記事
          </NuxtLink>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: {
    type: Object,
    required: true
  }
})

useHead({
  title: `${props.error.statusCode} - Article Platform`
})

const getErrorTitle = () => {
  switch (props.error.statusCode) {
    case 404:
      return 'ページが見つかりません'
    case 403:
      return 'アクセスが拒否されました'
    case 500:
      return 'サーバーエラー'
    default:
      return 'エラーが発生しました'
  }
}

const getErrorMessage = () => {
  switch (props.error.statusCode) {
    case 404:
      return 'お探しのページは存在しないか、移動された可能性があります。'
    case 403:
      return 'このページにアクセスする権限がありません。'
    case 500:
      return 'サーバーで問題が発生しました。しばらく時間をおいてから再度お試しください。'
    default:
      return '予期しないエラーが発生しました。'
  }
}

const goBack = () => {
  if (process.client) {
    window.history.back()
  }
}
</script>