<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <NuxtRouteAnnouncer />

    <!-- Navigation Header -->
    <AppHeader />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <!-- <AppFooter /> -->
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

// Initialize authentication when app mounts
onMounted(() => {
  console.log('🎬 APP.VUE - Mounted, initializing auth...')

  // Only run on client side
  if (process.client) {
    try {
      const { initializeAuth } = useAuth()
      initializeAuth()
      console.log('🎬 APP.VUE - Auth initialized successfully')
    } catch (error) {
      console.error('🎬 APP.VUE - Error initializing auth:', error)
    }
  }
})

console.log('🎬 APP.VUE - Script setup executed')
</script>

<style>
/* Global styles */
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
}

/* Code syntax highlighting */
pre {
  @apply bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto;
}

code {
  @apply bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm;
}

pre code {
  @apply bg-transparent text-inherit p-0;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-400 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500;
}
</style>
