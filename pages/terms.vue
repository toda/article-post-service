<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">利用規約</h1>
        <p class="text-gray-600">Article Platformの利用規約です。ご利用の前に必ずお読みください。</p>
      </div>

      <!-- Terms Content -->
      <div class="bg-white rounded-lg border border-gray-200 p-8">
        <div class="prose max-w-none">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">第1条（適用）</h2>
          <p class="text-gray-700 mb-6">
            この利用規約（以下「本規約」）は、Article Platform（以下「本サービス」）の利用条件を定めるものです。
            ユーザーは本規約に同意した上で本サービスを利用するものとします。
          </p>

          <h2 class="text-xl font-semibold text-gray-900 mb-4">第2条（利用登録）</h2>
          <p class="text-gray-700 mb-6">
            本サービスの利用を希望する方は、本規約に同意の上、所定の方法によって利用登録を申請し、
            当社がこれを承認することによって、利用登録が完了するものとします。
          </p>

          <h2 class="text-xl font-semibold text-gray-900 mb-4">第3条（ユーザーIDおよびパスワードの管理）</h2>
          <p class="text-gray-700 mb-6">
            ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを適切に管理するものとします。
            ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与し、
            もしくは第三者と共用することはできません。
          </p>

          <h2 class="text-xl font-semibold text-gray-900 mb-4">第4条（コンテンツの投稿）</h2>
          <p class="text-gray-700 mb-6">
            ユーザーは、本サービスを利用して投稿するコンテンツについて、以下の条件を満たすものとします：
          </p>
          <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>法律や公序良俗に反しない内容であること</li>
            <li>第三者の権利を侵害しない内容であること</li>
            <li>虚偽の情報を含まない内容であること</li>
            <li>技術的な内容について正確性を心がけること</li>
          </ul>

          <h2 class="text-xl font-semibold text-gray-900 mb-4">第5条（知的財産権）</h2>
          <p class="text-gray-700 mb-6">
            ユーザーが本サービスに投稿したコンテンツの著作権は、投稿者に帰属します。
            ただし、本サービスの運営に必要な範囲で、当社がコンテンツを利用することを許可するものとします。
          </p>

          <h2 class="text-xl font-semibold text-gray-900 mb-4">第6条（免責事項）</h2>
          <p class="text-gray-700 mb-6">
            当社は、本サービスに関して、明示または黙示を問わず、いかなる保証も行いません。
            本サービスの利用によってユーザーに生じた損害について、当社は一切の責任を負いません。
          </p>

          <h2 class="text-xl font-semibold text-gray-900 mb-4">第7条（規約の変更）</h2>
          <p class="text-gray-700 mb-6">
            当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
            なお、本規約の変更後、本サービスの利用を開始した場合には、当該ユーザーは変更後の規約に同意したものとみなします。
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
  title: '利用規約 - Article Platform',
  meta: [
    {
      name: 'description',
      content: 'Article Platformの利用規約ページです。サービスをご利用いただく前に必ずお読みください。'
    }
  ]
})
</script>