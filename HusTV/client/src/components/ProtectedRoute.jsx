// client/src/components/ProtectedRoute.jsx
import React, { useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";
import toast from "react-hot-toast";

const ProtectedRoute = ({ children, requireSubscription = false }) => {
  const { isLoaded, isSignedIn, user } = useUser();

  // ✅ FIX: Sử dụng useRef để tránh multiple toast
  const hasShownToast = useRef(false);

  // ✅ FIX: Sử dụng useEffect để show toast (không trong render)
  useEffect(() => {
    if (isLoaded && !isSignedIn && !hasShownToast.current) {
      toast.error("Please sign in to continue");
      hasShownToast.current = true;
    }
  }, [isLoaded, isSignedIn]);

  // ⏳ Đang load Clerk
  if (!isLoaded) {
    return <Loading />;
  }

  // 🚫 Chưa đăng nhập
  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  // 🔍 Check subscription nếu cần
  if (requireSubscription) {
    const hasActiveSubscription = user?.publicMetadata?.hasActiveSubscription;

    if (!hasActiveSubscription) {
      // ✅ Show toast trong useEffect để tránh setState in render
      if (!hasShownToast.current) {
        setTimeout(() => {
          toast.error("Please subscribe to watch videos");
        }, 0);
        hasShownToast.current = true;
      }

      return <Navigate to="/my-subscriptions" replace />;
    }
  }

  // ✅ Cho phép truy cập
  return <>{children}</>;
};

export default ProtectedRoute;
