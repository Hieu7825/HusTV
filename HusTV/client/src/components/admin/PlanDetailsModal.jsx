import React from "react";
import { X, Star, Sparkles, CheckCircle, Crown } from "lucide-react";

const PlanDetailsModal = ({ plan, onClose }) => {
  if (!plan) return null;

  const getPlanGradient = (tierRank) => {
    if (tierRank >= 5) return "from-red-600 via-red-800 to-red-950";
    if (tierRank >= 4) return "from-red-700 via-red-950 to-black";
    if (tierRank >= 3) return "from-rose-800 via-red-950 to-black";
    if (tierRank >= 2) return "from-red-900 via-black to-red-900";
    return "from-gray-800 via-gray-900 to-black";
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-zinc-950 via-black to-zinc-950 border-2 border-red-900/50 rounded-2xl max-w-3xl w-full shadow-2xl shadow-red-900/50 my-8">
        {/* Header */}
        <div
          className={`relative h-48 bg-gradient-to-br ${getPlanGradient(
            plan.tierRank
          )} p-8 rounded-t-2xl overflow-hidden`}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(239,68,68,0.4),transparent)]" />
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/80 hover:bg-red-600 rounded-lg transition-colors z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              {plan.isPopular && (
                <Crown className="w-8 h-8 text-yellow-400 animate-pulse" />
              )}
              <h2 className="text-5xl font-black text-white">
                {plan.planName}
              </h2>
            </div>
            <p className="text-gray-300 text-lg mb-4">{plan.description}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black text-white">
                ${plan.price}
              </span>
              <span className="text-xl text-gray-300">/{plan.duration}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-black/30 rounded-lg border border-red-900/30">
              <p className="text-gray-500 text-xs uppercase mb-1">Tier Rank</p>
              <p className="text-white font-bold text-2xl flex items-center justify-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                {plan.tierRank}
              </p>
            </div>

            <div className="text-center p-4 bg-black/30 rounded-lg border border-red-900/30">
              <p className="text-gray-500 text-xs uppercase mb-1">Devices</p>
              <p className="text-white font-bold text-2xl">
                {plan.connectedDevices}
              </p>
            </div>

            <div className="text-center p-4 bg-black/30 rounded-lg border border-red-900/30">
              <p className="text-gray-500 text-xs uppercase mb-1">Status</p>
              <p
                className={`text-xl font-bold ${
                  plan.isActive ? "text-green-400" : "text-red-400"
                }`}
              >
                {plan.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Features
            </h3>
            <div className="space-y-3">
              {plan.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-red-900/30"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-white">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="flex gap-3 pt-4">
            {plan.isPopular && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-950 to-black text-yellow-400 border-2 border-yellow-600/50 rounded-full text-sm font-black uppercase">
                <Crown className="w-4 h-4" />
                Most Popular
              </span>
            )}
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black uppercase border-2 ${
                plan.isActive
                  ? "bg-gradient-to-r from-green-950 to-black text-green-400 border-green-600/50"
                  : "bg-gradient-to-r from-red-950 to-black text-red-400 border-red-600/50"
              }`}
            >
              {plan.isActive ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
              {plan.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDetailsModal;
