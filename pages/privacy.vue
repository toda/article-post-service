<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">プライバシーポリシー</h1>
        <p class="text-gray-600">Article Platformにおける個人情報の取り扱いについて説明します。</p>
      </div>

      <!-- Privacy Policy Content -->
      <div class="bg-white rounded-lg border border-gray-200 p-8">
        <div class="prose max-w-none">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">1. 個人情報の収集について</h2>
          <p class="text-gray-700 mb-6">
            本サービスでは、以下の個人情報を収集する場合があります：
          </p>
          <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>お名前・ニックネーム</li>
            <li>メールアドレス</li>
            <li>プロフィール情報</li>
            <li>投稿されたコンテンツ</li>
            <li>利用履歴・アクセスログ</li>
          </ul>

          <h2 class="text-xl font-semibold text-gray-900 mb-4">2. 個人情報の利用目的</h2>
          <p class="text-gray-700 mb-6">
            収集した個人情報は、以下の目的で利用いたします：
          </p>
          <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>本サービスの提供・運営</li>
            <li>ユーザーサポート</li>
            <li>サービス改善のための分析</li>
            <li>重要なお知らせの通知</li>
            <li>利用規約違反の調査</li>
          </ul>

          <h2 class="text-xl font-semibold text-gray-900 mb-4">3. 個人情報の第三者提供</h2>
          <p class="text-gray-700 mb-6">
            当社は、法令に基づく場合を除き、ユーザーの同意なく第三者に個人情報を提供することはありません。
            ただし、以下の場合はこの限りではありません：
          </p>
          <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>法令に基づく場合</li>
            <li>人の生命、身体または財産の保護のために必要がある場合</li>
            <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合</li>
          </ul>

          <h2 class="text-xl font-semibold text-gray-900 mb-4">4. Cookieについて</h2>
          <p class="text-gray-700 mb-6">
            本サービスでは、ユーザーの利便性向上のためにCookieを使用しています。
            Cookieは、ウェブサイトがお客様のコンピューターに送信する小さなテキストファイルです。
            ブラウザの設定によりCookieを無効にすることができますが、
            一部機能が利用できなくなる可能性があります。
          </p>

          <h2 class="text-xl font-semibold text-gray-900 mb-4">5. セキュリティについて</h2>
          <p class="text-gray-700 mb-6">
            当社は、個人情報の保護のため、適切なセキュリティ対策を講じています。
            しかし、インターネット上の通信の性質上、絶対的な安全性を保証するものではありません。
          </p>

          <h2 class="text-xl font-semibold text-gray-900 mb-4">6. 個人情報の開示・訂正・削除</h2>
          <p class="text-gray-700 mb-6">
            ユーザーは、自身の個人情報について、開示、訂正、削除を求めることができます。
            これらのご請求については、所定の手続きに従って対応いたします。
          </p>

          <h2 class="text-xl font-semibold text-gray-900 mb-4">7. プライバシーポリシーの変更</h2>
          <p class="text-gray-700 mb-6">
            当社は、必要に応じて本プライバシーポリシーを変更することがあります。
            変更後のプライバシーポリシーは、本ページに掲載した時点で効力を生じるものとします。
          </p>

          <h2 class="text-xl font-semibold text-gray-900 mb-4">8. お問い合わせ</h2>
          <p class="text-gray-700 mb-6">
            本プライバシーポリシーに関するお問い合わせは、下記までご連絡ください：<br>
            Email: privacy@article-platform.com
          </p>

          <div class="mt-8 pt-6 border-t border-gray-200">
            <p class="text-sm text-gray-500">
              最終更新日: 2024年1月1日<br>
              Article Platform 運営事務局
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// SEO
useHead({
  title: 'プライバシーポリシー - Article Platform',
  meta: [
    {
      name: 'description',
      content: 'Article Platformのプライバシーポリシーです。個人情報の取り扱いについて詳しく説明しています。'
    }
  ]
})
</script>