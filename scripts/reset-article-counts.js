/**
 * Reset likeCount and commentCount to 0 for all articles
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDhy7i2ZMuHxfVIKd_DPKkRc-PwRqnw8QA",
  authDomain: "first-speckit.firebaseapp.com",
  projectId: "first-speckit",
  storageBucket: "first-speckit.firebasestorage.app",
  messagingSenderId: "901237974885",
  appId: "1:901237974885:web:d76ee0da21e4eaf3d49c1a"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function resetArticleCounts() {
  console.log('🚀 Resetting likeCount and commentCount for all articles...')

  try {
    // Get all articles
    const articlesSnapshot = await getDocs(collection(db, 'articles'))
    console.log(`📊 Found ${articlesSnapshot.size} articles`)

    let updatedCount = 0

    for (const docSnapshot of articlesSnapshot.docs) {
      const articleData = docSnapshot.data()

      // Only update if likeCount or commentCount is not 0
      if (articleData.likeCount !== 0 || articleData.commentCount !== 0) {
        await updateDoc(doc(db, 'articles', docSnapshot.id), {
          likeCount: 0,
          commentCount: 0
        })

        updatedCount++
        console.log(`✅ Updated article: ${articleData.title} (ID: ${docSnapshot.id})`)
      }
    }

    console.log(`🎉 Successfully reset ${updatedCount} articles!`)
    console.log(`ℹ️  ${articlesSnapshot.size - updatedCount} articles were already at 0`)
  } catch (error) {
    console.error('❌ Error resetting article counts:', error)
    process.exit(1)
  }
}

// Run the script
resetArticleCounts()
  .then(() => {
    console.log('✨ All done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
