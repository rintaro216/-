# お知らせ機能 完全ドキュメント

最終更新: 2025-11-08

## 📋 目次
1. [概要](#概要)
2. [データベース構造](#データベース構造)
3. [実装されている機能](#実装されている機能)
4. [ファイル構成](#ファイル構成)
5. [使用方法](#使用方法)

---

## 概要

おんぷ館スタジオ予約システムのお知らせ機能は、以下の要件を満たしています：
- 管理者がお知らせを投稿・編集・削除
- ユーザーがトップページでスライドショー形式で閲覧
- カテゴリ分けによる整理
- 公開期間の設定
- 画像添付
- LINE通知送信

---

## データベース構造

### テーブル: `announcements`

| カラム名 | 型 | 説明 | デフォルト値 |
|---------|-----|------|-------------|
| id | UUID | 主キー | gen_random_uuid() |
| title | VARCHAR(200) | タイトル | NOT NULL |
| content | TEXT | 本文 | NOT NULL |
| priority | VARCHAR(20) | 優先度 | 'normal' |
| is_published | BOOLEAN | 公開状態 | false |
| publish_start_date | DATE | 公開開始日 | NULL（即時公開） |
| publish_end_date | DATE | 公開終了日 | NULL（無期限） |
| display_order | INTEGER | 表示順序 | 0 |
| image_url | TEXT | 画像URL | NULL |
| created_at | TIMESTAMP | 作成日時 | NOW() |
| updated_at | TIMESTAMP | 更新日時 | NOW() |

**注意事項:**
- `priority`は現在 'normal' と 'important' のみ対応
- ただし、フロントエンドでは `category` フィールドを期待している箇所がある（一般/重要/メンテナンス/イベント）
- **問題点**: DBスキーマとフロントエンドの不一致あり

### RLSポリシー
- 公開されているお知らせは誰でも閲覧可能
- 管理者は全てのお知らせを操作可能（現在は一時的に全員許可）

### インデックス
- `idx_announcements_published`: 公開状態と表示順序
- `idx_announcements_dates`: 公開期間

---

## 実装されている機能

### ✅ 1. 管理機能 (`AnnouncementManagement.jsx`)

**できること:**
- ✅ お知らせの新規作成
- ✅ 既存お知らせの編集
- ✅ お知らせの削除
- ✅ 公開/非公開の切り替え
- ✅ 公開期間の設定（開始日・終了日）
- ✅ 表示順序の設定
- ✅ 画像URLの添付
- ✅ LINE通知送信（`sendAnnouncementToGroup`）

**バリデーション:**
- タイトル: 2文字以上必須
- 本文: 5文字以上必須
- 公開終了日は開始日以降である必要あり

**画像機能:**
- `ImageUpload` コンポーネントを使用
- 画像URLを手動入力（Supabase Storageへの直接アップロードは未実装）

### ✅ 2. 一覧表示 (`AnnouncementList.jsx`)

**できること:**
- ✅ 公開中のお知らせ一覧を表示
- ✅ カテゴリフィルター（全て/一般/重要/メンテナンス/イベント）
- ✅ ピン留め表示（`is_pinned`が優先）
- ✅ NEW バッジ（3日以内の投稿）
- ✅ 公開期間内のみ表示

**表示順:**
1. ピン留め（`is_pinned DESC`）
2. 作成日時（`created_at DESC`）

**カテゴリ:**
```javascript
{
  all: { label: '全て', color: 'bg-gray-500', icon: '📋' },
  general: { label: '一般', color: 'bg-blue-500', icon: '📰' },
  important: { label: '重要', color: 'bg-red-500', icon: '🚨' },
  maintenance: { label: 'メンテナンス', color: 'bg-yellow-500', icon: '🔧' },
  event: { label: 'イベント', color: 'bg-green-500', icon: '🎉' }
}
```

**問題点:**
- DBには `category` カラムが存在しない
- 現在は `priority` (normal/important) のみ保存されている
- カテゴリフィルターは機能しない可能性がある

### ✅ 3. 詳細表示 (`AnnouncementDetail.jsx`)

**できること:**
- ✅ お知らせの詳細を表示
- ✅ カテゴリバッジ表示
- ✅ 作成日時表示
- ✅ 公開終了日の表示（「○月○日まで掲載」）
- ✅ 画像表示（`image_url`がある場合）
- ✅ 本文の改行を保持（`whitespace-pre-wrap`）

**公開期間チェック:**
- 公開開始日前: 「このお知らせはまだ公開されていません」
- 公開終了日後: 「このお知らせの公開期間は終了しました」

### ✅ 4. スライドショー (`NewsSlider.jsx`)

**できること:**
- ✅ トップページで最新5件のお知らせをスライドショー表示
- ✅ 自動スライド（5秒間隔）
- ✅ ページネーション（ドット）
- ✅ 左右ナビゲーションボタン
- ✅ カテゴリ別のグラデーション背景
- ✅ 本文を120文字で切り詰め表示
- ✅ クリックで詳細ページへ遷移

**表示順:**
1. ピン留め（`is_pinned DESC`）
2. 表示順序（`display_order ASC`）
3. 作成日時（`created_at DESC`）

**Swiperライブラリ:**
- `swiper/react` を使用
- Autoplay, Pagination, Navigation モジュール

**カテゴリ別グラデーション:**
```javascript
important: 'bg-gradient-to-r from-red-500 to-orange-500'
maintenance: 'bg-gradient-to-r from-yellow-500 to-orange-400'
event: 'bg-gradient-to-r from-green-500 to-teal-500'
default: 'bg-gradient-to-r from-primary-green to-primary-orange'
```

### ✅ 5. 画像アップロード (`ImageUpload.jsx`)

**実装状況:**
- コンポーネントは存在
- 詳細は要確認（次のステップで確認）

---

## ファイル構成

```
src/
├── pages/
│   ├── AnnouncementList.jsx      # お知らせ一覧ページ
│   ├── AnnouncementDetail.jsx    # お知らせ詳細ページ
│   └── admin/
│       └── AnnouncementManagement.jsx  # 管理画面
├── components/
│   ├── NewsSlider.jsx            # トップページのスライドショー
│   └── ImageUpload.jsx           # 画像アップロードコンポーネント
└── services/
    └── lineNotificationService.js  # LINE通知（sendAnnouncementToGroup）

データベース:
├── SUPABASE_ANNOUNCEMENTS.sql       # テーブル作成SQL
└── SUPABASE_ANNOUNCEMENTS_UPDATE.sql # 更新SQL（存在する場合）
```

---

## 使用方法

### 管理者: お知らせを投稿する

1. 管理画面にアクセス: `/admin/announcements`
2. 「新規作成」ボタンをクリック
3. フォームに入力:
   - タイトル（必須・2文字以上）
   - 本文（必須・5文字以上）
   - 優先度（normal/important）
   - 公開/非公開
   - 公開期間（任意）
   - 表示順序（任意・数字）
   - 画像URL（任意）
4. 「保存」ボタンをクリック
5. （オプション）LINE通知を送信

### ユーザー: お知らせを見る

**方法1: トップページのスライドショー**
- トップページにアクセス
- 自動的に最新5件がスライド表示
- クリックで詳細ページへ

**方法2: お知らせ一覧**
- トップページの「すべてのお知らせを見る」リンクをクリック
- または直接 `/announcements` にアクセス
- カテゴリフィルターで絞り込み可能
- クリックで詳細ページへ

**方法3: 直接リンク**
- `/announcements/:id` でお知らせIDを指定

---

## 既知の問題点

### 🔴 重要: DBスキーマとフロントエンドの不一致

**問題:**
- データベースには `category` カラムが存在しない
- 現在は `priority` (normal/important) のみ
- フロントエンドでは4種類のカテゴリ（一般/重要/メンテナンス/イベント）を期待

**影響:**
- カテゴリフィルターが正常に機能しない
- お知らせ詳細でカテゴリが正しく表示されない可能性

**解決策（提案）:**
1. DBに `category` カラムを追加
2. `priority` を廃止して `category` に統一
3. 既存データの移行

### 🟡 画像アップロード機能

**現状:**
- 画像URLを手動入力する形式
- Supabase Storageへの直接アップロードは未実装

**改善案:**
- Supabase Storageへのアップロード機能追加
- 画像プレビュー表示
- ドラッグ&ドロップ対応

### 🟡 ピン留め機能

**現状:**
- DBに `is_pinned` カラムが存在しない（コードでは参照されている）
- 優先表示の仕組みが不完全

**改善案:**
- `is_pinned` カラムを追加
- 管理画面でピン留めのON/OFF切り替え

---

## 今後の拡張案

### 1. カテゴリ機能の完全実装
- DBスキーマ更新
- マイグレーション実行
- 管理画面でカテゴリ選択

### 2. 画像アップロードの強化
- Supabase Storage統合
- 複数画像対応
- 画像編集機能（トリミング・リサイズ）

### 3. リッチテキストエディタ
- Markdown対応
- WYSIWYG エディタ導入
- 太字・リスト・リンク挿入

### 4. 検索機能
- キーワード検索
- 日付範囲検索
- カテゴリ複数選択

### 5. テンプレート機能
- よく使うお知らせをテンプレート保存
- ワンクリックで再利用

### 6. 既読管理
- ユーザーごとの既読状態を保存
- 未読バッジ表示

### 7. 下書き機能
- 公開前に下書き保存
- プレビュー表示

---

## まとめ

**実装済み機能:**
✅ 基本的なCRUD操作
✅ 公開期間設定
✅ スライドショー表示
✅ カテゴリ分け（フロントエンドのみ）
✅ 画像URL添付
✅ LINE通知

**要改善:**
🔴 DBスキーマとフロントエンドの不一致（category）
🟡 ピン留め機能（is_pinned カラム未実装）
🟡 画像アップロード機能の強化

**優先度:**
1. 高: categoryカラムの追加とマイグレーション
2. 中: is_pinnedカラムの追加
3. 低: 画像アップロード強化、リッチテキスト、検索機能
