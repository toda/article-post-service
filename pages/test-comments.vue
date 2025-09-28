<template>
  <div class="max-w-4xl mx-auto py-8">
    <div class="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
      <h1 class="text-2xl font-bold text-blue-900 mb-4">💬 コメント機能テストページ</h1>
      <p class="text-blue-800 mb-2">
        このページはコメント機能をテストするためのデモページです。
      </p>
      <p class="text-blue-700 text-sm">
        実際のFirebaseデータベースは使用せず、モックデータで動作をテストできます。
      </p>
    </div>

    <!-- Test Article Content -->
    <article class="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
      <header class="p-6 border-b border-gray-200">
        <div class="flex items-center space-x-3 mb-4">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white bg-blue-600">
            テスト
          </span>
          <span class="text-sm text-gray-500">
            2025年9月22日
          </span>
          <span class="text-sm text-gray-500">
            2分で読めます
          </span>
        </div>

        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          コメント機能のテスト記事
        </h1>

        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <span class="text-white text-lg font-medium">T</span>
            </div>
            <div>
              <p class="font-semibold text-gray-900">テストユーザー</p>
              <p class="text-sm text-gray-500">テスト用のユーザーアカウントです</p>
            </div>
          </div>
        </div>
      </header>

      <div class="p-6">
        <div class="prose max-w-none">
          <h2>コメント機能について</h2>
          <p>
            この記事では、実装されたコメント機能をテストできます。以下の機能が含まれています：
          </p>
          <ul>
            <li><strong>コメント投稿</strong>: ログインユーザーがコメントを投稿できます</li>
            <li><strong>返信機能</strong>: コメントに対して返信することができます</li>
            <li><strong>編集・削除</strong>: 自分のコメントを編集・削除できます</li>
            <li><strong>いいね機能</strong>: コメントにいいねを付けることができます</li>
            <li><strong>Markdownサポート</strong>: コメントでマークダウン記法が使用できます</li>
          </ul>
          <p>
            下のコメントセクションで実際に機能をお試しください。
          </p>
        </div>
      </div>
    </article>

    <!-- Comments Section -->
    <CommentsSection :article-id="mockArticleId" />
  </div>
</template>

<script setup>
// Use a mock article ID for testing
const mockArticleId = 'test-comments-demo'

// Set page meta
useHead({
  title: 'コメント機能テスト - Article Platform',
  meta: [
    {
      name: 'description',
      content: 'コメント機能をテストするためのデモページ'
    }
  ]
})
</script>