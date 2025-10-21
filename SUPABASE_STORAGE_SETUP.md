# Supabase Storage 設定手順

お知らせの画像アップロード機能を使用するには、Supabase Storageの設定が必要です。

## 1. Storageバケットの作成

1. Supabase Dashboard → Storage
2. 「Create a new bucket」をクリック
3. 以下の設定でバケットを作成:
   - **Name**: `announcements`
   - **Public bucket**: ✅ チェックを入れる（公開バケット）
   - 「Create bucket」をクリック

## 2. ストレージポリシーの設定

バケット作成後、以下のポリシーを設定します:

### 2-1. 公開読み取りポリシー（誰でも画像を閲覧可能）

Storage → announcements バケット → Policies → 「New policy」

**ポリシー名**: `Public read access`

```sql
CREATE POLICY "公開画像の閲覧を許可"
ON storage.objects FOR SELECT
USING (bucket_id = 'announcements');
```

### 2-2. 認証済みユーザーのアップロードポリシー（管理者のみアップロード可能）

**ポリシー名**: `Authenticated users can upload`

```sql
CREATE POLICY "認証済みユーザーのアップロードを許可"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'announcements'
  AND auth.role() = 'authenticated'
);
```

### 2-3. 認証済みユーザーの削除ポリシー（管理者のみ削除可能）

**ポリシー名**: `Authenticated users can delete`

```sql
CREATE POLICY "認証済みユーザーの削除を許可"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'announcements'
  AND auth.role() = 'authenticated'
);
```

## 3. 画像URLの形式

アップロードした画像のURLは以下の形式になります:

```
https://[YOUR_PROJECT_ID].supabase.co/storage/v1/object/public/announcements/[FILE_NAME]
```

例:
```
https://ivdhvapmbyvdprykvpbd.supabase.co/storage/v1/object/public/announcements/announcement-1.jpg
```

## 4. 対応画像形式

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

## 5. ファイルサイズ制限

デフォルトでは50MBまでアップロード可能です。
推奨サイズ: 500KB以下（Web表示最適化のため）

## 完了後

設定完了後、管理画面のお知らせ作成・編集画面で画像をアップロードできるようになります。
