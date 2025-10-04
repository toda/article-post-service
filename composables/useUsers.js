/**
 * Users Composable
 * Handles user profile management and user interactions
 */

import { ref, computed } from 'vue'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch
} from 'firebase/firestore'
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage'
import { getStorage } from 'firebase/storage'
import { useFirestore } from '~/composables/useFirestore'
import { useAuth } from '~/composables/useAuth'

// Error codes from contract
export const UserErrorCodes = {
  // User Errors
  USER_NOT_FOUND: 'user/not-found',
  USER_UNAUTHORIZED: 'user/unauthorized',
  USER_ALREADY_EXISTS: 'user/already-exists',

  // Profile Errors
  PROFILE_UPDATE_FAILED: 'profile/update-failed',
  DISPLAY_NAME_REQUIRED: 'profile/display-name-required',
  DISPLAY_NAME_TAKEN: 'profile/display-name-taken',
  BIO_TOO_LONG: 'profile/bio-too-long',
  INVALID_URL: 'profile/invalid-url',

  // Username Errors
  USERNAME_REQUIRED: 'username/required',
  USERNAME_TAKEN: 'username/taken',
  USERNAME_INVALID: 'username/invalid',
  USERNAME_TOO_SHORT: 'username/too-short',
  USERNAME_TOO_LONG: 'username/too-long',

  // Avatar Errors
  AVATAR_UPLOAD_FAILED: 'avatar/upload-failed',
  AVATAR_FILE_TOO_LARGE: 'avatar/file-too-large',
  AVATAR_INVALID_TYPE: 'avatar/invalid-type',

  // Follow Errors
  CANNOT_FOLLOW_SELF: 'follow/cannot-follow-self',
  ALREADY_FOLLOWING: 'follow/already-following',
  NOT_FOLLOWING: 'follow/not-following',

  // Statistics Errors
  STATS_ACCESS_DENIED: 'stats/access-denied'
}

export function useUsers() {
  // Handle server-side rendering
  if (typeof window === 'undefined') {
    return {
      loading: computed(() => false),
      error: computed(() => null),
      getUser: () => Promise.resolve(null),
      updateUser: () => Promise.resolve(null),
      deleteUser: () => Promise.resolve(),
      uploadAvatar: () => Promise.resolve(null),
      deleteAvatar: () => Promise.resolve(),
      followUser: () => Promise.resolve(),
      unfollowUser: () => Promise.resolve(),
      getFollowers: () => Promise.resolve({ users: [], hasNext: false }),
      getFollowing: () => Promise.resolve({ users: [], hasNext: false }),
      searchUsers: () => Promise.resolve({ users: [], hasNext: false }),
      exportUserData: () => Promise.resolve(null),
      clearError: () => {}
    }
  }

  const { db } = useFirestore()
  const { user: currentUser } = useAuth()

  // Initialize storage only when needed
  const getStorageInstance = () => {
    try {
      const { getFirebaseApp } = require('~/utils/firebase')
      const app = getFirebaseApp()
      return app ? getStorage(app) : null
    } catch (error) {
      console.warn('Firebase Storage not available:', error)
      return null
    }
  }

  // State
  const usersLoading = ref(false)
  const usersError = ref(null)

  // Computed
  const loading = computed(() => usersLoading.value)
  const error = computed(() => usersError.value)

  // Clear error
  const clearError = () => {
    usersError.value = null
  }

  // Set error
  const setError = (error) => {
    if (error?.code) {
      usersError.value = {
        code: error.code,
        message: error.message
      }
    } else {
      usersError.value = {
        code: 'user/unknown-error',
        message: error?.message || 'An unknown error occurred'
      }
    }
  }

  // Validate profile data
  const validateProfileData = (data) => {
    if (data.bio && data.bio.length > 500) {
      throw new Error(UserErrorCodes.BIO_TOO_LONG)
    }

    if (data.website && !isValidUrl(data.website)) {
      throw new Error(UserErrorCodes.INVALID_URL)
    }
  }

  // URL validation helper
  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  // Username validation
  const validateUsername = (username) => {
    if (!username) {
      throw new Error(UserErrorCodes.USERNAME_REQUIRED)
    }

    if (username.length < 3) {
      throw new Error(UserErrorCodes.USERNAME_TOO_SHORT)
    }

    if (username.length > 20) {
      throw new Error(UserErrorCodes.USERNAME_TOO_LONG)
    }

    // Only allow alphanumeric characters, underscores, and hyphens
    const usernameRegex = /^[a-zA-Z0-9_-]+$/
    if (!usernameRegex.test(username)) {
      throw new Error(UserErrorCodes.USERNAME_INVALID)
    }

    return true
  }

  // Check if username is available
  const checkUsernameAvailability = async (username) => {
    try {
      validateUsername(username)

      const q = query(
        collection(db, 'users'),
        where('username', '==', username.toLowerCase()),
        limit(1)
      )
      const snapshot = await getDocs(q)

      return snapshot.empty
    } catch (error) {
      throw error
    }
  }

  // Generate username from display name
  const generateUsername = (displayName) => {
    // Remove special characters and spaces, convert to lowercase
    let username = displayName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')

    // Ensure minimum length
    if (username.length < 3) {
      username = username + '_user'
    }

    // Ensure maximum length
    if (username.length > 20) {
      username = username.substring(0, 20)
    }

    return username
  }

  // Get user profile by username
  const getUserProfileByUsername = async (username) => {
    try {
      clearError()
      usersLoading.value = true

      const q = query(
        collection(db, 'users'),
        where('username', '==', username.toLowerCase()),
        limit(1)
      )
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        throw new Error(UserErrorCodes.USER_NOT_FOUND)
      }

      const userDoc = snapshot.docs[0]
      const userData = userDoc.data()
      const userId = userDoc.id

      // Check if current user is following this user
      let isFollowing = false
      if (currentUser.value) {
        const followId = `${currentUser.value.uid}_${userId}`
        const followDoc = doc(db, 'follows', followId)
        const followSnapshot = await getDoc(followDoc)
        isFollowing = followSnapshot.exists()
      }

      return {
        uid: userId,
        ...userData,
        isFollowing
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      usersLoading.value = false
    }
  }

  // Get user profile
  const getUserProfile = async (userId) => {
    try {
      clearError()
      usersLoading.value = true

      const userDoc = doc(db, 'users', userId)
      const userSnapshot = await getDoc(userDoc)

      if (!userSnapshot.exists()) {
        throw new Error(UserErrorCodes.USER_NOT_FOUND)
      }

      const userData = userSnapshot.data()

      // Check if current user is following this user
      let isFollowing = false
      if (currentUser.value) {
        const followId = `${currentUser.value.uid}_${userId}`
        const followDoc = doc(db, 'follows', followId)
        const followSnapshot = await getDoc(followDoc)
        isFollowing = followSnapshot.exists()
      }

      return {
        uid: userId,
        ...userData,
        isFollowing
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      usersLoading.value = false
    }
  }

  // Update user profile
  const updateUserProfile = async (userId, profileData) => {
    try {
      clearError()
      usersLoading.value = true

      if (!currentUser.value) {
        throw new Error(UserErrorCodes.USER_UNAUTHORIZED)
      }

      // Ensure user can only update their own profile
      if (currentUser.value.uid !== userId) {
        throw new Error(UserErrorCodes.USER_UNAUTHORIZED)
      }

      // Validate profile data
      validateProfileData(profileData)

      const userDoc = doc(db, 'users', userId)
      await updateDoc(userDoc, {
        ...profileData,
        updatedAt: new Date()
      })

      return {
        uid: userId,
        ...profileData,
        updatedAt: new Date()
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      usersLoading.value = false
    }
  }

  // Upload avatar
  const uploadAvatar = async (file) => {
    try {
      clearError()
      usersLoading.value = true

      if (!currentUser.value) {
        throw new Error(UserErrorCodes.USER_UNAUTHORIZED)
      }

      // Validate file
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        throw new Error(UserErrorCodes.AVATAR_FILE_TOO_LARGE)
      }

      if (!file.type.startsWith('image/')) {
        throw new Error(UserErrorCodes.AVATAR_INVALID_TYPE)
      }

      // Create storage reference
      const avatarRef = storageRef(storage, `avatars/${currentUser.value.uid}/${Date.now()}_${file.name}`)

      // Upload file
      const snapshot = await uploadBytes(avatarRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)

      return {
        avatarUrl: downloadURL
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      usersLoading.value = false
    }
  }

  // Delete avatar
  const deleteAvatar = async (avatarUrl) => {
    try {
      clearError()

      if (!currentUser.value) {
        throw new Error(UserErrorCodes.USER_UNAUTHORIZED)
      }

      // Delete from storage
      const avatarRef = storageRef(storage, avatarUrl)
      await deleteObject(avatarRef)

      // Update user document
      const userDoc = doc(db, 'users', currentUser.value.uid)
      await updateDoc(userDoc, {
        avatarUrl: null,
        updatedAt: new Date()
      })
    } catch (error) {
      setError(error)
      throw error
    }
  }

  // Follow user
  const followUser = async (userId) => {
    try {
      clearError()

      if (!currentUser.value) {
        throw new Error(UserErrorCodes.USER_UNAUTHORIZED)
      }

      if (currentUser.value.uid === userId) {
        throw new Error(UserErrorCodes.CANNOT_FOLLOW_SELF)
      }

      const followId = `${currentUser.value.uid}_${userId}`
      const followDoc = doc(db, 'follows', followId)

      // Check if already following
      const existingFollow = await getDoc(followDoc)
      if (existingFollow.exists()) {
        throw new Error(UserErrorCodes.ALREADY_FOLLOWING)
      }

      // Create follow relationship
      await setDoc(followDoc, {
        followerId: currentUser.value.uid,
        followingId: userId,
        createdAt: new Date()
      })

      // Update follower count
      const targetUserDoc = doc(db, 'users', userId)
      await updateDoc(targetUserDoc, {
        followerCount: increment(1)
      })

      // Update following count
      const currentUserDoc = doc(db, 'users', currentUser.value.uid)
      await updateDoc(currentUserDoc, {
        followingCount: increment(1)
      })
    } catch (error) {
      setError(error)
      throw error
    }
  }

  // Unfollow user
  const unfollowUser = async (userId) => {
    try {
      clearError()

      if (!currentUser.value) {
        throw new Error(UserErrorCodes.USER_UNAUTHORIZED)
      }

      const followId = `${currentUser.value.uid}_${userId}`
      const followDoc = doc(db, 'follows', followId)

      // Check if following
      const existingFollow = await getDoc(followDoc)
      if (!existingFollow.exists()) {
        throw new Error(UserErrorCodes.NOT_FOLLOWING)
      }

      // Delete follow relationship
      await deleteDoc(followDoc)

      // Update follower count
      const targetUserDoc = doc(db, 'users', userId)
      await updateDoc(targetUserDoc, {
        followerCount: increment(-1)
      })

      // Update following count
      const currentUserDoc = doc(db, 'users', currentUser.value.uid)
      await updateDoc(currentUserDoc, {
        followingCount: increment(-1)
      })
    } catch (error) {
      setError(error)
      throw error
    }
  }

  // Get user followers
  const getUserFollowers = async (userId, options = {}) => {
    try {
      clearError()
      usersLoading.value = true

      const { page = 1, limit: pageLimit = 20 } = options

      let q = query(
        collection(db, 'follows'),
        where('followingId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(pageLimit)
      )

      if (page > 1 && options.startAfter) {
        q = query(q, startAfter(options.startAfter))
      }

      const snapshot = await getDocs(q)
      const followers = []

      for (const doc of snapshot.docs) {
        const followData = doc.data()
        const userDoc = await getDoc(doc(db, 'users', followData.followerId))
        if (userDoc.exists()) {
          followers.push({
            id: userDoc.id,
            ...userDoc.data(),
            followedAt: followData.createdAt
          })
        }
      }

      return {
        followers,
        hasNext: snapshot.docs.length === pageLimit,
        nextCursor: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      usersLoading.value = false
    }
  }

  // Get user following
  const getUserFollowing = async (userId, options = {}) => {
    try {
      clearError()
      usersLoading.value = true

      const { page = 1, limit: pageLimit = 20 } = options

      let q = query(
        collection(db, 'follows'),
        where('followerId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(pageLimit)
      )

      if (page > 1 && options.startAfter) {
        q = query(q, startAfter(options.startAfter))
      }

      const snapshot = await getDocs(q)
      const following = []

      for (const doc of snapshot.docs) {
        const followData = doc.data()
        const userDoc = await getDoc(doc(db, 'users', followData.followingId))
        if (userDoc.exists()) {
          following.push({
            id: userDoc.id,
            ...userDoc.data(),
            followedAt: followData.createdAt
          })
        }
      }

      return {
        following,
        hasNext: snapshot.docs.length === pageLimit,
        nextCursor: snapshot.docs.length > 0 ? following[following.length - 1] : null
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      usersLoading.value = false
    }
  }

  // Search users
  const searchUsers = async (searchTerm, options = {}) => {
    try {
      clearError()
      usersLoading.value = true

      const { limit: pageLimit = 20 } = options

      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation - in production, consider using Algolia or similar
      const q = query(
        collection(db, 'users'),
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff'),
        orderBy('displayName'),
        limit(pageLimit)
      )

      const snapshot = await getDocs(q)
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      return {
        users,
        total: users.length,
        hasNext: snapshot.docs.length === pageLimit
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      usersLoading.value = false
    }
  }

  // Get user statistics
  const getUserStats = async (userId) => {
    try {
      clearError()

      if (!currentUser.value || (currentUser.value.uid !== userId)) {
        throw new Error(UserErrorCodes.STATS_ACCESS_DENIED)
      }

      // Get user articles count and total views/likes
      const articlesQuery = query(
        collection(db, 'articles'),
        where('authorId', '==', userId)
      )
      const articlesSnapshot = await getDocs(articlesQuery)

      let totalViews = 0
      let totalLikes = 0
      const articles = []

      articlesSnapshot.forEach(doc => {
        const article = doc.data()
        totalViews += article.viewCount || 0
        totalLikes += article.likeCount || 0
        articles.push({
          id: doc.id,
          ...article
        })
      })

      // Get comments count
      const commentsQuery = query(
        collection(db, 'comments'),
        where('authorId', '==', userId)
      )
      const commentsSnapshot = await getDocs(commentsQuery)

      return {
        totalArticles: articlesSnapshot.size,
        totalViews,
        totalLikes,
        totalComments: commentsSnapshot.size,
        topArticles: articles
          .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
          .slice(0, 5),
        recentActivity: [] // Would need to implement activity tracking
      }
    } catch (error) {
      setError(error)
      throw error
    }
  }

  // Update privacy settings
  const updatePrivacySettings = async (privacySettings) => {
    try {
      clearError()

      if (!currentUser.value) {
        throw new Error(UserErrorCodes.USER_UNAUTHORIZED)
      }

      const userDoc = doc(db, 'users', currentUser.value.uid)
      await updateDoc(userDoc, {
        privacySettings,
        updatedAt: new Date()
      })
    } catch (error) {
      setError(error)
      throw error
    }
  }

  // Export user data
  const exportUserData = async (userId) => {
    try {
      clearError()

      if (!currentUser.value || currentUser.value.uid !== userId) {
        throw new Error(UserErrorCodes.USER_UNAUTHORIZED)
      }

      // Get all user data
      const userData = await getUserProfile(userId)
      const userStats = await getUserStats(userId)

      // Get user articles
      const articlesQuery = query(
        collection(db, 'articles'),
        where('authorId', '==', userId)
      )
      const articlesSnapshot = await getDocs(articlesQuery)
      const articles = articlesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Get user comments
      const commentsQuery = query(
        collection(db, 'comments'),
        where('authorId', '==', userId)
      )
      const commentsSnapshot = await getDocs(commentsQuery)
      const comments = commentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      const exportData = {
        profile: userData,
        statistics: userStats,
        articles,
        comments,
        exportedAt: new Date()
      }

      // In a real implementation, you would upload this to storage and return a download URL
      // For now, we'll return the data directly
      return {
        downloadUrl: `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`,
        data: exportData
      }
    } catch (error) {
      setError(error)
      throw error
    }
  }

  // Delete user data
  const deleteUserData = async (userId) => {
    try {
      clearError()
      console.log('🗑️ Starting user data deletion for user:', userId)

      if (!currentUser.value || currentUser.value.uid !== userId) {
        throw new Error(UserErrorCodes.USER_UNAUTHORIZED)
      }

      // Step 1: Anonymize user's articles (keep articles but remove author info)
      console.log('📰 Anonymizing user articles...')
      const articlesQuery = query(
        collection(db, 'articles'),
        where('authorId', '==', userId)
      )
      const articlesSnapshot = await getDocs(articlesQuery)
      console.log(`📰 Found ${articlesSnapshot.docs.length} articles to anonymize`)

      for (const articleDoc of articlesSnapshot.docs) {
        console.log('📰 Anonymizing article:', articleDoc.id)
        await updateDoc(articleDoc.ref, {
          authorId: '[deleted]',
          author: {
            displayName: '[削除されたユーザー]',
            avatarUrl: null,
            bio: null
          },
          updatedAt: new Date()
        })
      }

      // Step 2: Anonymize user's comments (keep comments but remove author info)
      console.log('💬 Anonymizing user comments...')
      const userCommentsQuery = query(
        collection(db, 'comments'),
        where('authorId', '==', userId)
      )
      const userCommentsSnapshot = await getDocs(userCommentsQuery)
      console.log(`💬 Found ${userCommentsSnapshot.docs.length} user comments to anonymize`)

      for (const commentDoc of userCommentsSnapshot.docs) {
        console.log('💬 Anonymizing comment:', commentDoc.id)
        await updateDoc(commentDoc.ref, {
          authorId: '[deleted]',
          authorName: '[削除されたユーザー]',
          author: {
            displayName: '[削除されたユーザー]',
            avatarUrl: null
          },
          updatedAt: new Date()
        })
      }

      // Step 3: Delete user's likes on articles
      console.log('❤️ Deleting user likes on articles...')
      const userLikesQuery = query(
        collection(db, 'likes'),
        where('userId', '==', userId)
      )
      const userLikesSnapshot = await getDocs(userLikesQuery)
      console.log(`❤️ Found ${userLikesSnapshot.docs.length} user likes to delete`)

      for (const likeDoc of userLikesSnapshot.docs) {
        await deleteDoc(likeDoc.ref)
      }

      // Step 4: Delete user's likes on comments
      console.log('❤️ Deleting user likes on comments...')
      const userCommentLikesQuery = query(
        collection(db, 'commentLikes'),
        where('userId', '==', userId)
      )
      const userCommentLikesSnapshot = await getDocs(userCommentLikesQuery)
      console.log(`❤️ Found ${userCommentLikesSnapshot.docs.length} user comment likes to delete`)

      for (const likeDoc of userCommentLikesSnapshot.docs) {
        await deleteDoc(likeDoc.ref)
      }

      // Step 5: Delete follow relationships
      console.log('👥 Deleting follow relationships...')
      const followsAsFollowerQuery = query(
        collection(db, 'follows'),
        where('followerId', '==', userId)
      )
      const followsAsFollowingQuery = query(
        collection(db, 'follows'),
        where('followingId', '==', userId)
      )

      const [followerSnapshot, followingSnapshot] = await Promise.all([
        getDocs(followsAsFollowerQuery),
        getDocs(followsAsFollowingQuery)
      ])

      console.log(`👥 Found ${followerSnapshot.docs.length + followingSnapshot.docs.length} follow relationships to delete`)

      for (const doc of [...followerSnapshot.docs, ...followingSnapshot.docs]) {
        await deleteDoc(doc.ref)
      }

      // Step 6: Delete user document
      console.log('👤 Deleting user document...')
      await deleteDoc(doc(db, 'users', userId))

      console.log('✅ User data deletion completed successfully')
    } catch (error) {
      console.error('❌ Error during user data deletion:', error)
      setError(error)
      throw error
    }
  }

  return {
    // State
    loading,
    error,

    // Methods
    getUserProfile,
    getUserProfileByUsername,
    updateUserProfile,
    uploadAvatar,
    deleteAvatar,
    followUser,
    unfollowUser,
    getUserFollowers,
    getUserFollowing,
    searchUsers,
    getUserStats,
    updatePrivacySettings,
    exportUserData,
    deleteUserData,
    validateUsername,
    checkUsernameAvailability,
    generateUsername,
    clearError
  }
}