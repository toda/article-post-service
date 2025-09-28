/**
 * Debug utility for avatar functionality
 * Run these functions in browser console to debug avatar issues
 */

import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { getFirebaseFirestore, getFirebaseAuth } from '~/utils/firebase'

// Debug current user avatar data
export async function debugCurrentUser() {
  const auth = getFirebaseAuth()
  const db = getFirebaseFirestore()

  if (!auth.currentUser) {
    console.log('❌ No current user logged in')
    return
  }

  console.log('🔍 Current Firebase Auth User:')
  console.log({
    uid: auth.currentUser.uid,
    email: auth.currentUser.email,
    displayName: auth.currentUser.displayName,
    photoURL: auth.currentUser.photoURL,
    emailVerified: auth.currentUser.emailVerified
  })

  if (db) {
    try {
      const userDoc = doc(db, 'users', auth.currentUser.uid)
      const userSnapshot = await getDoc(userDoc)

      if (userSnapshot.exists()) {
        console.log('📄 Firestore User Document:')
        console.log(userSnapshot.data())
      } else {
        console.log('❌ No Firestore user document found')
      }
    } catch (error) {
      console.error('❌ Error fetching Firestore user data:', error)
    }
  } else {
    console.log('❌ Firestore not available')
  }
}

// Debug comments and their author info
export async function debugComments() {
  const db = getFirebaseFirestore()

  if (!db) {
    console.log('❌ Firestore not available')
    return
  }

  try {
    const commentsRef = collection(db, 'comments')
    const q = query(commentsRef, orderBy('createdAt', 'desc'), limit(5))
    const snapshot = await getDocs(q)

    console.log('🔍 Recent comments:')

    for (const commentDoc of snapshot.docs) {
      const commentData = commentDoc.data()
      console.log(`\n📝 Comment ${commentDoc.id}:`)
      console.log({
        authorId: commentData.authorId,
        authorName: commentData.authorName,
        content: commentData.content?.substring(0, 50)
      })

      // Check author document
      if (commentData.authorId) {
        try {
          const authorDoc = doc(db, 'users', commentData.authorId)
          const authorSnapshot = await getDoc(authorDoc)

          if (authorSnapshot.exists()) {
            const authorData = authorSnapshot.data()
            console.log('👤 Author info from Firestore:')
            console.log({
              displayName: authorData.displayName,
              avatarUrl: authorData.avatarUrl,
              email: authorData.email
            })
          } else {
            console.log('❌ Author document not found')
          }
        } catch (error) {
          console.error('❌ Error fetching author:', error)
        }
      }
    }
  } catch (error) {
    console.error('❌ Error fetching comments:', error)
  }
}

// Debug avatar URL accessibility
export async function testAvatarUrl(url) {
  if (!url) {
    console.log('❌ No URL provided')
    return
  }

  console.log('🔍 Testing avatar URL:', url)

  // Test direct access
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors'
    })
    console.log('✅ Direct access response:', response.status)
  } catch (error) {
    console.log('❌ Direct access failed:', error.message)
  }

  // Test proxy access
  try {
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`
    const response = await fetch(proxyUrl, { method: 'HEAD' })
    console.log('✅ Proxy access response:', response.status)
  } catch (error) {
    console.log('❌ Proxy access failed:', error.message)
  }
}

// Make functions available globally for console use
if (typeof window !== 'undefined') {
  window.debugAvatar = {
    debugCurrentUser,
    debugComments,
    testAvatarUrl
  }

  console.log('💡 Avatar debug functions available:')
  console.log('- window.debugAvatar.debugCurrentUser()')
  console.log('- window.debugAvatar.debugComments()')
  console.log('- window.debugAvatar.testAvatarUrl("url")')
}