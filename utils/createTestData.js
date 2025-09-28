/**
 * Helper functions to create test data in Firestore
 * Run these functions in the browser console to populate test data
 */

import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { getFirebaseFirestore } from '~/utils/firebase'

export async function createTestArticle() {
  const db = getFirebaseFirestore()
  if (!db) {
    console.error('Firestore not available')
    return
  }

  const articleData = {
    id: 'test-article',
    title: 'テスト記事：コメント機能のデモ',
    content: `# コメント機能のテスト記事

これはコメント機能をテストするための記事です。

## 機能について

この記事では以下の機能をテストできます：

- コメントの投稿
- コメントの表示
- リアルタイム更新
- 返信機能（ネストコメント）

## 使い方

下のコメントセクションでコメントを投稿してみてください。`,
    excerpt: 'コメント機能をテストするためのサンプル記事です。',
    authorId: 'test-user-uid-123',
    authorName: 'テストユーザー',
    publishedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    tags: ['テスト', 'コメント', 'デモ'],
    status: 'published',
    likes: 0,
    commentCount: 0,
    viewCount: 0
  }

  try {
    await setDoc(doc(db, 'articles', 'test-article'), articleData)
    console.log('✅ Test article created successfully!')
    console.log('📄 You can view it at: /articles/test-article')
    return articleData
  } catch (error) {
    console.error('❌ Error creating test article:', error)
    throw error
  }
}

export async function createTestUser() {
  const db = getFirebaseFirestore()
  if (!db) {
    console.error('Firestore not available')
    return
  }

  const userData = {
    uid: 'test-user-uid-123',
    email: 'test@example.com',
    displayName: 'テストユーザー',
    emailVerified: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isActive: true,
    role: 'user'
  }

  try {
    await setDoc(doc(db, 'users', 'test-user-uid-123'), userData)
    console.log('✅ Test user created successfully!')
    console.log('👤 User data:', JSON.stringify(userData, null, 2))
    return userData
  } catch (error) {
    console.error('❌ Error creating test user:', error)
    throw error
  }
}

// Console helper function
if (typeof window !== 'undefined') {
  window.createTestData = async function() {
    console.log('🚀 Creating test data...')

    try {
      await createTestUser()
      await createTestArticle()
      console.log('✅ All test data created! You can now test comments at /articles/test-article')
    } catch (error) {
      console.error('❌ Failed to create test data:', error)
    }
  }

  console.log('💡 Run window.createTestData() in the console to create test data')
}