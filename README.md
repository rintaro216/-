# おんぷタイム（Onpu Time）

> あなたの音楽の時間を、もっと自由に

音楽スタジオの予約システム「おんぷタイム」- **本番稼働中！** 🚀

## 🎵 プロジェクト概要

おんぷ館・みどり楽器のスタジオをオンラインで簡単に予約できるWebアプリケーションです。

### 主な機能

- **お知らせスライドショー**: イベント・発表会情報を魅力的に表示
- **スタジオ予約**: 2つのエリア（おんぷ館・みどり楽器）、10スタジオから選択
- **リアルタイム空室管理**: 予約状況をリアルタイムで表示
- **当日予約制限**: 当日は電話対応（システムで自動制限）
- **レスポンシブデザイン**: スマホ・タブレット・PCに完全対応
- **利用者区分**: 一般・生徒で異なる料金設定

## 🚀 開発状況

現在：**Phase 2 完全稼働中** 🚀

### ✅ Phase 1（プロトタイプ版）完了

- ✅ プロジェクトセットアップ
- ✅ デザインシステム（Tailwind CSS）
- ✅ ヘッダー・フッター
- ✅ お知らせスライドショー
- ✅ 全予約フロー画面（8ページ）
- ✅ スタジオ情報表示

### ✅ Phase 2（本番機能）完了

- ✅ Supabase完全統合（PostgreSQL）
- ✅ 実際の予約機能（データベース保存）
- ✅ リアルタイム空室状況取得
- ✅ 予約競合防止（自動ブロック）
- ✅ 当日予約制限機能
- ✅ ローディング＆エラーハンドリング
- ✅ Row Level Security (RLS) 設定

### 🔜 Phase 3（拡張機能）検討中

- [ ] 管理画面（予約管理・スタジオ管理）
- [ ] メール通知機能
- [ ] 予約統計・レポート

## 💻 技術スタック

### フロントエンド
- **React** 19.1.1
- **React Router** 6.28.0
- **Tailwind CSS** 3.4.15
- **Framer Motion** 11.15.0（アニメーション）
- **date-fns** 4.1.0（日付処理）
- **Swiper** 11.1.1（スライドショー）
- **React Icons** 5.4.0

### バックエンド
- **Supabase** (PostgreSQL + Auth + Storage)
- **@supabase/supabase-js** 2.75.0

### 開発環境
- **Vite** 7.1.7
- **Node.js** 18+
- **npm** 10+

## 🛠️ セットアップ手順

### 1. 必要な環境

- Node.js 18以上
- npm 10以上
- Supabaseアカウント

### 2. プロジェクトのクローン

```bash
git clone https://github.com/your-username/onpu-time.git
cd onpu-time
```

### 3. 依存パッケージのインストール

```bash
npm install
```

### 4. Supabase設定

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. `SUPABASE_SCHEMA.md` のSQLを実行してテーブルを作成
3. `.env.local` ファイルを作成：

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI...
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

開発サーバーは `http://localhost:5173` で起動します。

### 6. ビルド＆デプロイ

```bash
# プロダクションビルド
npm run build

# ローカルでプレビュー
npm run preview
```

詳しいデプロイ手順は `DEPLOYMENT.md` を参照してください。

## 📁 プロジェクト構造

```
onpu-time/
├── src/
│   ├── components/          # 共通コンポーネント
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── NewsSlider.jsx
│   ├── pages/              # ページコンポーネント（8ページ）
│   │   ├── Home.jsx
│   │   ├── AreaSelect.jsx
│   │   ├── DateSelect.jsx
│   │   ├── StudioSelect.jsx
│   │   ├── UserTypeSelect.jsx
│   │   ├── ReservationForm.jsx
│   │   └── ReservationComplete.jsx
│   ├── services/           # ビジネスロジック
│   │   └── reservationService.js
│   ├── lib/                # ライブラリ設定
│   │   └── supabase.js
│   ├── data/               # 静的データ
│   │   ├── newsData.js
│   │   └── studioData.js
│   ├── index.css
│   ├── App.jsx
│   └── main.jsx
├── public/
├── DESIGN.md               # 詳細設計書
├── SUPABASE_SCHEMA.md      # データベース設計書
├── PROGRESS.md             # 開発進捗レポート
├── DEPLOYMENT.md           # デプロイガイド
├── .env.example            # 環境変数テンプレート
└── package.json
```

## 🎨 デザインシステム

### カラーパレット

- **プライマリオレンジ**: `#FF8C42`
- **プライマリグリーン**: `#4CAF50`
- **背景ベージュ**: `#FFF9F5`
- **空室（緑）**: `#4CAF50`
- **残りわずか（オレンジ）**: `#FF8C42`
- **満室（グレー）**: `#9E9E9E`

### フォント

- Noto Sans JP（Google Fonts）

## 📝 ドキュメント

プロジェクトには以下のドキュメントが用意されています：

- **[DESIGN.md](./DESIGN.md)**: 詳細設計書（UI/UX、機能仕様）
- **[SUPABASE_SCHEMA.md](./SUPABASE_SCHEMA.md)**: データベース設計書
- **[PROGRESS.md](./PROGRESS.md)**: 開発進捗レポート
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: デプロイガイド

## 🏢 施設情報

**おんぷ館**
- 住所: 〒466-0833 愛知県名古屋市昭和区隼人町3-10
- 電話: 052-836-0811
- アクセス: 地下鉄鶴舞線「いりなか駅」1番出口より徒歩2分

## 📄 ライセンス

© 2025 おんぷ館. All rights reserved.
