import React from "react";
import BlurCircle from "./BlurCircle";
import SubscriptionCard from "./SubscriptionCard";

const SubscriptionPlans = () => {
  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden">
      {/* Title Section */}
      <div className="text-center mb-16">
        <h2 className="gradient text-3xl md:text-4xl font-bold text-white mb-4 uppercase tracking-wide">
          🎬 Subscription Plans
        </h2>
        <p className="text-gray-300 font-medium text-lg max-w-[960px] mx-auto">
          Choose the perfect plan for your movie streaming experience
        </p>
        <div className="w-24 h-0.5 bg-gradient-to-r from-red-600 to-red-400 mx-auto mt-4"></div>
      </div>

      {/* Cards Grid */}
      <div className="relative">
        <BlurCircle top="-100px" right="-100px" />
        <BlurCircle top="300px" left="-150px" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16 lg:gap-20 justify-items-center">
          <SubscriptionCard
            planName="Basic"
            price="$9.99"
            description="Perfect for casual viewers who want access to our movie library."
            features={[
              "HD Quality",
              "2 Devices",
              "Basic Support",
              "Ad-Supported",
            ]}
          />

          <SubscriptionCard
            planName="Premium"
            price="$19.99"
            description="Most popular plan with enhanced features for movie enthusiasts."
            features={[
              "4K Ultra HD",
              "5 Devices",
              "No Ads",
              "Download Content",
              "Priority Support",
            ]}
            isPopular={true}
          />

          <SubscriptionCard
            planName="Pro"
            price="$29.99"
            description="Ultimate experience with exclusive content and premium features."
            features={[
              "8K Quality",
              "Unlimited Devices",
              "Exclusive Content",
              "Early Access",
              "24/7 Premium Support",
            ]}
          />
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="text-center mt-16">
        <p className="text-gray-400 text-sm mb-6">
          All plans come with a 7-day free trial • Cancel anytime • No hidden
          fees
        </p>
        <div className="flex justify-center gap-4 text-xs text-gray-500">
          <span>✓ Instant Access</span>
          <span>✓ HD/4K Streaming</span>
          <span>✓ Mobile & TV Apps</span>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
