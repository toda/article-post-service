/**
 * Mock data for development and testing
 */

export const mockArticle = {
  id: 'test-article',
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
  author: {
    uid: 'test-user',
    displayName: 'テストユーザー',
    email: 'test@example.com',
    bio: 'テスト用のユーザーアカウントです',
    avatarUrl: null
  },
  status: 'published',
  publishedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  categoryId: 'other',
  tags: ['テスト', 'コメント', '機能確認'],
  viewCount: 42,
  likeCount: 5,
  commentCount: 3,
  readingTime: 2,
  featured: false,
  draft: false,
  isLiked: false
}

export const mockComments = [
  {
    comment: {
      id: 'comment-1',
      content: 'とても参考になる記事ですね！コメント機能の実装がうまくいっているようで、素晴らしいです。',
      authorId: 'user-1',
      author: {
        uid: 'user-1',
        displayName: '田中太郎',
        avatarUrl: null,
        bio: 'フロントエンド開発者'
      },
      articleId: 'test-article',
      parentId: null,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      likeCount: 2,
      isDeleted: false,
      childCount: 1
    },
    replies: [
      {
        id: 'reply-1',
        content: 'ありがとうございます！まだ改善点はありますが、基本的な機能は動作しています。',
        authorId: 'test-user',
        author: {
          uid: 'test-user',
          displayName: 'テストユーザー',
          avatarUrl: null,
          bio: 'テスト用のユーザーアカウントです'
        },
        articleId: 'test-article',
        parentId: 'comment-1',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        likeCount: 1,
        isDeleted: false
      }
    ],
    totalReplies: 1,
    hasMoreReplies: false
  },
  {
    comment: {
      id: 'comment-2',
      content: 'マークダウンのサポートも **太字** や `コード` がちゃんと動いているのが良いですね！',
      authorId: 'user-2',
      author: {
        uid: 'user-2',
        displayName: '佐藤花子',
        avatarUrl: null,
        bio: 'バックエンド開発者'
      },
      articleId: 'test-article',
      parentId: null,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      likeCount: 1,
      isDeleted: false,
      childCount: 0
    },
    replies: [],
    totalReplies: 0,
    hasMoreReplies: false
  },
  {
    comment: {
      id: 'comment-3',
      content: 'リアルタイム更新も実装されていると嬉しいですね。将来的に追加される予定はありますか？',
      authorId: 'user-3',
      author: {
        uid: 'user-3',
        displayName: '山田次郎',
        avatarUrl: null,
        bio: 'フルスタック開発者'
      },
      articleId: 'test-article',
      parentId: null,
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
      updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      likeCount: 0,
      isDeleted: false,
      childCount: 0
    },
    replies: [],
    totalReplies: 0,
    hasMoreReplies: false
  }
]