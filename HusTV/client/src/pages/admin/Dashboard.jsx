// client/src/pages/admin/DashBoard.jsx
import React, { useEffect, useState } from "react";
import { dummyDashboardData } from "../../assets/assets";
import {
  TrendingUpIcon,
  CircleDollarSignIcon,
  CreditCardIcon,
  UsersIcon,
  CalendarIcon,
  CheckCircle2Icon,
  XCircleIcon,
  Crown,
  Sparkles,
  Flame,
} from "lucide-react";
import Loading from "../../components/Loading";
import BlurCircle from "../../components/BlurCircle";
import { dateFormat } from "../../lib/dateFormat";
import Title from "../../components/admin/Title";

const DashBoard = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const [dashboardData, setDashboardData] = useState({
    totalSubscriptions: 0,
    totalRevenue: 0,
    activeSubscriptions: [],
    totalUsers: 0,
  });

  const [loading, setLoading] = useState(true);

  const dashboardCards = [
    {
      title: "Total Subscriptions",
      value: dashboardData.totalSubscriptions || "0",
      icon: TrendingUpIcon,
      gradient: "from-red-600 via-red-500 to-rose-600",
      borderColor: "border-red-600/50 hover:border-red-500",
      shadowColor: "shadow-red-600/30 hover:shadow-red-500/50",
      iconColor: "text-red-500",
      bgGlow: "bg-red-600/5",
    },
    {
      title: "Total Revenue",
      value: `${currency}${dashboardData.totalRevenue || "0"}`,
      icon: CircleDollarSignIcon,
      gradient: "from-rose-600 via-red-600 to-pink-600",
      borderColor: "border-rose-600/50 hover:border-rose-500",
      shadowColor: "shadow-rose-600/30 hover:shadow-rose-500/50",
      iconColor: "text-rose-500",
      bgGlow: "bg-rose-600/5",
    },
    {
      title: "Active Plans",
      value:
        dashboardData.activeSubscriptions.filter((s) => s.status === "active")
          .length || "0",
      icon: CreditCardIcon,
      gradient: "from-red-700 via-red-600 to-red-500",
      borderColor: "border-red-700/50 hover:border-red-600",
      shadowColor: "shadow-red-700/30 hover:shadow-red-600/50",
      iconColor: "text-red-600",
      bgGlow: "bg-red-700/5",
    },
    {
      title: "Total Users",
      value: dashboardData.totalUsers || "0",
      icon: UsersIcon,
      gradient: "from-pink-600 via-red-500 to-rose-500",
      borderColor: "border-pink-600/50 hover:border-pink-500",
      shadowColor: "shadow-pink-600/30 hover:shadow-pink-500/50",
      iconColor: "text-pink-500",
      bgGlow: "bg-pink-600/5",
    },
  ];

  const fetchDashboardData = async () => {
    setDashboardData(dummyDashboardData);
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getPlanBorderColor = (planName) => {
    const colors = {
      Basic: "border-gray-700 hover:border-gray-600",
      Standard: "border-red-900/70 hover:border-red-800",
      Advanced: "border-red-800/70 hover:border-red-700",
      Premium: "border-rose-700/70 hover:border-rose-600",
      Pro: "border-red-600/70 hover:border-red-500",
      Ultra: "border-red-500/70 hover:border-red-400",
    };
    return colors[planName] || "border-gray-700 hover:border-gray-600";
  };

  const getPlanShadowColor = (planName) => {
    const colors = {
      Basic: "shadow-gray-700/30 hover:shadow-gray-600/50",
      Standard: "shadow-red-900/30 hover:shadow-red-800/50",
      Advanced: "shadow-red-800/40 hover:shadow-red-700/60",
      Premium: "shadow-rose-700/40 hover:shadow-rose-600/60",
      Pro: "shadow-red-600/50 hover:shadow-red-500/70",
      Ultra: "shadow-red-500/60 hover:shadow-red-400/80",
    };
    return colors[planName] || "shadow-gray-700/30 hover:shadow-gray-600/50";
  };

  const getPlanGradient = (planName) => {
    const gradients = {
      Basic: "from-gray-800 via-gray-900 to-black",
      Standard: "from-red-950 via-black to-red-950",
      Advanced: "from-red-900 via-black to-red-900",
      Premium: "from-rose-800 via-red-950 to-black",
      Pro: "from-red-700 via-red-950 to-black",
      Ultra: "from-red-600 via-red-800 to-red-950",
    };
    return gradients[planName] || "from-gray-800 via-gray-900 to-black";
  };

  return !loading ? (
    <>
      <Title text1="Admin" text2="Dashboard" />

      {/* Stats Cards */}
      <div className="relative flex flex-wrap gap-5 mt-8">
        <BlurCircle top="-100px" left="0" />
        <div className="flex flex-wrap gap-5 w-full">
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              className={`group relative flex items-center justify-between 
                px-6 py-5 
                bg-gradient-to-br from-zinc-950 via-black to-zinc-950
                border-2 ${card.borderColor} rounded-2xl 
                max-w-xs w-full
                shadow-2xl ${card.shadowColor}
                transition-all duration-500 hover:-translate-y-2 hover:scale-105
                overflow-hidden cursor-pointer`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Glow Background */}
              <div
                className={`absolute inset-0 ${card.bgGlow} opacity-50 group-hover:opacity-70 transition-opacity duration-500`}
              ></div>

              {/* Diagonal Light Streak */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
              ></div>

              {/* Content */}
              <div className="relative z-10">
                <h1 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1 group-hover:text-gray-400 transition-colors">
                  {card.title}
                </h1>
                <p className="text-4xl font-black mt-2 text-white drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                  {card.value}
                </p>
              </div>

              {/* Icon with Glow */}
              <div className="relative">
                <div
                  className={`absolute inset-0 blur-xl ${card.iconColor} opacity-30 group-hover:opacity-50 transition-opacity`}
                ></div>
                <card.icon
                  className={`w-14 h-14 ${card.iconColor} drop-shadow-[0_0_15px_rgba(239,68,68,0.7)] 
                    group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative z-10`}
                />
              </div>

              {/* Animated Border Shine */}
              <span className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
                <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-red-500/30 to-transparent group-hover:animate-[shimmer_2s_infinite]" />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Subscriptions Section */}
      <div className="mt-16">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-red-600 blur-xl opacity-50"></div>
              <CreditCardIcon className="w-8 h-8 text-red-500 relative z-10 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
              <Flame className="w-4 h-4 text-rose-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">
                Active Subscriptions
              </h2>
              <div className="h-1 w-40 bg-gradient-to-r from-red-600 via-rose-600 to-transparent mt-2 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            </div>
          </div>

          {/* Status Badge */}
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-red-600 blur-lg opacity-40 group-hover:opacity-60 transition-opacity rounded-full"></div>
            <span className="relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-black via-red-950 to-black border-2 border-red-600/50 rounded-full text-sm font-black shadow-2xl shadow-red-600/40 backdrop-blur-sm hover:border-red-500 hover:shadow-red-500/50 transition-all duration-300">
              <Crown className="w-5 h-5 text-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <span className="text-white">
                {
                  dashboardData.activeSubscriptions.filter(
                    (s) => s.status === "active"
                  ).length
                }
              </span>
              <span className="text-red-500">Active</span>
            </span>
          </div>
        </div>

        {/* Subscriptions Grid */}
        <div className="relative flex flex-wrap gap-8 mt-8">
          <BlurCircle top="100px" left="-10%" />
          {dashboardData.activeSubscriptions
            .slice(0, 6)
            .map((subscription, index) => (
              <div
                key={subscription._id}
                className={`group relative w-80 rounded-2xl overflow-hidden 
                bg-gradient-to-br from-zinc-950 via-black to-zinc-950
                border-3 ${getPlanBorderColor(subscription.plan.planName)}
                shadow-2xl ${getPlanShadowColor(subscription.plan.planName)}
                hover:-translate-y-3 hover:scale-105
                transition-all duration-500 cursor-pointer`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Outer Glow */}
                <div
                  className={`absolute -inset-1 bg-gradient-to-br ${getPlanGradient(
                    subscription.plan.planName
                  )} opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-500 rounded-2xl`}
                ></div>

                {/* Header Section with Plan Gradient */}
                <div
                  className={`relative h-40 bg-gradient-to-br ${getPlanGradient(
                    subscription.plan.planName
                  )} p-6 flex flex-col justify-between overflow-hidden border-b-2 border-red-900/30`}
                >
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(239,68,68,0.4),transparent)]" />
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(239,68,68,0.1) 10px, rgba(239,68,68,0.1) 20px)",
                      }}
                    ></div>
                  </div>

                  {/* Top Section */}
                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {subscription.plan.tierRank >= 3 && (
                          <Crown className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)] animate-pulse" />
                        )}
                        <h3 className="text-2xl font-black text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] uppercase tracking-wider">
                          {subscription.plan.planName}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-2 drop-shadow-md">
                        {subscription.plan.description}
                      </p>
                    </div>

                    {/* Status Icon with Glow */}
                    <div className="relative">
                      {subscription.status === "active" ? (
                        <>
                          <div className="absolute inset-0 bg-green-500 blur-md opacity-50"></div>
                          <CheckCircle2Icon className="w-8 h-8 text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] relative z-10" />
                        </>
                      ) : (
                        <XCircleIcon className="w-8 h-8 text-red-400/70" />
                      )}
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="relative z-10">
                    <p className="text-5xl font-black text-white drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                      {currency}
                      {subscription.pricePaid}
                      <span className="text-lg font-bold text-gray-300 ml-2">
                        /mo
                      </span>
                    </p>
                  </div>

                  {/* Decorative Shine Line */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                </div>

                {/* Content Section */}
                <div className="relative p-6 space-y-5 bg-gradient-to-b from-black/50 to-black/80">
                  {/* Features Pills */}
                  <div>
                    <p className="text-xs text-gray-500 font-black mb-3 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-red-500" />
                      Features
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {subscription.plan.features
                        .slice(0, 3)
                        .map((feature, i) => (
                          <span
                            key={i}
                            className="px-3 py-2 bg-red-950/30 border border-red-900/40 rounded-lg text-xs font-semibold text-gray-300 hover:border-red-700/60 hover:bg-red-900/20 transition-all duration-300 cursor-default shadow-inner"
                          >
                            {feature}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-red-900/40 to-transparent" />

                  {/* Date Information */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-bold flex items-center gap-2 uppercase tracking-wide">
                        <CalendarIcon className="w-4 h-4 text-red-600" />
                        Purchased
                      </span>
                      <span className="text-xs text-gray-300 font-bold">
                        {dateFormat(subscription.purchaseDate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-bold flex items-center gap-2 uppercase tracking-wide">
                        <CalendarIcon className="w-4 h-4 text-red-600" />
                        Expires
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          subscription.status === "active"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {dateFormat(subscription.expiryDate)}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="pt-3">
                    <span
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border-2 shadow-xl ${
                        subscription.status === "active"
                          ? "bg-gradient-to-r from-green-950 to-black text-green-400 border-green-600/50 shadow-green-600/30"
                          : "bg-gradient-to-r from-red-950 to-black text-red-400 border-red-600/50 shadow-red-600/30"
                      }`}
                    >
                      {subscription.status === "active" ? (
                        <CheckCircle2Icon className="w-4 h-4" />
                      ) : (
                        <XCircleIcon className="w-4 h-4" />
                      )}
                      {subscription.status}
                    </span>
                  </div>
                </div>

                {/* Hover shimmer effect */}
                <span className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                  <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-red-500/20 to-transparent group-hover:animate-[shimmer_2s_infinite]" />
                </span>
              </div>
            ))}
        </div>
      </div>
    </>
  ) : (
    <Loading />
  );
};

export default DashBoard;
