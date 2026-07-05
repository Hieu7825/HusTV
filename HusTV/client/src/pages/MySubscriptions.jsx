// client/src/pages/MySubscriptions.jsx
import React, { useEffect, useState, useRef } from "react";
import { subscriptionService } from "../services/subscriptionService";
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";
import {
  CheckCircle,
  Crown,
  CreditCard,
  Check,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

const MySubscriptions = () => {
  const currency = import.meta.env.VITE_CURRENCY || "$";

  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserPlan, setCurrentUserPlan] = useState(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false); // ✅ NEW: Sync state

  const pollingIntervalRef = useRef(null);
  const maxPollingAttemptsRef = useRef(0);

  /**
   * Fetch all plans and current subscription
   */
  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);

      // Fetch all plans
      const plansResponse = await subscriptionService.getAllPlans();
      const plansData = plansResponse.data?.plans || plansResponse.data || [];

      let currentPlan = null;

      // Fetch current subscription
      try {
        const currentResponse =
          await subscriptionService.getCurrentSubscription();
        const currentSubscription = currentResponse?.data?.subscription;

        currentPlan = currentSubscription?.isPaid
          ? currentSubscription?.plan
          : null;
      } catch (subError) {
        currentPlan = null;
      }

      setCurrentUserPlan(currentPlan);

      // Sort plans: current plan first, then by tierRank
      const sortedPlans = [...plansData].sort((a, b) => {
        const aIsSubscribed = currentPlan && a._id === currentPlan._id;
        const bIsSubscribed = currentPlan && b._id === currentPlan._id;

        if (aIsSubscribed && !bIsSubscribed) return -1;
        if (!aIsSubscribed && bIsSubscribed) return 1;
        return a.tierRank - b.tierRank;
      });

      setPlans(sortedPlans);
    } catch (error) {
      console.error("❌ Failed to fetch subscriptions:", error);
      toast.error(
        error.response?.data?.message || "Failed to load subscription plans",
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * ✅ NEW: Handle manual sync to Clerk
   */
  const handleSyncToClerk = async () => {
    try {
      setIsSyncing(true);
      toast.loading("🔄 Syncing subscription to your profile...", {
        id: "sync-toast",
      });

      await subscriptionService.syncClerkMetadata();

      // Refresh data after sync
      await fetchSubscriptions();

      toast.success("✅ Subscription synced successfully!", {
        id: "sync-toast",
        duration: 4000,
      });

      console.log("✅ Manual sync completed");
    } catch (error) {
      console.error("❌ Failed to sync:", error);
      toast.error(
        error.response?.data?.message || "Failed to sync subscription",
        {
          id: "sync-toast",
          duration: 4000,
        },
      );
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Poll payment status until confirmed (max 20 attempts = ~20 seconds)
   */
  const pollPaymentStatus = async () => {
    const MAX_ATTEMPTS = 20;
    const POLL_INTERVAL = 1000;

    maxPollingAttemptsRef.current = 0;
    setIsVerifyingPayment(true);

    pollingIntervalRef.current = setInterval(async () => {
      try {
        maxPollingAttemptsRef.current += 1;

        console.log(
          `🔄 Polling payment status (attempt ${maxPollingAttemptsRef.current}/${MAX_ATTEMPTS})`,
        );

        const currentResponse =
          await subscriptionService.getCurrentSubscription();
        const currentSubscription = currentResponse?.data?.subscription;

        if (currentSubscription?.isPaid) {
          clearInterval(pollingIntervalRef.current);
          setIsVerifyingPayment(false);

          await fetchSubscriptions();

          toast.success(
            "✅ Payment successful! Your plan has been activated.",
            { duration: 5000 },
          );

          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );

          return;
        }

        if (maxPollingAttemptsRef.current >= MAX_ATTEMPTS) {
          clearInterval(pollingIntervalRef.current);
          setIsVerifyingPayment(false);

          toast.error(
            "Payment verification taking longer than expected. Please refresh the page.",
            { duration: 6000 },
          );

          await fetchSubscriptions();
        }
      } catch (error) {
        console.error("❌ Error polling payment status:", error);

        if (maxPollingAttemptsRef.current >= MAX_ATTEMPTS) {
          clearInterval(pollingIntervalRef.current);
          setIsVerifyingPayment(false);
        }
      }
    }, POLL_INTERVAL);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const cancelled = params.get("cancelled");

    if (sessionId) {
      console.log("💳 Payment session detected, starting verification...");
      pollPaymentStatus();
    } else {
      fetchSubscriptions();
    }

    if (cancelled) {
      toast.info("Payment cancelled. You can try again anytime.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  /**
   * Check if user is subscribed to this plan
   */
  const isSubscribed = (plan) => {
    return currentUserPlan && currentUserPlan._id === plan._id;
  };

  /**
   * Check if this plan is lower tier than current
   */
  const isLowerTier = (plan) => {
    if (!currentUserPlan) return false;
    return plan.tierRank < currentUserPlan.tierRank;
  };

  /**
   * Handle subscription purchase
   */
  const handleSubscribe = async (plan) => {
    if (isSubscribed(plan) || isLowerTier(plan)) return;

    try {
      toast.loading("Creating checkout session...");
      const response = await subscriptionService.createSubscription(plan._id);
      toast.dismiss();

      const paymentUrl = response.data?.url;

      if (paymentUrl) {
        toast.success("Redirecting to payment...");
        window.location.href = paymentUrl;
      } else {
        throw new Error("Payment link not received");
      }
    } catch (error) {
      toast.dismiss();
      console.error("❌ Failed to subscribe:", error);
      toast.error(
        error.response?.data?.message || "Failed to process subscription",
      );
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="relative px-4 sm:px-6 md:px-12 lg:px-24 xl:px-32 py-16 md:py-24 min-h-screen">
      <BlurCircle top="100px" right="0" />
      <BlurCircle bottom="0px" left="300px" />
      <BlurCircle top="150px" left="-80px" />
      <BlurCircle bottom="50px" right="50px" />

      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h1 className="gradient text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 uppercase tracking-tight">
          Subscription Plans
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 mx-auto mb-6"></div>
        <p className="text-gray-400 text-base md:text-lg">
          Choose the perfect plan for unlimited entertainment
        </p>

        {isVerifyingPayment && (
          <div className="mt-6 inline-flex items-center gap-3 bg-blue-500/10 text-blue-400 border border-blue-500/50 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            Verifying Payment...
          </div>
        )}

        {currentUserPlan && !isVerifyingPayment && (
          <div className="mt-6 space-y-3">
            {/* Current Plan Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider">
              <Check className="w-4 h-4" />
              Current Plan: {currentUserPlan.planName}
            </div>

            {/* ✅ NEW: Sync Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSyncToClerk}
                disabled={isSyncing}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 border ${
                  isSyncing
                    ? "bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed"
                    : "bg-blue-500/10 text-blue-400 border-blue-500/50 hover:bg-blue-500/20 hover:border-blue-400 cursor-pointer"
                }`}
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Sync to Profile
                  </>
                )}
              </button>
            </div>

            {/* Helper text */}
            <p className="text-gray-500 text-xs">
              💡 Click "Sync to Profile" if your subscription doesn't show in
              your account
            </p>
          </div>
        )}
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-4">
            No subscription plans available
          </p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const subscribed = isSubscribed(plan);
            const lowerTier = isLowerTier(plan);

            return (
              <div
                key={plan._id}
                className={`relative group ${subscribed ? "order-first" : ""}`}
              >
                <div
                  className={`absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-75 blur-xl transition-all duration-500 ${
                    subscribed
                      ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-700"
                      : "bg-gradient-to-r from-red-600 via-red-500 to-red-700"
                  }`}
                ></div>

                <div
                  className={`relative light:bg-gradient-to-br light:from-white light:via-gray-50 light:to-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-black rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-1 border ${
                    subscribed
                      ? "light:border-emerald-400 dark:border-emerald-500/50 light:group-hover:border-emerald-500 dark:group-hover:border-emerald-400"
                      : plan.isPopular
                        ? "light:border-red-400 dark:border-red-500/50 light:group-hover:border-red-500 dark:group-hover:border-red-400"
                        : "light:border-gray-300 dark:border-gray-800 light:group-hover:border-red-400 dark:group-hover:border-red-500/50"
                  }`}
                >
                  {(plan.isPopular || subscribed) && (
                    <div className="absolute top-0 right-0 z-10">
                      <div
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-bl-3xl rounded-tr-3xl text-xs font-bold text-white shadow-xl ${
                          subscribed
                            ? "bg-gradient-to-r from-emerald-600 to-emerald-700"
                            : "bg-gradient-to-r from-red-600 to-red-700"
                        }`}
                      >
                        {subscribed ? (
                          <>
                            <Check className="w-4 h-4" />
                            CURRENT PLAN
                          </>
                        ) : (
                          <>
                            <Crown className="w-4 h-4 text-yellow-300" />
                            MOST POPULAR
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="relative p-8 flex flex-col h-auto">
                    <div className="text-center mb-6 pt-4">
                      <h3
                        className={`text-3xl font-bold light:text-gray-900 dark:text-white mb-3 uppercase tracking-wide transition-colors duration-300 ${
                          subscribed
                            ? "light:text-emerald-600 dark:text-emerald-400"
                            : "light:group-hover:text-red-600 dark:group-hover:text-red-400"
                        }`}
                      >
                        {plan.planName}
                      </h3>
                      <p className="light:text-gray-600 dark:text-gray-400 text-sm leading-relaxed min-h-[44px] px-2">
                        {plan.description}
                      </p>
                    </div>

                    <div
                      className={`text-center mb-6 py-6 light:bg-white/30 dark:bg-black/40 backdrop-blur-sm rounded-2xl border transition-all ${
                        subscribed
                          ? "light:border-emerald-300 dark:border-emerald-800 light:group-hover:border-emerald-400 dark:group-hover:border-emerald-700"
                          : "light:border-gray-300 dark:border-gray-800 light:group-hover:border-gray-400 dark:group-hover:border-gray-700"
                      }`}
                    >
                      <div className="flex items-baseline justify-center gap-1 mb-2">
                        <span
                          className={`text-2xl font-semibold ${
                            subscribed
                              ? "light:text-emerald-600 dark:text-emerald-500"
                              : "light:text-gray-600 dark:text-gray-500"
                          }`}
                        >
                          {currency}
                        </span>
                        <span
                          className={`text-6xl font-extrabold transition-transform duration-300 ${
                            subscribed
                              ? "light:text-emerald-600 dark:text-emerald-400 group-hover:scale-105"
                              : "light:text-gray-900 dark:text-white group-hover:scale-105"
                          }`}
                        >
                          {plan.price}
                        </span>
                      </div>

                      <p
                        className={`text-sm font-medium uppercase tracking-wider ${
                          subscribed
                            ? "light:text-emerald-700 dark:text-emerald-600"
                            : "light:text-gray-600 dark:text-gray-500"
                        }`}
                      >
                        per {plan.duration === "Monthly" ? "month" : "year"}
                      </p>
                    </div>

                    <div className="mb-6 flex-grow">
                      <div className="flex items-center gap-2 text-xs light:text-gray-600 dark:text-gray-500 uppercase tracking-wider font-bold mb-4 px-1">
                        <div
                          className={`w-1 h-4 rounded-full ${
                            subscribed
                              ? "bg-emerald-600 light:bg-emerald-500"
                              : "bg-red-600 light:bg-red-500"
                          }`}
                        ></div>
                        <span>Features</span>
                      </div>
                      <div className="space-y-3">
                        {plan.features?.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 text-sm light:text-gray-700 dark:text-gray-300 light:hover:text-gray-900 dark:hover:text-white transition-colors group/feature"
                          >
                            <CheckCircle
                              className={`w-5 h-5 flex-shrink-0 mt-0.5 group-hover/feature:scale-110 transition-transform ${
                                subscribed
                                  ? "light:text-emerald-600 dark:text-emerald-500"
                                  : "light:text-red-600 dark:text-red-500"
                              }`}
                            />
                            <span className="leading-relaxed">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto pt-6 light:border-t light:border-gray-300 dark:border-t dark:border-gray-800">
                      <button
                        disabled={subscribed || lowerTier}
                        onClick={() => handleSubscribe(plan)}
                        className={`relative w-full py-4 font-bold text-sm uppercase tracking-wider rounded-xl transition-all duration-300 transform overflow-hidden border ${
                          subscribed
                            ? "light:text-white dark:text-white light:bg-emerald-600 dark:bg-emerald-600 light:hover:bg-emerald-700 dark:hover:bg-emerald-700 light:border-emerald-500/50 dark:border-emerald-500/50 cursor-default"
                            : lowerTier
                              ? "light:text-gray-700 dark:text-gray-400 light:bg-gray-300 dark:bg-gray-700 light:hover:bg-gray-400 dark:hover:bg-gray-600 light:border-gray-400/50 dark:border-gray-600/50 cursor-not-allowed"
                              : "light:text-white dark:text-white light:bg-gradient-to-r light:from-red-600 light:to-red-700 dark:bg-gradient-to-r dark:from-red-600 dark:to-red-700 light:hover:from-red-500 light:hover:to-red-600 dark:hover:from-red-500 dark:hover:to-red-600 light:border-red-500/50 dark:border-red-500/50 light:hover:shadow-red-400/30 dark:hover:shadow-red-500/50 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
                        }`}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {subscribed ? (
                            <>
                              <Check className="w-4 h-4" />
                              SUBSCRIBED
                            </>
                          ) : lowerTier ? (
                            <>
                              <X className="w-4 h-4" />
                              LOWER TIER
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4" />
                              UPGRADE NOW
                            </>
                          )}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div
                    className={`absolute bottom-0 left-0 w-full h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ${
                      subscribed
                        ? "bg-gradient-to-r from-transparent via-emerald-600 to-transparent"
                        : "bg-gradient-to-r from-transparent via-red-600 to-transparent"
                    }`}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-center mt-16 max-w-2xl mx-auto">
        <p className="text-gray-400 text-sm mb-6">
          All plans include 7-day free trial • Cancel anytime • No hidden fees
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
          <span>✓ Instant Access</span>
          <span>✓ HD/4K Streaming</span>
          <span>✓ Mobile & TV Apps</span>
          <span>✓ Secure Payment</span>
        </div>
      </div>
    </div>
  );
};

export default MySubscriptions;
