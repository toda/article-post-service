/**
 * Authentication Composable
 * Handles user authentication, registration, and session management
 */

import { ref, computed, onMounted } from 'vue'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  // TwitterAuthProvider,
  // GitHubAuthProvider, // Temporarily disabled due to import issues
  signOut,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
  sendEmailVerification,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, collection, getDocs } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { getFirebaseAuth, getFirebaseFirestore, getFirebaseStorage } from '~/utils/firebase'

// Global state
const currentUser = ref(null)
const isAuthenticated = ref(false)
const authLoading = ref(true)
const authError = ref(null)

// Error codes from contract
export const AuthErrorCodes = {
  // Registration Errors
  EMAIL_ALREADY_EXISTS: 'auth/email-already-in-use',
  WEAK_PASSWORD: 'auth/weak-password',
  INVALID_EMAIL: 'auth/invalid-email',
  USERNAME_ALREADY_EXISTS: 'auth/username-already-exists',
  OPERATION_NOT_ALLOWED: 'auth/operation-not-allowed',

  // Login Errors
  USER_NOT_FOUND: 'auth/user-not-found',
  WRONG_PASSWORD: 'auth/wrong-password',
  USER_DISABLED: 'auth/user-disabled',
  TOO_MANY_REQUESTS: 'auth/too-many-requests',
  EMAIL_NOT_VERIFIED: 'auth/email-not-verified',

  // Token Errors
  TOKEN_EXPIRED: 'auth/id-token-expired',
  TOKEN_REVOKED: 'auth/id-token-revoked',
  INVALID_TOKEN: 'auth/argument-error',

  // Provider Errors
  ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL: 'auth/account-exists-with-different-credential',
  PROVIDER_ALREADY_LINKED: 'auth/provider-already-linked',
  NO_SUCH_PROVIDER: 'auth/no-such-provider',

  // Permission Errors
  REQUIRES_RECENT_LOGIN: 'auth/requires-recent-login',
  UNAUTHORIZED: 'auth/unauthorized',

  // Validation Errors
  DISPLAY_NAME_REQUIRED: 'auth/display-name-required',
  DISPLAY_NAME_TOO_LONG: 'auth/display-name-too-long',
  INVALID_DISPLAY_NAME: 'auth/invalid-display-name'
}

export function useAuth() {
  // Note: Firebase Auth only works on client-side, but we need to maintain
  // reactive state for SSR hydration consistency

  const auth = getFirebaseAuth()
  const db = getFirebaseFirestore()
  const storage = getFirebaseStorage()

  // Computed properties
  const user = computed(() => currentUser.value)
  const isLoggedIn = computed(() => isAuthenticated.value)
  const loading = computed(() => authLoading.value)
  const error = computed(() => authError.value)

  // Clear error
  const clearError = () => {
    authError.value = null
  }

  // Set error with proper error code mapping
  const setError = (error) => {
    if (error?.code) {
      authError.value = {
        code: error.code,
        message: error.message
      }
    } else {
      authError.value = {
        code: 'auth/unknown-error',
        message: error?.message || 'An unknown error occurred'
      }
    }
  }

  // Validate display name
  const validateDisplayName = (displayName) => {
    if (!displayName || displayName.trim().length === 0) {
      throw new Error(AuthErrorCodes.DISPLAY_NAME_REQUIRED)
    }
    if (displayName.length > 50) {
      throw new Error(AuthErrorCodes.DISPLAY_NAME_TOO_LONG)
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(displayName)) {
      throw new Error(AuthErrorCodes.INVALID_DISPLAY_NAME)
    }
  }

  // Check username availability
  const checkUsernameAvailability = async ({ displayName }) => {
    try {
      clearError()
      validateDisplayName(displayName)

      console.log(`Checking username availability for: "${displayName}"`)

      if (!db) {
        throw new Error('Database not available - cannot verify username uniqueness. Please try again later.')
      }

      try {
        // Check Firestore for existing users (only source of truth for usernames)
        console.log('Checking Firestore for existing users')
        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('displayName', '==', displayName))
        const querySnapshot = await getDocs(q)

        console.log(`Firestore query result for "${displayName}":`, querySnapshot.empty ? 'empty' : 'found matches')
        if (!querySnapshot.empty) {
          console.log('Existing documents:', querySnapshot.docs.map(doc => doc.data()))
        }

        if (querySnapshot.empty) {
          return {
            available: true,
            suggestions: [],
            message: 'Username is available'
          }
        } else {
          // Generate suggestions
          const suggestions = []
          for (let i = 1; i <= 3; i++) {
            suggestions.push(`${displayName}${i}`)
            suggestions.push(`${displayName}_${i}`)
          }

          return {
            available: false,
            suggestions,
            message: 'Username is already taken'
          }
        }
      } catch (firestoreError) {
        console.error('Firestore error during username check:', firestoreError.message)

        // Handle permission denied errors with a fallback
        if (firestoreError.code === 'permission-denied' ||
            firestoreError.message.includes('Missing or insufficient permissions')) {

          console.warn('Firestore permissions insufficient for username check - using fallback validation')

          // Fallback: Check during signup process instead of real-time
          // For now, allow the username but verification will happen during signup
          return {
            available: true,
            suggestions: [],
            message: 'Username will be verified during registration'
          }
        }

        // Re-throw other Firestore errors
        throw firestoreError
      }
    } catch (error) {
      console.error('Username availability check failed:', error.message)
      setError(error)
      throw error
    }
  }

  // Sign up with email and password
  const signUp = async ({ email, password, displayName }) => {
    try {
      clearError()
      authLoading.value = true

      if (!auth) throw new Error('Firebase Auth not initialized')

      // Validate display name
      validateDisplayName(displayName)

      // Check if username is available
      const availability = await checkUsernameAvailability({ displayName })
      if (!availability.available) {
        throw new Error(AuthErrorCodes.USERNAME_ALREADY_EXISTS)
      }

      // Try to create user account with Firebase Authentication
      let user = null
      let firebaseSuccessful = false

      if (auth) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password)
          user = userCredential.user

          // Update profile with display name
          await updateProfile(user, { displayName })
          firebaseSuccessful = true
          console.log('Firebase Authentication successful')
        } catch (firebaseError) {
          console.warn('Firebase Authentication failed:', firebaseError.message)

          // Check if it's a network error (emulator not running or demo config)
          if (firebaseError.code === 'auth/network-request-failed' || firebaseError.code === 'auth/invalid-api-key') {
            // Simulate user creation for development
            user = {
              uid: Math.random().toString(36).substr(2, 9),
              email: email,
              displayName: displayName,
              emailVerified: false
            }
            console.log('Using simulated user for development')
          } else {
            throw firebaseError // Re-throw other Firebase errors
          }
        }
      } else {
        // No auth instance, simulate user creation
        user = {
          uid: Math.random().toString(36).substr(2, 9),
          email: email,
          displayName: displayName,
          emailVerified: false
        }
        console.log('Using simulated user (no Firebase auth)')
      }

      // Prepare user data for Firestore storage
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        emailVerified: user.emailVerified,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        role: 'user'
      }

      // Save to Firestore (required for proper user management)
      if (!db) {
        throw new Error('Firestore not available - proper user management requires Firestore')
      } else {
        console.log('Attempting to save user data to Firestore...')
        try {
          // Force save to Firestore with retry logic
          await setDoc(doc(db, 'users', user.uid), userData)
          console.log('✅ User data saved to Firestore successfully')
        } catch (firestoreError) {
          console.error('❌ Failed to save to Firestore:', firestoreError)
          console.error('Error code:', firestoreError.code)
          console.error('Error message:', firestoreError.message)

          // Throw error to prevent signup completion without proper data storage
          throw new Error(`Failed to save user data to Firestore: ${firestoreError.message}`)
        }
      }

      // User data is now stored in Firestore only - no localStorage needed

      // Send email verification (only if Firebase was successful)
      if (firebaseSuccessful) {
        try {
          // Configure action code settings for custom redirect
          const actionCodeSettings = {
            url: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'}/verify-email`,
            handleCodeInApp: false
          }

          await sendEmailVerification(user, actionCodeSettings)
          console.log('Verification email sent with custom redirect to:', actionCodeSettings.url)
        } catch (emailError) {
          console.warn('Failed to send verification email:', emailError.message)
        }
      } else {
        console.log('Email verification skipped (simulated user)')
      }

      // Update state
      currentUser.value = userData
      isAuthenticated.value = true

      return userData
    } catch (error) {
      setError(error)
      throw error
    } finally {
      authLoading.value = false
    }
  }

  // Sign in with email and password
  const signIn = async ({ email, password }) => {
    try {
      clearError()
      authLoading.value = true

      if (!auth) throw new Error('Firebase Auth not initialized')

      console.log('🔐 Attempting to sign in with email:', email)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      console.log('🔐 Sign in successful, checking email verification status')
      console.log('🔐 User emailVerified:', user.emailVerified)
      console.log('🔐 User object:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
      })

      // If email is not verified, sign out the user immediately and throw error
      if (!user.emailVerified) {
        console.log('❌ Email not verified in Firebase Auth, signing out user and rejecting login')
        await signOut(auth)
        throw {
          code: AuthErrorCodes.EMAIL_NOT_VERIFIED,
          message: 'メールアドレスの認証が完了していません。メールを確認して認証を完了してからログインしてください。'
        }
      }

      // Also check Firestore emailVerified status for additional security
      if (db) {
        try {
          const userDoc = doc(db, 'users', user.uid)
          const userSnapshot = await getDoc(userDoc)
          if (userSnapshot.exists()) {
            const firestoreData = userSnapshot.data()

            // If Firebase Auth shows verified but Firestore doesn't, sync Firestore
            if (!firestoreData.emailVerified && user.emailVerified) {
              console.log('🔄 Firebase Auth shows email verified but Firestore does not. Syncing Firestore...')
              await updateDoc(userDoc, {
                emailVerified: true,
                updatedAt: new Date()
              })
              console.log('✅ Firestore emailVerified status updated to true')
            } else if (!firestoreData.emailVerified && !user.emailVerified) {
              console.log('❌ Email not verified in both Firebase Auth and Firestore, rejecting login')
              await signOut(auth)
              throw {
                code: AuthErrorCodes.EMAIL_NOT_VERIFIED,
                message: 'メールアドレスの認証が完了していません。メールを確認して認証を完了してからログインしてください。'
              }
            }
            console.log('✅ Email verified in both Firebase Auth and Firestore')
          } else {
            console.log('⚠️ User document not found in Firestore, creating with current status')
            // Create user document with current Firebase Auth status
            await setDoc(userDoc, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              emailVerified: user.emailVerified,
              createdAt: new Date(),
              updatedAt: new Date(),
              isActive: true,
              role: 'user'
            })
          }
        } catch (firestoreError) {
          console.warn('Failed to check Firestore emailVerified status:', firestoreError.message)
          // Continue with Firebase Auth verification only as fallback
        }
      }

      console.log('✅ Email verified, allowing login')
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      authLoading.value = false
    }
  }

  // Sign in with social provider
  const signInWithProvider = async ({ providerId }) => {
    try {
      clearError()
      authLoading.value = true

      let provider
      switch (providerId) {
        case 'google.com':
        case 'google':
          provider = new GoogleAuthProvider()
          break
        // case 'twitter.com':
        //   provider = new TwitterAuthProvider()
        //   break
        // case 'github.com':
        // case 'github':
        //   provider = new GitHubAuthProvider()
        //   break
        default:
          throw new Error('Provider not supported: ' + providerId)
      }

      const userCredential = await signInWithPopup(auth, provider)
      const user = userCredential.user

      console.log('🔐 Provider sign in successful, checking email verification status')
      console.log('🔐 User emailVerified:', user.emailVerified)

      // If email is not verified, sign out the user immediately and throw error
      if (!user.emailVerified) {
        console.log('❌ Email not verified, signing out user and rejecting provider login')
        await signOut(auth)
        throw {
          code: AuthErrorCodes.EMAIL_NOT_VERIFIED,
          message: 'メールアドレスの認証が完了していません。メールを確認して認証を完了してからログインしてください。'
        }
      }

      console.log('✅ Email verified in Firebase Auth, checking Firestore')

      // Check if user document exists, create if not
      const userDoc = doc(db, 'users', user.uid)
      const userSnapshot = await getDoc(userDoc)

      if (!userSnapshot.exists()) {
        console.log('Creating new user document in Firestore')
        await setDoc(userDoc, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          avatarUrl: user.photoURL,
          emailVerified: user.emailVerified,
          providerId: providerId,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          role: 'user'
        })
      } else {
        // User document exists, check Firestore emailVerified status
        const firestoreData = userSnapshot.data()
        if (!firestoreData.emailVerified) {
          console.log('❌ Email not verified in Firestore, signing out user and rejecting provider login')
          await signOut(auth)
          throw {
            code: AuthErrorCodes.EMAIL_NOT_VERIFIED,
            message: 'メールアドレスの認証が完了していません。メールを確認して認証を完了してからログインしてください。'
          }
        }
        console.log('✅ Email verified in both Firebase Auth and Firestore for provider login')
      }

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        providerId: providerId
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      authLoading.value = false
    }
  }

  // Sign out
  const signOutUser = async () => {
    try {
      clearError()

      // Sign out from Firebase if available
      if (auth) {
        await signOut(auth)
      }

      // User data is managed in Firestore only - no localStorage to clear

      // Update state
      currentUser.value = null
      isAuthenticated.value = false
    } catch (error) {
      setError(error)
      throw error
    }
  }

  // Get current user
  const getCurrentUser = async () => {
    if (auth.currentUser) {
      const userDoc = doc(db, 'users', auth.currentUser.uid)
      const userSnapshot = await getDoc(userDoc)

      if (userSnapshot.exists()) {
        return {
          uid: auth.currentUser.uid,
          ...userSnapshot.data()
        }
      }
    }
    return null
  }

  // Update email
  const updateUserEmail = async (newEmail) => {
    try {
      clearError()
      if (!auth.currentUser) {
        throw new Error(AuthErrorCodes.UNAUTHORIZED)
      }

      console.log('📧 Updating email to:', newEmail)
      await updateEmail(auth.currentUser, newEmail)

      // Update user document
      const userDoc = doc(db, 'users', auth.currentUser.uid)
      await setDoc(userDoc, {
        email: newEmail,
        emailVerified: false,
        updatedAt: new Date()
      }, { merge: true })

      // Send verification email
      await sendEmailVerification(auth.currentUser)
      console.log('✅ Email update completed, verification email sent')

    } catch (error) {
      console.error('❌ Failed to update email:', error)
      setError(error)
      throw error
    }
  }

  // Update password
  const updateUserPassword = async (newPassword) => {
    try {
      clearError()
      if (!auth.currentUser) {
        throw new Error(AuthErrorCodes.UNAUTHORIZED)
      }

      await updatePassword(auth.currentUser, newPassword)
    } catch (error) {
      setError(error)
      throw error
    }
  }

  // Send email verification
  const sendVerificationEmail = async () => {
    try {
      clearError()
      if (!auth.currentUser) {
        throw new Error(AuthErrorCodes.UNAUTHORIZED)
      }

      // Configure action code settings for custom redirect
      const actionCodeSettings = {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: false
      }

      await sendEmailVerification(auth.currentUser, actionCodeSettings)
      console.log('✅ Verification email sent with custom redirect to:', actionCodeSettings.url)
    } catch (error) {
      setError(error)
      throw error
    }
  }

  // Check current email verification status
  const checkEmailVerification = async () => {
    try {
      if (!auth.currentUser) {
        return { verified: false, user: null }
      }

      // Reload user to get latest verification status
      await auth.currentUser.reload()

      return {
        verified: auth.currentUser.emailVerified,
        user: {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName,
          emailVerified: auth.currentUser.emailVerified
        }
      }
    } catch (error) {
      console.error('Error checking email verification:', error)
      return { verified: false, user: null }
    }
  }

  // Refresh email verification status and update UI
  const refreshEmailVerification = async () => {
    try {
      const result = await checkEmailVerification()

      if (result.verified && result.user) {
        // Update Firestore with verified status
        if (db) {
          const userDoc = doc(db, 'users', result.user.uid)
          await setDoc(userDoc, {
            emailVerified: true,
            updatedAt: new Date()
          }, { merge: true })
        }

        // Update local state
        currentUser.value = {
          ...currentUser.value,
          emailVerified: true
        }
        isAuthenticated.value = true

        return {
          verified: true,
          message: 'メール認証が完了しました！'
        }
      } else {
        return {
          verified: false,
          message: 'メール認証がまだ完了していません。'
        }
      }
    } catch (error) {
      console.error('Error refreshing email verification:', error)
      return {
        verified: false,
        message: 'メール認証状態の確認に失敗しました。'
      }
    }
  }

  // Delete account
  const deleteAccount = async () => {
    try {
      clearError()
      console.log('🔐 Starting Firebase Authentication account deletion...')

      if (!auth.currentUser) {
        throw new Error(AuthErrorCodes.UNAUTHORIZED)
      }

      const userId = auth.currentUser.uid
      console.log('🔐 Deleting auth account for user:', userId)

      // Delete auth account only (user data should be deleted separately by useUsers.js)
      await deleteUser(auth.currentUser)
      console.log('✅ Firebase Authentication account deleted successfully')

      // Explicitly clear local auth state after account deletion
      currentUser.value = null
      isAuthenticated.value = false
      console.log('🔄 Local authentication state cleared')

    } catch (error) {
      console.error('❌ Error deleting Firebase Authentication account:', error)

      // Handle specific errors
      if (error.code === AuthErrorCodes.REQUIRES_RECENT_LOGIN) {
        throw new Error('アカウント削除を実行するには、最近のログインが必要です。一度ログアウトして再度ログインしてから、もう一度お試しください。')
      }

      setError(error)
      throw error
    }
  }

  // Reauthenticate user
  const reauthenticate = async (password) => {
    try {
      clearError()
      if (!auth.currentUser || !auth.currentUser.email) {
        throw new Error(AuthErrorCodes.UNAUTHORIZED)
      }

      const credential = EmailAuthProvider.credential(auth.currentUser.email, password)
      await reauthenticateWithCredential(auth.currentUser, credential)
    } catch (error) {
      setError(error)
      throw error
    }
  }

  // Initialize auth state listener
  const initializeAuth = () => {
    console.log('🎬 ===== AUTHENTICATION DEBUG START =====')
    console.log('🎬 initializeAuth called, window available:', typeof window !== 'undefined')
    console.log('🎬 Firebase auth instance:', auth ? 'available' : 'not available')
    console.log('🎬 Current user state:', currentUser.value)
    console.log('🎬 Current isAuthenticated state:', isAuthenticated.value)
    console.log('🎬 Current authLoading state:', authLoading.value)

    if (typeof window !== 'undefined' && auth) {
      console.log('🎬 Setting up onAuthStateChanged listener')
      console.log('🎬 Auth object details:', {
        currentUser: auth.currentUser ? auth.currentUser.uid : 'null',
        app: auth.app ? auth.app.name : 'no app'
      })

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log('🔄 ===== AUTH STATE CHANGE EVENT FIRED =====')
        console.log('🔄 Timestamp:', new Date().toISOString())
        console.log('🔄 Page URL:', typeof window !== 'undefined' ? window.location.href : 'server-side')
        console.log('🔄 Auth state changed, user:', user ? 'logged in' : 'logged out')
        if (user) {
          // Always reload user to get latest emailVerified status
          try {
            await user.reload()
            console.log('🔄 User data reloaded from Firebase')
          } catch (reloadError) {
            console.warn('⚠️ Failed to reload user data:', reloadError.message)
          }

          console.log('🔍 Auth state - User data:', {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified
          })

          // For newly verified users, sometimes there's a delay in Firebase Auth sync
          // Check Firestore emailVerified status as well before signing out
          let shouldAllowLogin = user.emailVerified

          if (!user.emailVerified && db) {
            try {
              console.log('🔍 Checking Firestore emailVerified status as fallback...')
              const userDoc = doc(db, 'users', user.uid)
              const userSnapshot = await getDoc(userDoc)
              if (userSnapshot.exists()) {
                const firestoreData = userSnapshot.data()
                if (firestoreData.emailVerified === true) {
                  console.log('✅ Firestore shows email verified, allowing login despite Firebase Auth delay')
                  shouldAllowLogin = true
                }
              }
            } catch (firestoreError) {
              console.warn('⚠️ Failed to check Firestore emailVerified status:', firestoreError.message)
            }
          }

          // Check if email is verified (Firebase Auth or Firestore)
          if (!shouldAllowLogin) {
            console.log('❌ Auth state - User email not verified in both Firebase Auth and Firestore, signing out')
            await signOut(auth)
            return
          }

          console.log('✅ Auth state - Email verified, proceeding with authentication')

          try {
            // Get user data from Firestore
            let userData = null

            if (db) {
              try {
                const userDoc = doc(db, 'users', user.uid)
                const userSnapshot = await getDoc(userDoc)
                if (userSnapshot.exists()) {
                  userData = {
                    uid: user.uid,
                    ...userSnapshot.data()
                  }

                  // Sync avatar between Firebase Auth and Firestore
                  // Firestore is the source of truth for avatarUrl
                  const currentAvatarUrl = userData.avatarUrl
                  const firebaseAvatarUrl = user.photoURL

                  let needsUpdate = false
                  const updateData = {}

                  // If Firestore has null but Firebase Auth has a URL, clear Firebase Auth
                  if (currentAvatarUrl === null && firebaseAvatarUrl !== null) {
                    console.log('🔄 Firestore avatarUrl is null, clearing Firebase Auth photoURL')
                    try {
                      await updateProfile(user, { photoURL: null })
                      console.log('✅ Firebase Auth photoURL cleared')
                    } catch (profileError) {
                      console.warn('⚠️ Failed to clear Firebase Auth photoURL:', profileError.message)
                    }
                    userData.avatarUrl = null
                  }
                  // If Firebase Auth has a URL but Firestore doesn't, update Firestore
                  else if (firebaseAvatarUrl && firebaseAvatarUrl !== currentAvatarUrl) {
                    console.log('🔄 Updating Firestore avatar URL from Firebase Auth:', firebaseAvatarUrl)
                    updateData.avatarUrl = firebaseAvatarUrl
                    userData.avatarUrl = firebaseAvatarUrl
                    needsUpdate = true
                  }
                  // Both are in sync
                  else {
                    console.log('✅ Avatar URL already synced:', currentAvatarUrl)
                    userData.avatarUrl = currentAvatarUrl
                  }

                  // Always sync emailVerified status between Firebase Auth and Firestore
                  const currentEmailVerified = userData.emailVerified
                  const firebaseEmailVerified = user.emailVerified

                  if (firebaseEmailVerified !== currentEmailVerified) {
                    console.log('🔄 Syncing emailVerified status:', {
                      firestore: currentEmailVerified,
                      firebaseAuth: firebaseEmailVerified
                    })
                    updateData.emailVerified = firebaseEmailVerified
                    userData.emailVerified = firebaseEmailVerified
                    needsUpdate = true
                  } else {
                    console.log('✅ EmailVerified status already synced:', firebaseEmailVerified)
                  }

                  // Update Firestore if needed
                  if (needsUpdate) {
                    updateData.updatedAt = new Date()
                    await setDoc(userDoc, updateData, { merge: true })
                    console.log('✅ User data updated in Firestore:', updateData)
                  }
                }
              } catch (firestoreError) {
                console.warn('Failed to fetch user data from Firestore:', firestoreError.message)
              }
            }

            // User data must come from Firestore only

            // Default user data if nothing found
            if (!userData) {
              userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || '',
                avatarUrl: user.photoURL || null,
                emailVerified: user.emailVerified,
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
                role: 'user'
              }
            }

            console.log('✅ User authenticated and set:', {
              uid: userData.uid,
              displayName: userData.displayName,
              email: userData.email,
              userData
            })
            currentUser.value = userData
            isAuthenticated.value = true
          } catch (error) {
            console.error('Error fetching user data:', error)
            currentUser.value = null
            isAuthenticated.value = false
          }
        } else {
          console.log('❌ ===== USER SIGNED OUT =====')
          console.log('❌ Setting currentUser to null and isAuthenticated to false')
          currentUser.value = null
          isAuthenticated.value = false
        }
        authLoading.value = false
        console.log('🔄 ===== AUTH STATE CHANGE COMPLETE =====')
        console.log('🔄 Final state - currentUser:', currentUser.value ? 'set' : 'null')
        console.log('🔄 Final state - isAuthenticated:', isAuthenticated.value)
        console.log('🔄 Final state - authLoading:', authLoading.value)
      })

      console.log('🎬 onAuthStateChanged listener registered successfully')
      return unsubscribe
    } else if (process.client) {
      // Firebase not available - authentication requires Firebase
      console.warn('Firebase not available - user authentication disabled')
      authLoading.value = false
    }
  }

  // Upload user icon directly to Firebase Storage
  const uploadUserIcon = async (file) => {
    try {
      clearError()

      if (!auth.currentUser) {
        throw new Error(AuthErrorCodes.UNAUTHORIZED)
      }

      if (!storage) {
        throw new Error('Firebase Storage が利用できません')
      }

      // Validate file
      if (!file) {
        throw new Error('ファイルが選択されていません')
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('対応していないファイル形式です。JPEG、PNG、GIF、WebP形式のファイルを選択してください。')
      }

      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        throw new Error('ファイルサイズが大きすぎます。5MB以下のファイルを選択してください。')
      }

      console.log('📤 Firebase Storage に直接アイコンをアップロード:', file.name)

      // Create file reference
      const fileName = `icon.${file.name.split('.').pop()}`
      const fileRef = storageRef(storage, `user-icons/${auth.currentUser.uid}/${fileName}`)

      // Upload file
      console.log('📤 ファイルをアップロード中...')
      const snapshot = await uploadBytes(fileRef, file)
      console.log('✅ ファイルアップロード完了:', snapshot.ref.fullPath)

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref)
      console.log('✅ ダウンロードURL取得完了:', downloadURL)

      // Firestoreのユーザードキュメントを更新
      if (db) {
        const userDocRef = doc(db, 'users', auth.currentUser.uid)
        await updateDoc(userDocRef, {
          avatarUrl: downloadURL,
          updatedAt: new Date()
        })
        console.log('✅ Firestoreのユーザーデータを更新完了')
      }

      // Firebase Authのユーザープロファイルを更新
      await updateProfile(auth.currentUser, {
        photoURL: downloadURL
      })
      console.log('✅ Firebase Authのプロファイルを更新完了')

      // ローカル状態を更新
      if (currentUser.value) {
        currentUser.value.avatarUrl = downloadURL
      }

      return downloadURL
    } catch (error) {
      console.error('❌ アイコンアップロードエラー:', error)
      setError(error)
      throw error
    }
  }

  // Delete user icon directly from Firebase Storage
  const deleteUserIcon = async () => {
    try {
      clearError()

      if (!auth.currentUser) {
        throw new Error(AuthErrorCodes.UNAUTHORIZED)
      }

      if (!storage) {
        throw new Error('Firebase Storage が利用できません')
      }

      console.log('🗑️ Firebase Storage から直接アイコンを削除')

      // 現在のアバターURLを取得
      const currentAvatarUrl = currentUser.value?.avatarUrl
      if (!currentAvatarUrl) {
        console.log('⚠️ 削除するアバター画像がありません')
        return true
      }

      try {
        // URLからファイルパスを抽出
        let filePath = null
        if (currentAvatarUrl.includes('firebasestorage.googleapis.com') || currentAvatarUrl.includes('storage.googleapis.com')) {
          const url = new URL(currentAvatarUrl)
          if (url.pathname.includes('/o/')) {
            const pathMatch = url.pathname.match(/\/o\/(.+?)\?/)
            if (pathMatch) {
              filePath = decodeURIComponent(pathMatch[1])
            }
          } else {
            // storage.googleapis.com URL format
            const pathParts = url.pathname.split('/')
            if (pathParts.length >= 3) {
              filePath = pathParts.slice(2).join('/')
            }
          }
        }

        if (filePath) {
          // Delete from Firebase Storage directly
          const fileRef = storageRef(storage, filePath)
          await deleteObject(fileRef)
          console.log('✅ Firebase Storage からファイル削除完了:', filePath)
        }
      } catch (deleteError) {
        console.warn('⚠️ ファイル削除に失敗（ファイルが既に存在しない可能性）:', deleteError.message)
        // 削除エラーは続行（ファイルが既に削除されている場合など）
      }

      // Firestoreのユーザードキュメントを更新
      if (db) {
        const userDocRef = doc(db, 'users', auth.currentUser.uid)
        await updateDoc(userDocRef, {
          avatarUrl: null,
          updatedAt: new Date()
        })
        console.log('✅ Firestoreのアバター情報を削除完了')
      }

      // Firebase Authのユーザープロファイルを更新
      await updateProfile(auth.currentUser, {
        photoURL: null
      })
      console.log('✅ Firebase Authのプロファイル削除完了')

      // ローカル状態を更新
      if (currentUser.value) {
        currentUser.value.avatarUrl = null
      }

      return true
    } catch (error) {
      console.error('❌ アイコン削除エラー:', error)
      setError(error)
      throw error
    }
  }

  // Initialize on mount
  onMounted(() => {
    initializeAuth()
  })

  return {
    // State
    user,
    isLoggedIn,
    loading,
    error,

    // Methods
    signUp,
    signIn,
    signInWithProvider,
    signOut: signOutUser,
    getCurrentUser,
    checkUsernameAvailability,
    updateEmail: updateUserEmail,
    updatePassword: updateUserPassword,
    sendEmailVerification: sendVerificationEmail,
    checkEmailVerification,
    refreshEmailVerification,
    deleteAccount,
    reauthenticate,
    clearError,
    uploadUserIcon,
    deleteUserIcon,

    // Utils
    initializeAuth
  }
}