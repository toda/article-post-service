import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId
  }

  // Initialize Firebase
  const app = initializeApp(firebaseConfig)

  // Initialize Firebase services
  const auth = getAuth(app)
  const firestore = getFirestore(app)
  const storage = getStorage(app)

  return {
    provide: {
      firebase: app,
      firebaseAuth: auth,
      firestore,
      firebaseStorage: storage
    }
  }
})