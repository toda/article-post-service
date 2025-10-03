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
│   ├── AppHeader.vue   # ヘッダー（認証状態表示）
│   └── ArticleCard.vue # 記事カード
├── composables/         # Vue コンポーザブル
│   ├── useAuth.js      # 認証管理
│   ├── useArticles.js  # 記事管理
│   └── useFirebase.js  # Firebase初期化
├── pages/              # ページコンポーネント（自動ルーティング）
│   ├── index.vue       # トップページ
│   ├── articles/       # 記事関連
│   │   └── [id].vue    # 記事詳細
│   ├── categories/     # カテゴリ関連
│   │   ├── index.vue   # カテゴリ一覧
│   │   └── [id].vue    # カテゴリ別記事一覧
│   ├── tags/           # タグ関連
│   │   ├── index.vue   # タグ一覧
│   │   └── [id].vue    # タグ別記事一覧
│   ├── search.vue      # 記事検索
│   ├── write.vue       # 記事投稿
│   ├── login.vue       # ログイン
│   └── signup.vue      # ユーザー登録
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
- ✅ **Email認証必須**: メール認証が完了していないユーザーはログイン不可
- ✅ **SSR対応**: サーバーサイドレンダリング環境でも安全な認証状態管理
- ✅ **セッション整合性**: ページ遷移時の認証状態保持を改善
- ✅ **デュアルチェック**: Firebase AuthとFirestoreの両方で認証状態を検証

### 認証フロー
1. **ユーザー登録**: `/signup` でメールアドレスとパスワードで登録
2. **メール認証**: 送信されたメール内のリンクをクリック
3. **認証完了**: メール認証後に自動的に`emailVerified`がtrueに変更
4. **ログイン許可**: `/login` で認証済みユーザーのみログイン可能

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
- ✅ 記事一覧表示（ページネーション対応）
- ✅ 記事詳細表示
- ✅ 記事投稿（Markdown対応）
- ✅ 記事編集
- ✅ カテゴリ分類
- ✅ タグ付け
- ✅ 記事検索（タイトル、本文、タグ）
- ✅ 人気記事表示（いいね数順）
- ✅ トレンド記事表示

### ユーザー機能
- ✅ ユーザー登録
- ✅ メール認証
- ✅ ログイン/ログアウト
- ✅ パスワードリセット
- ✅ プロフィール表示

### その他
- ✅ レスポンシブデザイン
- ✅ SSR（SEO最適化）
- ✅ 画像アップロード

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
