// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss'
  ],

  // Firebase Functions preset for SSR
  nitro: {
    preset: 'firebase',
    firebase: {
      gen: 2,
      nodeVersion: '18'
    }
  },

  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID
    }
  },

  css: ['~/assets/css/main.css'],

  typescript: {
    strict: true
  },

  // Improve CSS handling without breaking functionality
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        // Prevent browser from caching styles aggressively
        { 'http-equiv': 'Cache-Control', content: 'no-cache, no-store, must-revalidate' }
      ]
    }
  },

  // Optimized CSS handling for better browser navigation
  vite: {
    css: {
      devSourcemap: true
    }
  }
})
