// ============================================
// client/src/components/SubscriptionPlans.jsx
// ============================================
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BlurCircle from "./BlurCircle";
import SubscriptionCard from "./SubscriptionCard";
import { subscriptionService } from "../services";
import { ArrowRight, Crown, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await subscriptionService.getAllPlans();

        console.log("📥 API Response:", response);

        // ✅ Extract plans from response.data
        let plansData = [];

        if (response?.data?.plans) {
          // Case: { data: { plans: [...] } }
          plansData = response.data.plans;
        } else if (response?.data) {
          // Case: { data: [...] }
          plansData = response.data;
        } else if (response?.plans) {
          // Case: { plans: [...] }
          plansData = response.plans;
        } else if (Array.isArray(response)) {
          // Case: [...]
          plansData = response;
        }

        console.log("✅ Extracted plans:", plansData);

        // Filter active plans only
        const activePlans = plansData.filter((plan) => plan.isActive === true);

        // Sort by tierRank
        const sortedPlans = activePlans.sort((a, b) => a.tierRank - b.tierRank);

        setPlans(sortedPlans);

        if (sortedPlans.length === 0) {
          console.warn("⚠️ No active plans found");
        }
      } catch (error) {
        console.error("❌ Failed to fetch plans:", error);
        toast.error("Failed to load subscription plans");
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  // // Don't render section if no plans
  // if (plans.length === 0) {
  //   return null;
  // }

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden">
      <div className="relative flex items-center justify-between mb-16">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Crown className="w-6 h-6 text-red-500 animate-pulse" />
            <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <div className="relative">
            <h2 className="gradient text-2xl md:text-3xl font-bold tracking-wide uppercase letter-spacing-2 transform hover:scale-105 transition-all duration-300">
              🎬 Subscription Plans
            </h2>
            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-red-600 via-red-500 to-transparent animate-pulse"></div>
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce delay-75"></div>
            <div className="w-2 h-2 bg-red-300 rounded-full animate-bounce delay-150"></div>
          </div>
        </div>

        <button
          onClick={() => navigate("/my-subscriptions")}
          className="group flex items-center gap-2 px-4 py-2 text-sm text-gray-300 cursor-pointer hover:text-red-400 transition-all duration-300 border border-transparent hover:border-red-500/50 rounded-lg backdrop-blur-sm hover:bg-red-900/20"
        >
          <span className="group-hover:animate-pulse">View All</span>
          <ArrowRight className="group-hover:translate-x-1 group-hover:text-red-400 transition-all duration-300 w-4.5 h-4.5" />
        </button>
      </div>

      <div className="text-center mb-10">
        <p className="text-gray-300 font-medium text-lg max-w-[960px] mx-auto">
          Choose the perfect plan for your movie streaming experience
        </p>
      </div>

      <div className="relative">
        <BlurCircle top="-100px" right="-100px" />
        <BlurCircle top="300px" left="-150px" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16 lg:gap-20 justify-items-center">
          {plans.map((plan, index) => (
            <div
              key={plan._id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <SubscriptionCard
                planName={plan.planName}
                price={plan.price}
                description={plan.description}
                features={plan.features || []}
                isPopular={plan.isPopular}
                duration={plan.duration}
                tierRank={plan.tierRank}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-16">
        <p className="text-gray-400 text-sm mb-6">
          All plans come with a 7-day free trial • Cancel anytime • No hidden
          fees
        </p>
        <div className="flex justify-center gap-4 text-xs text-gray-500 mb-8">
          <span>✓ Instant Access</span>
          <span>✓ HD/4K Streaming</span>
          <span>✓ Mobile & TV Apps</span>
        </div>

        <button
          onClick={() => {
            navigate("/my-subscriptions");
            scrollTo(0, 0);
          }}
          className="group relative px-12 py-4 text-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white transition-all duration-300 rounded-lg font-medium cursor-pointer shadow-lg hover:shadow-red-500/50 hover:scale-105 border border-red-500/50"
        >
          <span className="relative z-10">View All Plans</span>
          <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
