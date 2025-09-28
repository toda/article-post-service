<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">タグ一覧</h1>
        <p class="text-gray-600">記事を整理するためのタグの一覧です。</p>
      </div>

      <!-- Popular Tags -->
      <div class="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">人気タグ</h2>
        <div class="flex flex-wrap gap-3">
          <span
            v-for="tag in popularTags"
            :key="tag.id"
            class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
          >
            #{{ tag.name }}
            <span class="ml-2 text-xs text-blue-600">({{ tag.count }})</span>
          </span>
        </div>
      </div>

      <!-- All Tags -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">すべてのタグ</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="tag in allTags"
            :key="tag.id"
            class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer"
          >
            <span class="font-medium text-gray-900">#{{ tag.name }}</span>
            <span class="text-sm text-gray-500">{{ tag.count }}記事</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// SEO
useHead({
  title: 'タグ一覧 - Article Platform',
  meta: [
    {
      name: 'description',
      content: '記事を整理するためのタグの一覧ページです。人気のタグから記事を探すことができます。'
    }
  ]
})

// State
const popularTags = ref([])
const allTags = ref([])

// Methods
const loadTags = async () => {
  // Mock data for now
  popularTags.value = [
    { id: 'javascript', name: 'JavaScript', count: 150 },
    { id: 'typescript', name: 'TypeScript', count: 120 },
    { id: 'react', name: 'React', count: 100 },
    { id: 'vue', name: 'Vue.js', count: 90 },
    { id: 'nodejs', name: 'Node.js', count: 85 },
  ]

  allTags.value = [
    { id: 'javascript', name: 'JavaScript', count: 150 },
    { id: 'typescript', name: 'TypeScript', count: 120 },
    { id: 'react', name: 'React', count: 100 },
    { id: 'vue', name: 'Vue.js', count: 90 },
    { id: 'nodejs', name: 'Node.js', count: 85 },
    { id: 'python', name: 'Python', count: 80 },
    { id: 'docker', name: 'Docker', count: 60 },
    { id: 'kubernetes', name: 'Kubernetes', count: 45 },
    { id: 'aws', name: 'AWS', count: 40 },
    { id: 'nextjs', name: 'Next.js', count: 35 },
    { id: 'nuxt', name: 'Nuxt.js', count: 30 },
    { id: 'css', name: 'CSS', count: 75 },
    { id: 'html', name: 'HTML', count: 65 },
    { id: 'git', name: 'Git', count: 55 },
    { id: 'github', name: 'GitHub', count: 50 }
  ]
}

// Lifecycle
onMounted(() => {
  loadTags()
})
</script>