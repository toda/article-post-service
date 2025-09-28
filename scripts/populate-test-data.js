#!/usr/bin/env node

/**
 * Script to populate Firestore with initial test data
 * Run with: node scripts/populate-test-data.js
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, setDoc, serverTimestamp, connectFirestoreEmulator } from 'firebase/firestore'

// Firebase config for emulator
const firebaseConfig = {
  projectId: "demo-project"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Connect to Firestore emulator
try {
  connectFirestoreEmulator(db, 'localhost', 8080)
  console.log('🔗 Connected to Firestore emulator')
} catch (error) {
  console.log('⚠️ Could not connect to emulator, using production config')
}

async function createTestUser() {
  console.log('🔄 Creating test user document...')

  const userId = 'test-user-uid-123'
  const userData = {
    uid: userId,
    email: 'test@example.com',
    displayName: 'テストユーザー',
    emailVerified: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isActive: true,
    role: 'user'
  }

  try {
    await setDoc(doc(db, 'users', userId), userData)
    console.log('✅ Test user document created:', userId)
    return { uid: userId, ...userData }
  } catch (error) {
    console.error('❌ Error creating test user document:', error)
    throw error
  }
}

async function createTestArticle() {
  console.log('🔄 Creating test article...')

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
    console.log('✅ Test article created: test-article')
  } catch (error) {
    console.error('❌ Error creating test article:', error)
    throw error
  }
}

async function createTestComments() {
  console.log('🔄 Creating test comments...')

  const comments = [
    {
      id: 'comment-1',
      content: '素晴らしい記事ですね！コメント機能が正常に動作しているようです。',
      authorId: 'test-user-uid-123',
      authorName: 'テストユーザー',
      articleId: 'test-article',
      parentId: null,
      depth: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: 2,
      replies: 1
    },
    {
      id: 'comment-1-reply-1',
      content: 'ありがとうございます！返信機能もテストしてみます。',
      authorId: 'test-user-uid-123',
      authorName: 'テストユーザー',
      articleId: 'test-article',
      parentId: 'comment-1',
      depth: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: 1,
      replies: 0
    },
    {
      id: 'comment-2',
      content: 'Firestoreとの連携も問題なく動作していますね。リアルタイム更新が素晴らしいです！',
      authorId: 'test-user-uid-123',
      authorName: 'テストユーザー',
      articleId: 'test-article',
      parentId: null,
      depth: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: 3,
      replies: 0
    },
    {
      id: 'comment-3',
      content: 'マークダウンの表示も**太字**や*斜体*、`コード`がきちんと反映されていて良いですね。\n\n改行も正しく処理されています。',
      authorId: 'test-user-uid-123',
      authorName: 'テストユーザー',
      articleId: 'test-article',
      parentId: null,
      depth: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: 1,
      replies: 0
    }
  ]

  try {
    for (const comment of comments) {
      await setDoc(doc(db, 'comments', comment.id), comment)
      console.log('✅ Comment created:', comment.id)
    }

    // Update article comment count
    await setDoc(doc(db, 'articles', 'test-article'), {
      commentCount: comments.length
    }, { merge: true })

    console.log('✅ All test comments created and article updated')
  } catch (error) {
    console.error('❌ Error creating test comments:', error)
    throw error
  }
}

async function main() {
  try {
    console.log('🚀 Starting test data population...')

    // Create test user
    const testUser = await createTestUser()

    // Create test article
    await createTestArticle()

    // Create test comments
    await createTestComments()

    console.log('✅ All test data created successfully!')
    console.log('📝 You can now view the test article at: /articles/test-article')
    console.log('💬 Comments should be loaded from Firestore instead of mock data')

  } catch (error) {
    console.error('❌ Error populating test data:', error)
    process.exit(1)
  }
}

// Run the script
main()