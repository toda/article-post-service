/**
 * Firebase Configuration and Initialization
 * Centralized Firebase setup to avoid duplicate app errors
 */

import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Initialize Firebase app (singleton pattern)
let app = null
let auth = null
let db = null
let storage = null

function getFirebaseConfig() {
  console.log('🔧 Getting Firebase config...')

  let config = null

  // Use Nuxt runtime config if available, fallback to env variables
  if (typeof useRuntimeConfig !== 'undefined') {
    try {
      const runtimeConfig = useRuntimeConfig()
      console.log('🔧 Using Nuxt runtime config')
      config = {
        apiKey: runtimeConfig.public.firebaseApiKey,
        authDomain: runtimeConfig.public.firebaseAuthDomain,
        projectId: runtimeConfig.public.firebaseProjectId,
        storageBucket: runtimeConfig.public.firebaseStorageBucket,
        messagingSenderId: runtimeConfig.public.firebaseMessagingSenderId,
        appId: runtimeConfig.public.firebaseAppId
      }
    } catch (e) {
      console.log('🔧 useRuntimeConfig error:', e.message)
    }
  } else {
    console.log('🔧 useRuntimeConfig not available')
  }

  // Fallback to environment variables if runtime config is not available
  if (!config || !config.apiKey) {
    console.log('🔧 Using environment variables')
    config = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID
    }
  }

  // Validate required configuration
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId']
  const missingFields = requiredFields.filter(field => !config[field])

  if (missingFields.length > 0) {
    console.error('🚨 Missing Firebase configuration:', missingFields)
    throw new Error(`Firebase configuration is incomplete. Missing: ${missingFields.join(', ')}`)
  }

  console.log('✅ Firebase configuration loaded successfully')
  return config
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
    console.log('🔥 Firestore initialized for production use')

    // Auth and Storage are only available on client side
    if (typeof window !== 'undefined') {
      auth = getAuth(app)
      storage = getStorage(app)
      console.log('🔥 Firebase Auth and Storage initialized for production use')
    }
  }

  return { app, auth, db, storage }
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

export function getFirebaseStorage() {
  if (!storage && typeof window !== 'undefined') {
    initializeFirebase()
  }
  return storage
}

export function getFirebaseApp() {
  if (!app && typeof window !== 'undefined') {
    initializeFirebase()
  }
  return app
}