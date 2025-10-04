# 技術記事投稿プラットフォーム

Nuxt.js 3 + Firebase + TailwindCSS で構築された技術記事投稿プラットフォーム

## 🌐 デプロイ済みサイト

**本番環境**: https://first-speckit.web.app

## 🚀 クイックスタート

### 前提条件
- Node.js 18+
- npm or yarn
- Firebase CLI
- Git

### セットアップ

1. **依存関係のインストール**
```bash
npm install
```

2. **環境変数の設定**
```bash
# .envファイルを作成してFirebase設定を追加
cp .env.example .env
# .envファイルを編集してFirebase設定値を入力
```

3. **開発サーバーの起動**
```bash
npm run dev
```

4. **アクセス**
- **開発環境**: http://localhost:3000
- **本番環境**: https://first-speckit.web.app

### Firebase Emulator（オプション）

ローカル開発でFirebase Emulatorを使用する場合:
```bash
firebase emulators:start --only firestore,auth,storage
```

**Emulator UI**: http://localhost:4000

## 📋 利用可能なスクリプト

### 開発
- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクションビルド
- `npm run preview` - プロダクションプレビュー

### デプロイ
- `npm run deploy` - 全てビルド & デプロイ
- `npm run deploy:hosting` - Hostingのみデプロイ
- `npm run deploy:functions` - Functionsのみデプロイ
- `npm run deploy:firestore` - Firestoreルール/インデックスのみデプロイ

### テスト
- `npm run test` - 単体テスト実行
- `npm run test:watch` - テストウォッチモード
- `npm run test:integration` - 統合テスト実行
- `npm run test:e2e` - E2Eテスト実行

### コード品質
- `npm run lint` - ESLint実行
- `npm run lint:fix` - ESLint自動修正
- `npm run format` - Prettier実行
- `npm run format:check` - Prettierチェック

## 🏗️ 技術スタック

- **フロントエンド**: Nuxt.js 3 (SSR), Vue.js 3, TailwindCSS
- **バックエンド**: Firebase Functions (Gen 2), Node.js 18
- **データベース**: Cloud Firestore
- **認証**: Firebase Authentication
- **ストレージ**: Cloud Storage
- **ホスティング**: Firebase Hosting + Cloud Functions (SSR)
- **テスト**: Jest, Vue Test Utils, Playwright
- **開発ツール**: ESLint, Prettier, TypeScript

## 📁 プロジェクト構造

```
article-platform/
├── components/          # Vue コンポーネント
│   ├── AppHeader.vue   # ヘッダー（認証状態表示、検索バー）
│   ├── AppHeaderSimple.vue # シンプルヘッダー（認証ページ用）
│   ├── AppFooter.vue   # フッター
│   ├── ArticleCard.vue # 記事カード
│   ├── ArticleListItem.vue # 記事リストアイテム
│   ├── CommentsSection.vue # コメントセクション
│   ├── CommentThread.vue # コメントスレッド
│   ├── CommentItem.vue # コメントアイテム
│   └── CommentForm.vue # コメント投稿フォーム
├── composables/         # Vue コンポーザブル
│   ├── useAuth.js      # 認証管理（ログイン、登録、Google OAuth）
│   ├── useArticles.js  # 記事管理（CRUD、検索、いいね）
│   ├── useUsers.js     # ユーザー管理（プロフィール、フォロー）
│   ├── useComments.js  # コメント管理（投稿、削除、ネスト）
│   ├── useFirestore.js # Firestore初期化
│   └── useMarkdown.js  # Markdown変換
├── pages/              # ページコンポーネント（自動ルーティング）
│   ├── index.vue       # トップページ
│   ├── articles/       # 記事関連
│   │   ├── index.vue   # 記事一覧
│   │   ├── [id].vue    # 記事詳細
│   │   └── edit-[id].vue # 記事編集
│   ├── categories/     # カテゴリ関連
│   │   ├── index.vue   # カテゴリ一覧
│   │   └── [id].vue    # カテゴリ別記事一覧
│   ├── tags/           # タグ関連
│   │   ├── index.vue   # タグ一覧
│   │   └── [id].vue    # タグ別記事一覧
│   ├── users/          # ユーザー関連
│   │   └── [username].vue # ユーザープロフィール
│   ├── search.vue      # 記事検索
│   ├── write.vue       # 記事投稿
│   ├── trending.vue    # トレンド記事
│   ├── settings/       # 設定
│   │   └── index.vue   # アカウント設定
│   ├── login.vue       # ログイン
│   ├── signup.vue      # ユーザー登録
│   ├── forgot-password.vue # パスワードリセット
│   └── verify-email.vue    # メール認証確認
├── plugins/            # Nuxt プラグイン
│   └── auth.client.js  # クライアント認証初期化
├── assets/             # スタイルとアセット
│   └── css/main.css    # TailwindCSS
├── scripts/            # ユーティリティスクリプト
│   ├── create-dummy-articles.js  # ダミー記事生成
│   └── reset-article-counts.js   # カウントリセット
├── tests/              # テストファイル
│   ├── unit/           # 単体テスト
│   ├── integration/    # 統合テスト
│   ├── contract/       # コントラクトテスト
│   └── e2e/           # E2Eテスト
├── .output/            # ビルド出力
│   ├── public/         # 静的ファイル（Hosting）
│   └── server/         # SSRサーバー（Functions）
├── firebase.json       # Firebase設定
├── firestore.rules     # Firestoreセキュリティルール
├── firestore.indexes.json  # Firestoreインデックス
├── storage.rules       # Storageセキュリティルール
└── nuxt.config.ts      # Nuxt設定
```

## 🔒 認証システム

### セキュリティ強化
- ✅ **Email認証必須**: メール認証が完了していないユーザーは記事投稿不可
- ✅ **SSR対応**: サーバーサイドレンダリング環境でも安全な認証状態管理
- ✅ **セッション整合性**: ページ遷移時の認証状態保持を改善
- ✅ **デュアルチェック**: Firebase AuthとFirestoreの両方で認証状態を検証
- ✅ **Google OAuth**: Googleアカウントでのログインに対応

### 認証フロー

#### メールアドレス登録
1. **ユーザー登録**: `/signup` でメールアドレスとパスワードで登録
2. **メール認証**: 送信されたメール内のリンクをクリック
3. **認証完了**: メール認証後に自動的に`emailVerified`がtrueに変更
4. **ログイン許可**: `/login` で認証済みユーザーのみログイン可能

#### Googleログイン
1. **OAuth認証**: `/login` でGoogleアカウント認証
2. **自動ユーザー名生成**: メールアドレスから自動的にユーザー名を生成（重複時は連番付与）
3. **即座にログイン**: メール認証不要で即座に利用可能

## 🔧 Firebase設定

### 必要なFirebaseサービス
- **Authentication**: ユーザー認証
- **Cloud Firestore**: データベース（記事、ユーザー、カテゴリ、タグ）
- **Cloud Storage**: ファイルストレージ（画像アップロード）
- **Firebase Hosting**: 静的ファイル配信
- **Cloud Functions (Gen 2)**: SSRサーバー

### アーキテクチャ

```
ユーザー → Firebase Hosting (CDN)
              ↓
              ├─ 静的ファイル (.css, .js, 画像) → 直接配信
              └─ その他のリクエスト → Cloud Functions (SSR)
                                          ↓
                                      Nuxt SSRレンダリング
                                          ↓
                                      Firestore / Storage
```

### セキュリティルール

- **Firestore**: `firestore.rules` - コレクション単位のアクセス制御
- **Storage**: `storage.rules` - ファイルアップロード制御

### Firestoreインデックス

`firestore.indexes.json`で定義された複合インデックス:
- 記事一覧（公開状態 + 公開日降順）
- 記事一覧（公開状態 + いいね数降順）
- カテゴリ別記事（カテゴリ + 公開状態 + 公開日降順）
- タグ別記事（タグ配列 + 公開状態 + 公開日降順）
- 記事検索（公開状態 + タイトル昇順）

## 🎯 主要機能

### 記事機能
- ✅ 記事一覧表示（ページネーション対応、21件/ページ）
- ✅ 記事詳細表示
- ✅ 記事投稿（Markdown対応）
- ✅ 記事編集・削除
- ✅ カテゴリ分類（7カテゴリ）
- ✅ タグ付け（最大5個）
- ✅ 記事検索（タイトル、本文、タグ、ページネーション対応）
- ✅ 人気記事表示（いいね数順）
- ✅ トレンド記事表示
- ✅ カテゴリ別記事一覧（ページネーション対応）
- ✅ タグ別記事一覧（ページネーション対応）
- ✅ いいね機能
- ✅ コメント機能（ネスト対応）
- ✅ 投稿者プロフィールリンク

### ユーザー機能
- ✅ ユーザー登録（メール/パスワード）
- ✅ Googleログイン（OAuth）
- ✅ メール認証
- ✅ ログイン/ログアウト
- ✅ パスワード変更・リセット
- ✅ プロフィール表示（`/users/[username]`）
- ✅ ユーザー名・表示名設定
- ✅ アイコン画像アップロード
- ✅ 自己紹介編集
- ✅ プライバシー設定
  - プロフィール公開/非公開
  - 統計情報表示/非表示
  - フォロー許可/不許可
- ✅ フォロー/フォロワー機能
- ✅ ユーザー統計情報（記事数、いいね数など）
- ✅ アカウント削除

### ナビゲーション
- ✅ レスポンシブヘッダー（モバイルメニュー対応）
- ✅ 記事検索バー
- ✅ トレンドページ
- ✅ カテゴリ一覧
- ✅ タグ一覧

### その他
- ✅ レスポンシブデザイン（PC/タブレット/スマホ対応）
- ✅ SSR（SEO最適化）
- ✅ 画像アップロード（アイコン、記事内画像）
- ✅ Markdown記事作成

## 🛠️ ユーティリティスクリプト

### ダミー記事生成

100件のテスト記事を生成:
```bash
node scripts/create-dummy-articles.js
```

### 記事カウントリセット

全記事のいいね数・コメント数を0にリセット:
```bash
node scripts/reset-article-counts.js
```

**注意**: これらのスクリプトは`.env`ファイルの環境変数を使用します。

## 🚀 デプロイ

### 初回デプロイ

1. **Firebase CLIインストール**
```bash
npm install -g firebase-tools
```

2. **Firebaseログイン**
```bash
firebase login
```

3. **プロジェクト確認**
```bash
firebase projects:list
```

4. **デプロイ実行**
```bash
npm run deploy
```

### 更新デプロイ

```bash
# 全て更新
npm run deploy

# Hostingのみ
npm run deploy:hosting

# Functionsのみ
npm run deploy:functions

# Firestoreルール/インデックスのみ
npm run deploy:firestore
```

## 🧪 テスト

### 単体テスト
```bash
npm run test
```

### 統合テスト
```bash
npm run test:integration
```

### E2Eテスト
```bash
npm run test:e2e
```

## 💻 技術的実装詳細

### SSR (Server-Side Rendering)

- **Nitro Firebase Preset**: Cloud Functions Gen 2 で SSR を実現
- **動的ルーティング**: `/articles/[id]`, `/categories/[id]`, `/tags/[id]`
- **SEO最適化**: `useHead()` でメタタグ動的生成

### 認証システムアーキテクチャ

- **Composable**: `composables/useAuth.js` - 認証状態管理の中核
- **プラグイン**: `plugins/auth.client.js` - クライアントサイド認証初期化
- **コンポーネント**: `components/AppHeader.vue` - SSR安全な認証状態表示

### データフェッチング

- **Firestore SDK**: 直接Firestoreクエリ実行
- **リアルタイム更新**: `onSnapshot` でデータ監視
- **ページネーション**: カーソルベースページング実装

## 📝 開発フロー

1. TDD (Test-Driven Development) を採用
2. 機能開発前にテスト作成
3. ESLint と Prettier でコード品質維持
4. コミット前に全テスト実行
5. **セキュリティ**: 認証が必要な機能は必ず`emailVerified`チェックを実装

## 🐛 トラブルシューティング

### メール認証後もログインできない
- ブラウザを再読み込みして認証状態を更新
- Firebase Authの状態同期の遅延が原因

### 開発サーバーが起動しない
- ポート3000が使用中の場合、プロセスを停止
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Firestoreインデックスエラー
- コンソールに表示されるリンクから手動作成、または:
```bash
firebase deploy --only firestore:indexes
```

## 📚 ドキュメント

- [設計仕様書](../specs/001-zenn-qiita-spec/)
- [API仕様](../specs/001-zenn-qiita-spec/contracts/)
- [データモデル](../specs/001-zenn-qiita-spec/data-model.md)

## 🤝 貢献

1. フォークしてクローン
2. 機能ブランチを作成
3. テストを追加
4. プルリクエストを作成

## 📄 ライセンス

MIT License
