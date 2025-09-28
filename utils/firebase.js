/**
 * Firebase Configuration and Initialization
 * Centralized Firebase setup to avoid duplicate app errors
 */

import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Initialize Firebase app (singleton pattern)
let app = null
let auth = null
let db = null

function getFirebaseConfig() {
  console.log('🔧 Getting Firebase config...')

  // Use Nuxt runtime config if available, fallback to env variables
  if (typeof useRuntimeConfig !== 'undefined') {
    try {
      const config = useRuntimeConfig()
      console.log('🔧 Using Nuxt runtime config')
      return {
        apiKey: config.public.firebaseApiKey || "AIzaSyBUCGgZ8o4Ygj2CDKFY_UaOr-RE4whOJkY",
        authDomain: config.public.firebaseAuthDomain || "first-speckit.firebaseapp.com",
        projectId: config.public.firebaseProjectId || "first-speckit",
        storageBucket: config.public.firebaseStorageBucket || "first-speckit.firebasestorage.app",
        messagingSenderId: config.public.firebaseMessagingSenderId || "677560287317",
        appId: config.public.firebaseAppId || "1:677560287317:web:88b27378cd0de9e66354dc"
      }
    } catch (e) {
      console.log('🔧 useRuntimeConfig error:', e.message)
    }
  } else {
    console.log('🔧 useRuntimeConfig not available')
  }

  // Fallback configuration
  console.log('🔧 Using fallback Firebase config')
  return {
    apiKey: "AIzaSyBUCGgZ8o4Ygj2CDKFY_UaOr-RE4whOJkY",
    authDomain: "first-speckit.firebaseapp.com",
    projectId: "first-speckit",
    storageBucket: "first-speckit.firebasestorage.app",
    messagingSenderId: "677560287317",
    appId: "1:677560287317:web:88b27378cd0de9e66354dc"
  }
}

export function initializeFirebase() {
  if (!app) {
    const existingApps = getApps()
    if (existingApps.length === 0) {
      const firebaseConfig = getFirebaseConfig()
      app = initializeApp(firebaseConfig)
      console.log('🔥 Firebase initialized with config:', firebaseConfig.projectId, typeof window !== 'undefined' ? '[Client]' : '[Server]')
    } else {
      app = existingApps[0]
      console.log('🔥 Using existing Firebase app', typeof window !== 'undefined' ? '[Client]' : '[Server]')
    }

    // Initialize Firestore for both client and server
    db = getFirestore(app)

    // Auth is only available on client side
    if (typeof window !== 'undefined') {
      auth = getAuth(app)
    }
  }

  return { app, auth, db }
}

export function getFirebaseAuth() {
  if (!auth && typeof window !== 'undefined') {
    initializeFirebase()
  }
  return auth
}

export function getFirebaseFirestore() {
  if (!db) {
    initializeFirebase()
  }
  return db
}

export function getFirebaseApp() {
  if (!app && typeof window !== 'undefined') {
    initializeFirebase()
  }
  return app
}