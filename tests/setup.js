// Test setup file
import { config } from '@vue/test-utils'
import { vi } from '@jest/globals'

// Global test configuration
config.global.mocks = {
  $t: (msg) => msg,
  $route: {
    params: {},
    query: {},
    path: '/'
  },
  $router: {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn()
  }
}

// Mock Nuxt composables globally
config.global.mocks.$useNuxtApp = () => ({
  $router: config.global.mocks.$router,
  $route: config.global.mocks.$route
})

// Mock Firebase modules
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn()
}))

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn()
}))

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn()
}))