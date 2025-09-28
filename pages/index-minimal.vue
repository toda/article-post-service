<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Minimal Test Page</h1>
    <p>This is a minimal test to see if the issue is in the index.vue content.</p>
    <div class="mt-4">
      <p>Current time: {{ new Date().toISOString() }}</p>
    </div>
  </div>
</template>

<script setup>
// Minimal script section
useHead({
  title: 'Minimal Test Page'
})
</script>