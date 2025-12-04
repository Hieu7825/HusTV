// client/src/components/admin/ProtectedAdminRoute.jsx
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import Loading from "../Loading";
import toast from "react-hot-toast";
import { adminService } from "../../services";

const ProtectedAdminRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      // ⏳ Đợi Clerk load xong
      if (!isLoaded) {
        return;
      }

      // 🚫 Chưa đăng nhập
      if (!isSignedIn) {
        setIsChecking(false);
        return;
      }

      // 🔍 Call API để check admin role
      try {
        const response = await adminService.checkAdmin();

        // Backend trả về: { success: true, isAdmin: true }
        if (response.data?.success && response.data?.isAdmin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("❌ Admin check failed:", error);
        setIsAdmin(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminStatus();
  }, [isLoaded, isSignedIn]);

  // ⏳ Đang load Clerk hoặc đang check admin
  if (!isLoaded || isChecking) {
    return <Loading />;
  }

  // 🚫 Chưa đăng nhập
  if (!isSignedIn) {
    toast.error("Please sign in to access admin panel");
    return <Navigate to="/" replace />;
  }

  // 🚫 Không phải admin
  if (!isAdmin) {
    toast.error("Access denied. Admin only.");
    return <Navigate to="/" replace />;
  }

  // ✅ Là admin - cho phép truy cập
  return <>{children}</>;
};

export default ProtectedAdminRoute;
