# 🚀 おんぷタイム デプロイガイド

このドキュメントは、おんぷタイムをVercel、Netlify、またはその他のホスティングサービスにデプロイする手順を説明します。

---

## 📋 前提条件

デプロイ前に以下が完了していることを確認してください：

- ✅ Supabaseプロジェクトが作成済み
- ✅ データベーステーブルが作成済み
- ✅ 初期スタジオデータが投入済み
- ✅ Supabase URL と ANON KEY を取得済み

---

## 🌐 Vercelへのデプロイ

### 1. GitHubリポジトリの準備

```bash
# Gitリポジトリを初期化（まだの場合）
git init

# 全てのファイルをコミット
git add .
git commit -m "Initial commit - おんぷタイム予約システム"

# GitHubにプッシュ
git remote add origin https://github.com/your-username/onpu-time.git
git push -u origin main
```

### 2. Vercelでプロジェクトをインポート

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. **「New Project」** をクリック
3. GitHubリポジトリを選択
4. プロジェクト設定：
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3. 環境変数の設定

Vercelの **「Environment Variables」** セクションで以下を追加：

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJI...` |

### 4. デプロイ

**「Deploy」** ボタンをクリックしてデプロイを開始します。

---

## 🎯 Netlifyへのデプロイ

### 1. Netlify CLIのインストール

```bash
npm install -g netlify-cli
```

### 2. ビルド

```bash
npm run build
```

### 3. Netlifyにデプロイ

```bash
# 初回デプロイ
netlify deploy

# プロンプトに従って設定
# Build directory: dist

# 本番デプロイ
netlify deploy --prod
```

### 4. 環境変数の設定

Netlify Dashboard で環境変数を設定：

1. **Site settings** → **Environment variables**
2. 以下を追加：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

## 🔧 カスタムドメインの設定

### Vercelの場合

1. Vercel Dashboard → **Settings** → **Domains**
2. カスタムドメインを追加
3. DNSレコードを設定（Vercelの指示に従う）

### Netlifyの場合

1. Netlify Dashboard → **Domain settings**
2. **Add custom domain**
3. DNSレコードを設定

---

## ⚡ パフォーマンス最適化

### ビルド最適化

```bash
# プロダクションビルド
npm run build

# ビルド結果の確認
npm run preview
```

### 推奨設定

- **画像最適化**: 画像を追加する場合はWebP形式を使用
- **キャッシュ戦略**: Vercel/Netlifyのデフォルト設定で最適化済み
- **CDN**: 自動的に有効化されます

---

## 🔐 セキュリティチェックリスト

デプロイ前に確認：

- [ ] `.env.local` が `.gitignore` に含まれている（✅ 設定済み）
- [ ] Supabase RLSポリシーが有効
- [ ] 環境変数がホスティングサービスに正しく設定されている
- [ ] HTTPSが有効（Vercel/Netlifyは自動）

---

## 📊 デプロイ後の確認

デプロイが完了したら、以下を確認してください：

### 1. 基本動作確認
- [ ] トップページが正しく表示される
- [ ] エリア選択ができる
- [ ] カレンダーが表示される
- [ ] 当日が選択不可になっている

### 2. データベース接続確認
- [ ] 空室状況が表示される
- [ ] テスト予約ができる
- [ ] 予約がSupabaseに保存される
- [ ] 予約後に空室数が減る

### 3. エラーハンドリング確認
- [ ] ネットワークエラー時にエラーメッセージが表示される
- [ ] ローディング状態が正しく表示される

---

## 🐛 トラブルシューティング

### ビルドエラーが発生する場合

```bash
# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install

# 再度ビルド
npm run build
```

### 環境変数が読み込まれない

- Viteでは環境変数名は `VITE_` で始まる必要があります
- デプロイ後、環境変数を変更した場合は再デプロイが必要です

### Supabaseに接続できない

1. ブラウザの開発者ツール（Console）でエラーを確認
2. 環境変数が正しく設定されているか確認
3. Supabase URLとANON KEYが正しいか確認

---

## 📞 サポート

問題が解決しない場合：

1. ブラウザの開発者ツール（Console / Network）でエラーを確認
2. Vercel/Netlifyのデプロイログを確認
3. Supabaseのログを確認

---

## 🎉 デプロイ完了！

デプロイが成功したら、本番URLをチーム・ユーザーと共有しましょう！

**本番URL**: `https://your-site.vercel.app` (または `https://your-site.netlify.app`)

---

**作成日**: 2025-10-13
**最終更新**: 2025-10-13
