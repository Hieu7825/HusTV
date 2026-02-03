# HusTVプロジェクト報告書

**作成日:** 2025年12月20日  
**プロジェクト名:** HusTV - 映画ストリーミングプラットフォーム  
**技術:** React + Vite (フロントエンド), Node.js + Express (バックエンド), MongoDB (データベース)

---

## 📋 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [システムアーキテクチャ](#システムアーキテクチャ)
3. [主要機能](#主要機能)
4. [使用技術](#使用技術)
5. [データベーススキーマ](#データベーススキーマ)
6. [UML図](#uml図)
7. [主要業務フロー](#主要業務フロー)
8. [APIドキュメント](#apiドキュメント)
9. [ミドルウェアとバリデーション](#ミドルウェアとバリデーション)
10. [デプロイと環境](#デプロイと環境)
11. [セキュリティ機能](#セキュリティ機能)
12. [パフォーマンスと最適化](#パフォーマンスと最適化)
13. [アプリケーションデモ](#アプリケーションデモ)
14. [結論](#結論)

---

## 1. プロジェクト概要

### 1.1 説明

**HusTV**は、ユーザーが以下のことを可能にする現代的なオンライン映画ストリーミングプラットフォームです:

- 映画とビデオの視聴
- お気に入りの管理
- サブスクリプションプランの購入
- 視聴履歴の追跡
- 個人アカウントの管理

### 1.2 対象ユーザー

- **一般ユーザー:** 映画視聴、プラン購入、お気に入り管理
- **管理者 (Admin):** 映画、ジャンル、サブスクリプションプラン、顧客の管理
- **ゲスト:** 映画情報の閲覧、アカウント登録

### 1.3 コア機能

✅ 映画とビデオのリスト表示  
✅ ジャンル別の検索とフィルタリング  
✅ 映画詳細表示 (トレーラー、評価、あらすじ)  
✅ ビデオ視聴 (HLSストリーム)  
✅ お気に入り管理  
✅ サブスクリプションプランの購入と管理  
✅ 視聴履歴の追跡  
✅ ユーザープロフィール管理  
✅ 管理者: 映画の追加/編集/削除  
✅ 管理者: サブスクリプションプラン管理  
✅ 管理者: メンバー管理

---

## 2. システムアーキテクチャ

### 2.1 全体アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────┐
│ フロントエンド (React + Vite)                                │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│ │ ホーム   │ │ 映画     │ │ 詳細     │ │ お気に入り   │   │
│ │ ページ   │ │ ページ   │ │ ページ   │ │ ページ       │   │
│ └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│ │ ビデオ   │ │プラン    │ │ 管理     │ │ ナビバー     │   │
│ │ プレーヤー│ │ページ    │ │ダッシュ  │ │ フッター     │   │
│ └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Axios HTTPクライアント + サービス層                     │ │
│ └────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 認証 (Clerk) + React Router                            │ │
│ └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          ↕ (HTTP/REST)
┌─────────────────────────────────────────────────────────────┐
│ バックエンド (Node.js + Express)                            │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ ルート:                                               │   │
│ │ • /api/users - ユーザー管理                          │   │
│ │ • /api/videos - 映画/ビデオ管理                      │   │
│ │ • /api/genres - ジャンル管理                         │   │
│ │ • /api/subscriptions - サブスクリプション管理        │   │
│ │ • /api/admin - 管理者機能                            │   │
│ │ • /api/webhooks - Stripe Webhook                     │   │
│ └──────────────────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ ミドルウェア:                                         │   │
│ │ • 認証 (Clerk) • エラーハンドラー                    │   │
│ │ • レート制限 • バリデーション                        │   │
│ │ • CORS • サブスクリプション検証                      │   │
│ └──────────────────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ コントローラー: User, Video, Admin, Genre,           │   │
│ │ Subscription, Stripe Webhooks                        │   │
│ └──────────────────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ サービスとユーティリティ:                            │   │
│ │ • Cloudinary (ビデオアップロード)                    │   │
│ │ • Stripe (決済処理)                                  │   │
│ │ • メールサービス (Nodemailer)                        │   │
│ │ • Inngest (ジョブキューと自動化)                     │   │
│ │ • Cronジョブ (サブスクリプションチェッカー)          │   │
│ └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↕ (TCP/IP)
┌─────────────────────────────────────────────────────────────┐
│ データベースとサービス                                      │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│ │ MongoDB      │ │ Cloudinary   │ │ Stripe       │        │
│ │ (NoSQL DB)   │ │ (ビデオCDN)  │ │ (決済)       │        │
│ └──────────────┘ └──────────────┘ └──────────────┘        │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│ │ Clerk        │ │ Nodemailer   │ │ Inngest      │        │
│ │ (認証)       │ │ (メール)     │ │ (ジョブキュー)│        │
│ └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 フォルダ構造

```
HusTV/
├── client/                    # フロントエンド (React + Vite)
│   ├── src/
│   │   ├── components/        # Reactコンポーネント
│   │   ├── pages/             # メインページ
│   │   ├── services/          # API呼び出し
│   │   ├── hooks/             # カスタムフック
│   │   ├── lib/               # ユーティリティ
│   │   └── assets/            # 画像、ビデオ
│   └── package.json
│
└── server/                    # バックエンド (Node.js + Express)
    ├── models/                # MongoDBスキーマ
    ├── controllers/           # ビジネスロジック
    ├── routes/                # APIエンドポイント
    ├── middleware/            # Expressミドルウェア
    ├── utils/                 # ユーティリティ (Cloudinary, Stripe, Email)
    ├── services/              # ビジネスサービス
    ├── inngest/               # ジョブキューと自動化
    ├── cron/                  # スケジュールタスク
    ├── configs/               # 設定 (DB)
    └── package.json
```

---

## 3. 主要機能

### 3.1 映画とビデオの管理

| 機能               | ユーザー | 管理者 | 説明                             |
| ------------------ | -------- | ------ | -------------------------------- |
| 映画リスト表示     | ✅       | ✅     | ページネーション付き全映画表示   |
| 映画検索           | ✅       | ✅     | タイトルで映画を検索             |
| ジャンル別フィルタ | ✅       | ✅     | ジャンルで映画をフィルタリング   |
| 映画詳細表示       | ✅       | ✅     | ポスター、トレーラー、あらすじ等 |
| ビデオ視聴         | ✅\*     | ✅     | \*有効なサブスクリプション必要   |
| 新規映画追加       | ❌       | ✅     | フォームから映画をアップロード   |
| 映画情報編集       | ❌       | ✅     | 映画情報の更新                   |
| 映画削除           | ❌       | ✅     | システムから映画を削除           |

### 3.2 サブスクリプション管理

| 機能                 | ユーザー | 管理者 | 説明                         |
| -------------------- | -------- | ------ | ---------------------------- |
| プラン表示           | ✅       | ✅     | 利用可能なプランを表示       |
| プラン購入           | ✅       | ✅     | Stripeで決済                 |
| 現在のプラン確認     | ✅       | ✅     | 使用中のプラン情報を表示     |
| プランキャンセル     | ✅       | ✅     | 現在のサブスクリプション解除 |
| プランアップグレード | ✅       | ✅     | 上位プランへ変更             |
| 新規プラン作成       | ❌       | ✅     | 新しいプランを作成           |
| プラン編集           | ❌       | ✅     | プラン情報の更新             |
| プラン削除           | ❌       | ✅     | システムからプランを削除     |

### 3.3 アカウントとプロフィール管理

| 機能                  | 説明                         |
| --------------------- | ---------------------------- |
| ログイン/サインアップ | Clerk経由 (SSO)              |
| プロフィール表示      | 個人情報の閲覧               |
| プロフィール更新      | 名前、画像、設定の編集       |
| 設定                  | 言語、ビデオ品質、通知の選択 |
| 視聴履歴表示          | 視聴した映画の確認           |
| お気に入り管理        | お気に入り映画の追加/削除    |

### 3.4 ジャンル管理

| 機能               | ユーザー | 管理者 | 説明                 |
| ------------------ | -------- | ------ | -------------------- |
| ジャンルリスト表示 | ✅       | ✅     | 全ジャンルを表示     |
| ジャンル別フィルタ | ✅       | ✅     | ジャンルの映画を表示 |
| ジャンル追加       | ❌       | ✅     | 新規ジャンル作成     |
| ジャンル編集       | ❌       | ✅     | ジャンル名の更新     |
| ジャンル削除       | ❌       | ✅     | ジャンルを削除       |

### 3.5 決済とWebhook

| 機能                | 説明                         |
| ------------------- | ---------------------------- |
| Stripe決済          | Stripe経由の安全な決済処理   |
| StripeからのWebhook | Stripeから決済イベントを受信 |
| 注文ステータス更新  | 決済成功時に自動更新         |
| 確認メール          | 決済完了時にメール送信       |

### 3.6 自動化とバックグラウンドジョブ

| 機能                           | 説明                                | 技術                 |
| ------------------------------ | ----------------------------------- | -------------------- |
| サブスクリプション期限チェック | 毎時実行、ステータス更新            | Cronジョブ           |
| Clerkユーザー同期              | Clerkからユーザーを自動作成/更新    | Inngest              |
| ビデオ処理                     | ビデオエンコード、HLSストリーム作成 | Inngest              |
| 自動メール送信                 | 確認メール、通知の送信              | Inngest + Nodemailer |

---

## 4. 使用技術

### 4.1 フロントエンド

```
- React 18+           → UIライブラリ
- Vite                → ビルドツールと開発サーバー
- React Router v6     → ルーティング
- Axios               → HTTPクライアント
- React Hot Toast     → 通知
- Clerk               → 認証
- CSS + Tailwind      → スタイリング
```

### 4.2 バックエンド

```
- Node.js             → ランタイム
- Express 5.1         → Webフレームワーク
- MongoDB + Mongoose  → データベース
- Cloudinary          → ビデオ/画像CDN
- Stripe              → 決済処理
- Clerk               → 認証
- Nodemailer          → メール送信
- Inngest             → ジョブキューとワークフロー
- Express Rate Limit  → API保護
- Express Validator   → 入力検証
- Multer              → ファイルアップロード
- Node Cron           → スケジュールタスク
- CORS                → クロスオリジンリクエスト
- Dotenv              → 環境設定
```

### 4.3 外部サービス

```
- Clerk               → ユーザー認証と管理
- Stripe              → 決済処理
- Cloudinary          → ビデオと画像ホスティング
- Nodemailer          → メールサービス
- Inngest             → タスクキューと自動化
- MongoDB Atlas       → データベースホスティング
```

### 4.4 開発ツール

```
- Nodemon             → サーバー自動リロード
- Git                 → バージョン管理
- VSCode              → IDE
```

---

## 5. データベーススキーマ

### 5.1 ER図

```
┌─────────────────────────────────────────────────────────────────────┐
│ データベーススキーマ                                                 │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│ User         │
├──────────────┤
│ _id: String  │ (MongoDB)
│ clerkId      │ (ユニーク, インデックス)
│ name         │
│ email        │ (ユニーク, インデックス)
│ image        │
│ isActive     │
│ isBanned     │
│ preferences  │ (ネスト)
│ createdAt    │
│ updatedAt    │
└──────────────┘
       │
┌───────────────┼───────────────┐
│               │               │
↓               ↓               ↓
┌──────────────────┐  ┌──────────────┐  ┌────────────────┐
│ Subscription     │  │ WatchHistory │  │ Favorite       │
├──────────────────┤  ├──────────────┤  ├────────────────┤
│ _id: ObjectId    │  │ _id: ObjectId│  │ _id: ObjectId  │
│ user: String(FK) │  │ user: String │  │ user: String   │
│ plan: String(FK) │  │ video: String│  │ video: String  │
│ purchaseDate     │  │ watchedDur   │  │ addedAt        │
│ expiryDate       │  │ totalDur     │  │ createdAt      │
│ status           │  │ progress %   │  └────────────────┘
│ amount           │  │ lastWatched  │
│ currency         │  │ completed    │
│ paymentId        │  │ createdAt    │
│ createdAt        │  └──────────────┘
└──────────────────┘
       │
       ↓
┌──────────────────────────┐
│ SubscriptionPlan         │
├──────────────────────────┤
│ _id: String (plan_xxxxx) │
│ planName                 │
│ price                    │
│ description              │
│ features[]               │
│ connectedDevices         │
│ duration (月額/年額)     │
│ tierRank (1-10)          │
│ isPopular                │
│ isActive                 │
│ createdAt                │
└──────────────────────────┘

┌──────────────┐
│ Video        │
├──────────────┤
│ _id: String  │
│ id: Number   │ (ユニーク)
│ title        │
│ overview     │
│ video        │ (Cloudinary URL)
│ trailer      │ (オプション)
│ poster_path  │
│ backdrop_path│
│ releaseDate  │
│ rating       │
│ genres[]     │ (GenreへのFK)
│ cast[]       │
│ crew[]       │
│ duration     │
│ status       │
│ createdAt    │
└──────────────┘
       │
       ↓
┌──────────────┐
│ Genre        │
├──────────────┤
│ _id: ObjectId│
│ id: Number   │
│ name: String │
│ createdAt    │
└──────────────┘

┌──────────────┐
│ Admin        │
├──────────────┤
│ _id: String  │
│ clerkId      │ (ユニーク, インデックス)
│ name         │
│ email        │ (ユニーク, インデックス)
│ role         │ (例: superadmin)
│ isActive     │
│ createdAt    │
│ updatedAt    │
└──────────────┘

Admin (1) ─────→ (多) Video
Admin (1) ─────→ (多) Genre
Admin (1) ─────→ (多) SubscriptionPlan
Admin (1) ─────→ (多) User (管理アクション/監査)
```

### 5.2 詳細テーブル

#### **コレクション: User**

```javascript
{
  _id: "user_123",
  clerkId: "clerk_xxxxx",         // Clerk User ID
  name: "山田太郎",
  email: "yamada@example.com",
  image: "https://...",
  currentSubscription: ObjectId("..."),  // Subscriptionへの参照
  subscriptionStatus: "active",   // none | active | expired | cancelled
  subscriptionTier: "Premium",
  isActive: true,
  isBanned: false,
  preferences: {
    language: "ja",
    autoplay: true,
    quality: "1080p",
    notifications: {
      email: true,
      newReleases: true
    }
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

#### **コレクション: Video**

```javascript
{
  _id: "video_123",
  id: 1001,
  title: "インセプション",
  overview: "熟練した泥棒が...",
  video: "https://cloudinary.com/...",      // HLSストリーム
  trailer: "https://youtube.com/...",
  poster_path: "https://cloudinary.com/...",
  backdrop_path: "https://cloudinary.com/...",
  releaseDate: ISODate,
  rating: 8.8,
  genres: ["アクション", "SF"],
  cast: [
    { name: "レオナルド・ディカプリオ", character: "コブ" },
    { name: "エレン・ペイジ", character: "アリアドネ" }
  ],
  duration: 148,  // 分
  status: "published",  // draft | processing | published
  cloudinaryPublicId: "video_123_main",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

#### **コレクション: Subscription**

```javascript
{
  _id: ObjectId,
  user: "clerk_xxxxx",            // Clerk User ID
  userName: "山田太郎",
  userEmail: "yamada@example.com",
  plan: "plan_premium",           // SubscriptionPlanのID
  purchaseDate: ISODate,
  expiryDate: ISODate,
  status: "active",               // active | expired | cancelled
  amount: 99.99,
  currency: "JPY",
  paymentMethod: "card",
  paymentId: "pi_xxxxxxx",        // Stripe Payment Intent ID
  transactionId: "ch_xxxxxx",     // Stripe Charge ID
  metadata: {
    autoRenew: true,
    lastRenewDate: ISODate
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

#### **コレクション: SubscriptionPlan**

```javascript
{
  _id: "plan_basic",
  planName: "ベーシック",
  price: 4.99,
  description: "カジュアル視聴者に最適",
  features: [
    "HD (720p) 画質",
    "1デバイス",
    "広告あり"
  ],
  connectedDevices: 1,
  duration: "月額",
  tierRank: 1,
  isPopular: false,
  isActive: true,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

#### **コレクション: Genre**

```javascript
{
  _id: ObjectId,
  id: 28,
  name: "アクション",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

#### **コレクション: WatchHistory**

```javascript
{
  _id: ObjectId,
  user: "clerk_xxxxx",
  video: "video_123",           // Videoへの参照
  watchedDuration: 3600,        // 視聴秒数
  totalDuration: 8880,          // 合計秒数
  progress: 40.5,               // パーセンテージ
  lastWatchedAt: ISODate,
  completed: false,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 5.3 リレーション

```
User (1) ─────→ (多) Subscription
User (1) ─────→ (多) WatchHistory
User (1) ─────→ (多) Favorite [暗黙的]
Subscription (多) ─────→ (1) SubscriptionPlan
Subscription (多) ─────→ (1) User
Video (1) ─────→ (多) WatchHistory
Video (多) ─────→ (多) Genre [配列]
Genre (1) ─────→ (多) Video [配列で参照]
```

---

## 6. UML図

### 6.1 クラス図

```
┌─────────────────────────────────────────────────────────────┐
│ UMLクラス図                                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────┐
│ User                                │
├─────────────────────────────────────┤
│ - clerkId: string                   │
│ - name: string                      │
│ - email: string                     │
│ - image: string                     │
│ - subscriptionStatus: enum          │
│ - subscriptionTier: string          │
│ - isActive: boolean                 │
│ - isBanned: boolean                 │
│ - preferences: object               │
├─────────────────────────────────────┤
│ + getProfile(): Profile             │
│ + updateProfile(data): void         │
│ + getCurrentSubscription(): Sub     │
│ + canWatchVideo(): boolean          │
│ + isMember(): boolean               │
│ + getWatchHistory(): Video[]        │
└─────────────────────────────────────┘
         ↑
         │ 継承
         │              使用
┌─────┴─────┐           ↓              ↓
┌──────────────────┐  ┌──────────────────┐
│ Subscription     │  │ WatchHistory     │
├──────────────────┤  ├──────────────────┤
│ - user: User     │  │ - user: User     │
│ - plan: Plan     │  │ - video: Video   │
│ - purchaseDate   │  │ - progress: num  │
│ - expiryDate     │  │ - completed: bool│
│ - status: enum   │  │ - lastWatched    │
│ - amount: num    │  ├──────────────────┤
│ - paymentId      │  │ + updateProgress │
├──────────────────┤  │ + markCompleted  │
│ + isActive()     │  │ + getProgress()  │
│ + isExpired()    │  └──────────────────┘
│ + cancel()       │
│ + renew()        │
│ + getRemaining() │
└──────────────────┘
         ↓ 参照
         ↓
┌──────────────────────────┐
│ SubscriptionPlan         │
├──────────────────────────┤
│ - planName: string       │
│ - price: number          │
│ - duration: enum         │
│ - features: string[]     │
│ - connectedDevices: num  │
│ - tierRank: number       │
│ - isPopular: boolean     │
├──────────────────────────┤
│ + getFeatures(): string[]│
│ + isAvailable(): boolean │
│ + getPrice(): number     │
│ + compare(other): int    │
└──────────────────────────┘

┌──────────────────────────┐
│ Video                    │
├──────────────────────────┤
│ - title: string          │
│ - overview: string       │
│ - video: URL             │
│ - trailer: URL           │
│ - poster_path: URL       │
│ - releaseDate: Date      │
│ - rating: number         │
│ - genres: Genre[]        │
│ - cast: Actor[]          │
│ - duration: number       │
│ - status: enum           │
├──────────────────────────┤
│ + getDetails(): object   │
│ + isAvailable(): boolean │
│ + getGenres(): Genre[]   │
│ + getCast(): Actor[]     │
│ + play(): Stream         │
│ + getTrailer(): URL      │
│ + search(query): Video[] │
│ + filterByGenre(g): Video[]
└──────────────────────────┘
         ↓ 使用
         ↓
┌──────────────────────────┐
│ Genre                    │
├──────────────────────────┤
│ - id: number             │
│ - name: string           │
├──────────────────────────┤
│ + getName(): string      │
│ + getVideos(): Video[]   │
│ + getById(id): Genre     │
└──────────────────────────┘

┌─────────────────────────────────────┐
│ Admin                               │
├─────────────────────────────────────┤
│ - clerkId: string                   │
│ - name: string                      │
│ - email: string                     │
│ - role: string                      │
│ - isActive: boolean                 │
├─────────────────────────────────────┤
│ + createVideo(data): Video          │
│ + updateVideo(id, data): Video      │
│ + deleteVideo(id): void             │
│ + createPlan(data): SubscriptionPlan│
│ + updatePlan(id, data): SubscriptionPlan│
│ + deletePlan(id): void              │
│ + createGenre(data): Genre          │
│ + manageUser(id, action): void      │
└─────────────────────────────────────┘

Admin "管理" -> Video
Admin "管理" -> Genre
Admin "管理" -> SubscriptionPlan
Admin "管理" -> User
```

### 6.2 シーケンス図 - 映画視聴フロー

```
┌──────────────────────────────────────────────────────────────────┐
│ シーケンス: ユーザーがビデオを視聴                                │
└──────────────────────────────────────────────────────────────────┘

ユーザー  フロントエンド  バックエンド  DB  Cloudinary
   │           │              │         │        │
   │──視聴─────│              │         │        │
   │           │──GET /api/videos/:id──→│        │
   │           │              │──クエリ→│        │
   │           │◄─────────────レスポンス │        │
   │◄──────────│              │         │        │
   │           │──サブスクリプション確認→│        │
   │           │    (アクティブ&時間チェック)     │
   │           │◄─────────────────────────│        │
   │           │              │         │        │
   │           │──POST /api/videos/:id/watch──→  │
   │           │      (視聴履歴記録)     │        │
   │           │◄────────────────────────│        │
   │           │              │         │        │
   │──再生─────│              │         │        │
   │           │──HLSストリームURL取得──────────────→│
   │           │◄─────────────────────────────────│
   │◄─ストリーム│              │         │        │
   │           │──進捗更新────→│         │        │
   │           │  (30秒ごと)   │         │        │
   │           │◄────────────────────────│        │
   │           │              │         │        │
   │──視聴停止─│              │         │        │
   │           │──POST /mark-completed──→│       │
   │           │              │──更新──→│        │
   │           │◄─────────────────────────│        │
   │◄──OK──────│              │         │        │
```

### 6.3 シーケンス図 - プラン購入フロー

```
┌──────────────────────────────────────────────────────────────────┐
│ シーケンス: ユーザーがサブスクリプションプランを購入              │
└──────────────────────────────────────────────────────────────────┘

ユーザー フロントエンド バックエンド Stripe Inngest DB
   │         │            │         │       │    │
   │─プラン選択           │         │       │    │
   │         │            │         │       │    │
   │──決済───│            │         │       │    │
   │         │            │         │       │    │
   │         │──POST /subscriptions─→       │    │
   │         │  (planId, paymentMethod)     │    │
   │         │            │         │       │    │
   │         │            │──決済Intent作成─→    │
   │         │            │◄────clientSecret │    │
   │◄────────│            │         │       │    │
   │         │            │         │       │    │
   │◄Stripe決済           │         │       │    │
   │         │            │         │       │    │
   │──支払い─│            │         │       │    │
   │         │            │         │       │    │
   │         │            │         │       │    │
   │         │            │◄Webhook: charge.succeeded│
   │         │            │────DBに保存────────────→│
   │         │            │────メールジョブ追加──→  │
   │         │            │         │  │──メール送信
   │         │            │◄────確認 │  │          │
   │         │◄──成功─────│         │  │          │
   │◄─成功───│            │         │  │          │
   │         │            │         │  │          │
   │         │──GET /subscriptions──→  │          │
   │         │◄─現在のプランデータ────  │          │
   │◄アクティブプラン表示  │         │  │          │
```

### 6.4 シーケンス図 - 管理者が映画追加

```
┌──────────────────────────────────────────────────────────────────┐
│ シーケンス: 管理者が新しい映画を追加                              │
└──────────────────────────────────────────────────────────────────┘

管理者 フロントエンド バックエンド Cloudinary Inngest DB
  │        │            │           │         │      │
  │─フォーム入力         │           │         │      │
  │        │            │           │         │      │
  │──送信──│            │           │         │      │
  │        │            │           │         │      │
  │        │──POST /admin/videos──→ │         │      │
  │        │  (title, overview, files)        │      │
  │        │            │           │         │      │
  │        │            │──ビデオアップロード→│      │
  │        │            │           │────安全アップロード
  │        │            │◄─URL & public_id   │      │
  │        │            │           │         │      │
  │        │            │──DBに保存──────────────────→│
  │        │            │──ジョブ追加────────→│      │
  │        │            │           │  ビデオ処理(HLS)
  │        │            │           │  エンコード、変換│
  │        │            │◄──────────ジョブ完了 │      │
  │        │            │           │         │      │
  │        │            │──ステータス更新: published ─→│
  │        │◄──成功─────│           │         │      │
  │◄リダイレクト         │           │         │      │
  │  リストへ            │           │         │      │
```

---

## 7. 主要業務フロー

### 7.1 ユーザー登録と認証フロー

```
flowchart TD
    A["ユーザーがアプリにアクセス"] --> B{"ログイン済み?"}
    B -->|いいえ| C["Clerkログインへリダイレクト"]
    C --> D["ユーザーがClerkでサインアップ/イン"]
    D --> E["ClerkがユーザーデータをInngestに送信"]
    E --> F["Inngest: ClerkSync関数"]
    F --> G["MongoDBにユーザーが存在するかチェック"]
    G -->|存在する| H["ユーザープロフィールを更新"]
    G -->|新規| I["新しいUserドキュメントを作成"]
    H --> J["subscriptionStatus: noneに設定"]
    I --> J
    J --> K["ユーザーをホームにリダイレクト"]
    B -->|はい| K
    K --> L{"コンテンツにアクセス可能?"}
    L -->|サブスクリプションアクティブ| M["全コンテンツを表示"]
    L -->|サブスクリプションなし| N["コンテンツプレビューを表示"]
```

### 7.2 サブスクリプションプラン購入フロー

```
flowchart TD
    A["ユーザーがサブスクリプションプランを表示"] --> B["プランを選択"]
    B --> C["「登録」ボタンをクリック"]
    C --> D["POST /api/subscriptions"]
    D --> E["バックエンドが検証:"]
    E --> E1["- ユーザーが存在する"]
    E --> E2["- プランがアクティブ"]
    E --> E3["- アクティブなサブスクリプションがない"]
    E1 --> F{"すべて有効?"}
    E2 --> F
    E3 --> F
    F -->|いいえ| G["エラーを返す"]
    F -->|はい| H["Stripe Payment Intentを作成"]
    H --> I["clientSecretをフロントエンドに返す"]
    I --> J["Stripe決済フォームを読み込む"]
    J --> K["ユーザーがカード情報を入力"]
    K --> L["フロントエンドが支払いを確認"]
    L --> M["Stripeが決済を処理"]
    M --> N{"決済成功?"}
    N -->|いいえ| O["決済失敗 - ユーザーに通知"]
    N -->|はい| P["StripeがWebhookを送信"]
    P --> Q["バックエンドが受信: charge.succeeded"]
    Q --> R["Subscriptionレコードを作成"]
    R --> S["Userを更新: subscriptionStatus='active'"]
    S --> T["確認メールをキューに追加"]
    T --> U["Inngestジョブをキューに追加"]
    U --> V["確認メールを送信"]
    V --> W["フロントエンド: 成功を表示"]
    W --> X["「マイサブスクリプション」へリダイレクト"]
```

### 7.3 サブスクリプション期限チェックフロー

```
flowchart TD
    A["Cronジョブが毎時実行"] --> B["全サブスクリプションを取得"]
    B --> C["フィルタ: expiryDate <= now"]
    C --> D{"期限切れあり?"}
    D -->|はい| E["subscriptionStatus = 'expired'に更新"]
    E --> F["User: subscriptionStatus = 'expired'に更新"]
    F --> G["メール通知をキューに追加"]
    G --> H["「サブスクリプション期限切れ」メールを送信"]
    H --> I["ユーザーはコンテンツを視聴できなくなる"]
    D -->|いいえ| J["アクション不要"]
    J --> K["次の時間まで待機"]
```

### 7.4 映画アップロードと処理フロー

```
flowchart TD
    A["管理者が映画追加フォームに入力"] --> B["ビデオファイルを選択"]
    B --> C["ポスター画像を選択"]
    C --> D["「アップロード」をクリック"]
    D --> E["フロントエンドが検証:"]
    E --> E1["- ファイルサイズ < 上限"]
    E --> E2["- ファイル形式が正しい"]
    E --> E3["- すべてのフィールドが入力済み"]
    E1 --> F{"有効?"}
    E2 --> F
    E3 --> F
    F -->|いいえ| G["エラーメッセージを表示"]
    F -->|はい| H["POST /admin/videos"]
    H --> I["ビデオメタデータをDBに保存"]
    I --> J["ビデオをCloudinaryにアップロード"]
    J --> K["Inngestジョブをキューに追加: videoProcessing"]
    K --> L["Inngest: ビデオをエンコード"]
    L --> M["HLSプレイリストを生成"]
    M --> N["ビデオステータスを更新: 'processed'"]
    N --> O["Cloudinary public IDを更新"]
    O --> P["管理者にメール: 「ビデオ準備完了」"]
    P --> Q["ビデオがカタログに表示される"]
```

### 7.5 映画視聴フロー

```
flowchart TD
    A["ユーザーがビデオを選択"] --> B["GET /api/videos/:id"]
    B --> C["ビデオ詳細 + メタデータを返す"]
    C --> D["フロントエンドがチェック:"]
    D --> D1["- ユーザーはアクティブなサブスクリプションを持っているか?"]
    D --> D2["- サブスクリプションティアはこのビデオを許可するか?"]
    D1 --> E{"アクセス許可?"}
    D2 --> E
    E -->|サブスクリプションなし| F["アップグレードプロンプトを表示"]
    E -->|はい| G["CloudinaryからHLSストリームURLを取得"]
    G --> H["ビデオプレーヤーを初期化"]
    H --> I["POST /api/videos/:id/watch"]
    I --> J["WatchHistoryレコードを作成/更新"]
    J --> K["ユーザーが視聴開始"]
    K --> L["30秒ごと: PATCH progress"]
    L --> M["watchedDurationとprogress%を更新"]
    M --> N{"ビデオ完了?"}
    N -->|いいえ| L
    N -->|はい| O["POST /mark-completed"]
    O --> P["WatchHistory: completed = trueに設定"]
    P --> Q["「完了」バッジを表示"]
```

### 7.6 映画検索とフィルタリングフロー

```
flowchart TD
    A["ユーザーが検索クエリを入力"] --> B["GET /api/videos/search?q=..."]
    B --> C["バックエンドが検索:"]
    C --> C1["- title (大文字小文字を区別しない)"]
    C --> C2["- overview"]
    C --> C3["- tagline"]
    C1 --> D["一致するビデオを返す"]
    C2 --> D
    C3 --> D
    D --> E["フロントエンドが結果を表示"]
    E --> F["ユーザーが「ジャンルフィルタ」をクリック"]
    F --> G["GET /api/videos?genres=..."]
    G --> H["ジャンルでビデオをフィルタ"]
    H --> I["フィルタリングされた結果を返す"]
    I --> J["フロントエンドがフィルタリストを表示"]
```

### 7.7 お気に入り管理フロー

```
flowchart TD
    A["ユーザーがビデオ詳細を表示"] --> B{"ビデオはお気に入り?"}
    B -->|いいえ| C["「お気に入りに追加」ボタンを表示"]
    B -->|はい| D["「お気に入りから削除」ボタンを表示"]
    C --> E["ユーザーがボタンをクリック"]
    D --> E
    E --> F{"アクション?"}
    F -->|追加| G["POST /api/videos/:id/favorite"]
    F -->|削除| H["DELETE /api/videos/:id/favorite"]
    G --> I["Favoriteレコードを作成"]
    H --> J["Favoriteレコードを削除"]
    I --> K["UIを更新"]
    J --> K
    K --> L["ユーザーが更新されたステータスを確認"]
```

---

## 8. APIドキュメント

### 8.1 認証とユーザーAPI

#### **POST /api/auth/login**

```javascript
// 明示的なAPIなし - フロントエンドでClerkが処理
// ClerkがInngest webhook経由でユーザーをMongoDBに同期
```

#### **GET /api/users/profile**

```
メソッド: GET
認証: 必須 (Clerk JWT)
レスポンス: {
  _id: "user_123",
  clerkId: "clerk_xxxxx",
  name: "山田太郎",
  email: "yamada@example.com",
  image: "https://...",
  subscriptionStatus: "active",
  subscriptionTier: "Premium",
  preferences: {...}
}
```

#### **PATCH /api/users/profile**

```
メソッド: PATCH
認証: 必須
ボディ: {
  name?: "新しい名前",
  preferences?: {
    language: "ja",
    quality: "1080p",
    autoplay: true
  }
}
レスポンス: 更新されたユーザーオブジェクト
```

### 8.2 ビデオAPI

#### **GET /api/videos**

```
メソッド: GET
認証: オプション
クエリパラメータ:
  - page: number (デフォルト: 1)
  - limit: number (デフォルト: 20)
  - genres: string[] (カンマ区切り)
  - sortBy: "rating" | "releaseDate" | "trending"
レスポンス: {
  data: [Video[], ...],
  totalPages: number,
  currentPage: number,
  totalCount: number
}
```

#### **GET /api/videos/:id**

```
メソッド: GET
認証: オプション
レスポンス: 完全な詳細を持つVideoオブジェクト
```

#### **GET /api/videos/search**

```
メソッド: GET
クエリ: q=searchTerm
レスポンス: Video[]
```

#### **POST /api/videos/:id/watch**

```
メソッド: POST
認証: 必須
ボディ: {
  watchedDuration: number,
  progress: number
}
レスポンス: {success: true}
```

#### **PATCH /api/videos/:id/progress**

```
メソッド: PATCH
認証: 必須
ボディ: {
  watchedDuration: number,
  progress: number
}
レスポンス: 更新されたWatchHistory
```

#### **POST /api/videos/:id/favorite**

```
メソッド: POST
認証: 必須
レスポンス: {success: true, message: "お気に入りに追加されました"}
```

#### **DELETE /api/videos/:id/favorite**

```
メソッド: DELETE
認証: 必須
レスポンス: {success: true, message: "お気に入りから削除されました"}
```

#### **POST /admin/videos**

```
メソッド: POST
認証: 必須 (管理者のみ)
ボディ: FormData {
  title: string,
  overview: string,
  tagline?: string,
  releaseDate: date,
  rating: number,
  genres: string[],
  cast: [{name, character}, ...],
  poster: File,
  backdrop?: File,
  video: File,
  trailer?: string
}
レスポンス: 作成されたVideoオブジェクト
```

### 8.3 サブスクリプションAPI

#### **GET /api/subscriptions/plans**

```
メソッド: GET
認証: オプション
レスポンス: SubscriptionPlan[]
```

#### **GET /api/subscriptions/current**

```
メソッド: GET
認証: 必須
レスポンス: 現在のSubscriptionまたはnull
```

#### **POST /api/subscriptions**

```
メソッド: POST
認証: 必須
ボディ: {
  planId: string,
  paymentMethodId: string
}
レスポンス: {
  clientSecret: string,
  subscriptionId: string
}
```

#### **POST /api/subscriptions/cancel**

```
メソッド: POST
認証: 必須
レスポンス: {success: true, message: "サブスクリプションがキャンセルされました"}
```

#### **POST /api/subscriptions/upgrade**

```
メソッド: POST
認証: 必須
ボディ: {planId: string}
レスポンス: 更新されたSubscription
```

### 8.4 ジャンルAPI

#### **GET /api/genres**

```
メソッド: GET
認証: オプション
レスポンス: Genre[]
```

#### **POST /admin/genres**

```
メソッド: POST
認証: 必須 (管理者のみ)
ボディ: {name: string}
レスポンス: 作成されたGenre
```

### 8.5 管理者API

#### **GET /admin/dashboard**

```
メソッド: GET
認証: 必須 (管理者のみ)
レスポンス: {
  totalUsers: number,
  activeSubscriptions: number,
  totalVideos: number,
  revenue: number,
  revenueChart: {month: string, amount: number}[],
  topVideos: Video[],
  recentSubscriptions: Subscription[]
}
```

#### **GET /admin/users**

```
メソッド: GET
認証: 必須 (管理者のみ)
クエリ: page, limit, search
レスポンス: ページネーションされたUserリスト
```

#### **GET /admin/subscriptions**

```
メソッド: GET
認証: 必須 (管理者のみ)
クエリ: page, limit, status
レスポンス: ページネーションされたSubscriptionリスト
```

#### **POST /admin/plans**

```
メソッド: POST
認証: 必須 (管理者のみ)
ボディ: SubscriptionPlanデータ
レスポンス: 作成されたPlan
```

### 8.6 Webhook API

#### **POST /api/webhooks/stripe**

```
メソッド: POST
ヘッダー: stripe-signature
ボディ: Stripe webhookイベント
処理されるイベント:
  - charge.succeeded → Subscriptionを作成
  - charge.failed → エラーメールを送信
  - invoice.payment_succeeded → サブスクリプションを更新
```

---

## 9. ミドルウェアとバリデーション

### 9.1 ミドルウェアパイプライン

```
リクエスト
    ↓
CORS → レート制限 → 認証 (Clerk) → バリデーション → ルート
    ↓
レスポンス
    ↓
エラーハンドラー
```

### 9.2 レート制限設定

```javascript
apiLimiter = 15分間に15リクエスト/IP
```

### 9.3 バリデーションルール

- メール: 有効なメール形式
- パスワード: (Clerkが処理)
- プランフィールド: 必須、有効な値
- ビデオタイトル: 最大500文字
- ビデオ概要: 最大2000文字

---

## 10. デプロイと環境

### 10.1 環境変数

**バックエンド (.env)**

```
# データベース
MONGODB_URI=mongodb+srv://...

# Clerk
CLERK_API_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary
CLOUDINARY_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# メール
SMTP_USER=...
SMTP_PASS=...
SMTP_HOST=smtp.gmail.com

# サーバー
PORT=3000
NODE_ENV=production

# フロントエンド
VITE_API_URL=https://api.hustv.com
```

**フロントエンド (.env)**

```
VITE_CLERK_PUBLISHABLE_KEY=pk_...
VITE_API_URL=https://api.hustv.com
```

### 10.2 デプロイメント

**Vercel (フロントエンド)**

- ビルド: `npm run build`
- 出力: `dist/`
- 環境: VITE\_\* 変数

**Vercel (バックエンド)**

- フレームワーク: Node.js
- ビルド: デフォルト
- 開始: `node server.js`
- 環境: すべての変数

**データベース**

- MongoDB Atlas (クラウド)

**CDNとストレージ**

- Cloudinary (ビデオと画像)

---

## 11. セキュリティ機能

✅ **認証**

- Clerk経由のOAuth 2.0
- JWTトークン

✅ **認可**

- ロールベースアクセス (ユーザー/管理者)
- 保護されたルート
- サブスクリプション検証

✅ **APIセキュリティ**

- レート制限
- 入力検証
- CORSポリシー
- 環境変数

✅ **決済セキュリティ**

- Stripe統合
- Webhook署名検証
- ログに機密データなし

✅ **データ保護**

- HTTPSのみ (Vercel)
- パフォーマンス向上のためのMongoDBインデックス
- ユーザーデータ暗号化

---

## 12. パフォーマンスと最適化

✅ **フロントエンド**

- Viteによるコード分割
- コンポーネントの遅延ロード
- 画像最適化

✅ **バックエンド**

- データベースインデックス
- ページネーション
- キャッシング (CDNによる暗黙的)
- レート制限

✅ **メディア**

- ビデオのHLSストリーミング
- Cloudinary経由の画像CDN
- アダプティブビットレートストリーミング

---

## 13. アプリケーションデモ

### 13.1 デモへのアクセス

HusTVプロジェクトの完全なデモバージョンにアクセスできます:

🌐 **URL:** https://hustv.vercel.app/

### 13.2 テスト可能な機能

**一般ユーザー**

- ✅ アカウント登録/ログイン
- ✅ 映画リスト表示
- ✅ タイトルで映画を検索
- ✅ ジャンルで映画をフィルタ
- ✅ 映画詳細表示 (トレーラー、評価、あらすじ、キャスト)
- ✅ 映画視聴 (有効なサブスクリプション必要)
- ✅ 視聴進捗の追跡
- ✅ お気に入り映画の追加/削除
- ✅ サブスクリプションプラン管理
- ✅ Stripeでプラン購入
- ✅ 視聴履歴の確認
- ✅ 個人プロフィールの更新

**管理者**

- ✅ 管理ダッシュボードへのログイン
- ✅ 概要表示 (ダッシュボード統計)
- ✅ 映画管理 (追加、編集、削除)
- ✅ ビデオと画像のアップロード
- ✅ 映画ジャンル管理
- ✅ サブスクリプションプラン管理
- ✅ ユーザーリスト表示
- ✅ サブスクリプションリスト表示
- ✅ 収益分析

### 13.3 デモ使用ガイド

**映画視聴:**

1. アカウントにログイン
2. 「Movies」ページへ移動
3. 映画を選択
4. サブスクリプションがない場合は「Upgrade Plan」をクリック
5. 適切なプランを選択
6. Stripeで決済 (テストカード使用: 4242 4242 4242 4242)
7. 映画に戻り「Watch Now」をクリック

**お気に入り管理:**

1. 映画詳細を開く
2. ハートボタンをクリックしてお気に入りに追加
3. 「Favorites」ページへ移動してリストを確認

**プラン管理:**

1. 「My Subscriptions」ページへ移動
2. 現在のプランを表示またはアップグレード
3. 必要に応じてサブスクリプションをキャンセル

**管理者向け:**

1. 管理者アカウントでログイン
2. `/admin/dashboard` にアクセス
3. サイドバーから映画、ジャンル、プランを管理
4. フォームから新しい映画をアップロード
5. 統計とレポートを表示

### 13.4 デモされる技術

- ✅ Clerk認証 (OAuth)
- ✅ Stripe決済統合
- ✅ ビデオストリーミング (HLS)
- ✅ リアルタイム検索とフィルタ
- ✅ レスポンシブデザイン (モバイル、タブレット、デスクトップ)
- ✅ ロールベースアクセス制御
- ✅ データベース操作 (CRUD)
- ✅ ファイルアップロード (ビデオと画像)
- ✅ エラーハンドリングとバリデーション

---

## 14. 結論

**HusTV**プロジェクトは、以下を備えた完全なストリーミングプラットフォームです:

- ✅ 現代的なアーキテクチャ (React + Node.js)
- ✅ 安全な認証 (Clerk OAuth)
- ✅ PCI準拠の決済 (Stripe)
- ✅ 柔軟なコンテンツ管理 (管理パネル)
- ✅ スムーズなユーザーエクスペリエンス (HLSビデオプレーヤー)
- ✅ 自動化 (Inngest + Cron)
- ✅ 信頼性 (エラーハンドリング、ログ記録)

---

**このドキュメントの作成日:** 2025年12月20日  
**バージョン:** 1.0  
**著者:** Nguyễn Minh Hiếu (hieu7825)

---

# BÁO CÁO DỰ ÁN HusTV

**Ngày tạo:** 20/12/2025  
**Tên dự án:** HusTV - Nền tảng Streaming Film  
**Công nghệ:** React + Vite (Frontend), Node.js + Express (Backend), MongoDB (Database)

---

## 📋 MỤC LỤC

1. [Tổng quan dự án](#tổng-quan-dự-án)
2. [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
3. [Các chức năng chính](#các-chức-năng-chính)
4. [Công nghệ sử dụng](#công-nghệ-sử-dụng)
5. [Sơ đồ cơ sở dữ liệu](#sơ-đồ-cơ-sở-dữ-liệu)
6. [Sơ đồ UML](#sơ-đồ-uml)
7. [Quy trình nghiệp vụ chính](#quy-trình-nghiệp-vụ-chính)
8. [API Documentation](#api-documentation)
9. [Middleware & Validation](#middleware--validation)
10. [Triển khai & Môi trường](#triển-khai--môi-trường)
11. [Tính năng bảo mật](#tính-năng-bảo-mật)
12. [Hiệu suất & Tối ưu](#hiệu-suất--tối-ưu)
13. [Demo Ứng dụng](#demo-ứng-dụng)
14. [Kết luận](#kết-luận)

---

## 1. Tổng Quan Dự Án

### 1.1 Mô Tả

**HusTV** là một nền tảng streaming phim trực tuyến hiện đại, cho phép người dùng:

- Xem phim và video
- Quản lý yêu thích
- Mua gói đăng ký (Subscription)
- Theo dõi lịch sử xem
- Quản lý tài khoản cá nhân

### 1.2 Đối Tượng Người Dùng

- **Người dùng thông thường (User):** Xem phim, mua gói, quản lý yêu thích
- **Quản trị viên (Admin):** Quản lý phim, thể loại, gói đăng ký, khách hàng
- **Khách (Guest):** Xem thông tin phim, đăng ký tài khoản

### 1.3 Các Chức Năng Cốt Lõi

✅ Xem danh sách phim và video  
✅ Tìm kiếm và lọc phim theo thể loại  
✅ Xem chi tiết phim (trailer, rating, plot)  
✅ Xem video (HLS stream)  
✅ Quản lý yêu thích (Favorites)  
✅ Mua và quản lý gói đăng ký  
✅ Theo dõi lịch sử xem  
✅ Quản lý hồ sơ người dùng  
✅ Admin: Thêm/Sửa/Xóa phim  
✅ Admin: Quản lý gói đăng ký  
✅ Admin: Quản lý thành viên

---

## 2. Kiến Trúc Hệ Thống

### 2.1 Sơ Đồ Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │   Home   │ │ Movies   │ │ Details  │ │ Favorite     │   │
│  │ Page     │ │ Page     │ │ Page     │ │ Page         │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ Video    │ │Subscript │ │  Admin   │ │  Navbar      │   │
│  │ Player   │ │ Plans    │ │ Dashboard│ │  Footer      │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Axios HTTP Client + Services Layer             │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Authentication (Clerk) + React Router                 │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↕ (HTTP/REST)
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Node.js + Express)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Routes:                                             │   │
│  │  • /api/users       - Quản lý người dùng           │   │
│  │  • /api/videos      - Quản lý phim/video           │   │
│  │  • /api/genres      - Quản lý thể loại             │   │
│  │  • /api/subscriptions - Quản lý gói đăng ký       │   │
│  │  • /api/admin       - Quản lý admin                │   │
│  │  • /api/webhooks    - Stripe webhooks              │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Middleware:                                         │   │
│  │  • Auth (Clerk)         • Error Handler             │   │
│  │  • Rate Limiter         • Validation                │   │
│  │  • CORS                 • Subscription Validation   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Controllers: User, Video, Admin, Genre,             │   │
│  │  Subscription, Stripe Webhooks                       │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Services & Utils:                                   │   │
│  │  • Cloudinary (Video Upload)                         │   │
│  │  • Stripe (Payment Processing)                       │   │
│  │  • Email Service (Nodemailer)                        │   │
│  │  • Inngest (Job Queue & Automation)                  │   │
│  │  • Cron Jobs (Subscription Checker)                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ (TCP/IP)
┌─────────────────────────────────────────────────────────────┐
│                   DATABASES & SERVICES                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│  │  MongoDB     │ │  Cloudinary  │ │  Stripe      │         │
│  │ (NoSQL DB)   │ │ (Video CDN)  │ │ (Payments)   │         │
│  └──────────────┘ └──────────────┘ └──────────────┘         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│  │  Clerk       │ │  Nodemailer  │ │  Inngest     │         │
│  │ (Auth)       │ │ (Email)      │ │ (Job Queue)  │         │
│  └──────────────┘ └──────────────┘ └──────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Cấu Trúc Folder

```
HusTV/
├── client/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/        # Các component React
│   │   ├── pages/            # Trang chính
│   │   ├── services/         # API calls
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilities
│   │   └── assets/           # Hình ảnh, video
│   └── package.json
│
└── server/                    # Backend (Node.js + Express)
    ├── models/              # MongoDB schemas
    ├── controllers/         # Business logic
    ├── routes/             # API endpoints
    ├── middleware/         # Express middleware
    ├── utils/              # Utilities (Cloudinary, Stripe, Email)
    ├── services/           # Business services
    ├── inngest/            # Job queue & automation
    ├── cron/               # Scheduled tasks
    ├── configs/            # Configuration (DB)
    └── package.json
```

---

## 3. Các Chức Năng Chính

### 3.1 Quản Lý Phim & Video

| Chức Năng          | User | Admin | Mô Tả                               |
| ------------------ | ---- | ----- | ----------------------------------- |
| Xem danh sách phim | ✅   | ✅    | Hiển thị tất cả phim với phân trang |
| Tìm kiếm phim      | ✅   | ✅    | Tìm phim theo tiêu đề               |
| Lọc theo thể loại  | ✅   | ✅    | Lọc phim theo thể loại              |
| Xem chi tiết phim  | ✅   | ✅    | Xem poster, trailer, plot, cast     |
| Xem video          | ✅\* | ✅    | \*Yêu cầu gói đăng ký hợp lệ        |
| Thêm phim mới      | ❌   | ✅    | Upload phim từ form                 |
| Sửa thông tin phim | ❌   | ✅    | Cập nhật thông tin phim             |
| Xóa phim           | ❌   | ✅    | Xóa phim khỏi hệ thống              |

### 3.2 Quản Lý Gói Đăng Ký (Subscription)

| Chức Năng        | User | Admin | Mô Tả                       |
| ---------------- | ---- | ----- | --------------------------- |
| Xem gói sẵn có   | ✅   | ✅    | Hiển thị các gói đăng ký    |
| Mua gói          | ✅   | ✅    | Thanh toán qua Stripe       |
| Xem gói hiện tại | ✅   | ✅    | Xem thông tin gói đang dùng |
| Hủy gói          | ✅   | ✅    | Hủy đăng ký hiện tại        |
| Nâng cấp gói     | ✅   | ✅    | Chuyển sang gói cao hơn     |
| Tạo gói mới      | ❌   | ✅    | Tạo gói đăng ký mới         |
| Chỉnh sửa gói    | ❌   | ✅    | Cập nhật thông tin gói      |
| Xóa gói          | ❌   | ✅    | Xóa gói khỏi hệ thống       |

### 3.3 Quản Lý Tài Khoản & Hồ Sơ

| Chức Năng         | Mô Tả                                      |
| ----------------- | ------------------------------------------ |
| Đăng nhập/Đăng ký | Thông qua Clerk (SSO)                      |
| Xem hồ sơ cá nhân | Xem thông tin cá nhân                      |
| Cập nhật hồ sơ    | Sửa tên, ảnh, cài đặt                      |
| Cài đặt tùy chọn  | Chọn ngôn ngữ, chất lượng video, thông báo |
| Xem lịch sử xem   | Xem các phim đã xem                        |
| Quản lý yêu thích | Thêm/xóa phim yêu thích                    |

### 3.4 Quản Lý Thể Loại

| Chức Năng              | User | Admin | Mô Tả                     |
| ---------------------- | ---- | ----- | ------------------------- |
| Xem danh sách thể loại | ✅   | ✅    | Hiển thị tất cả thể loại  |
| Lọc phim theo thể loại | ✅   | ✅    | Xem phim của một thể loại |
| Thêm thể loại          | ❌   | ✅    | Tạo thể loại mới          |
| Sửa thể loại           | ❌   | ✅    | Cập nhật tên thể loại     |
| Xóa thể loại           | ❌   | ✅    | Xóa thể loại              |

### 3.5 Thanh Toán & Webhooks

| Chức Năng                    | Mô Tả                                      |
| ---------------------------- | ------------------------------------------ |
| Thanh toán Stripe            | Xử lý thanh toán an toàn qua Stripe        |
| Webhook từ Stripe            | Nhận sự kiện thanh toán từ Stripe          |
| Cập nhật trạng thái đơn hàng | Tự động cập nhật khi thanh toán thành công |
| Email xác nhận               | Gửi email khi thanh toán hoàn tất          |

### 3.6 Tự Động Hóa & Công Việc Nền

| Chức Năng                | Mô Tả                              | Công nghệ            |
| ------------------------ | ---------------------------------- | -------------------- |
| Kiểm tra hết hạn đăng ký | Chạy mỗi giờ, cập nhật trạng thái  | Cron Job             |
| Đồng bộ Clerk Users      | Tự động tạo/cập nhật user từ Clerk | Inngest              |
| Xử lý video              | Mã hóa video, tạo HLS stream       | Inngest              |
| Gửi email tự động        | Gửi email xác nhận, thông báo      | Inngest + Nodemailer |

---

## 4. Công Nghệ Sử Dụng

### 4.1 Frontend

```
- React 18+              → UI Library
- Vite                   → Build tool & Dev server
- React Router v6        → Routing
- Axios                  → HTTP Client
- React Hot Toast        → Notifications
- Clerk                  → Authentication
- CSS + Tailwind (implied) → Styling
```

### 4.2 Backend

```
- Node.js               → Runtime
- Express 5.1           → Web framework
- MongoDB + Mongoose    → Database
- Cloudinary            → Video/Image CDN
- Stripe                → Payment processing
- Clerk                 → Authentication
- Nodemailer            → Email sending
- Inngest               → Job queue & workflow
- Express Rate Limit    → API protection
- Express Validator     → Input validation
- Multer                → File upload
- Node Cron             → Scheduled tasks
- CORS                  → Cross-origin requests
- Dotenv                → Environment config
```

### 4.3 External Services

```
- Clerk                 → User authentication & management
- Stripe                → Payment processing
- Cloudinary            → Video & image hosting
- Nodemailer            → Email service
- Inngest               → Task queue & automation
- MongoDB Atlas         → Database hosting
```

### 4.4 Development Tools

```
- Nodemon               → Auto-reload server
- Git                   → Version control
- VSCode                → IDE
```

---

## 5. Sơ Đồ Cơ Sở Dữ Liệu

### 5.1 Entity-Relationship Diagram (ER Diagram)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DATABASE SCHEMA                              │
└─────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │    User      │
                              ├──────────────┤
                              │ _id: String  │ (MongoDB)
                              │ clerkId      │ (Unique, Index)
                              │ name         │
                              │ email        │ (Unique, Index)
                              │ image        │
                              │ isActive     │
                              │ isBanned     │
                              │ preferences  │ (nested)
                              │ createdAt    │
                              │ updatedAt    │
                              └──────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ↓               ↓               ↓
        ┌──────────────────┐  ┌──────────────┐  ┌────────────────┐
        │  Subscription    │  │ WatchHistory │  │   Favorite     │
        ├──────────────────┤  ├──────────────┤  ├────────────────┤
        │ _id: ObjectId    │  │ _id: ObjectId│  │ _id: ObjectId  │
        │ user: String(FK) │  │ user: String │  │ user: String   │
        │ plan: String(FK) │  │ video: Str   │  │ video: String  │
        │ purchaseDate     │  │ watchedDur   │  │ addedAt         │
        │ expiryDate       │  │ totalDur     │  │ createdAt       │
        │ status           │  │ progress %   │  └────────────────┘
        │ amount           │  │ lastWatched  │
        │ currency         │  │ completed    │
        │ paymentId        │  │ createdAt    │
        │ createdAt        │  └──────────────┘
        └──────────────────┘
                │
                ↓
    ┌──────────────────────────┐
    │  SubscriptionPlan        │
    ├──────────────────────────┤
    │ _id: String (plan_xxxxx) │
    │ planName                 │
    │ price                    │
    │ description              │
    │ features[]               │
    │ connectedDevices         │
    │ duration (Monthly/Yearly)│
    │ tierRank (1-10)          │
    │ isPopular                │
    │ isActive                 │
    │ createdAt                │
    └──────────────────────────┘

                              ┌──────────────┐
                              │    Video     │
                              ├──────────────┤
                              │ _id: String  │
                              │ id: Number   │ (Unique)
                              │ title        │
                              │ overview     │
                              │ video        │ (Cloudinary URL)
                              │ trailer      │ (Optional)
                              │ poster_path  │
                              │ backdrop_path│
                              │ releaseDate  │
                              │ rating       │
                              │ genres[]     │ (FK to Genre)
                              │ cast[]       │
                              │ crew[]       │
                              │ duration     │
                              │ status       │
                              │ createdAt    │
                              └──────────────┘
                                    │
                                    ↓
                          ┌──────────────┐
                          │    Genre     │
                          ├──────────────┤
                          │ _id: ObjectId│
                          │ id: Number   │
                          │ name: String │
                          │ createdAt    │
                          └──────────────┘

                                  ┌──────────────┐
                                  │    Admin     │
                                  ├──────────────┤
                                  │ _id: String  │
                                  │ clerkId      │ (Unique, Index)
                                  │ name         │
                                  │ email        │ (Unique, Index)
                                  │ role         │ (e.g. superadmin)
                                  │ isActive     │
                                  │ createdAt    │
                                  │ updatedAt    │
                                  └──────────────┘

    Admin (1) ─────→ (Many) Video
    Admin (1) ─────→ (Many) Genre
    Admin (1) ─────→ (Many) SubscriptionPlan
    Admin (1) ─────→ (Many) User (admin actions / audits)

```

### 5.2 Bảng Chi Tiết

#### **Collection: User**

```javascript
{
  _id: "user_123",
  clerkId: "clerk_xxxxx",  // Clerk User ID
  name: "John Doe",
  email: "john@example.com",
  image: "https://...",
  currentSubscription: ObjectId("..."),  // ref to Subscription
  subscriptionStatus: "active",          // none | active | expired | cancelled
  subscriptionTier: "Premium",
  isActive: true,
  isBanned: false,
  preferences: {
    language: "en",
    autoplay: true,
    quality: "1080p",
    notifications: {
      email: true,
      newReleases: true
    }
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

#### **Collection: Video**

```javascript
{
  _id: "video_123",
  id: 1001,
  title: "Inception",
  overview: "A skilled thief...",
  video: "https://cloudinary.com/...",  // HLS stream
  trailer: "https://youtube.com/...",
  poster_path: "https://cloudinary.com/...",
  backdrop_path: "https://cloudinary.com/...",
  releaseDate: ISODate,
  rating: 8.8,
  genres: ["Action", "Sci-Fi"],
  cast: [
    { name: "Leonardo DiCaprio", character: "Cobb" },
    { name: "Ellen Page", character: "Ariadne" }
  ],
  duration: 148,  // minutes
  status: "published",  // draft | processing | published
  cloudinaryPublicId: "video_123_main",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

#### **Collection: Subscription**

```javascript
{
  _id: ObjectId,
  user: "clerk_xxxxx",  // Clerk User ID
  userName: "John Doe",
  userEmail: "john@example.com",
  plan: "plan_premium",  // ID of SubscriptionPlan
  purchaseDate: ISODate,
  expiryDate: ISODate,
  status: "active",  // active | expired | cancelled
  amount: 99.99,
  currency: "USD",
  paymentMethod: "card",
  paymentId: "pi_xxxxxxx",  // Stripe Payment Intent ID
  transactionId: "ch_xxxxxx",  // Stripe Charge ID
  metadata: {
    autoRenew: true,
    lastRenewDate: ISODate
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

#### **Collection: SubscriptionPlan**

```javascript
{
  _id: "plan_basic",
  planName: "Basic",
  price: 4.99,
  description: "Perfect for casual viewers",
  features: [
    "HD (720p) quality",
    "1 device",
    "Ad-supported"
  ],
  connectedDevices: 1,
  duration: "Monthly",
  tierRank: 1,
  isPopular: false,
  isActive: true,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

#### **Collection: Genre**

```javascript
{
  _id: ObjectId,
  id: 28,
  name: "Action",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

#### **Collection: WatchHistory**

```javascript
{
  _id: ObjectId,
  user: "clerk_xxxxx",
  video: "video_123",  // ref to Video
  watchedDuration: 3600,  // seconds watched
  totalDuration: 8880,    // total seconds
  progress: 40.5,         // percentage
  lastWatchedAt: ISODate,
  completed: false,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 5.3 Mối Quan Hệ

```
User (1) ─────→ (Many) Subscription
User (1) ─────→ (Many) WatchHistory
User (1) ─────→ (Many) Favorite [implicit]

Subscription (Many) ─────→ (1) SubscriptionPlan
Subscription (Many) ─────→ (1) User

Video (1) ─────→ (Many) WatchHistory
Video (Many) ─────→ (Many) Genre [array]

Genre (1) ─────→ (Many) Video [referenced in array]
```

---

## 6. Sơ Đồ UML

### 6.1 Class Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        UML CLASS DIAGRAM                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────┐
│           User                      │
├─────────────────────────────────────┤
│ - clerkId: string                   │
│ - name: string                      │
│ - email: string                     │
│ - image: string                     │
│ - subscriptionStatus: enum          │
│ - subscriptionTier: string          │
│ - isActive: boolean                 │
│ - isBanned: boolean                 │
│ - preferences: object               │
├─────────────────────────────────────┤
│ + getProfile(): Profile             │
│ + updateProfile(data): void         │
│ + getCurrentSubscription(): Sub      │
│ + canWatchVideo(): boolean          │
│ + isMember(): boolean               │
│ + getWatchHistory(): Video[]        │
└─────────────────────────────────────┘
           ↑
           │ inherits
           │
        Uses
      ┌─────┴─────┐
      ↓           ↓
┌──────────────────┐   ┌──────────────────┐
│  Subscription    │   │  WatchHistory    │
├──────────────────┤   ├──────────────────┤
│ - user: User     │   │ - user: User     │
│ - plan: Plan     │   │ - video: Video   │
│ - purchaseDate   │   │ - progress: num  │
│ - expiryDate     │   │ - completed: bool│
│ - status: enum   │   │ - lastWatched    │
│ - amount: num    │   ├──────────────────┤
│ - paymentId      │   │ + updateProgress │
├──────────────────┤   │ + markCompleted  │
│ + isActive()     │   │ + getProgress()  │
│ + isExpired()    │   └──────────────────┘
│ + cancel()       │
│ + renew()        │
│ + getRemaining() │
└──────────────────┘
      ↓
   references
      ↓
┌──────────────────────────┐
│  SubscriptionPlan        │
├──────────────────────────┤
│ - planName: string       │
│ - price: number          │
│ - duration: enum         │
│ - features: string[]     │
│ - connectedDevices: num  │
│ - tierRank: number       │
│ - isPopular: boolean     │
├──────────────────────────┤
│ + getFeatures(): string[]│
│ + isAvailable(): boolean │
│ + getPrice(): number     │
│ + compare(other): int    │
└──────────────────────────┘


┌──────────────────────────┐
│         Video            │
├──────────────────────────┤
│ - title: string          │
│ - overview: string       │
│ - video: URL             │
│ - trailer: URL           │
│ - poster_path: URL       │
│ - releaseDate: Date      │
│ - rating: number         │
│ - genres: Genre[]        │
│ - cast: Actor[]          │
│ - duration: number       │
│ - status: enum           │
├──────────────────────────┤
│ + getDetails(): object   │
│ + isAvailable(): boolean │
│ + getGenres(): Genre[]   │
│ + getCast(): Actor[]     │
│ + play(): Stream         │
│ + getTrailer(): URL      │
│ + search(query): Video[] │
│ + filterByGenre(g): Video[]
└──────────────────────────┘
      ↓
   uses
      ↓
┌──────────────────────────┐
│        Genre             │
├──────────────────────────┤
│ - id: number             │
│ - name: string           │
├──────────────────────────┤
│ + getName(): string      │
│ + getVideos(): Video[]   │
│ + getById(id): Genre     │
└──────────────────────────┘

┌─────────────────────────────────────┐
│             Admin                   │
├─────────────────────────────────────┤
│ - clerkId: string                   │
│ - name: string                      │
│ - email: string                     │
│ - role: string                      │
│ - isActive: boolean                 │
├─────────────────────────────────────┤
│ + createVideo(data): Video          │
│ + updateVideo(id, data): Video     │
│ + deleteVideo(id): void             │
│ + createPlan(data): SubscriptionPlan│
│ + updatePlan(id, data): SubscriptionPlan│
│ + deletePlan(id): void              │
│ + createGenre(data): Genre         │
│ + manageUser(id, action): void     │
└─────────────────────────────────────┘

Admin "manages" -> Video
Admin "manages" -> Genre
Admin "manages" -> SubscriptionPlan
Admin "manages" -> User

```

### 6.2 Sequence Diagram - Quy Trình Xem Phim

```
┌──────────────────────────────────────────────────────────────────┐
│   Sequence: User watches a Video                                │
└──────────────────────────────────────────────────────────────────┘

User          Frontend        Backend         DB          Cloudinary
  │              │              │            │               │
  │──Watch Video──│              │            │               │
  │              │──GET /api/videos/:id──→   │               │
  │              │              │──Query──→  │               │
  │              │◄──────────────── Response │               │
  │◄─────────────│              │            │               │
  │              │──Verify Subscription──→   │               │
  │              │ (Check: isActive & time)  │               │
  │              │◄─────────────────────────│               │
  │              │              │            │               │
  │              │──POST /api/videos/:id/watch──→           │
  │              │ (Log watch history)       │               │
  │              │◄────────────────────────│               │
  │              │              │            │               │
  │──Play Stream─│              │            │               │
  │              │──Get HLS Stream URL──────────────────────→│
  │              │◄─────────────────────────────────────────│
  │◄─────Stream──│              │            │               │
  │              │──Update Progress──→       │               │
  │              │ (Every 30 seconds)        │               │
  │              │◄────────────────────────│               │
  │              │              │            │               │
  │──Stop Watching              │            │               │
  │              │──POST /mark-completed──→ │               │
  │              │              │──Update──→│               │
  │              │◄─────────────────────────│               │
  │◄─────OK──────│              │            │               │
```

### 6.3 Sequence Diagram - Quy Trình Mua Gói

```
┌──────────────────────────────────────────────────────────────────┐
│   Sequence: User purchases a Subscription Plan                  │
└──────────────────────────────────────────────────────────────────┘

User      Frontend     Backend       Stripe       Inngest      DB
 │           │           │            │             │          │
 │─Select Plan          │            │             │          │
 │           │           │            │             │          │
 │──Checkout─│           │            │             │          │
 │           │           │            │             │          │
 │           │──POST /subscriptions─→│             │          │
 │           │    (planId, paymentMethod)          │          │
 │           │           │            │             │          │
 │           │           │──Create Payment Intent──→│          │
 │           │           │◄─────────────clientSecret           │
 │           │◄──────────│            │             │          │
 │           │           │            │             │          │
 │◄─Stripe Checkout      │            │             │          │
 │           │           │            │             │          │
 │──Payment──│           │            │             │          │
 │           │           │            │             │          │
 │           │           │◄──Webhook: charge.succeeded─│       │
 │           │           │────Store in DB────────────────→    │
 │           │           │────Queue Email Job──→       │       │
 │           │           │                     │────Send Email
 │           │           │                     │◄────Confirmation
 │           │           │                     │
 │           │◄─Success─│            │             │          │
 │◄─Success──│           │            │             │          │
 │           │           │            │             │          │
 │           │──GET /subscriptions──→ │             │          │
 │           │◄─Current Plan Data─────│             │          │
 │◄─Show Active Plan     │            │             │          │
```

### 6.4 Sequence Diagram - Admin Thêm Phim

```
┌──────────────────────────────────────────────────────────────────┐
│   Sequence: Admin adds a new Movie                              │
└──────────────────────────────────────────────────────────────────┘

Admin      Frontend      Backend       Cloudinary   Inngest      DB
 │           │            │              │            │          │
 │─Fill Form-│            │              │            │          │
 │           │            │              │            │          │
 │──Submit───│            │              │            │          │
 │           │            │              │            │          │
 │           │──POST /admin/videos──→    │            │          │
 │           │  (title, overview, files) │            │          │
 │           │            │              │            │          │
 │           │            │──Upload Video──────→      │          │
 │           │            │              │────Secure Upload
 │           │            │              │◄─URL & public_id
 │           │            │              │            │          │
 │           │            │──Save to DB──────────────────→       │
 │           │            │──Queue Job─────────→       │          │
 │           │            │              │    Process Video (HLS)
 │           │            │              │    Encode, transcode
 │           │            │◄──────────────────Job Complete
 │           │            │              │            │          │
 │           │            │──Update Status: published ──→        │
 │           │◄─Success───│            │            │          │
 │◄─Redirect─│            │            │            │          │
 │   to list │            │            │            │          │
```

---

## 7. Quy Trình Nghiệp Vụ Chính

### 7.1 Quy Trình Đăng Ký & Xác Thực Người Dùng

```
flowchart TD
    A["User accesses app"] --> B{"User logged in?"}
    B -->|No| C["Redirect to Clerk Login"]
    C --> D["User signs up/in with Clerk"]
    D --> E["Clerk sends user data to Inngest"]
    E --> F["Inngest: ClerkSync Function"]
    F --> G["Check if User exists in MongoDB"]
    G -->|Exists| H["Update user profile"]
    G -->|New| I["Create new User document"]
    H --> J["Set subscriptionStatus: none"]
    I --> J
    J --> K["User redirected to Home"]
    B -->|Yes| K
    K --> L{"Can access content?"}
    L -->|Subscription Active| M["Show full content"]
    L -->|No Subscription| N["Show content preview"]
```

### 7.2 Quy Trình Mua Gói Đăng Ký

```
flowchart TD
    A["User views subscription plans"] --> B["Select a plan"]
    B --> C["Click 'Subscribe' button"]
    C --> D["POST /api/subscriptions"]
    D --> E["Backend validates:"]
    E --> E1["- User exists"]
    E --> E2["- Plan is active"]
    E --> E3["- No active subscription"]
    E1 --> F{"All valid?"}
    E2 --> F
    E3 --> F
    F -->|No| G["Return error"]
    F -->|Yes| H["Create Stripe Payment Intent"]
    H --> I["Return clientSecret to frontend"]
    I --> J["Load Stripe payment form"]
    J --> K["User enters card details"]
    K --> L["Frontend confirms payment"]
    L --> M["Stripe processes payment"]
    M --> N{"Payment successful?"}
    N -->|No| O["Payment failed - notify user"]
    N -->|Yes| P["Stripe sends webhook"]
    P --> Q["Backend receives: charge.succeeded"]
    Q --> R["Create Subscription record"]
    R --> S["Update User: subscriptionStatus='active'"]
    S --> T["Queue email confirmation"]
    T --> U["Queue Inngest job"]
    U --> V["Send confirmation email"]
    V --> W["Frontend: Show success"]
    W --> X["Redirect to 'My Subscriptions'"]
```

### 7.3 Quy Trình Kiểm Tra Hết Hạn Đăng Ký

```
flowchart TD
    A["Cron Job runs every hour"] --> B["GET all subscriptions"]
    B --> C["Filter: expiryDate <= now"]
    C --> D{"Any expired?"}
    D -->|Yes| E["Update subscriptionStatus = 'expired'"]
    E --> F["Update User: subscriptionStatus = 'expired'"]
    F --> G["Queue email notification"]
    G --> H["Send 'Subscription Expired' email"]
    H --> I["User can no longer watch content"]
    D -->|No| J["No action needed"]
    J --> K["Wait until next hour"]
```

### 7.4 Quy Trình Upload & Xử Lý Phim

```
flowchart TD
    A["Admin fills Add Movie form"] --> B["Select video file"]
    B --> C["Select poster image"]
    C --> D["Click 'Upload'"]
    D --> E["Frontend validates:"]
    E --> E1["- File size < limit"]
    E --> E2["- File format correct"]
    E --> E3["- All fields filled"]
    E1 --> F{"Valid?"}
    E2 --> F
    E3 --> F
    F -->|No| G["Show error message"]
    F -->|Yes| H["POST /admin/videos"]
    H --> I["Save video metadata to DB"]
    I --> J["Upload video to Cloudinary"]
    J --> K["Queue Inngest job: videoProcessing"]
    K --> L["Inngest: Encode video"]
    L --> M["Generate HLS playlist"]
    M --> N["Update video status: 'processed'"]
    N --> O["Update Cloudinary public ID"]
    O --> P["Email admin: 'Video ready'"]
    P --> Q["Video appears in catalog"]
```

### 7.5 Quy Trình Xem Phim

```
flowchart TD
    A["User selects a video"] --> B["GET /api/videos/:id"]
    B --> C["Return video details + metadata"]
    C --> D["Frontend checks:"]
    D --> D1["- User has active subscription?"]
    D --> D2["- Subscription tier allows this video?"]
    D1 --> E{"Access granted?"}
    D2 --> E
    E -->|No subscription| F["Show upgrade prompt"]
    E -->|Yes| G["Get HLS stream URL from Cloudinary"]
    G --> H["Initialize video player"]
    H --> I["POST /api/videos/:id/watch"]
    I --> J["Create/Update WatchHistory record"]
    J --> K["User starts watching"]
    K --> L["Every 30s: PATCH progress"]
    L --> M["Update watchedDuration & progress%"]
    M --> N{"Video completed?"}
    N -->|No| L
    N -->|Yes| O["POST /mark-completed"]
    O --> P["Set WatchHistory: completed = true"]
    P --> Q["Show 'Completed' badge"]
```

### 7.6 Quy Trình Tìm Kiếm & Lọc Phim

```
flowchart TD
    A["User enters search query"] --> B["GET /api/videos/search?q=..."]
    B --> C["Backend searches in:"]
    C --> C1["- title (case-insensitive)"]
    C --> C2["- overview"]
    C --> C3["- tagline"]
    C1 --> D["Return matching videos"]
    C2 --> D
    C3 --> D
    D --> E["Frontend displays results"]
    E --> F["User clicks 'Genre filter'"]
    F --> G["GET /api/videos?genres=..."]
    G --> H["Filter videos by genre"]
    H --> I["Return filtered results"]
    I --> J["Frontend displays filtered list"]
```

### 7.7 Quy Trình Quản Lý Yêu Thích

```
flowchart TD
    A["User views video details"] --> B{"Video in favorites?"}
    B -->|No| C["Show 'Add to Favorites' button"]
    B -->|Yes| D["Show 'Remove from Favorites' button"]
    C --> E["User clicks button"]
    D --> E
    E --> F{"Action?"}
    F -->|Add| G["POST /api/videos/:id/favorite"]
    F -->|Remove| H["DELETE /api/videos/:id/favorite"]
    G --> I["Create Favorite record"]
    H --> J["Delete Favorite record"]
    I --> K["Update UI"]
    J --> K
    K --> L["User sees updated status"]
```

---

## 8. API Documentation

### 8.1 Authentication & User APIs

#### **POST /api/auth/login**

```javascript
// No explicit API - handled by Clerk on frontend
// Clerk syncs user to MongoDB via Inngest webhook
```

#### **GET /api/users/profile**

```
Method: GET
Auth: Required (Clerk JWT)
Response:
{
  _id: "user_123",
  clerkId: "clerk_xxxxx",
  name: "John Doe",
  email: "john@example.com",
  image: "https://...",
  subscriptionStatus: "active",
  subscriptionTier: "Premium",
  preferences: {...}
}
```

#### **PATCH /api/users/profile**

```
Method: PATCH
Auth: Required
Body:
{
  name?: "New Name",
  preferences?: {
    language: "en",
    quality: "1080p",
    autoplay: true
  }
}
Response: Updated user object
```

### 8.2 Video APIs

#### **GET /api/videos**

```
Method: GET
Auth: Optional
Query Params:
  - page: number (default: 1)
  - limit: number (default: 20)
  - genres: string[] (comma-separated)
  - sortBy: "rating" | "releaseDate" | "trending"
Response:
{
  data: [Video[], ...],
  totalPages: number,
  currentPage: number,
  totalCount: number
}
```

#### **GET /api/videos/:id**

```
Method: GET
Auth: Optional
Response: Video object with full details
```

#### **GET /api/videos/search**

```
Method: GET
Query: q=searchTerm
Response: Video[]
```

#### **POST /api/videos/:id/watch**

```
Method: POST
Auth: Required
Body:
{
  watchedDuration: number,
  progress: number
}
Response: {success: true}
```

#### **PATCH /api/videos/:id/progress**

```
Method: PATCH
Auth: Required
Body:
{
  watchedDuration: number,
  progress: number
}
Response: Updated WatchHistory
```

#### **POST /api/videos/:id/favorite**

```
Method: POST
Auth: Required
Response: {success: true, message: "Added to favorites"}
```

#### **DELETE /api/videos/:id/favorite**

```
Method: DELETE
Auth: Required
Response: {success: true, message: "Removed from favorites"}
```

#### **POST /admin/videos**

```
Method: POST
Auth: Required (Admin only)
Body: FormData
{
  title: string,
  overview: string,
  tagline?: string,
  releaseDate: date,
  rating: number,
  genres: string[],
  cast: [{name, character}, ...],
  poster: File,
  backdrop?: File,
  video: File,
  trailer?: string
}
Response: Created Video object
```

### 8.3 Subscription APIs

#### **GET /api/subscriptions/plans**

```
Method: GET
Auth: Optional
Response: SubscriptionPlan[]
```

#### **GET /api/subscriptions/current**

```
Method: GET
Auth: Required
Response: Current Subscription or null
```

#### **POST /api/subscriptions**

```
Method: POST
Auth: Required
Body:
{
  planId: string,
  paymentMethodId: string
}
Response:
{
  clientSecret: string,
  subscriptionId: string
}
```

#### **POST /api/subscriptions/cancel**

```
Method: POST
Auth: Required
Response: {success: true, message: "Subscription cancelled"}
```

#### **POST /api/subscriptions/upgrade**

```
Method: POST
Auth: Required
Body: {planId: string}
Response: Updated Subscription
```

### 8.4 Genre APIs

#### **GET /api/genres**

```
Method: GET
Auth: Optional
Response: Genre[]
```

#### **POST /admin/genres**

```
Method: POST
Auth: Required (Admin only)
Body: {name: string}
Response: Created Genre
```

### 8.5 Admin APIs

#### **GET /admin/dashboard**

```
Method: GET
Auth: Required (Admin only)
Response:
{
  totalUsers: number,
  activeSubscriptions: number,
  totalVideos: number,
  revenue: number,
  revenueChart: {month: string, amount: number}[],
  topVideos: Video[],
  recentSubscriptions: Subscription[]
}
```

#### **GET /admin/users**

```
Method: GET
Auth: Required (Admin only)
Query: page, limit, search
Response: Paginated User list
```

#### **GET /admin/subscriptions**

```
Method: GET
Auth: Required (Admin only)
Query: page, limit, status
Response: Paginated Subscription list
```

#### **POST /admin/plans**

```
Method: POST
Auth: Required (Admin only)
Body: SubscriptionPlan data
Response: Created Plan
```

### 8.6 Webhook APIs

#### **POST /api/webhooks/stripe**

```
Method: POST
Headers: stripe-signature
Body: Stripe webhook event
Events handled:
  - charge.succeeded → Create Subscription
  - charge.failed → Send error email
  - invoice.payment_succeeded → Renew subscription
```

---

## 9. Middleware & Validation

### 9.1 Middleware Pipeline

```
Request
  ↓
CORS → Rate Limit → Auth (Clerk) → Validation → Route
  ↓
Response
  ↓
Error Handler
```

### 9.2 Rate Limiter Config

```javascript
apiLimiter = 15 requests per 15 minutes per IP
```

### 9.3 Validation Rules

- Email: Valid email format
- Password: (Clerk handles)
- Plan fields: Required, valid values
- Video title: Max 500 characters
- Video overview: Max 2000 characters

---

## 10. Triển Khai & Môi Trường

### 10.1 Environment Variables

**Backend (.env)**

```
# Database
MONGODB_URI=mongodb+srv://...

# Clerk
CLERK_API_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary
CLOUDINARY_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email
SMTP_USER=...
SMTP_PASS=...
SMTP_HOST=smtp.gmail.com

# Server
PORT=3000
NODE_ENV=production

# Frontend
VITE_API_URL=https://api.hustv.com
```

**Frontend (.env)**

```
VITE_CLERK_PUBLISHABLE_KEY=pk_...
VITE_API_URL=https://api.hustv.com
```

### 10.2 Deployment

**Vercel (Frontend)**

- Build: `npm run build`
- Output: `dist/`
- Environment: VITE\_\* variables

**Vercel (Backend)**

- Framework: Node.js
- Build: Default
- Start: `node server.js`
- Environment: All variables

**Database**

- MongoDB Atlas (Cloud)

**CDN & Storage**

- Cloudinary (Videos & Images)

---

## 11. Tính Năng Bảo Mật

✅ **Authentication**

- OAuth 2.0 via Clerk
- JWT tokens

✅ **Authorization**

- Role-based access (User/Admin)
- Protected routes
- Subscription verification

✅ **API Security**

- Rate limiting
- Input validation
- CORS policy
- Environment variables

✅ **Payment Security**

- Stripe integration
- Webhook signature verification
- No sensitive data in logs

✅ **Data Protection**

- HTTPS only (Vercel)
- MongoDB indexes for performance
- User data encryption

---

## 12. Hiệu Suất & Tối Ưu

✅ **Frontend**

- Code splitting with Vite
- Lazy loading components
- Image optimization

✅ **Backend**

- Database indexing
- Pagination
- Caching (implicit with CDN)
- Rate limiting

✅ **Media**

- HLS streaming for videos
- Image CDN via Cloudinary
- Adaptive bitrate streaming

---

## 13. Demo Ứng Dụng

### 13.1 Truy Cập Demo

Bạn có thể truy cập phiên bản demo hoàn chỉnh của dự án HusTV tại:

🌐 **URL:** https://hustv.vercel.app/

### 13.2 Các Tính Năng Có Sẵn Để Kiểm Tra

**Người Dùng Thông Thường (User)**

- ✅ Đăng ký/Đăng nhập tài khoản
- ✅ Xem danh sách phim
- ✅ Tìm kiếm phim theo tiêu đề
- ✅ Lọc phim theo thể loại
- ✅ Xem chi tiết phim (trailer, rating, plot, cast)
- ✅ Xem phim (với subscription hợp lệ)
- ✅ Theo dõi tiến độ xem
- ✅ Thêm/xóa phim yêu thích
- ✅ Quản lý gói đăng ký
- ✅ Mua gói đăng ký qua Stripe
- ✅ Xem lịch sử xem phim
- ✅ Cập nhật hồ sơ cá nhân

**Quản Trị Viên (Admin)**

- ✅ Đăng nhập vào admin dashboard
- ✅ Xem tổng quan (dashboard stats)
- ✅ Quản lý phim (thêm, sửa, xóa)
- ✅ Upload video và hình ảnh
- ✅ Quản lý thể loại phim
- ✅ Quản lý gói đăng ký
- ✅ Xem danh sách người dùng
- ✅ Xem danh sách đơn đăng ký
- ✅ Phân tích doanh thu

### 13.3 Hướng Dẫn Sử Dụng Demo

**Xem Phim:**

1. Đăng nhập vào tài khoản
2. Đi tới trang "Movies"
3. Chọn một phim
4. Nếu không có subscription, bấm "Upgrade Plan"
5. Chọn gói phù hợp
6. Thanh toán qua Stripe (sử dụng test card: 4242 4242 4242 4242)
7. Quay lại phim và bấm "Watch Now"

**Quản Lý Yêu Thích:**

1. Mở chi tiết phim
2. Bấm nút trái tim để thêm vào yêu thích
3. Đi tới trang "Favorites" để xem danh sách

**Quản Lý Gói:**

1. Đi tới trang "My Subscriptions"
2. Xem gói hiện tại hoặc nâng cấp
3. Hủy subscription nếu muốn

**Cho Admin:**

1. Đăng nhập vào tài khoản admin
2. Truy cập `/admin/dashboard`
3. Quản lý phim, thể loại, gói từ sidebar
4. Upload phim mới qua form
5. Xem thống kê và báo cáo

### 13.4 Các Công Nghệ Được Demos

- ✅ Clerk Authentication (OAuth)
- ✅ Stripe Payment Integration
- ✅ Video Streaming (HLS)
- ✅ Real-time Search & Filter
- ✅ Responsive Design (Mobile, Tablet, Desktop)
- ✅ Role-based Access Control
- ✅ Database Operations (CRUD)
- ✅ File Upload (Videos & Images)
- ✅ Error Handling & Validation

---

## 14. Kết Luận

Dự án **HusTV** là một nền tảng streaming hoàn chỉnh với:

- ✅ Kiến trúc hiện đại (React + Node.js)
- ✅ Xác thực an toàn (Clerk OAuth)
- ✅ Thanh toán PCI-compliant (Stripe)
- ✅ Quản lý nội dung linh hoạt (Admin panel)
- ✅ Trải nghiệm người dùng mượt (Video player HLS)
- ✅ Tự động hóa (Inngest + Cron)
- ✅ Đáng tin cậy (Error handling, logging)

---

**Tài liệu này được tạo ngày: 20/12/2025**

**Phiên bản:** 1.0

**Tác giả:** Nguyễn Minh Hiếu (hieu7825)

---
