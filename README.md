# 技術記事投稿プラットフォーム (Zenn/Qiita スタイル)

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

2. **Firebase設定**
```bash
# Firebase CLIのインストール (グローバル)
npm install -g firebase-tools

# Firebaseにログイン
firebase login

# Firebaseプロジェクトの初期化
firebase init
```

3. **環境変数の設定**
```bash
# .env.example をコピーして .env を作成
cp .env.example .env

# Firebase設定値を .env に設定
# Firebase Console から取得した設定値を入力
```

4. **開発サーバーの起動**
```bash
npm run dev
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
firebase emulators:start
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

## 📝 開発フロー

1. TDD (Test-Driven Development) を採用
2. 機能開発前にテスト作成
3. ESLint と Prettier でコード品質維持
4. コミット前に全テスト実行

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
