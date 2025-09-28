export default defineNuxtPlugin(() => {
  if (process.client) {
    // Handle browser back/forward navigation CSS issues
    const handlePageShow = (event: PageTransitionEvent) => {
      // Only reload if page was loaded from bfcache and Tailwind isn't working
      if (event.persisted) {
        setTimeout(() => {
          // Check if Tailwind CSS is properly loaded
          const testEl = document.createElement('div')
          testEl.className = 'bg-blue-500'
          testEl.style.position = 'absolute'
          testEl.style.top = '-9999px'
          document.body.appendChild(testEl)

          const computed = window.getComputedStyle(testEl)
          const hasBlue = computed.backgroundColor.includes('59, 130, 246') // blue-500

          document.body.removeChild(testEl)

          if (!hasBlue) {
            console.log('CSS not loaded after bfcache, reloading...')
            window.location.reload()
          }
        }, 50)
      }
    }

    // Listen for pageshow event (fired when page loads from bfcache)
    window.addEventListener('pageshow', handlePageShow)

    // Also check CSS on initial load
    const checkInitialCSS = () => {
      const testEl = document.createElement('div')
      testEl.className = 'bg-blue-500 p-4'
      testEl.style.position = 'absolute'
      testEl.style.top = '-9999px'
      document.body.appendChild(testEl)

      const computed = window.getComputedStyle(testEl)
      const hasBlue = computed.backgroundColor.includes('59, 130, 246')
      const hasPadding = computed.paddingTop === '16px'

      document.body.removeChild(testEl)

      if (!hasBlue || !hasPadding) {
        console.log('CSS not properly loaded on initial load, reloading...')
        setTimeout(() => window.location.reload(), 100)
      }
    }

    // Check CSS after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(checkInitialCSS, 100)
      })
    } else {
      setTimeout(checkInitialCSS, 100)
    }
  }
})