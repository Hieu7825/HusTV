# 📱 HusTVクライアントドキュメント

Reactフロントエンドの構造、コンポーネント、ページ、フック、サービス、ワークフローに関する詳細ドキュメント。

---

## 📁 ディレクトリ構造

```
client/
├── src/
│   ├── components/        - 再利用可能なコンポーネント
│   │   └── admin/        - 管理者専用コンポーネント
│   ├── pages/            - メインページ
│   │   └── admin/        - 管理者ページ
│   ├── hooks/            - カスタムReactフック
│   ├── services/         - APIサービス呼び出し
│   ├── lib/              - ユーティリティ関数 (axios, format)
│   ├── assets/           - 画像、ビデオ
│   ├── App.jsx           - ルートコンポーネント
│   ├── main.jsx          - エントリーポイント
│   └── index.css         - Tailwind CSS
├── public/               - 静的ファイル
├── vite.config.js        - Vite設定
├── package.json          - 依存関係
└── .env                  - 環境変数
```

---

## 🔧 各ディレクトリの詳細

### 1️⃣ **App.jsx** - ルートコンポーネント

```jsx
<ClerkProvider>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</ClerkProvider>
```

**機能**:

- Clerk認証のセットアップ
- アプリケーション全体のルーター設定
- Toaster通知の配置
- StrictModeを無効化（API呼び出しの重複を防ぐ）

**ルート**:

```
/                    - ホーム
/movies              - 映画リスト
/movies/:id          - 映画詳細
/video/:id           - ビデオ視聴
/favorite            - お気に入りビデオ
/subscriptions       - マイサブスクリプション
/admin/*             - 管理ダッシュボード（保護）
```

---

### 2️⃣ **components/** - UIコンポーネント

アプリケーション全体で再利用されるコンポーネント。

#### **共有コンポーネント**

| コンポーネント            | 機能                                                 |
| ------------------------- | ---------------------------------------------------- |
| `Navbar.jsx`              | ナビゲーションバー、検索、認証ボタン、テーマ切り替え |
| `Footer.jsx`              | リンク、著作権情報を含むフッター                     |
| `SearchBar.jsx`           | ビデオ検索用の検索入力                               |
| `MovieCard.jsx`           | 1つのビデオ情報を表示するカード                      |
| `Pagination.jsx`          | リスト用のページネーション                           |
| `Loading.jsx`             | ローディングスピナー                                 |
| `ProtectedRoute.jsx`      | 認証が必要なルートを保護                             |
| `Switch.jsx`              | テーマ切り替え（ライト/ダーク）                      |
| `BlurCircle.jsx`          | 装飾用ブラーエフェクト                               |
| `SnowflakeBackground.jsx` | スノーフレーク背景アニメーション（クリスマス）       |

#### **ランディングページコンポーネント**

| コンポーネント          | 機能                                       |
| ----------------------- | ------------------------------------------ |
| `HeroSection.jsx`       | ヒーローカルーセルバナー（トレンドビデオ） |
| `FeaturedSection.jsx`   | 注目セクション（注目のビデオ）             |
| `SubscriptionPlans.jsx` | サブスクリプションプランの表示             |
| `SubscriptionCard.jsx`  | 1つのサブスクリプションプランカード        |

#### **admin/** - 管理者コンポーネント

| コンポーネント            | 機能                                         |
| ------------------------- | -------------------------------------------- |
| `AdminNavBar.jsx`         | 管理者ナビゲーションバー                     |
| `AdminSideBar.jsx`        | 管理者サイドバーメニュー                     |
| `ProtectedAdminRoute.jsx` | 管理者ルートを保護（管理者ロールをチェック） |
| `AddNewMovie.jsx`         | 映画の追加/編集モーダル                      |
| `AddNewPlan.jsx`          | サブスクリプションプランの追加/編集モーダル  |
| `MovieDetailsModal.jsx`   | 映画詳細表示モーダル                         |
| `PlanDetailsModal.jsx`    | プラン詳細表示モーダル                       |
| `Title.jsx`               | ページタイトルコンポーネント                 |

#### **movie-form/** - 映画フォームコンポーネント（サブコンポーネント）

| コンポーネント         | 機能                                   |
| ---------------------- | -------------------------------------- |
| `VideoUploadInput.jsx` | ビデオファイルアップロード入力         |
| `ImageUploadInput.jsx` | 画像アップロード入力（ポスター、背景） |
| `GenreSelector.jsx`    | ジャンル選択ドロップダウン             |
| `CastManager.jsx`      | キャストリスト管理（俳優の追加/削除）  |
| `UploadProgress.jsx`   | アップロード用プログレスバー           |

---

### 3️⃣ **pages/** - ページコンポーネント

アプリケーションのメインページ。

#### **ユーザーページ**

| ページ                | ルート           | 機能                                             |
| --------------------- | ---------------- | ------------------------------------------------ |
| `Home.jsx`            | `/`              | ホームページ（ヒーロー + 注目 + プラン）         |
| `Movies.jsx`          | `/movies`        | 全映画リスト（検索、フィルタ、ページネーション） |
| `MovieDetails.jsx`    | `/movies/:id`    | 映画詳細（情報、トレーラー、関連）               |
| `Video.jsx`           | `/video/:id`     | ビデオ視聴（プレーヤー、履歴、続きから視聴）     |
| `Favorite.jsx`        | `/favorite`      | お気に入りビデオリスト                           |
| `MySubscriptions.jsx` | `/subscriptions` | ユーザーのサブスクリプション管理                 |

#### **admin/** - 管理者ページ

| ページ            | ルート               | 機能                                     |
| ----------------- | -------------------- | ---------------------------------------- |
| `Layout.jsx`      | `/admin`             | ナビバー + サイドバーを含むレイアウト    |
| `Dashboard.jsx`   | `/admin/dashboard`   | 統計情報を含むダッシュボード             |
| `AddMovies.jsx`   | `/admin/movies`      | 映画の追加/編集/削除                     |
| `ListMovies.jsx`  | `/admin/movies/list` | 映画リスト                               |
| `AddGenre.jsx`    | `/admin/genres`      | ジャンルの追加/編集/削除                 |
| `AddPlans.jsx`    | `/admin/plans`       | サブスクリプションプランの追加/編集/削除 |
| `ListBooking.jsx` | `/admin/bookings`    | サブスクリプションリスト                 |

---

### 4️⃣ **services/** - APIサービス呼び出し

バックエンドサーバーへのAPI呼び出しを行うサービス。

#### **userService.js** - ユーザーAPI

```javascript
userService = {
  // プロフィール
  getUserProfile()              // プロフィール情報取得
  getUserStats()                // ユーザー統計取得

  // お気に入り
  getFavorites()                // お気に入りリスト取得
  toggleFavorite(videoId)       // お気に入りの追加/削除
  checkFavorite(videoId)        // ビデオがお気に入りかチェック

  // 視聴履歴
  getWatchHistory()             // 視聴履歴取得
  updateWatchProgress()         // 視聴進捗更新
  getWatchProgress(videoId)     // 1つのビデオの進捗取得
  deleteWatchHistory(id)        // 履歴から1つのビデオを削除
  clearWatchHistory()           // 全履歴をクリア

  // 設定
  updatePreferences()           // 設定を更新
  getPreferences()              // 設定を取得

  // デバイス
  getDevices()                  // デバイスリスト取得
  updateDevice()                // デバイス更新
  removeDevice()                // デバイス削除

  // おすすめ
  getContinueWatching()         // 続きから視聴を取得
  getRecommendedVideos()        // おすすめビデオを取得
}
```

#### **videoService.js** - ビデオAPI

```javascript
videoService = {
  // アップロード (Cloudinary)
  getCloudinarySignature()      // アップロード署名取得
  uploadToCloudinary()          // Cloudinaryに直接ファイルアップロード

  // 取得
  getAllVideos()                // ビデオリスト取得（検索、フィルタ）
  getVideoById()                // 1つのビデオの詳細取得
  getFeaturedVideos()           // 注目のビデオ取得
  getTrendingVideos()           // トレンドビデオ取得
  getVideosByGenre()            // ジャンル別ビデオ取得
  searchVideos()                // ビデオ検索

  // ストリーミング
  streamVideo()                 // ビデオ再生
  getTrailerUrl()               // トレーラーURL取得

  // 管理（管理者）
  createVideo()                 // 新規ビデオ作成
  updateVideo()                 // ビデオ更新
  deleteVideo()                 // ビデオ削除
  incrementView()               // 視聴回数増加
  toggleFeatured()              // 注目マークを切り替え
  toggleTrending()              // トレンドマークを切り替え
}
```

#### **subscriptionService.js** - サブスクリプションAPI

```javascript
subscriptionService = {
  // プラン
  getAllPlans()                 // プランリスト取得
  getPlanById()                 // 1つのプラン詳細取得
  createPlan()                  // 新規プラン作成（管理者）
  updatePlan()                  // プラン更新（管理者）
  deletePlan()                  // プラン削除（管理者）

  // サブスクリプション
  createSubscription()          // サブスクリプション作成（決済）
  getCurrentSubscription()      // 現在のサブスクリプション取得
  getSubscriptionHistory()      // サブスクリプション履歴取得
  cancelSubscription()          // サブスクリプションキャンセル
}
```

#### **genreService.js** - ジャンルAPI

```javascript
genreService = {
  getAllGenres()                // ジャンルリスト取得
  getGenreById()                // 1つのジャンル詳細取得
  createGenre()                 // 新規ジャンル作成（管理者）
  updateGenre()                 // ジャンル更新（管理者）
  deleteGenre()                 // ジャンル削除（管理者）
}
```

#### **adminService.js** - 管理者API

```javascript
adminService = {
  checkAdmin()                  // ユーザーが管理者かチェック
  getDashboardStats()           // ダッシュボード統計取得
  getAllUsers()                 // ユーザーリスト取得
  toggleUserBan()               // ユーザーのBAN/BAN解除
  getAllSubscriptions()         // サブスクリプションリスト取得
}
```

#### **index.js** - 全サービスのエクスポート

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

### 5️⃣ **hooks/** - カスタムReactフック

#### **useMovieForm.js** - 映画フォームフック

**機能**: 映画の追加/編集フォームの状態とロジックを管理

```javascript
const {
  formData, // フォームデータ状態
  errors, // バリデーションエラー
  isSubmitting, // ローディング状態
  uploadProgress, // アップロード進捗（0-100）

  // プレビュー状態
  posterPreview,
  backdropPreview,
  trailerFile,
  videoFile,

  // ハンドラー
  handleChange, // 入力変更
  handleSubmit, // フォーム送信
  handleGenreAdd, // ジャンル追加
  handleCastAdd, // キャスト追加
  handleImageUpload, // 画像アップロード
  handleVideoUpload, // ビデオアップロード
  // ... その他のハンドラー
} = useMovieForm(movie, onSuccess);
```

**ワークフロー**:

1. ユーザーがファイルを選択（ポスター、背景、トレーラー、ビデオ）
2. フックがファイルサイズを計算し、バリデーションをチェック
3. Cloudinaryに直接アップロード（サーバー経由なし）
4. 返されたURLを取得
5. 全URLを含むフォームをバックエンドに送信
6. バックエンドがURLを使用してビデオを作成/更新

---

### 6️⃣ **lib/** - ユーティリティ関数

#### **axios.js** - Axios設定

```javascript
const api = axios.create({
  baseURL: process.env.VITE_API_URL,
  timeout: 300000, // 5分
});

// リクエストインターセプター
- ClerkトークンをAuthorizationヘッダーに追加
- FormDataを処理（Content-Typeを削除してaxiosが自動設定）

// レスポンスインターセプター
- グローバルエラー処理
- 期限切れの場合にトークンをリフレッシュ
```

#### **dateFormat.js** - 日付フォーマット

ベトナム形式で日付をフォーマットするユーティリティ

```javascript
formatDate(date); // フォーマット: DD/MM/YYYY
formatDateTime(); // フォーマット: DD/MM/YYYY HH:MM:SS
getRelativeTime(); // フォーマット: "2時間前"
```

#### **timeFormat.js** - 時間フォーマット

```javascript
formatDuration(seconds); // フォーマット: "1h 30m 45s"
formatWatchTime(); // 視聴時間を時間でフォーマット
```

---

### 7️⃣ **assets/** - 静的ファイル

#### **assets.js** - アセットインポート

`assets/`フォルダから全ての画像、ビデオを一元的にインポート

```javascript
export const assets = {
  logo: require("./image/logo.png"),
  heroImage: require("./image/hero.png"),
  // ... その他のアセット
};
```

#### **image/** - 画像

- ロゴ、アイコン、背景
- UI用の静的画像

#### **video/** - ビデオ

- デモビデオ、トレーラー

---

### 8️⃣ **main.jsx** - エントリーポイント

```jsx
createRoot(root).render(
  <ClerkProvider publishableKey={VITE_CLERK_PUBLISHABLE_KEY}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ClerkProvider>,
);
```

**機能**:

- Clerk認証の読み込み
- React Routerのセットアップ
- AppコンポーネントをDOMにマウント

---

### 9️⃣ **index.css** - Tailwind CSS

- グローバルスタイル
- Tailwind設定
- カスタムCSSクラス
- ダークモード設定

---

## 🚀 動作フロー

### 1. ユーザーがホームページにアクセス

1. `main.jsx`がアプリを読み込み
2. `App.jsx`がレイアウトをレンダリング
3. `Home.jsx`がレンダリング:
   - `HeroSection` - 注目ビデオのカルーセル
   - `FeaturedSection` - 注目のビデオ
   - `SubscriptionPlans` - サブスクリプションプラン
4. サービスがAPIを呼び出してデータを取得

### 2. ユーザーがビデオを視聴

1. 映画をクリック → `MovieDetails.jsx`
2. トレーラー、情報を表示
3. 「ビデオを視聴」をクリック → `Video.jsx`
4. `videoService.streamVideo()`がURLを取得
5. ReactPlayerがビデオを再生
6. `userService.updateWatchProgress()`が進捗を保存

### 3. ユーザーがサブスクリプションを購入

1. プランをクリック → `SubscriptionPlans.jsx`
2. `subscriptionService.createSubscription()`
3. Stripeチェックアウトにリダイレクト
4. 決済成功
5. Stripeコールバックリダイレクト
6. `userService.getUserProfile()`がサブスクリプション情報を更新

### 4. 管理者がビデオを追加

1. `/admin/movies`へ移動
2. `AddNewMovie.jsx`モーダルが開く
3. `useMovieForm`フックがフォームを管理
4. ユーザーがファイルを選択 → Cloudinaryにアップロード
5. `addNewMovie()`がフォームを送信
6. `videoService.createVideo()`がビデオを作成
7. 映画がデータベースに追加される

### 5. 検索とフィルタ

1. ユーザーがキーワードを入力 → `SearchBar.jsx`
2. `Movies.jsx`が`videoService.searchVideos()`を呼び出し
3. ジャンル、年などでフィルタ
4. ページネーション付きで結果を表示

---

## 📊 データフロー

```
ユーザーインタラクション（クリック、入力）
        ↓
コンポーネント状態更新
        ↓
サービス呼び出し（API）
        ↓
Axiosインターセプター（トークン追加）
        ↓
バックエンドサーバー
        ↓
レスポンスインターセプター
        ↓
コンポーネント状態更新
        ↓
UI再レンダリング
```

---

## 🔐 認証フロー

### Clerkセットアップ

1. `main.jsx`がClerkProviderを読み込み
2. ClerkProviderがClerkセッションを初期化
3. ユーザーがClerkモーダルでログイン
4. `useAuth()`フックがユーザー情報にアクセス
5. Clerkトークンがヘッダーにアタッチされる（インターセプター）

### 保護されたルート

```jsx
<ProtectedRoute>
  <Page />
</ProtectedRoute>
```

- `useAuth().isSignedIn`をチェック
- 未ログインの場合は`/`にリダイレクト

### 管理者ルート

```jsx
<ProtectedAdminRoute>
  <AdminPage />
</ProtectedAdminRoute>
```

- `useAuth()` + `adminService.checkAdmin()`を呼び出してチェック
- 管理者でない場合は`/`にリダイレクト

---

## 🎯 コンポーネント階層

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
  │   │   ├── <MovieCard> (複数)
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

## 📝 環境変数 (.env)

```
# API
VITE_API_URL=http://localhost:3000/api

# Clerk認証
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Cloudinary (オプション - クライアント側アップロードの場合)
VITE_CLOUDINARY_CLOUD_NAME=...
```

---

## 📦 依存関係

| パッケージ           | 機能                       |
| -------------------- | -------------------------- |
| `react`              | UIライブラリ               |
| `react-router-dom`   | クライアント側ルーティング |
| `@clerk/clerk-react` | 認証                       |
| `axios`              | HTTPリクエスト             |
| `tailwindcss`        | スタイリング               |
| `lucide-react`       | アイコン                   |
| `react-player`       | ビデオプレーヤー           |
| `react-hot-toast`    | 通知                       |
| `vite`               | ビルドツール               |

---

## 🎨 スタイリング - Tailwind CSS

- **ダークモード**: 設定済み
- **カラー**: カスタムダークテーマ（グレー、レッド）
- **レスポンシブ**: モバイルファーストアプローチ
- **コンポーネント**: Tailwindユーティリティクラス

---

## ⚡ パフォーマンス最適化

### 遅延読み込み

```jsx
const Component = lazy(() => import("./Component"));
<Suspense fallback={<Loading />}>
  <Component />
</Suspense>;
```

### コード分割

- Viteがルートごとに自動的にコードを分割

### キャッシング

- Axiosレスポンスキャッシング
- ブラウザキャッシュヘッダー

### ページネーション

- ページあたり12アイテムを読み込み（Movies.jsx）
- 一度に全データを読み込むことを回避

---

## 🐛 デバッグのヒント

### 1. Clerk初期化のチェック

```javascript
const { isLoaded, isSignedIn } = useAuth();
console.log("Clerk読み込み済み:", isLoaded);
console.log("ユーザーログイン済み:", isSignedIn);
```

### 2. API呼び出しのチェック

```javascript
// Axiosインターセプターがリクエスト/レスポンスをログ
// ブラウザDevTools → Networkタブを開く
```

### 3. コンポーネント状態のチェック

```javascript
console.log("フォームデータ:", formData);
console.log("アップロード進捗:", uploadProgress);
```

### 4. ルーティングのチェック

```javascript
import { useLocation } from "react-router-dom";
const location = useLocation();
console.log("現在のルート:", location.pathname);
```

---

## 📝 コード例

### ビデオの取得と表示

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
      toast.error("ビデオの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  fetchVideos();
}, []);
```

### お気に入りの切り替え

```jsx
const handleToggleFavorite = async (videoId) => {
  try {
    const response = await userService.toggleFavorite(videoId);

    if (response.data.isFavorite) {
      toast.success("お気に入りに追加されました");
    } else {
      toast.success("お気に入りから削除されました");
    }

    // お気に入りを更新
    fetchFavorites();
  } catch (error) {
    toast.error("お気に入りの切り替えに失敗しました");
  }
};
```

### ビデオアップロード（クライアント側）

```jsx
const handleVideoUpload = async (file) => {
  try {
    const response = await videoService.uploadToCloudinary(
      file,
      { folder: "hustv/videos" },
      (progress) => setUploadProgress(progress),
    );

    setFormData((prev) => ({
      ...prev,
      video_url: response.url,
    }));

    toast.success("ビデオが正常にアップロードされました");
  } catch (error) {
    toast.error("アップロードに失敗しました");
  }
};
```

---

## 🔗 使用されるAPIエンドポイント

### ユーザーエンドポイント

```
GET    /api/users/profile
POST   /api/users/favorites
GET    /api/users/favorites
GET    /api/users/watch-history
POST   /api/users/watch-progress/:id
GET    /api/users/stats
```

### ビデオエンドポイント

```
GET    /api/videos
POST   /api/videos/upload
GET    /api/videos/:id
GET    /api/videos/featured
GET    /api/videos/search
POST   /api/videos/cloudinary/signature
```

### サブスクリプションエンドポイント

```
GET    /api/subscriptions/plans
POST   /api/subscriptions/create
GET    /api/subscriptions/current
```

### 管理者エンドポイント

```
GET    /api/admin/check
GET    /api/admin/dashboard/stats
GET    /api/admin/users
POST   /api/videos/upload
```

---

## 📞 お問い合わせとサポート

クライアントに関する質問がある場合は、対応するファイルを確認するか、開発チームにお問い合わせください。

**最終更新日**: 2025年12月

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
  </ClerkProvider>,
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
      (progress) => setUploadProgress(progress),
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
