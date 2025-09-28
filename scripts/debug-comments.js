#!/usr/bin/env node

/**
 * Debug script to check comments in Firestore
 * Run with: node scripts/debug-comments.js
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, where, connectFirestoreEmulator } from 'firebase/firestore'

// Firebase config for production/development
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function debugComments() {
  try {
    console.log('🔍 Debugging comments in Firestore...')

    // Get all comments for test article
    const commentsRef = collection(db, 'comments')
    const q = query(commentsRef, where('articleId', '==', 'test-article'))
    const snapshot = await getDocs(q)

    console.log(`📝 Found ${snapshot.docs.length} comments for test-article`)

    snapshot.docs.forEach((doc) => {
      const data = doc.data()
      console.log(`\n💬 Comment ID: ${doc.id}`)
      console.log(`   📄 Content: ${data.content?.substring(0, 50)}...`)
      console.log(`   👤 Author ID: ${data.authorId}`)
      console.log(`   🏷️ Author Name: ${data.authorName}`)
      console.log(`   ⏰ Created: ${data.createdAt}`)
      console.log(`   📋 Full data:`, JSON.stringify(data, null, 2))
    })

    // Check users collection
    console.log('\n👥 Checking users collection...')
    const usersRef = collection(db, 'users')
    const usersSnapshot = await getDocs(usersRef)

    console.log(`👤 Found ${usersSnapshot.docs.length} users`)
    usersSnapshot.docs.forEach((doc) => {
      const data = doc.data()
      console.log(`\n🆔 User ID: ${doc.id}`)
      console.log(`   📧 Email: ${data.email}`)
      console.log(`   🏷️ Display Name: ${data.displayName}`)
      console.log(`   📋 Full data:`, JSON.stringify(data, null, 2))
    })

  } catch (error) {
    console.error('❌ Error debugging comments:', error)
  }
}

// Run the debug script
debugComments()