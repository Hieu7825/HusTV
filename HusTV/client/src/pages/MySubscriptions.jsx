// client/src/pages/MySubscriptions.jsx
import React, { useEffect, useState } from "react";
import { dummySubscriptionPlansData } from "../assets/assets";
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";
import {
  CheckCircle,
  Star,
  Crown,
  CreditCard,
  Check,
  TrendingUp,
} from "lucide-react";

const MySubscriptions = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserPlan, setCurrentUserPlan] = useState(null);

  const getUserSubscriptions = async () => {
    // Giả sử user đã đăng ký gói "Basic" (có thể lấy từ API)
    const userCurrentPlan = "Premium";

    const currentPlan = dummySubscriptionPlansData.find(
      (plan) => plan.planName === userCurrentPlan
    );

    setCurrentUserPlan(currentPlan);

    // Sắp xếp plans: chưa mua trước, đã mua sau cùng
    const sortedPlans = [...dummySubscriptionPlansData].sort((a, b) => {
      const aIsSubscribed = a.planName === userCurrentPlan;
      const bIsSubscribed = b.planName === userCurrentPlan;

      if (aIsSubscribed && !bIsSubscribed) return 1;
      if (!aIsSubscribed && bIsSubscribed) return -1;
      return a.tierRank - b.tierRank;
    });

    setPlans(sortedPlans);
    setIsLoading(false);
  };

  // Tính giá nâng cấp
  const getUpgradePrice = (plan) => {
    if (!currentUserPlan) return plan.price;

    if (currentUserPlan.planName === plan.planName) {
      return 0;
    }

    if (plan.tierRank <= currentUserPlan.tierRank) {
      return 0;
    }

    const upgradePrice = plan.price - currentUserPlan.price;
    return upgradePrice > 0 ? upgradePrice : 0;
  };

  const isSubscribed = (plan) => {
    return currentUserPlan && currentUserPlan.planName === plan.planName;
  };

  const canUpgrade = (plan) => {
    if (!currentUserPlan) return true;
    return plan.tierRank > currentUserPlan.tierRank;
  };

  const isLowerTier = (plan) => {
    if (!currentUserPlan) return false;
    return plan.tierRank < currentUserPlan.tierRank;
  };

  const getButtonText = (plan) => {
    if (isSubscribed(plan)) return "Current Plan";
    if (isLowerTier(plan)) return "Downgrade";
    if (canUpgrade(plan)) return "Upgrade Now";
    return "Subscribe";
  };

  const getButtonStyle = (plan) => {
    if (isSubscribed(plan)) {
      return "bg-emerald-600 hover:bg-emerald-700 border-emerald-500/50 cursor-default";
    }
    if (isLowerTier(plan)) {
      return "bg-gray-700 hover:bg-gray-600 border-gray-600/50 cursor-default";
    }
    return "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border-red-500/50";
  };

  useEffect(() => {
    getUserSubscriptions();
  }, []);

  return !isLoading ? (
    <div className="relative px-4 sm:px-6 md:px-12 lg:px-24 xl:px-32 py-16 md:py-24 min-h-screen ">
      <BlurCircle top="100px" right="0" />
      <BlurCircle bottom="0px" left="300px" />
      <BlurCircle top="150px" left="-80px" />
      <BlurCircle bottom="50px" right="50px" />

      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h1 className="gradient text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 uppercase tracking-tight">
          All Subscription Plans
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 mx-auto mb-6"></div>
        <p className="text-gray-400 text-base md:text-lg">
          Choose your perfect plan or upgrade to unlock more features
        </p>
        {currentUserPlan && (
          <div className="mt-6 inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider">
            <Check className="w-4 h-4" />
            Currently on {currentUserPlan.planName} Plan
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const upgradePrice = getUpgradePrice(plan);
          const subscribed = isSubscribed(plan);
          const lowerTier = isLowerTier(plan);

          return (
            <div
              key={plan._id}
              className={`relative group ${subscribed ? "order-last" : ""}`}
            >
              <div
                className={`absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-75 blur-xl transition-all duration-500 ${
                  subscribed
                    ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-700"
                    : "bg-gradient-to-r from-red-600 via-red-500 to-red-700"
                }`}
              ></div>

              <div
                className={`relative bg-gradient-to-br from-gray-900 via-gray-900 to-black rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-1 border ${
                  subscribed
                    ? "border-emerald-500/50 group-hover:border-emerald-400"
                    : plan.isPopular
                    ? "border-red-500/50 group-hover:border-red-400"
                    : "border-gray-800 group-hover:border-red-500/50"
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
                          YOUR PLAN
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

                <div className="relative p-8 flex flex-col h-[110vh]">
                  <div className="text-center mb-6 pt-4">
                    <h3
                      className={`text-3xl font-bold text-white mb-3 uppercase tracking-wide transition-colors duration-300 ${
                        subscribed
                          ? "text-emerald-400"
                          : "group-hover:text-red-400"
                      }`}
                    >
                      {plan.planName}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed min-h-[44px] px-2">
                      {plan.description}
                    </p>
                  </div>

                  <div
                    className={`text-center mb-6 py-6 bg-black/40 backdrop-blur-sm rounded-2xl border transition-all ${
                      subscribed
                        ? "border-emerald-800 group-hover:border-emerald-700"
                        : "border-gray-800 group-hover:border-gray-700"
                    }`}
                  >
                    {currentUserPlan &&
                      canUpgrade(plan) &&
                      upgradePrice < plan.price && (
                        <div className="flex items-baseline justify-center gap-1 mb-2 opacity-50">
                          <span className="text-lg text-gray-500 font-semibold line-through">
                            {currency}
                            {plan.price}
                          </span>
                        </div>
                      )}

                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span
                        className={`text-2xl font-semibold ${
                          subscribed ? "text-emerald-500" : "text-gray-500"
                        }`}
                      >
                        {currency}
                      </span>
                      <span
                        className={`text-6xl font-extrabold transition-transform duration-300 ${
                          subscribed
                            ? "text-emerald-400 group-hover:scale-105"
                            : "text-white group-hover:scale-105"
                        }`}
                      >
                        {subscribed
                          ? plan.price
                          : canUpgrade(plan) && upgradePrice < plan.price
                          ? upgradePrice.toFixed(2)
                          : plan.price}
                      </span>
                    </div>

                    {currentUserPlan &&
                      canUpgrade(plan) &&
                      upgradePrice < plan.price && (
                        <div className="flex items-center justify-center gap-1 mb-2">
                          <TrendingUp className="w-4 h-4 text-red-400" />
                          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                            Save {currency}
                            {(plan.price - upgradePrice).toFixed(2)} on upgrade
                          </span>
                        </div>
                      )}

                    <p
                      className={`text-sm font-medium uppercase tracking-wider ${
                        subscribed ? "text-emerald-600" : "text-gray-500"
                      }`}
                    >
                      per {plan.duration}
                    </p>
                  </div>

                  <div className="mb-6 flex-grow">
                    <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider font-bold mb-4 px-1">
                      <div
                        className={`w-1 h-4 rounded-full ${
                          subscribed ? "bg-emerald-600" : "bg-red-600"
                        }`}
                      ></div>
                      <span>Plan Features</span>
                    </div>
                    <div className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 text-sm text-gray-300 hover:text-white transition-colors group/feature"
                        >
                          <CheckCircle
                            className={`w-5 h-5 flex-shrink-0 mt-0.5 group-hover/feature:scale-110 transition-transform ${
                              subscribed ? "text-emerald-500" : "text-red-500"
                            }`}
                          />
                          <span className="leading-relaxed">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-gray-800">
                    <button
                      disabled={subscribed}
                      className={`relative w-full py-4 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl overflow-hidden ${getButtonStyle(
                        plan
                      )} ${
                        subscribed
                          ? "hover:scale-100"
                          : lowerTier
                          ? "hover:scale-100"
                          : "hover:shadow-red-500/50 cursor-pointer"
                      }`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {subscribed ? (
                          <Check className="w-4 h-4" />
                        ) : lowerTier ? (
                          <TrendingUp className="w-4 h-4 rotate-180" />
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                        {getButtonText(plan)}
                      </span>
                      {!subscribed && !lowerTier && (
                        <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      )}
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

      <div className="text-center mt-16 max-w-2xl mx-auto">
        <p className="text-gray-400 text-sm mb-6">
          All plans come with a 7-day free trial • Cancel anytime • No hidden
          fees
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
          <span>✓ Instant Access</span>
          <span>✓ HD/4K Streaming</span>
          <span>✓ Mobile & TV Apps</span>
          <span>✓ Secure Payment</span>
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default MySubscriptions;
