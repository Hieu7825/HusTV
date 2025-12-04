// client/src/lib/axios.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 300000, // 5 minutes for large file uploads
});

// Request interceptor - Add auth token and handle FormData
api.interceptors.request.use(
  async (config) => {
    try {
      // ✅ FIX: Kiểm tra Clerk đã load và có session
      if (window.Clerk && window.Clerk.session) {
        try {
          const token = await window.Clerk.session.getToken();

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("✅ Clerk token attached");
          }
        } catch (tokenError) {
          // Token fetch failed - không phải lỗi nghiêm trọng
          console.log(
            "ℹ️ Could not fetch token (public route or not signed in)"
          );
        }
      } else {
        // Clerk chưa init hoặc không có session - route public
        console.log("ℹ️ Clerk not initialized (public route)");
      }

      // Handle FormData - Remove Content-Type to let axios set boundary
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
        console.log(
          "✅ FormData detected - Content-Type removed for multipart"
        );
      } else {
        // Set Content-Type for JSON requests
        config.headers["Content-Type"] = "application/json";
      }

      console.log("📤 Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        isFormData: config.data instanceof FormData,
        contentType: config.headers["Content-Type"],
        hasAuth: !!config.headers.Authorization,
      });

      return config;
    } catch (error) {
      console.error("❌ Request interceptor error:", error);
      return config; // ✅ Return config even if token fetch fails
    }
  },
  (error) => {
    console.error("❌ Request setup error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", {
      status: response.status,
      url: response.config.url,
      hasData: !!response.data,
    });

    // Return full response object
    return response;
  },
  (error) => {
    // Handle common errors
    const message =
      error.response?.data?.message || error.message || "Something went wrong";

    // Log error for debugging
    console.error("❌ API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message,
      data: error.response?.data,
    });

    // Handle specific error codes
    if (error.response?.status === 401) {
      console.error("🔒 Unauthorized - Please login again");
      // Optionally redirect to login or show auth modal
    }

    if (error.response?.status === 413) {
      console.error("📦 Payload too large - File may be too big");
    }

    return Promise.reject(error);
  }
);

export default api;

// Export API_URL for direct use
export { API_URL };
