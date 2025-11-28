// client/src/lib/axios.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 300000, // 5 minutes for large file uploads
  // ❌ KHÔNG set Content-Type mặc định!
});

// Request interceptor - Add auth token and handle FormData
api.interceptors.request.use(
  async (config) => {
    // Get token from Clerk
    const token = await window.Clerk?.session?.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ QUAN TRỌNG: Nếu data là FormData, XÓA Content-Type
    // Để axios tự động set với boundary parameter
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      console.log("✅ FormData detected - Content-Type removed for multipart");
    } else {
      // Chỉ set Content-Type cho non-FormData requests
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
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
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

    // ✅ Return full response object, NOT just response.data
    // videoService expects response.data.video
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
