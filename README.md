# 技術記事投稿プラットフォーム

Nuxt.js 3 + Firebase + TailwindCSS で構築された技術記事投稿プラットフォーム

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

2. **Firebase Emulatorの起動（推奨）**
```bash
# Firebase Emulatorを起動（認証とFirestore）
firebase emulators:start --only firestore,auth
```

3. **開発サーバーの起動**
```bash
# 新しいターミナルで開発サーバーを起動
npm run dev
```

4. **アクセス**
- **メインアプリケーション**: http://localhost:3000
- **Firebase Emulator UI**: http://localhost:4000 （Emulator使用時）

### 本番Firebase設定（オプション）

1. **Firebase設定**
```bash
# Firebase CLIのインストール (グローバル)
npm install -g firebase-tools

# Firebaseにログイン
firebase login

# Firebaseプロジェクトの初期化
firebase init
```

2. **環境変数の設定**
```bash
# .env.example をコピーして .env を作成
cp .env.example .env

# Firebase設定値を .env に設定
# Firebase Console から取得した設定値を入力
```

## 📋 利用可能なスクリプト

- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクションビルド
- `npm run preview` - プロダクションプレビュー
- `npm run test` - 単体テスト実行
- `npm run test:watch` - テストウォッチモード
- `npm run test:integration` - 統合テスト実行
- `npm run lint` - ESLint実行
- `npm run lint:fix` - ESLint自動修正
- `npm run format` - Prettier実行
- `npm run format:check` - Prettierチェック

## 🏗️ 技術スタック

- **フロントエンド**: Nuxt.js 3, Vue.js 3, TailwindCSS
- **バックエンド**: Firebase (Auth, Firestore, Storage, Hosting)
- **テスト**: Jest, Vue Test Utils, Playwright
- **開発ツール**: ESLint, Prettier, TypeScript

## 📁 プロジェクト構造

```
article-platform/
├── components/          # Vue コンポーネント
├── composables/         # Vue コンポーザブル
├── pages/              # ページコンポーネント
├── plugins/            # Nuxt プラグイン
├── assets/             # スタイルとアセット
├── tests/              # テストファイル
│   ├── unit/           # 単体テスト
│   ├── integration/    # 統合テスト
│   ├── contract/       # コントラクトテスト
│   └── e2e/           # E2Eテスト
└── firebase.json       # Firebase設定
```

## 🔒 認証システム

### セキュリティ強化
- ✅ **Email認証必須**: メール認証が完了していないユーザーはログイン不可
- ✅ **SSR対応**: サーバーサイドレンダリング環境でも安全な認証状態管理
- ✅ **セッション整合性**: ページ遷移時の認証状態保持を改善
- ✅ **デュアルチェック**: Firebase AuthとFirestoreの両方で認証状態を検証

### 認証フロー
1. **ユーザー登録**: メールアドレスとパスワードで登録
2. **メール認証**: 送信されたメール内のリンクをクリック
3. **認証完了**: メール認証後に自動的に`emailVerified`がtrueに変更
4. **ログイン許可**: 認証済みユーザーのみログイン可能

### トラブルシューティング
**問題**: メール認証後もログインできない
- **確認事項**: ブラウザを再読み込みして認証状態を更新
- **原因**: Firebase Authの状態同期の遅延

**問題**: ページ遷移でログアウト状態になる
- **解決済み**: SSR安全な認証初期化システムに修正済み

## 🔧 Firebase設定

### 必要なFirebaseサービス
- Authentication (認証)
- Cloud Firestore (データベース)
- Cloud Storage (ファイルストレージ)
- Firebase Hosting (ホスティング)

### セキュリティルール
Firestoreセキュリティルールは `firestore.rules` で設定

### Firebase Emulator
ローカル開発では Firebase Emulator を使用:
```bash
firebase emulators:start --only firestore,auth
```

**Emulator設定**:
- **Authentication**: http://localhost:9099
- **Firestore**: http://localhost:8080
- **Emulator UI**: http://localhost:4000

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

### 認証システムアーキテクチャ
- **Composable**: `composables/useAuth.js` - 認証状態管理の中核
- **プラグイン**: `plugins/auth.client.js` - クライアントサイド認証初期化（バックアップ）
- **コンポーネント**: `components/AppHeader.vue` - SSR安全な認証状態表示
- **ページ**: `pages/verify-email.vue` - メール認証専用ページ

### 主要な修正内容
1. **セキュリティホール修正**: `emailVerified: false`でもログインできる脆弱性を修正
2. **SSR対応**: サーバーサイドレンダリングでの認証状態管理を安全化
3. **セッション整合性**: ページ遷移時の認証状態保持問題を解決
4. **エラーハンドリング**: 500エラーの原因となったundefinedアクセスを修正

### ファイル構造の特徴
```
composables/useAuth.js        # 認証ロジックの中核
components/AppHeader.vue      # SSR安全な認証UI
pages/login.vue              # 強化されたログイン検証
pages/verify-email.vue       # メール認証フロー
pages/write.vue              # 認証済みユーザー限定アクセス
plugins/auth.client.js       # クライアント認証初期化
```

## 📝 開発フロー

1. TDD (Test-Driven Development) を採用
2. 機能開発前にテスト作成
3. ESLint と Prettier でコード品質維持
4. コミット前に全テスト実行
5. **セキュリティ**: 認証が必要な機能は必ず`emailVerified`チェックを実装

## 🚀 デプロイ

### Firebase Hosting
```bash
npm run build
firebase deploy
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
