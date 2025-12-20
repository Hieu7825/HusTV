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
