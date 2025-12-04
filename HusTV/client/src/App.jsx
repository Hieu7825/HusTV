// client/src/App.jsx
import React, { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Toaster } from "react-hot-toast";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";

// Pages
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import Favorite from "./pages/Favorite";
import { Video } from "./pages/Video";
import MySubscriptions from "./pages/MySubscriptions";

// Admin Pages
import Layout from "./pages/admin/Layout";
import DashBoard from "./pages/admin/DashBoard";
import AddGenre from "./pages/admin/AddGenre";
import AddMovies from "./pages/admin/AddMovies";
import AddPlans from "./pages/admin/AddPlans";
import ListBooking from "./pages/admin/ListBooking";
import ListMovies from "./pages/admin/ListMovies";

// ✅ Component để ensure Clerk được load và log status
const ClerkInitializer = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded) {
      console.log("✅ Clerk initialized successfully");
      console.log(`📝 User signed in: ${isSignedIn}`);
    }
  }, [isLoaded, isSignedIn]);

  return children;
};

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <ClerkInitializer>
      {/* Toaster Configuration */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1f2937",
            color: "#fff",
            border: "1px solid #374151",
            borderRadius: "8px",
            padding: "16px",
            fontSize: "14px",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
            style: {
              border: "1px solid #10b981",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
            style: {
              border: "1px solid #ef4444",
            },
          },
          loading: {
            iconTheme: {
              primary: "#3b82f6",
              secondary: "#fff",
            },
          },
        }}
      />

      {/* Conditional Navbar */}
      {!isAdminRoute && <Navbar />}

      {/* Routes */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetails />} />

        {/* ✅ Protected: Video Player - Requires Login + Active Subscription */}
        <Route
          path="/video/:id"
          element={
            <ProtectedRoute requireSubscription={true}>
              <Video />
            </ProtectedRoute>
          }
        />

        {/* ✅ Protected: Subscriptions Page - Requires Login Only */}
        <Route
          path="/my-subscriptions"
          element={
            <ProtectedRoute>
              <MySubscriptions />
            </ProtectedRoute>
          }
        />

        {/* ✅ Protected: Favorites Page - Requires Login Only */}
        <Route
          path="/favorite"
          element={
            <ProtectedRoute>
              <Favorite />
            </ProtectedRoute>
          }
        />

        {/* ✅ Protected: Admin Routes - Requires Admin Role */}
        <Route
          path="/admin/*"
          element={
            <ProtectedAdminRoute>
              <Layout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<DashBoard />} />
          <Route path="add-movies" element={<AddMovies />} />
          <Route path="add-genre" element={<AddGenre />} />
          <Route path="add-plans" element={<AddPlans />} />
          <Route path="list-booking" element={<ListBooking />} />
          <Route path="list-movies" element={<ListMovies />} />
        </Route>

        {/* ✅ 404 Not Found (Optional) */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
                <p className="text-gray-400 text-xl mb-8">Page Not Found</p>
                <a
                  href="/"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Go Home
                </a>
              </div>
            </div>
          }
        />
      </Routes>

      {/* Conditional Footer */}
      {!isAdminRoute && <Footer />}
    </ClerkInitializer>
  );
};

export default App;
