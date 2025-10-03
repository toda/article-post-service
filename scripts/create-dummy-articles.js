/**
 * Create 100 dummy articles for testing
 */

import 'dotenv/config'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Data for generating dummy articles
const categories = ['web', 'backend', 'frontend', 'mobile', 'devops', 'ai', 'database']
const tags = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust',
  'React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt',
  'Node.js', 'Express', 'Django', 'FastAPI', 'Spring Boot',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
  'PostgreSQL', 'MongoDB', 'Redis', 'Firebase',
  'GraphQL', 'REST', 'WebSocket', 'gRPC',
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch'
]

const titles = [
  'の基本的な使い方',
  'を使った開発入門',
  'のベストプラクティス',
  'で作るWebアプリケーション',
  '入門ガイド',
  'の実践的な活用方法',
  'チュートリアル',
  'を学ぶ',
  'の設計パターン',
  'のパフォーマンス最適化',
  'とは？初心者向け解説',
  'の便利な機能',
  'でできること',
  'の導入方法',
  'を使いこなす'
]

const contentTemplates = [
  (tech) => `# ${tech}について\n\n${tech}は現代的な開発に欠かせないツールの一つです。この記事では、${tech}の基本的な概念から実践的な使い方まで解説します。\n\n## ${tech}の特徴\n\n${tech}には以下のような特徴があります：\n\n- 高いパフォーマンス\n- 使いやすいAPI\n- 豊富なエコシステム\n- アクティブなコミュニティ\n\n## 実装例\n\n\`\`\`javascript\n// ${tech}のサンプルコード\nconst example = () => {\n  console.log('Hello, ${tech}!');\n};\n\nexample();\n\`\`\`\n\n## まとめ\n\n${tech}を使うことで、効率的な開発が可能になります。ぜひ試してみてください。`,

  (tech) => `この記事では${tech}の実践的な活用方法を紹介します。\n\n## はじめに\n\n${tech}は多くの開発者に支持されている技術です。本記事では実際のプロジェクトでの活用例を見ていきましょう。\n\n## 基本的な使い方\n\n${tech}を使い始めるには、まず環境をセットアップする必要があります。\n\n### インストール\n\n\`\`\`bash\nnpm install ${tech.toLowerCase()}\n\`\`\`\n\n### 基本設定\n\n設定ファイルを作成し、必要なオプションを指定します。\n\n## 応用例\n\n${tech}を使った実際のアプリケーション開発例を紹介します。\n\n## 参考リンク\n\n- [公式ドキュメント](https://example.com)\n- [GitHub](https://github.com)\n\n以上、${tech}の活用方法でした。`,

  (tech) => `# ${tech}を深く理解する\n\n${tech}について詳しく解説していきます。\n\n## ${tech}とは\n\n${tech}は、開発効率を向上させるための強力なツールです。\n\n## 主な機能\n\n1. **機能A**: 効率的な処理が可能\n2. **機能B**: 柔軟な設定\n3. **機能C**: 拡張性の高いアーキテクチャ\n\n## ユースケース\n\n${tech}は以下のような場面で活用できます：\n\n- Webアプリケーション開発\n- APIサーバーの構築\n- データ処理パイプライン\n- リアルタイムアプリケーション\n\n## ベストプラクティス\n\n${tech}を使用する際は、以下の点に注意してください：\n\n- パフォーマンスの最適化\n- セキュリティの考慮\n- テストの実装\n- ドキュメントの整備\n\n## まとめ\n\n${tech}をマスターすることで、より高度な開発が可能になります。`
]

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

async function createDummyArticles() {
  console.log('🚀 Creating 100 dummy articles...')

  const authorId = 'fV4v9pSiUIV5eyOaFR9vSc5A1cz2'

  try {
    for (let i = 1; i <= 100; i++) {
      const tech = getRandomElement(tags)
      const titleSuffix = getRandomElement(titles)
      const categoryId = getRandomElement(categories)
      const articleTags = getRandomElements(tags, Math.floor(Math.random() * 4) + 2)
      const contentTemplate = getRandomElement(contentTemplates)

      const article = {
        title: `${tech}${titleSuffix}`,
        content: contentTemplate(tech),
        excerpt: `${tech}について詳しく解説します。基本的な使い方から応用例まで、実践的な内容をカバーしています。`,
        categoryId: categoryId,
        tags: articleTags,
        authorId: authorId,
        isPublic: true,
        publishedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        viewCount: Math.floor(Math.random() * 1000),
        likeCount: Math.floor(Math.random() * 100),
        commentCount: Math.floor(Math.random() * 20)
      }

      const docRef = await addDoc(collection(db, 'articles'), article)
      console.log(`✅ Created article ${i}/100: ${article.title} (ID: ${docRef.id})`)

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log('🎉 Successfully created 100 dummy articles!')
  } catch (error) {
    console.error('❌ Error creating articles:', error)
    process.exit(1)
  }
}

// Run the script
createDummyArticles()
  .then(() => {
    console.log('✨ All done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
