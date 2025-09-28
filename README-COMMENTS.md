# コメント機能の使用方法

コメント機能がモックデータからFirestoreに正常に切り替えられました。

## 🚀 クイックスタート

### 1. 開発サーバーを起動

```bash
npm run dev
```

### 2. テストデータを作成

ブラウザで `http://localhost:3000` にアクセスし、開発者コンソールを開いて以下を実行：

```javascript
window.createTestData()
```

これにより以下が作成されます：
- テスト記事（ID: `test-article`）
- テストユーザー（ID: `test-user-uid-123`）

### 3. コメント機能をテスト

`http://localhost:3000/articles/test-article` にアクセスしてコメント機能をテストできます。

## 📂 関連ファイル

### コンポーネント
- `components/CommentsSection.vue` - メインのコメントセクション
- `components/CommentForm.vue` - コメント投稿フォーム
- `components/CommentItem.vue` - 個別コメント表示
- `components/CommentThread.vue` - コメントスレッド管理

### コンポーザブル
- `composables/useComments.js` - コメントCRUD操作
- `composables/useAuth.js` - 認証管理
- `composables/useFirestore.js` - Firestore接続
- `composables/useArticles.js` - 記事管理

### ユーティリティ
- `utils/firebase.js` - Firebase設定
- `utils/createTestData.js` - テストデータ作成ヘルパー

## 🔧 Firestore設定

### セキュリティルール

`firestore.rules` ファイルには以下のコレクション用のルールが設定済み：

- `articles` - 記事データ
- `comments` - コメントデータ
- `users` - ユーザーデータ
- `likes` - いいねデータ

### データ構造

#### Articles コレクション
```javascript
{
  id: "article-id",
  title: "記事タイトル",
  content: "記事内容（markdown）",
  authorId: "user-id",
  authorName: "著者名",
  publishedAt: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp,
  tags: ["tag1", "tag2"],
  status: "published",
  commentCount: 0,
  likes: 0,
  viewCount: 0
}
```

#### Comments コレクション
```javascript
{
  id: "comment-id",
  content: "コメント内容（markdown）",
  authorId: "user-id",
  articleId: "article-id",
  parentId: "parent-comment-id", // null for top-level comments
  depth: 0, // 0 for top-level, 1+ for replies
  createdAt: timestamp,
  updatedAt: timestamp,
  likes: 0,
  replies: 0,
  isDeleted: false
}
```

#### Users コレクション
```javascript
{
  uid: "user-id",
  email: "user@example.com",
  displayName: "ユーザー名",
  emailVerified: false,
  createdAt: timestamp,
  updatedAt: timestamp,
  isActive: true,
  role: "user"
}
```

## 🎯 主な機能

### 実装済み機能
- ✅ コメントの投稿
- ✅ コメントの表示
- ✅ リアルタイム更新（Firestore onSnapshot）
- ✅ 返信機能（ネストコメント）
- ✅ マークダウン対応
- ✅ 認証連携
- ✅ SSR対応

### 今後の拡張可能性
- いいね機能
- コメント編集・削除
- 通知機能
- コメントの検索・フィルタ
- モデレーション機能

## 🔍 デバッグ

### よくある問題

#### 1. Firebase接続エラー
- Firebase設定ファイル（`utils/firebase.js`）を確認
- プロジェクトIDとAPIキーが正しいか確認

#### 2. コメントが表示されない
- ブラウザコンソールでエラーを確認
- Firestoreルールが正しく設定されているか確認
- テストデータが作成されているか確認

#### 3. 認証エラー
- `useAuth.js` の設定を確認
- Firebase Authentication が有効になっているか確認

### デバッグモード

開発中は各コンポーネントでコンソールログが出力されるため、ブラウザの開発者ツールでデータフローを確認できます。

## 📝 変更履歴

### v2.0.0 - Firestore移行
- モックデータからFirestoreに完全移行
- リアルタイム更新の実装
- SSR対応の強化
- テストデータ作成ヘルパーの追加