/**
 * Recalculate category article counts from existing articles
 * Run this script with: node scripts/recalculate-category-counts.js
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore'

// Firebase configuration (same as in utils/firebase.js)
const firebaseConfig = {
  apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID
}

// Predefined categories
const CATEGORIES = [
  { id: 'frontend', name: 'フロントエンド', slug: 'frontend', color: '#3B82F6', isActive: true, sortOrder: 1 },
  { id: 'backend', name: 'バックエンド', slug: 'backend', color: '#10B981', isActive: true, sortOrder: 2 },
  { id: 'mobile', name: 'モバイル', slug: 'mobile', color: '#8B5CF6', isActive: true, sortOrder: 3 },
  { id: 'devops', name: 'DevOps', slug: 'devops', color: '#F59E0B', isActive: true, sortOrder: 4 },
  { id: 'ai-ml', name: 'AI・機械学習', slug: 'ai-ml', color: '#EF4444', isActive: true, sortOrder: 5 },
  { id: 'security', name: 'セキュリティ', slug: 'security', color: '#6B7280', isActive: true, sortOrder: 6 },
  { id: 'other', name: 'その他', slug: 'other', color: '#94A3B8', isActive: true, sortOrder: 99 }
]

async function recalculateCategoryCounts() {
  console.log('🔄 Starting category count recalculation...')

  // Initialize Firebase
  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)

  // Get all public articles
  const articlesSnapshot = await getDocs(collection(db, 'articles'))
  const articles = articlesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  console.log(`📊 Found ${articles.length} total articles`)

  // Count articles by category
  const categoryCounts = {}
  CATEGORIES.forEach(cat => {
    categoryCounts[cat.id] = 0
  })

  articles.forEach(article => {
    if (article.isPublic && article.categoryId && categoryCounts[article.categoryId] !== undefined) {
      categoryCounts[article.categoryId]++
    }
  })

  console.log('📊 Category counts:', categoryCounts)

  // Update Firestore categories collection
  const batch = writeBatch(db)

  for (const category of CATEGORIES) {
    const categoryDoc = doc(db, 'categories', category.id)
    batch.set(categoryDoc, {
      ...category,
      articleCount: categoryCounts[category.id]
    }, { merge: true })
  }

  await batch.commit()

  console.log('✅ Category counts updated successfully!')

  // Display results
  CATEGORIES.forEach(cat => {
    console.log(`  ${cat.name}: ${categoryCounts[cat.id]} articles`)
  })
}

// Run the script
recalculateCategoryCounts()
  .then(() => {
    console.log('✅ Script completed')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
