# 📺 HusTVサーバードキュメント

サーバー構造、各ディレクトリの機能と関数に関する詳細ドキュメント。

---

## 📁 ディレクトリ構造

```
server/
├── configs/          - データベース接続設定
├── controllers/      - クライアントからのリクエスト処理ロジック
├── models/           - データベース用MongoDBスキーマ
├── routes/           - APIエンドポイントのルーティング
├── middleware/       - 認証とリクエスト処理のミドルウェア
├── utils/            - 共通ユーティリティ関数
├── inngest/          - ジョブキューと自動化ワークフロー
├── cron/             - 定期実行タスク
├── temp & tmp/       - アップロード用一時ディレクトリ
├── server.js         - メインサーバー起動ファイル
├── package.json      - 依存関係とスクリプト
└── .env              - 環境変数
```

---

## 🔧 各ディレクトリの詳細

### 1️⃣ **configs/** - データベース設定

#### `db.js`

- **機能**: MongoDBデータベースへの接続
- **主要関数**: `connectDB()`
  - Mongooseを使用してMongoDBに接続
  - server.jsの起動時に呼び出される

```javascript
// 使用例:
await connectDB();
```

---

### 2️⃣ **controllers/** - ビジネスロジック処理

コントローラーはクライアントからのリクエストを処理するすべてのロジックを含みます。

#### **userController.js** - ユーザー管理

| 関数                     | 機能                                              |
| ------------------------ | ------------------------------------------------- |
| `getUserProfile()`       | ユーザープロフィール + サブスクリプション情報取得 |
| `toggleFavorite()`       | お気に入りビデオの追加/削除                       |
| `getFavorites()`         | お気に入りビデオリスト取得                        |
| `checkFavorite()`        | ビデオがお気に入りリストにあるかチェック          |
| `getWatchHistory()`      | ビデオ視聴履歴取得                                |
| `updateWatchProgress()`  | 視聴進捗更新（分、秒）                            |
| `getWatchProgress()`     | 1つのビデオの視聴進捗取得                         |
| `deleteWatchHistory()`   | 視聴履歴から1項目削除                             |
| `clearWatchHistory()`    | 全視聴履歴をクリア                                |
| `updatePreferences()`    | 設定更新（言語、年齢など）                        |
| `getPreferences()`       | ユーザー設定取得                                  |
| `getDevices()`           | ログインデバイスリスト取得                        |
| `updateDevice()`         | デバイス名/情報更新                               |
| `removeDevice()`         | デバイス削除                                      |
| `getUserStats()`         | 統計取得（合計視聴、お気に入りビデオなど）        |
| `getContinueWatching()`  | 続きから視聴リスト取得                            |
| `getRecommendedVideos()` | 設定に基づくおすすめビデオ取得                    |

#### **videoController.js** - ビデオ管理

| 関数                  | 機能                                                       |
| --------------------- | ---------------------------------------------------------- |
| `uploadVideo()`       | 新規ビデオアップロード（クライアント側・サーバー側両対応） |
| `getAllVideos()`      | ページネーション付きビデオリスト取得                       |
| `getVideoById()`      | 1つのビデオの詳細取得                                      |
| `getFeaturedVideos()` | 注目のビデオ取得                                           |
| `getTrendingVideos()` | トレンドビデオ取得                                         |
| `getVideosByGenre()`  | ジャンル別ビデオ取得                                       |
| `searchVideos()`      | キーワードでビデオ検索                                     |
| `streamVideo()`       | ビデオストリーミング（オンライン再生）                     |
| `getTrailerUrl()`     | ビデオのトレーラーURL取得                                  |
| `updateVideo()`       | ビデオ情報更新                                             |
| `deleteVideo()`       | ビデオ削除                                                 |
| `incrementView()`     | 視聴回数増加                                               |
| `toggleFeatured()`    | 注目のビデオマーク                                         |
| `toggleTrending()`    | トレンドビデオマーク                                       |

#### **subscriptionController.js** - サブスクリプション管理

| 関数                       | 機能                                     |
| -------------------------- | ---------------------------------------- |
| `getAllPlans()`            | 利用可能な全サブスクリプションプラン取得 |
| `recalculateRanks()`       | サブスクリプションプランのランク再計算   |
| `createSubscription()`     | 新規サブスクリプション作成（決済開始）   |
| `getCurrentSubscription()` | ユーザーの現在のサブスクリプション取得   |
| `getSubscriptionHistory()` | サブスクリプション履歴取得               |
| `cancelSubscription()`     | サブスクリプションキャンセル             |
| `syncClerkMetadata()`      | Clerkからメタデータを同期                |

#### **adminController.js** - 管理ダッシュボード

| 関数                    | 機能                                                           |
| ----------------------- | -------------------------------------------------------------- |
| `isAdmin()`             | ユーザーが管理者かチェック                                     |
| `getDashboardData()`    | ダッシュボードデータ取得（収益、ユーザー、サブスクリプション） |
| `getAllSubscriptions()` | 全サブスクリプションリスト取得（フィルタ、ページネーション）   |
| `getAllUsers()`         | 全ユーザーリスト取得                                           |
| `toggleUserBan()`       | ユーザーのBAN/BAN解除                                          |

#### **genreController.js** - ジャンル管理

| 関数             | 機能                  |
| ---------------- | --------------------- |
| `getAllGenres()` | 全ジャンルリスト取得  |
| `getGenreById()` | 1つのジャンル詳細取得 |
| `createGenre()`  | 新規ジャンル作成      |
| `updateGenre()`  | ジャンル更新          |
| `deleteGenre()`  | ジャンル削除          |

#### **stripeWebhooks.js** - Stripe Webhook処理

| 関数                     | 機能                                                 |
| ------------------------ | ---------------------------------------------------- |
| `stripeWebhookHandler()` | Stripeからのイベント処理（決済成功、キャンセルなど） |

---

### 3️⃣ **models/** - データベーススキーマ

#### `User.js`

- 保存内容: Clerk ID、メール、お気に入り、設定、デバイス
- 関連: `currentSubscription`（Subscriptionから）

#### `Video.js`

- 保存内容: タイトル、概要、ビデオURL、ポスター、トレーラー、ジャンル、キャスト
- 関連: `genres`（Genreから）

#### `Subscription.js`

- 保存内容: ユーザーID、プランID、ステータス、有効期限、決済情報
- 関連: `user`（Userから）、`plan`（SubscriptionPlanから）

#### `SubscriptionPlan.js`

- 保存内容: プラン名、価格、期間、機能、ティアランク

#### `Genre.js`

- 保存内容: ジャンル名、説明、アイコン/カラー

#### `WatchHistory.js`

- 保存内容: ユーザーID、ビデオID、最終視聴日時、視聴進捗
- 関連: `user`（Userから）、`video`（Videoから）

---

### 4️⃣ **routes/** - APIエンドポイント

#### `userRoutes.js`

```
GET    /api/users/profile              - ユーザープロフィール取得
POST   /api/users/favorites            - お気に入り追加/削除
GET    /api/users/favorites            - お気に入りリスト取得
GET    /api/users/watch-history        - 視聴履歴取得
POST   /api/users/watch-progress       - 視聴進捗更新
GET    /api/users/continue-watching    - 続きから視聴取得
```

#### `videoRoutes.js`

```
GET    /api/videos                     - ビデオリスト取得
POST   /api/videos/upload              - 新規ビデオアップロード
GET    /api/videos/:id                 - ビデオ詳細取得
GET    /api/videos/featured            - 注目のビデオ取得
GET    /api/videos/trending            - トレンドビデオ取得
GET    /api/videos/genre/:id           - ジャンル別ビデオ取得
GET    /api/videos/search              - ビデオ検索
```

#### `subscriptionRoutes.js`

```
GET    /api/subscriptions/plans        - プランリスト取得
POST   /api/subscriptions/create       - 新規サブスクリプション作成
GET    /api/subscriptions/current      - 現在のサブスクリプション取得
DELETE /api/subscriptions/:id          - サブスクリプションキャンセル
```

#### `adminRoutes.js`

```
GET    /api/admin/dashboard            - ダッシュボードデータ取得
GET    /api/admin/users                - ユーザーリスト取得
GET    /api/admin/subscriptions        - サブスクリプションリスト取得
```

#### `genreRoutes.js`

```
GET    /api/genres                     - ジャンルリスト取得
POST   /api/genres                     - 新規ジャンル作成
PUT    /api/genres/:id                 - ジャンル更新
DELETE /api/genres/:id                 - ジャンル削除
```

#### `adminPlanRoutes.js`

```
GET    /api/admin/plans                - 全プラン取得
POST   /api/admin/plans                - 新規プラン作成
PUT    /api/admin/plans/:id            - プラン更新
DELETE /api/admin/plans/:id            - プラン削除
```

#### `webhookRoutes.js`

```
POST   /api/webhooks/stripe            - Stripe Webhook処理
```

---

### 5️⃣ **middleware/** - 認証と処理

#### `auth.js` - Clerk認証

```javascript
protectAdmin(req, res, next)
  - ユーザーが管理者かチェック
  - Clerk privateMetadataを使用
```

#### `validation.js`

- クライアントからの入力データを検証
- express-validatorを使用

#### `rateLimiter.js`

- 1つのIPからのリクエスト数を制限（DDoS攻撃防止）
- 設定: 各エンドポイント用の`apiLimiter`

#### `errorHandler.js`

```javascript
errorHandler(err, req, res, next)
  - アプリケーション全体のエラー処理

notFound(req, res)
  - 404 Not Foundの処理
```

#### `uploadVideo.js`

- ビデオアップロード用のmulter設定
- ビデオ、トレーラー、ポスター、背景のアップロードをサポート

#### `validateSubscription.js`

- ユーザーが有効なサブスクリプションを持っているかチェック

#### `index.js`

- 全ミドルウェアをエクスポート

---

### 6️⃣ **utils/** - ユーティリティ関数

#### `email.js` - メール送信

```javascript
sendSubscriptionConfirmation() - サブスクリプション確認メールを送信;

sendUpgradeConfirmation() - サブスクリプションアップグレード確認メールを送信;

sendPaymentReceipt() - 決済領収書メールを送信;

sendExpiryReminder() - サブスクリプション期限切れ間近の通知メールを送信;
```

#### `stripe.js` - Stripe決済

```javascript
createCheckoutSession()
  - Stripe決済セッションを作成
  - Stripe Checkout URLを返す

verifyWebhookSignature()
  - StripeからのWebhook署名を検証
```

#### `cloudinary.js` - メディアアップロード

```javascript
uploadVideo()
  - Cloudinaryにビデオをアップロード
  - ビデオURLを返す

uploadImage()
  - 画像をアップロード（ポスター、背景）

deleteVideo()
  - Cloudinaryからビデオを削除

deleteImage()
  - Cloudinaryから画像を削除

getStreamingUrl()
  - ビデオストリーミングURLを作成
```

#### `index.js`

- 全ユーティリティ関数をエクスポート

---

### 7️⃣ **inngest/** - ジョブキューとワークフロー

Inngestは非同期ジョブ（async jobs）を実行するプラットフォームです。

#### `client.js`

- Inngestクライアントを作成

#### `index.js`

- Inngest関数の設定とエクスポート

#### **functions/**

##### `emailAutomation.js` - 自動メール送信

```javascript
sendSubscriptionConfirmedEmail
  - サブスクリプション作成時にメールを送信
  - トリガー: イベント "subscription/confirmed"

sendUpgradeEmail
  - ユーザーがプランをアップグレードしたときにメールを送信
  - トリガー: イベント "subscription/upgraded"

sendExpiryReminderEmail
  - サブスクリプション期限切れ間近の通知メールを送信
  - トリガー: イベント "subscription/expiring-soon"
```

##### `subscriptionJobs.js` - サブスクリプションジョブ

```javascript
processSubscriptionRenewal
  - サブスクリプションの自動更新

checkExpiredSubscriptions
  - 期限切れサブスクリプションをチェック
  - ステータスを"Expired"に更新
```

##### `videoProcessing.js` - ビデオ処理

```javascript
processVideoUpload
  - アップロード後のビデオ処理
  - リサイズ、トランスコード、サムネイル作成

generateVideoThumbnail
  - ビデオからサムネイルを作成
```

##### `clerkSync.js` - Clerk同期

```javascript
syncUserFromClerk - Clerkからユーザーデータを同期 - MongoDBに更新;

syncUserDeletion - Clerkからのユーザー削除を同期;
```

---

### 8️⃣ **cron/** - 定期実行タスク

#### `subscriptionChecker.js`

```javascript
startSubscriptionChecker()
  - 毎時実行
  - 期限切れサブスクリプションをチェック
  - 7日前に通知メールを送信
  - 期限切れ時にステータスを更新
  - 変更をログに記録
```

---

### 9️⃣ **server.js** - 起動ファイル

```javascript
// Expressアプリを初期化
const app = express();

// CORS設定
// localhost:5173 (開発) と hustv.vercel.app (本番) からのリクエストを許可

// MongoDB接続
await connectDB();

// ミドルウェア
- Webhookルートは最初に配置（express.json()の前）
- ボディパーサー（JSON、URLエンコード）
- CORS
- Clerk認証
- レート制限
- エラーハンドラー

// ルート
- webhookRoutes
- subscriptionRoutes
- userRoutes
- videoRoutes
- adminRoutes
- genreRoutes
- adminPlanRoutes

// Cronジョブ
- startSubscriptionChecker()

// Inngest Webhook
- serve(inngest, functions)

// サーバー起動
app.listen(port)
```

---

### 🔟 **package.json** - 依存関係

| パッケージ           | 機能                 |
| -------------------- | -------------------- |
| `express`            | Webフレームワーク    |
| `mongoose`           | MongoDB ODM          |
| `@clerk/express`     | 認証                 |
| `stripe`             | 決済                 |
| `cloudinary`         | メディアアップロード |
| `nodemailer`         | メール送信           |
| `inngest`            | ジョブキュー         |
| `multer`             | ファイルアップロード |
| `express-validator`  | バリデーション       |
| `express-rate-limit` | レート制限           |
| `cors`               | CORS処理             |
| `node-cron`          | スケジュールタスク   |
| `dotenv`             | 環境変数             |

---

## 🚀 動作フロー

### 1. ユーザー登録とログイン

1. Clerkがユーザーを認証
2. `userController.getUserProfile()`がClerkからプロフィールを取得
3. MongoDBにユーザーを保存/更新

### 2. ユーザーがビデオを視聴

1. `videoController.getVideoById()`がビデオ情報を取得
2. `validateSubscription()`でサブスクリプションをチェック
3. `videoController.streamVideo()`がビデオを再生
4. `videoController.incrementView()`が視聴回数を増加
5. `userController.updateWatchProgress()`が進捗を保存

### 3. ユーザーがサブスクリプションを購入

1. `subscriptionController.createSubscription()`がサブスクリプションを作成
2. `stripe.createCheckoutSession()`が決済セッションを作成
3. ユーザーがStripeで決済
4. Stripeが`/api/webhooks/stripe`にWebhookを送信
5. `stripeWebhookHandler()`がWebhookを処理
6. `inngest`がメール自動化をトリガー
7. `emailAutomation.sendSubscriptionConfirmedEmail()`がメールを送信

### 4. サブスクリプション期限切れ間近

1. `subscriptionChecker.js`（cronジョブ）が毎時実行
2. 期限切れサブスクリプションをチェック
3. 7日前に通知メールを送信
4. 期限切れ時にステータスを更新

### 5. 管理者がビデオを管理

1. `adminController.getDashboardData()`がダッシュボードを表示
2. `videoController.uploadVideo()`がビデオをアップロード
3. `videoController.updateVideo()`が情報を更新
4. `videoController.toggleFeatured()`が注目マークを付ける
5. `videoController.deleteVideo()`がビデオを削除

---

## 📊 データフロー図

```
フロントエンド（クライアント）
        ↓
    ルート（APIエンドポイント）
        ↓
    ミドルウェア（認証、バリデーション、レート制限）
        ↓
    コントローラー（ビジネスロジック）
        ↓
    モデル（MongoDBスキーマ）
        ↓
    データベース（MongoDB）

追加:
  - ユーティリティ（メール、Stripe、Cloudinary）
  - Inngest（非同期ジョブ）
  - Cron（スケジュールタスク）
```

---

## 🔐 セキュリティ

- **認証**: Clerk + JWT
- **認可**: Clerk `privateMetadata`から管理者ロールをチェック
- **レート制限**: `express-rate-limit`（DDoS攻撃防止）
- **入力検証**: `express-validator`
- **CORS**: 許可されたドメインからのリクエストのみ許可
- **Webhook検証**: Stripe署名の検証

---

## 📝 環境変数 (.env)

```
# データベース
MONGODB_URI=your_mongodb_connection_string

# Clerk
CLERK_SECRET_KEY=your_clerk_secret_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# メール
SMTP_USER=your_brevo_email
SMTP_PASS=your_brevo_password
SENDER_EMAIL=noreply@hustv.com

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret

# Inngest
INNGEST_EVENT_KEY=your_inngest_key

# サーバー
WEBSITE_URL=http://localhost:5173
```

---

## 🎯 まとめ

- **Controllers**: ロジック処理（ユーザー、ビデオ、サブスクリプション、管理、ジャンル）
- **Models**: スキーマ定義（User、Video、Subscription、Genre、WatchHistory）
- **Routes**: APIエンドポイントのルーティング
- **Middleware**: 認証、バリデーション、エラー処理
- **Utils**: ユーティリティ関数（メール、Stripe、Cloudinary）
- **Inngest**: 非同期ジョブ実行（メール、サブスクリプション、ビデオ処理）
- **Cron**: 定期的なサブスクリプションチェック
- **Server.js**: メインアプリの起動

---

## 📞 お問い合わせとサポート

サーバーに関する質問がある場合は、対応するファイルを確認するか、開発チームにお問い合わせください。

**最終更新日**: 2025年12月

# 📺 HusTV Server Documentation

Tài liệu chi tiết về cấu trúc server, các hàm và chức năng của từng thư mục.

---

## 📁 Cấu trúc thư mục

```
server/
├── configs/          - Cấu hình kết nối database
├── controllers/      - Logic xử lý request từ client
├── models/           - Schema MongoDB cho database
├── routes/           - Định tuyến API endpoints
├── middleware/       - Middleware xác thực và xử lý request
├── utils/            - Hàm tiện ích dùng chung
├── inngest/          - Job queue và automated workflows
├── cron/             - Các tác vụ định kỳ
├── temp & tmp/       - Thư mục tạm thời cho uploads
├── server.js         - File khởi động server chính
├── package.json      - Dependencies và scripts
└── .env              - Biến môi trường
```

---

## 🔧 Từng Thư Mục Chi Tiết

### 1️⃣ **configs/** - Cấu hình Database

#### `db.js`

- **Chức năng**: Kết nối MongoDB database
- **Hàm chính**: `connectDB()`
  - Kết nối tới MongoDB sử dụng Mongoose
  - Gọi từ server.js khi khởi động

```javascript
// Sử dụng:
await connectDB();
```

---

### 2️⃣ **controllers/** - Logic Xử Lý Business

Controllers chứa tất cả logic xử lý request từ client.

#### **userController.js** - Quản lý Người Dùng

| Hàm                      | Chức năng                                             |
| ------------------------ | ----------------------------------------------------- |
| `getUserProfile()`       | Lấy thông tin profile user + subscription info        |
| `toggleFavorite()`       | Thêm/xóa video yêu thích                              |
| `getFavorites()`         | Lấy danh sách video yêu thích                         |
| `checkFavorite()`        | Kiểm tra video có trong danh sách yêu thích hay không |
| `getWatchHistory()`      | Lấy lịch sử xem video                                 |
| `updateWatchProgress()`  | Cập nhật tiến độ xem (phút, giây)                     |
| `getWatchProgress()`     | Lấy tiến độ xem của 1 video                           |
| `deleteWatchHistory()`   | Xóa 1 item từ lịch sử xem                             |
| `clearWatchHistory()`    | Xóa toàn bộ lịch sử xem                               |
| `updatePreferences()`    | Cập nhật sở thích (ngôn ngữ, độ tuổi, etc)            |
| `getPreferences()`       | Lấy sở thích người dùng                               |
| `getDevices()`           | Lấy danh sách thiết bị đăng nhập                      |
| `updateDevice()`         | Cập nhật tên/thông tin thiết bị                       |
| `removeDevice()`         | Xóa 1 thiết bị                                        |
| `getUserStats()`         | Lấy thống kê (tổng xem, video yêu thích, etc)         |
| `getContinueWatching()`  | Lấy danh sách tiếp tục xem                            |
| `getRecommendedVideos()` | Lấy video đề xuất theo sở thích                       |

#### **videoController.js** - Quản lý Video

| Hàm                   | Chức năng                                               |
| --------------------- | ------------------------------------------------------- |
| `uploadVideo()`       | Upload video mới (hỗ trợ cả client-side và server-side) |
| `getAllVideos()`      | Lấy danh sách video với pagination                      |
| `getVideoById()`      | Lấy chi tiết 1 video                                    |
| `getFeaturedVideos()` | Lấy video nổi bật                                       |
| `getTrendingVideos()` | Lấy video trending                                      |
| `getVideosByGenre()`  | Lấy video theo thể loại                                 |
| `searchVideos()`      | Tìm kiếm video theo keyword                             |
| `streamVideo()`       | Stream video (phát trực tuyến)                          |
| `getTrailerUrl()`     | Lấy URL trailer của video                               |
| `updateVideo()`       | Cập nhật thông tin video                                |
| `deleteVideo()`       | Xóa video                                               |
| `incrementView()`     | Tăng lượt xem                                           |
| `toggleFeatured()`    | Đánh dấu video nổi bật                                  |
| `toggleTrending()`    | Đánh dấu video trending                                 |

#### **subscriptionController.js** - Quản lý Subscription

| Hàm                        | Chức năng                                  |
| -------------------------- | ------------------------------------------ |
| `getAllPlans()`            | Lấy tất cả gói subscription có sẵn         |
| `recalculateRanks()`       | Tính toán lại thứ hạng gói subscription    |
| `createSubscription()`     | Tạo subscription mới (khởi tạo thanh toán) |
| `getCurrentSubscription()` | Lấy subscription hiện tại của user         |
| `getSubscriptionHistory()` | Lấy lịch sử subscription                   |
| `cancelSubscription()`     | Hủy subscription                           |
| `syncClerkMetadata()`      | Đồng bộ metadata từ Clerk                  |

#### **adminController.js** - Admin Dashboard

| Hàm                     | Chức năng                                               |
| ----------------------- | ------------------------------------------------------- |
| `isAdmin()`             | Kiểm tra user có phải admin                             |
| `getDashboardData()`    | Lấy dữ liệu dashboard (doanh thu, users, subscriptions) |
| `getAllSubscriptions()` | Lấy danh sách tất cả subscriptions (filter, pagination) |
| `getAllUsers()`         | Lấy danh sách tất cả users                              |
| `toggleUserBan()`       | Cấm/mở cấm user                                         |

#### **genreController.js** - Quản lý Thể Loại

| Hàm              | Chức năng                     |
| ---------------- | ----------------------------- |
| `getAllGenres()` | Lấy danh sách tất cả thể loại |
| `getGenreById()` | Lấy chi tiết 1 thể loại       |
| `createGenre()`  | Tạo thể loại mới              |
| `updateGenre()`  | Cập nhật thể loại             |
| `deleteGenre()`  | Xóa thể loại                  |

#### **stripeWebhooks.js** - Xử lý Stripe Webhooks

| Hàm                      | Chức năng                                                     |
| ------------------------ | ------------------------------------------------------------- |
| `stripeWebhookHandler()` | Xử lý các sự kiện từ Stripe (thanh toán thành công, hủy, etc) |

---

### 3️⃣ **models/** - Database Schema

#### `User.js`

- Lưu trữ: ID Clerk, email, favorites, preferences, devices
- Liên kết: `currentSubscription` (từ Subscription)

#### `Video.js`

- Lưu trữ: title, overview, video URL, poster, trailer, genres, cast
- Liên kết: `genres` (từ Genre)

#### `Subscription.js`

- Lưu trữ: user ID, plan ID, status, expiry date, payment info
- Liên kết: `user` (từ User), `plan` (từ SubscriptionPlan)

#### `SubscriptionPlan.js`

- Lưu trữ: planName, price, duration, features, tierRank

#### `Genre.js`

- Lưu trữ: tên thể loại, mô tả, icon/color

#### `WatchHistory.js`

- Lưu trữ: user ID, video ID, xem lần cuối, tiến độ xem
- Liên kết: `user` (từ User), `video` (từ Video)

---

### 4️⃣ **routes/** - API Endpoints

#### `userRoutes.js`

```
GET    /api/users/profile              - Lấy profile user
POST   /api/users/favorites            - Thêm/xóa favorite
GET    /api/users/favorites            - Lấy danh sách favorites
GET    /api/users/watch-history        - Lấy lịch sử xem
POST   /api/users/watch-progress       - Cập nhật tiến độ xem
GET    /api/users/continue-watching    - Lấy tiếp tục xem
```

#### `videoRoutes.js`

```
GET    /api/videos                     - Lấy danh sách video
POST   /api/videos/upload              - Upload video mới
GET    /api/videos/:id                 - Lấy chi tiết video
GET    /api/videos/featured            - Lấy video nổi bật
GET    /api/videos/trending            - Lấy video trending
GET    /api/videos/genre/:id           - Lấy video theo thể loại
GET    /api/videos/search              - Tìm kiếm video
```

#### `subscriptionRoutes.js`

```
GET    /api/subscriptions/plans        - Lấy danh sách gói
POST   /api/subscriptions/create       - Tạo subscription mới
GET    /api/subscriptions/current      - Lấy subscription hiện tại
DELETE /api/subscriptions/:id          - Hủy subscription
```

#### `adminRoutes.js`

```
GET    /api/admin/dashboard            - Lấy dashboard data
GET    /api/admin/users                - Lấy danh sách users
GET    /api/admin/subscriptions        - Lấy danh sách subscriptions
```

#### `genreRoutes.js`

```
GET    /api/genres                     - Lấy danh sách thể loại
POST   /api/genres                     - Tạo thể loại mới
PUT    /api/genres/:id                 - Cập nhật thể loại
DELETE /api/genres/:id                 - Xóa thể loại
```

#### `adminPlanRoutes.js`

```
GET    /api/admin/plans                - Lấy tất cả gói plans
POST   /api/admin/plans                - Tạo plan mới
PUT    /api/admin/plans/:id            - Cập nhật plan
DELETE /api/admin/plans/:id            - Xóa plan
```

#### `webhookRoutes.js`

```
POST   /api/webhooks/stripe            - Xử lý Stripe webhooks
```

---

### 5️⃣ **middleware/** - Xác Thực & Xử Lý

#### `auth.js` - Xác Thực Clerk

```javascript
protectAdmin(req, res, next)
  - Kiểm tra user có phải admin
  - Sử dụng Clerk privateMetadata
```

#### `validation.js`

- Xác thực dữ liệu input từ client
- Sử dụng express-validator

#### `rateLimiter.js`

- Giới hạn số request từ 1 IP (tránh DDoS)
- Config: `apiLimiter` cho các endpoint

#### `errorHandler.js`

```javascript
errorHandler(err, req, res, next)
  - Xử lý lỗi toàn ứng dụng

notFound(req, res)
  - Xử lý 404 Not Found
```

#### `uploadVideo.js`

- Config multer cho upload video
- Hỗ trợ upload cả video, trailer, poster, backdrop

#### `validateSubscription.js`

- Kiểm tra user có subscription hợp lệ

#### `index.js`

- Export tất cả middleware

---

### 6️⃣ **utils/** - Hàm Tiện Ích

#### `email.js` - Gửi Email

```javascript
sendSubscriptionConfirmation()
  - Gửi email xác nhận subscription

sendUpgradeConfirmation()
  - Gửi email xác nhận upgrade subscription

sendPaymentReceipt()
  - Gửi email hóa đơn thanh toán

sendExpiryReminder()
  - Gửi email nhắc nhở subscription sắp hết hạn
```

#### `stripe.js` - Thanh Toán Stripe

```javascript
createCheckoutSession()
  - Tạo session thanh toán Stripe
  - Trả về Stripe Checkout URL

verifyWebhookSignature()
  - Xác thực chữ ký webhook từ Stripe
```

#### `cloudinary.js` - Upload Media

```javascript
uploadVideo()
  - Upload video lên Cloudinary
  - Trả về video URL

uploadImage()
  - Upload hình ảnh (poster, backdrop)

deleteVideo()
  - Xóa video từ Cloudinary

deleteImage()
  - Xóa hình ảnh từ Cloudinary

getStreamingUrl()
  - Tạo URL streaming video
```

#### `index.js`

- Export tất cả utility functions

---

### 7️⃣ **inngest/** - Job Queue & Workflows

Inngest là nền tảng để chạy các job không đồng bộ (async jobs).

#### `client.js`

- Tạo Inngest client

#### `index.js`

- Config và export Inngest functions

#### **functions/**

##### `emailAutomation.js` - Gửi Email Tự Động

```javascript
sendSubscriptionConfirmedEmail
  - Gửi email khi subscription được tạo
  - Trigger: event "subscription/confirmed"

sendUpgradeEmail
  - Gửi email khi user upgrade gói
  - Trigger: event "subscription/upgraded"

sendExpiryReminderEmail
  - Gửi email nhắc nhở subscription sắp hết hạn
  - Trigger: event "subscription/expiring-soon"
```

##### `subscriptionJobs.js` - Job Subscription

```javascript
processSubscriptionRenewal
  - Tự động gia hạn subscription

checkExpiredSubscriptions
  - Kiểm tra subscription hết hạn
  - Cập nhật status thành "Expired"
```

##### `videoProcessing.js` - Xử Lý Video

```javascript
processVideoUpload
  - Xử lý video sau khi upload
  - Resize, transcode, tạo thumbnail

generateVideoThumbnail
  - Tạo thumbnail từ video
```

##### `clerkSync.js` - Đồng Bộ Clerk

```javascript
syncUserFromClerk
  - Đồng bộ user data từ Clerk
  - Cập nhật lên MongoDB

syncUserDeletion
  - Đồng bộ xóa user từ Clerk
```

---

### 8️⃣ **cron/** - Tác Vụ Định Kỳ

#### `subscriptionChecker.js`

```javascript
startSubscriptionChecker()
  - Chạy mỗi giờ
  - Kiểm tra subscription hết hạn
  - Gửi email nhắc nhở trước 7 ngày
  - Cập nhật status khi hết hạn
  - Ghi log các thay đổi
```

---

### 9️⃣ **server.js** - File Khởi Động

```javascript
// Khởi tạo Express app
const app = express();

// Config CORS
// Cho phép requests từ localhost:5173 (dev) và hustv.vercel.app (production)

// Kết nối MongoDB
await connectDB();

// Middleware
- Webhook routes PHẢI là đầu tiên (trước express.json())
- Body parser (JSON, URL-encoded)
- CORS
- Clerk authentication
- Rate limiter
- Error handler

// Routes
- webhookRoutes
- subscriptionRoutes
- userRoutes
- videoRoutes
- adminRoutes
- genreRoutes
- adminPlanRoutes

// Cron jobs
- startSubscriptionChecker()

// Inngest webhooks
- serve(inngest, functions)

// Khởi động server
app.listen(port)
```

---

### 🔟 **package.json** - Dependencies

| Package              | Chức năng             |
| -------------------- | --------------------- |
| `express`            | Web framework         |
| `mongoose`           | MongoDB ODM           |
| `@clerk/express`     | Authentication        |
| `stripe`             | Thanh toán            |
| `cloudinary`         | Upload media          |
| `nodemailer`         | Gửi email             |
| `inngest`            | Job queue             |
| `multer`             | Upload file           |
| `express-validator`  | Validation            |
| `express-rate-limit` | Rate limiting         |
| `cors`               | CORS handling         |
| `node-cron`          | Scheduled tasks       |
| `dotenv`             | Environment variables |

---

## 🚀 Quy Trình Hoạt Động

### 1. User Đăng Ký & Đăng Nhập

1. Clerk xác thực user
2. `userController.getUserProfile()` lấy profile từ Clerk
3. Lưu/cập nhật user vào MongoDB

### 2. User Xem Video

1. `videoController.getVideoById()` lấy thông tin video
2. Kiểm tra subscription `validateSubscription()`
3. `videoController.streamVideo()` phát video
4. `videoController.incrementView()` tăng lượt xem
5. `userController.updateWatchProgress()` lưu tiến độ

### 3. User Mua Subscription

1. `subscriptionController.createSubscription()` tạo subscription
2. `stripe.createCheckoutSession()` tạo session thanh toán
3. User thanh toán trên Stripe
4. Stripe gửi webhook tới `/api/webhooks/stripe`
5. `stripeWebhookHandler()` xử lý webhook
6. `inngest` trigger email automation
7. `emailAutomation.sendSubscriptionConfirmedEmail()` gửi email

### 4. Subscription Sắp Hết Hạn

1. `subscriptionChecker.js` (cron job) chạy mỗi giờ
2. Kiểm tra subscription hết hạn
3. Gửi email nhắc nhở (7 ngày trước)
4. Cập nhật status khi hết hạn

### 5. Admin Quản Lý Video

1. `adminController.getDashboardData()` hiển thị dashboard
2. `videoController.uploadVideo()` upload video
3. `videoController.updateVideo()` cập nhật thông tin
4. `videoController.toggleFeatured()` đánh dấu nổi bật
5. `videoController.deleteVideo()` xóa video

---

## 📊 Data Flow Diagram

```
Frontend (Client)
        ↓
    Routes (API Endpoints)
        ↓
    Middleware (Auth, Validation, Rate Limit)
        ↓
    Controllers (Business Logic)
        ↓
    Models (MongoDB Schema)
        ↓
    Database (MongoDB)

Plus:
  - Utils (Email, Stripe, Cloudinary)
  - Inngest (Async Jobs)
  - Cron (Scheduled Tasks)
```

---

## 🔐 Bảo Mật

- **Authentication**: Clerk + JWT
- **Authorization**: Admin role kiểm tra từ Clerk `privateMetadata`
- **Rate Limiting**: `express-rate-limit` (tránh DDoS)
- **Input Validation**: `express-validator`
- **CORS**: Chỉ cho phép requests từ domain được phép
- **Webhook Verification**: Xác thực chữ ký Stripe

---

## 📝 Environment Variables (.env)

```
# Database
MONGODB_URI=your_mongodb_connection_string

# Clerk
CLERK_SECRET_KEY=your_clerk_secret_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email
SMTP_USER=your_brevo_email
SMTP_PASS=your_brevo_password
SENDER_EMAIL=noreply@hustv.com

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret

# Inngest
INNGEST_EVENT_KEY=your_inngest_key

# Server
WEBSITE_URL=http://localhost:5173
```

---

## 🎯 Tóm Tắt

- **Controllers**: Xử lý logic (user, video, subscription, admin, genre)
- **Models**: Định nghĩa schema (User, Video, Subscription, Genre, WatchHistory)
- **Routes**: Định tuyến API endpoints
- **Middleware**: Xác thực, validation, error handling
- **Utils**: Utility functions (email, Stripe, Cloudinary)
- **Inngest**: Chạy async jobs (email, subscription, video processing)
- **Cron**: Kiểm tra subscription định kỳ
- **Server.js**: Khởi động app chính

---

## 📞 Liên Hệ & Hỗ Trợ

Nếu có câu hỏi về server, vui lòng kiểm tra các file tương ứng hoặc liên hệ team development.

**Last Updated**: December 2025
