/**
 * Initialize test data for development
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'

// Firebase config (same as in nuxt.config.ts)
const firebaseConfig = {
  apiKey: "AIzaSyBUCGgZ8o4Ygj2CDKFY_UaOr-RE4whOJkY",
  authDomain: "first-speckit.firebaseapp.com",
  projectId: "first-speckit",
  storageBucket: "first-speckit.firebasestorage.app",
  messagingSenderId: "677560287317",
  appId: "1:677560287317:web:88b27378cd0de9e66354dc"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function createTestArticle() {
  try {
    console.log('Creating test article...')

    const testArticle = {
      title: 'テスト記事 - コメント機能の確認',
      content: `# コメント機能のテスト記事

この記事は、コメント機能が正常に動作することを確認するためのテスト記事です。

## コメント機能について

- ユーザーはログインしてコメントを投稿できます
- コメントに返信することができます
- コメントの編集・削除が可能です
- マークダウンがサポートされています

## コメントを試してみてください

ページの下部にあるコメントセクションで、以下のことができます：

1. **ログインしてコメント投稿**
2. **他のコメントに返信**
3. **自分のコメントを編集・削除**

ぜひコメント機能をお試しください！`,
      excerpt: 'コメント機能のテストのためのサンプル記事です。',
      slug: 'test-article',
      authorId: 'test-user',
      status: 'published',
      publishedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      categoryId: 'other',
      tags: ['テスト', 'コメント', '機能確認'],
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      readingTime: 2,
      featured: false,
      draft: false
    }

    // Create the article document
    await setDoc(doc(db, 'articles', 'test-article'), testArticle)

    console.log('✅ Test article created successfully!')
    console.log('📝 Article ID: test-article')
    console.log('🌐 URL: http://localhost:3001/articles/test-article')

    // Create test user
    const testUser = {
      uid: 'test-user',
      displayName: 'テストユーザー',
      email: 'test@example.com',
      bio: 'テスト用のユーザーアカウントです',
      avatarUrl: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      followerCount: 0,
      followingCount: 0,
      articleCount: 1
    }

    await setDoc(doc(db, 'users', 'test-user'), testUser)
    console.log('✅ Test user created successfully!')

  } catch (error) {
    console.error('❌ Error creating test data:', error)
  }
}

// Run the script
createTestArticle()
  .then(() => {
    console.log('\n🎉 Test data initialization complete!')
    console.log('👆 Visit the URL above to see the comment section')
    process.exit(0)
  })
  .catch(error => {
    console.error('Failed to initialize test data:', error)
    process.exit(1)
  })