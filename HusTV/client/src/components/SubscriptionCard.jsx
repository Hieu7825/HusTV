// client/src/components/SubscriptionCard.jsx
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
    <div className="relative group h-full">
      {/* Animated border gradient */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 dark:from-red-600 dark:via-red-500 dark:to-red-700 rounded-2xl opacity-0 group-hover:opacity-100 animate-pulse transition-all duration-500 blur-sm"></div>

      {/* Main card */}
      <div
        className="relative w-80 min-h-[600px] h-full rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:-translate-y-2 hover:scale-105 flex flex-col border"
        style={{
          backgroundColor: "var(--color-bg-card)",
          borderColor: "var(--color-primary)",
          boxShadow: `0 20px 25px -5px ${getComputedStyle(document.documentElement).getPropertyValue("--color-shadow-dark")}`,
        }}
      >
        {/* Popular badge */}
        {isPopular && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-red-600 dark:to-red-700 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg animate-bounce">
              <Crown className="w-3 h-3" />
              MOST POPULAR
            </div>
          </div>
        )}

        {/* Glowing effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(to right, 
              var(--color-primary) 0%, 
              transparent 50%, 
              var(--color-primary) 100%)`,
          }}
        ></div>

        {/* Content */}
        <div className="relative p-8 pt-20 text-center flex-1 flex flex-col justify-between">
          <div className="flex-grow">
            <div className="mb-6">
              <h3
                className="text-2xl font-bold mb-2 uppercase tracking-wider transition-colors duration-300"
                style={{ color: "var(--color-text-primary)" }}
              >
                {planName}
              </h3>
              <div
                className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 dark:from-red-600 dark:to-red-400 mx-auto"
                style={{
                  background: `linear-gradient(to right, var(--color-primary), var(--btn-gradient-to))`,
                }}
              ></div>
            </div>
            {/* Price */}
            <div className="mb-6">
              <div
                className="text-5xl font-extrabold group-hover:scale-110 transition-transform duration-300 drop-shadow-2xl"
                style={{ color: "var(--color-text-primary)" }}
              >
                ${price}
              </div>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                per {duration.toLowerCase()}
              </p>
            </div>
            {/* Description */}
            <p
              className="text-sm mb-8 leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {description}
            </p>
            {/* Features */}
            <div className="mb-8 space-y-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-sm transition-colors duration-300"
                  style={{ color: "var(--color-text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--color-text-primary)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color =
                      "var(--color-text-secondary)")
                  }
                >
                  <CheckCircle
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "var(--color-primary)" }}
                  />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          {/* CTA Button */}
          <div className="mt-auto pt-4">
            <button
              onClick={() => {
                scrollTo(0, 0);
                navigate("/my-subscriptions");
              }}
              className="relative cursor-pointer w-full py-4 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border group-hover:border-opacity-80"
              style={{
                background: `linear-gradient(to right, var(--color-primary), var(--btn-gradient-to))`,
                borderColor: "var(--color-primary)",
                borderWidth: "1px",
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Star className="w-4 h-4" />
                View
              </span>

              {/* Button glow effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                style={{
                  background: `linear-gradient(to right, var(--color-primary) 0%, transparent 50%)`,
                }}
              ></div>
            </button>
          </div>
        </div>

        {/* Bottom accent */}
        <div
          className="absolute bottom-0 left-0 w-full h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
          style={{
            background: `linear-gradient(to right, var(--color-primary), var(--btn-gradient-to))`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default SubscriptionCard;
