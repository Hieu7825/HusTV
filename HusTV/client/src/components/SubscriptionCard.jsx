//  client/src/components/SubscriptionCard.jsx
import React from "react";
import { CheckCircle, Star, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SubscriptionCard = ({
  planName = "Premium",
  price = "$29.99",
  description = "Enjoy unlimited access to premium movies and shows with the best streaming quality.",
  features = [
    "4K Ultra HD",
    "Unlimited Downloads",
    "Ad-Free Experience",
    "Multiple Devices",
    "Premium Support",
  ],
  isPopular = false,
  duration = "Monthly",
  tierRank = 1,
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative group ">
      {/* Animated border gradient */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-700 rounded-2xl opacity-0 group-hover:opacity-100 animate-pulse transition-all duration-500 blur-sm"></div>

      {/* Main card */}
      <div className="relative w-80 h-[600px] bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:-translate-y-2 hover:scale-105 hover:shadow-red-600/50 border border-red-600/30 hover:border-red-500">
        {/* Popular badge */}
        {isPopular && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="flex items-center gap-1 bg-gradient-to-r from-red-600 to-red-700 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg animate-bounce">
              <Crown className="w-3 h-3" />
              MOST POPULAR
            </div>
          </div>
        )}

        {/* Glowing effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-transparent to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Content */}
        <div className="relative p-8 pt-20 text-center h-full flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-wider group-hover:text-red-400 transition-colors duration-300">
                {planName}
              </h3>
              <div className="w-12 h-0.5 bg-gradient-to-r from-red-600 to-red-400 mx-auto"></div>
            </div>
            {/* Price */}
            <div className="mb-6">
              <div className="text-5xl font-extrabold text-white group-hover:scale-110 transition-transform duration-300 drop-shadow-2xl">
                ${price}
              </div>
              <p className="text-gray-400 text-sm mt-1">
                per {duration.toLowerCase()}
              </p>
            </div>
            {/* Description */}
            <p className="text-gray-300 text-sm mb-8 leading-relaxed">
              {description}
            </p>
            {/* Features */}
            <div className="mb-8 space-y-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-sm text-gray-300 group-hover:text-white transition-colors duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CheckCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          {/* CTA Button */}
          <div className="mt-auto">
            <button
              onClick={() => {
                scrollTo(0, 0), navigate("/my-subscriptions");
              }}
              className="relative cursor-pointer w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/50 border border-red-500/50 group-hover:border-red-400"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Star className="w-4 h-4" />
                View
              </span>

              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-400/30 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
      </div>
    </div>
  );
};

export default SubscriptionCard;
