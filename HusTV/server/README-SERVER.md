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
