# 📱 HusTV Client Documentation

Tài liệu chi tiết về cấu trúc React frontend, các components, pages, hooks, services và workflows.

---

## 📁 Cấu trúc thư mục

```
client/
├── src/
│   ├── components/        - Các component tái sử dụng
│   │   └── admin/        - Admin-only components
│   ├── pages/            - Các trang chính
│   │   └── admin/        - Admin pages
│   ├── hooks/            - Custom React hooks
│   ├── services/         - API service calls
│   ├── lib/              - Utility functions (axios, format)
│   ├── assets/           - Hình ảnh, video
│   ├── App.jsx           - Root component
│   ├── main.jsx          - Entry point
│   └── index.css         - Tailwind CSS
├── public/               - Static files
├── vite.config.js        - Vite configuration
├── package.json          - Dependencies
└── .env                  - Environment variables
```

---

## 🔧 Từng Thư Mục Chi Tiết

### 1️⃣ **App.jsx** - Root Component

```jsx
<ClerkProvider>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</ClerkProvider>
```

**Chức năng**:

- Setup Clerk authentication
- Setup router cho toàn ứng dụng
- Đặt Toaster notification
- Bỏ StrictMode (tránh double API calls)

**Routes**:

```
/                    - Home
/movies              - Movies list
/movies/:id          - Movie details
/video/:id           - Watch video
/favorite            - Favorite videos
/subscriptions       - My subscriptions
/admin/*             - Admin dashboard (protected)
```

---

### 2️⃣ **components/** - UI Components

Các component tái sử dụng cho toàn ứng dụng.

#### **Shared Components**

| Component                 | Chức năng                                          |
| ------------------------- | -------------------------------------------------- |
| `Navbar.jsx`              | Navigation bar, search, auth buttons, theme toggle |
| `Footer.jsx`              | Footer với links, copyright                        |
| `SearchBar.jsx`           | Search input để tìm video                          |
| `MovieCard.jsx`           | Card hiển thị thông tin 1 video                    |
| `Pagination.jsx`          | Pagination cho danh sách                           |
| `Loading.jsx`             | Loading spinner                                    |
| `ProtectedRoute.jsx`      | Protect routes cần auth                            |
| `Switch.jsx`              | Theme toggle (light/dark)                          |
| `BlurCircle.jsx`          | Decorative blur effect                             |
| `SnowflakeBackground.jsx` | Snowflake background animation (Noel)              |

#### **Landing Page Components**

| Component               | Chức năng                              |
| ----------------------- | -------------------------------------- |
| `HeroSection.jsx`       | Hero carousel banner (trending videos) |
| `FeaturedSection.jsx`   | Featured section (videos nổi bật)      |
| `SubscriptionPlans.jsx` | Hiển thị gói subscription              |
| `SubscriptionCard.jsx`  | Card 1 gói subscription                |

#### **admin/** - Admin Components

| Component                 | Chức năng                               |
| ------------------------- | --------------------------------------- |
| `AdminNavBar.jsx`         | Admin navigation bar                    |
| `AdminSideBar.jsx`        | Admin sidebar menu                      |
| `ProtectedAdminRoute.jsx` | Protect admin routes (check admin role) |
| `AddNewMovie.jsx`         | Modal thêm/edit movie                   |
| `AddNewPlan.jsx`          | Modal thêm/edit subscription plan       |
| `MovieDetailsModal.jsx`   | Modal hiển thị chi tiết movie           |
| `PlanDetailsModal.jsx`    | Modal hiển thị chi tiết plan            |
| `Title.jsx`               | Page title component                    |

#### **movie-form/** - Movie Form Components (Sub-components)

| Component              | Chức năng                             |
| ---------------------- | ------------------------------------- |
| `VideoUploadInput.jsx` | Input upload video file               |
| `ImageUploadInput.jsx` | Input upload image (poster, backdrop) |
| `GenreSelector.jsx`    | Dropdown chọn genre                   |
| `CastManager.jsx`      | Manage cast list (thêm/xóa diễn viên) |
| `UploadProgress.jsx`   | Progress bar cho upload               |

---

### 3️⃣ **pages/** - Page Components

Các trang chính của ứng dụng.

#### **User Pages**

| Page                  | Route            | Chức năng                                            |
| --------------------- | ---------------- | ---------------------------------------------------- |
| `Home.jsx`            | `/`              | Trang chủ (Hero + Featured + Plans)                  |
| `Movies.jsx`          | `/movies`        | Danh sách tất cả movies (search, filter, pagination) |
| `MovieDetails.jsx`    | `/movies/:id`    | Chi tiết movie (thông tin, trailer, liên quan)       |
| `Video.jsx`           | `/video/:id`     | Xem video (player, lịch sử, tiếp tục xem)            |
| `Favorite.jsx`        | `/favorite`      | Danh sách videos yêu thích                           |
| `MySubscriptions.jsx` | `/subscriptions` | Quản lý subscription của user                        |

#### **admin/** - Admin Pages

| Page              | Route                | Chức năng                        |
| ----------------- | -------------------- | -------------------------------- |
| `Layout.jsx`      | `/admin`             | Layout chứa navbar + sidebar     |
| `Dashboard.jsx`   | `/admin/dashboard`   | Dashboard với thống kê           |
| `AddMovies.jsx`   | `/admin/movies`      | Thêm/edit/xóa movies             |
| `ListMovies.jsx`  | `/admin/movies/list` | Danh sách movies                 |
| `AddGenre.jsx`    | `/admin/genres`      | Thêm/edit/xóa genres             |
| `AddPlans.jsx`    | `/admin/plans`       | Thêm/edit/xóa subscription plans |
| `ListBooking.jsx` | `/admin/bookings`    | Danh sách subscriptions          |

---

### 4️⃣ **services/** - API Service Calls

Services gọi API tới backend server.

#### **userService.js** - User API

```javascript
userService = {
  // Profile
  getUserProfile()              // Lấy thông tin profile
  getUserStats()                // Lấy thống kê user

  // Favorites
  getFavorites()                // Lấy danh sách yêu thích
  toggleFavorite(videoId)       // Thêm/xóa yêu thích
  checkFavorite(videoId)        // Kiểm tra video yêu thích

  // Watch History
  getWatchHistory()             // Lấy lịch sử xem
  updateWatchProgress()         // Cập nhật tiến độ xem
  getWatchProgress(videoId)     // Lấy tiến độ của 1 video
  deleteWatchHistory(id)        // Xóa 1 video từ history
  clearWatchHistory()           // Xóa toàn bộ history

  // Preferences
  updatePreferences()           // Cập nhật sở thích
  getPreferences()              // Lấy sở thích

  // Devices
  getDevices()                  // Lấy danh sách thiết bị
  updateDevice()                // Cập nhật thiết bị
  removeDevice()                // Xóa thiết bị

  // Recommendations
  getContinueWatching()         // Lấy tiếp tục xem
  getRecommendedVideos()        // Lấy video đề xuất
}
```

#### **videoService.js** - Video API

```javascript
videoService = {
  // Upload (Cloudinary)
  getCloudinarySignature()      // Lấy signature upload
  uploadToCloudinary()          // Upload file trực tiếp Cloudinary

  // Retrieve
  getAllVideos()                // Lấy danh sách video (search, filter)
  getVideoById()                // Lấy chi tiết 1 video
  getFeaturedVideos()           // Lấy video featured
  getTrendingVideos()           // Lấy video trending
  getVideosByGenre()            // Lấy video theo thể loại
  searchVideos()                // Tìm kiếm video

  // Streaming
  streamVideo()                 // Phát video
  getTrailerUrl()               // Lấy URL trailer

  // Manage (Admin)
  createVideo()                 // Tạo video mới
  updateVideo()                 // Cập nhật video
  deleteVideo()                 // Xóa video
  incrementView()               // Tăng lượt xem
  toggleFeatured()              // Đánh dấu featured
  toggleTrending()              // Đánh dấu trending
}
```

#### **subscriptionService.js** - Subscription API

```javascript
subscriptionService = {
  // Plans
  getAllPlans()                 // Lấy danh sách gói
  getPlanById()                 // Lấy chi tiết 1 gói
  createPlan()                  // Tạo plan mới (admin)
  updatePlan()                  // Cập nhật plan (admin)
  deletePlan()                  // Xóa plan (admin)

  // Subscriptions
  createSubscription()          // Tạo subscription (thanh toán)
  getCurrentSubscription()      // Lấy subscription hiện tại
  getSubscriptionHistory()      // Lấy lịch sử subscription
  cancelSubscription()          // Hủy subscription
}
```

#### **genreService.js** - Genre API

```javascript
genreService = {
  getAllGenres()                // Lấy danh sách thể loại
  getGenreById()                // Lấy chi tiết 1 thể loại
  createGenre()                 // Tạo thể loại mới (admin)
  updateGenre()                 // Cập nhật thể loại (admin)
  deleteGenre()                 // Xóa thể loại (admin)
}
```

#### **adminService.js** - Admin API

```javascript
adminService = {
  checkAdmin()                  // Kiểm tra user có phải admin
  getDashboardStats()           // Lấy dashboard stats
  getAllUsers()                 // Lấy danh sách users
  toggleUserBan()               // Cấm/mở cấm user
  getAllSubscriptions()         // Lấy danh sách subscriptions
}
```

#### **index.js** - Export All Services

```javascript
export {
  userService,
  videoService,
  subscriptionService,
  genreService,
  adminService,
};
```

---

### 5️⃣ **hooks/** - Custom React Hooks

#### **useMovieForm.js** - Movie Form Hook

**Chức năng**: Quản lý state và logic cho form thêm/edit movie

```javascript
const {
  formData, // Form data state
  errors, // Validation errors
  isSubmitting, // Loading state
  uploadProgress, // Upload progress (0-100)

  // Preview states
  posterPreview,
  backdropPreview,
  trailerFile,
  videoFile,

  // Handlers
  handleChange, // Input change
  handleSubmit, // Form submission
  handleGenreAdd, // Thêm genre
  handleCastAdd, // Thêm cast
  handleImageUpload, // Upload ảnh
  handleVideoUpload, // Upload video
  // ... more handlers
} = useMovieForm(movie, onSuccess);
```

**Workflow**:

1. User chọn file (poster, backdrop, trailer, video)
2. Hook tính toán file size, kiểm tra validation
3. Upload lên Cloudinary (direct, không qua server)
4. Lấy URL trả về
5. Submit form với tất cả URLs tới backend
6. Backend tạo/cập nhật video với URLs

---

### 6️⃣ **lib/** - Utility Functions

#### **axios.js** - Axios Configuration

```javascript
const api = axios.create({
  baseURL: process.env.VITE_API_URL,
  timeout: 300000, // 5 minutes
});

// Request Interceptor
- Thêm Clerk token vào Authorization header
- Xử lý FormData (xóa Content-Type để axios tự set)

// Response Interceptor
- Xử lý lỗi toàn cầu
- Refresh token nếu hết hạn
```

#### **dateFormat.js** - Date Formatting

Utility để format date theo Việt Nam

```javascript
formatDate(date); // Format: DD/MM/YYYY
formatDateTime(); // Format: DD/MM/YYYY HH:MM:SS
getRelativeTime(); // Format: "2 giờ trước"
```

#### **timeFormat.js** - Time Formatting

```javascript
formatDuration(seconds); // Format: "1h 30m 45s"
formatWatchTime(); // Format watchtime theo giờ
```

---

### 7️⃣ **assets/** - Static Files

#### **assets.js** - Asset Imports

Tập trung import tất cả ảnh, video từ folder `assets/`

```javascript
export const assets = {
  logo: require("./image/logo.png"),
  heroImage: require("./image/hero.png"),
  // ... more assets
};
```

#### **image/** - Hình ảnh

- Logo, icons, backgrounds
- Các ảnh tĩnh cho UI

#### **video/** - Video

- Demo video, trailer

---

### 8️⃣ **main.jsx** - Entry Point

```jsx
createRoot(root).render(
  <ClerkProvider publishableKey={VITE_CLERK_PUBLISHABLE_KEY}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ClerkProvider>
);
```

**Chức năng**:

- Load Clerk authentication
- Setup React Router
- Mount App component vào DOM

---

### 9️⃣ **index.css** - Tailwind CSS

- Global styles
- Tailwind configuration
- Custom CSS classes
- Dark mode setup

---

## 🚀 Quy Trình Hoạt Động

### 1. User Truy Cập Trang Chủ

1. `main.jsx` load app
2. `App.jsx` render layout
3. `Home.jsx` render:
   - `HeroSection` - Carousel featured videos
   - `FeaturedSection` - Featured videos
   - `SubscriptionPlans` - Gói subscription
4. Services call API lấy dữ liệu

### 2. User Xem Video

1. Click movie → `MovieDetails.jsx`
2. Hiển thị trailer, thông tin
3. Click "Xem Video" → `Video.jsx`
4. `videoService.streamVideo()` lấy URL
5. ReactPlayer phát video
6. `userService.updateWatchProgress()` lưu tiến độ

### 3. User Mua Subscription

1. Click gói → `SubscriptionPlans.jsx`
2. `subscriptionService.createSubscription()`
3. Redirect tới Stripe checkout
4. Thanh toán thành công
5. Stripe redirect callback
6. `userService.getUserProfile()` update subscription info

### 4. Admin Thêm Video

1. Go to `/admin/movies`
2. `AddNewMovie.jsx` modal mở
3. `useMovieForm` hook quản lý form
4. User chọn file → upload Cloudinary
5. `addNewMovie()` submit form
6. `videoService.createVideo()` tạo video
7. Movie thêm vào database

### 5. Search & Filter

1. User nhập keyword → `SearchBar.jsx`
2. `Movies.jsx` call `videoService.searchVideos()`
3. Filter theo genre, year, etc.
4. Hiển thị kết quả với pagination

---

## 📊 Data Flow

```
User Interaction (click, input)
        ↓
Component State Update
        ↓
Service Call (API)
        ↓
Axios Interceptor (add token)
        ↓
Backend Server
        ↓
Response Interceptor
        ↓
Component Update State
        ↓
Re-render UI
```

---

## 🔐 Authentication Flow

### Clerk Setup

1. `main.jsx` load ClerkProvider
2. ClerkProvider khởi tạo Clerk session
3. User login qua Clerk modal
4. `useAuth()` hook truy cập user info
5. Clerk token attach vào header (interceptor)

### Protected Routes

```jsx
<ProtectedRoute>
  <Page />
</ProtectedRoute>
```

- Check `useAuth().isSignedIn`
- Redirect `/` nếu chưa login

### Admin Routes

```jsx
<ProtectedAdminRoute>
  <AdminPage />
</ProtectedAdminRoute>
```

- Check `useAuth()` + call `adminService.checkAdmin()`
- Redirect `/` nếu không phải admin

---

## 🎯 Component Hierarchy

```
<App>
  ├── <Navbar>
  ├── <Routes>
  │   ├── <Home>
  │   │   ├── <HeroSection>
  │   │   ├── <FeaturedSection>
  │   │   └── <SubscriptionPlans>
  │   │       └── <SubscriptionCard>
  │   ├── <Movies>
  │   │   ├── <SearchBar>
  │   │   ├── <MovieCard> (x many)
  │   │   └── <Pagination>
  │   ├── <MovieDetails>
  │   ├── <Video>
  │   ├── <Favorite>
  │   ├── <MySubscriptions>
  │   └── <ProtectedAdminRoute>
  │       └── <Layout>
  │           ├── <AdminNavBar>
  │           ├── <AdminSideBar>
  │           └── <Routes>
  │               ├── <Dashboard>
  │               ├── <AddMovies>
  │               ├── <AddGenre>
  │               └── <AddPlans>
  └── <Footer>
```

---

## 📝 Environment Variables (.env)

```
# API
VITE_API_URL=http://localhost:3000/api

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Cloudinary (optional - if client-side upload)
VITE_CLOUDINARY_CLOUD_NAME=...
```

---

## 📦 Dependencies

| Package              | Chức năng           |
| -------------------- | ------------------- |
| `react`              | UI library          |
| `react-router-dom`   | Client-side routing |
| `@clerk/clerk-react` | Authentication      |
| `axios`              | HTTP requests       |
| `tailwindcss`        | Styling             |
| `lucide-react`       | Icons               |
| `react-player`       | Video player        |
| `react-hot-toast`    | Notifications       |
| `vite`               | Build tool          |

---

## 🎨 Styling - Tailwind CSS

- **Dark mode**: Configured
- **Colors**: Custom dark theme (grays, reds)
- **Responsive**: Mobile-first approach
- **Components**: Tailwind utility classes

---

## ⚡ Performance Optimizations

### Lazy Loading

```jsx
const Component = lazy(() => import("./Component"));
<Suspense fallback={<Loading />}>
  <Component />
</Suspense>;
```

### Code Splitting

- Vite tự động split code theo routes

### Caching

- Axios response caching
- Browser cache headers

### Pagination

- Load 12 items per page (Movies.jsx)
- Tránh load toàn bộ dữ liệu cùng lúc

---

## 🐛 Debugging Tips

### 1. Check Clerk Initialization

```javascript
const { isLoaded, isSignedIn } = useAuth();
console.log("Clerk loaded:", isLoaded);
console.log("User signed in:", isSignedIn);
```

### 2. Check API Calls

```javascript
// Axios interceptor logs requests/responses
// Mở browser DevTools → Network tab
```

### 3. Check Component State

```javascript
console.log("Form data:", formData);
console.log("Upload progress:", uploadProgress);
```

### 4. Check Routing

```javascript
import { useLocation } from "react-router-dom";
const location = useLocation();
console.log("Current route:", location.pathname);
```

---

## 📝 Code Examples

### Fetch & Display Videos

```jsx
const [videos, setVideos] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchVideos = async () => {
    try {
      const response = await videoService.getAllVideos({
        status: "published",
        limit: 20,
      });
      setVideos(response.data.videos || []);
    } catch (error) {
      toast.error("Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  };

  fetchVideos();
}, []);
```

### Toggle Favorite

```jsx
const handleToggleFavorite = async (videoId) => {
  try {
    const response = await userService.toggleFavorite(videoId);

    if (response.data.isFavorite) {
      toast.success("Added to favorites");
    } else {
      toast.success("Removed from favorites");
    }

    // Refresh favorites
    fetchFavorites();
  } catch (error) {
    toast.error("Failed to toggle favorite");
  }
};
```

### Upload Video (Client-side)

```jsx
const handleVideoUpload = async (file) => {
  try {
    const response = await videoService.uploadToCloudinary(
      file,
      { folder: "hustv/videos" },
      (progress) => setUploadProgress(progress)
    );

    setFormData((prev) => ({
      ...prev,
      video_url: response.url,
    }));

    toast.success("Video uploaded successfully");
  } catch (error) {
    toast.error("Upload failed");
  }
};
```

---

## 🔗 API Endpoints Used

### User Endpoints

```
GET    /api/users/profile
POST   /api/users/favorites
GET    /api/users/favorites
GET    /api/users/watch-history
POST   /api/users/watch-progress/:id
GET    /api/users/stats
```

### Video Endpoints

```
GET    /api/videos
POST   /api/videos/upload
GET    /api/videos/:id
GET    /api/videos/featured
GET    /api/videos/search
POST   /api/videos/cloudinary/signature
```

### Subscription Endpoints

```
GET    /api/subscriptions/plans
POST   /api/subscriptions/create
GET    /api/subscriptions/current
```

### Admin Endpoints

```
GET    /api/admin/check
GET    /api/admin/dashboard/stats
GET    /api/admin/users
POST   /api/videos/upload
```

---

## 📞 Liên Hệ & Hỗ Trợ

Nếu có câu hỏi về client, vui lòng kiểm tra các file tương ứng hoặc liên hệ team development.

**Last Updated**: December 2025
