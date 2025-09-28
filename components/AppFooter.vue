<template>
  <footer class="bg-white border-t border-gray-200 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand Section -->
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">A</span>
            </div>
            <span class="text-xl font-bold text-gray-900">Article Platform</span>
          </div>
          <p class="text-gray-600 text-sm max-w-md">
            技術記事を投稿・共有するプラットフォーム。開発者のナレッジを集約し、学習と成長をサポートします。
          </p>
          <div class="flex space-x-4 mt-4">
            <a href="#" class="text-gray-400 hover:text-gray-600 transition-colors">
              <span class="sr-only">Twitter</span>
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" class="text-gray-400 hover:text-gray-600 transition-colors">
              <span class="sr-only">GitHub</span>
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
              </svg>
            </a>
          </div>
        </div>

        <!-- Navigation Links -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
            ナビゲーション
          </h3>
          <ul class="space-y-3">
            <li>
              <NuxtLink to="/" class="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                ホーム
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/explore" class="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                発見
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/trending" class="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                トレンド
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/tags" class="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                タグ
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Support Links -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
            サポート
          </h3>
          <ul class="space-y-3">
            <li>
              <NuxtLink to="/help" class="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                ヘルプ
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/about" class="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                サービスについて
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/terms" class="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                利用規約
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/privacy" class="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                プライバシーポリシー
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/contact" class="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                お問い合わせ
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="mt-8 pt-8 border-t border-gray-200">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <p class="text-gray-500 text-sm">
            © {{ currentYear }} Article Platform. All rights reserved.
          </p>
          <div class="flex items-center space-x-4 mt-4 md:mt-0">
            <span class="text-gray-500 text-sm">言語:</span>
            <select class="text-sm border border-gray-300 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="ja">日本語</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

// Get current year
const currentYear = computed(() => new Date().getFullYear())
</script>