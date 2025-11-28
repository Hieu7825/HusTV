// client/src/pages/admin/AddPlans.jsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Star,
  Search,
  X,
  CreditCard,
  Crown,
  CheckCircle,
  Sparkles,
  Info,
  Users,
} from "lucide-react";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import AddNewPlan from "../../components/admin/AddNewPlan";
import PlanDetailsModal from "../../components/admin/PlanDetailsModal";
import Loading from "../../components/Loading";
import { subscriptionService } from "../../services";
import toast from "react-hot-toast";

const AddPlans = () => {
  const [plans, setPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch plans from API
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await subscriptionService.getAllPlans();
      setPlans(response.data || []);
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      toast.error("Failed to load subscription plans");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter(
    (plan) =>
      plan.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    try {
      await subscriptionService.deletePlan(id);
      toast.success("Plan deleted successfully");
      // Refresh plans list
      fetchPlans();
    } catch (error) {
      console.error("Failed to delete plan:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to delete plan. It may have active subscriptions."
      );
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setShowAddModal(true);
  };

  const handleSavePlan = async (planData) => {
    try {
      if (editingPlan) {
        // Update existing plan
        await subscriptionService.createOrUpdatePlan(editingPlan._id, planData);
        toast.success("Plan updated successfully");
      } else {
        // Create new plan
        await subscriptionService.createOrUpdatePlan("new", planData);
        toast.success("Plan created successfully");
      }

      // Refresh plans list
      fetchPlans();
      setShowAddModal(false);
      setEditingPlan(null);
    } catch (error) {
      console.error("Failed to save plan:", error);
      toast.error(error.response?.data?.message || "Failed to save plan");
    }
  };

  const getPlanGradient = (tierRank) => {
    if (tierRank >= 5) return "from-red-600 via-red-800 to-red-950";
    if (tierRank >= 4) return "from-red-700 via-red-950 to-black";
    if (tierRank >= 3) return "from-rose-800 via-red-950 to-black";
    if (tierRank >= 2) return "from-red-900 via-black to-red-900";
    return "from-gray-800 via-gray-900 to-black";
  };

  const getPlanBorderColor = (tierRank) => {
    if (tierRank >= 5) return "border-red-500/70 hover:border-red-400";
    if (tierRank >= 4) return "border-red-600/70 hover:border-red-500";
    if (tierRank >= 3) return "border-rose-700/70 hover:border-rose-600";
    if (tierRank >= 2) return "border-red-800/70 hover:border-red-700";
    return "border-gray-700 hover:border-gray-600";
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <BlurCircle top="10%" left="10%" />
        <BlurCircle top="60%" left="70%" />
        <div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-red-700/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <Title text1="Manage" text2="Plans" />
            <p className="text-gray-400 text-lg mt-2 ml-1">
              Total:{" "}
              <span className="text-red-500 font-bold">{plans.length}</span>{" "}
              plans
              {searchTerm && (
                <span className="text-gray-500">
                  {" "}
                  • Showing{" "}
                  <span className="text-red-400 font-bold">
                    {filteredPlans.length}
                  </span>{" "}
                  results
                </span>
              )}
            </p>
          </div>

          {/* Add New Button */}
          <button
            onClick={() => {
              setEditingPlan(null);
              setShowAddModal(true);
            }}
            className="group relative px-6 py-3 bg-gradient-to-r from-red-600 via-red-700 to-red-800 rounded-xl font-bold text-white shadow-2xl shadow-red-600/40 hover:shadow-red-500/60 transition-all duration-300 hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>Add New Plan</span>
            </div>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8 relative">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative flex items-center bg-gradient-to-br from-zinc-950 via-black to-zinc-950 border-2 border-red-900/30 rounded-xl overflow-hidden group-hover:border-red-700/50 transition-all duration-300">
              <Search className="w-5 h-5 text-red-500 ml-4" />
              <input
                type="text"
                placeholder="Search plans by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-4 bg-transparent text-white placeholder-gray-500 focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mr-4 p-1 hover:bg-red-900/30 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan, index) => (
            <div
              key={plan._id}
              className={`group relative bg-gradient-to-br from-zinc-950 via-black to-zinc-950 rounded-2xl overflow-hidden border-2 ${getPlanBorderColor(
                plan.tierRank
              )} shadow-2xl hover:shadow-red-600/40 transition-all duration-500 hover:-translate-y-2`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Outer Glow */}
              <div className="absolute -inset-1 bg-gradient-to-br from-red-900/20 via-transparent to-red-900/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 rounded-2xl"></div>

              {/* Header with Gradient */}
              <div
                className={`relative h-48 bg-gradient-to-br ${getPlanGradient(
                  plan.tierRank
                )} p-6 flex flex-col justify-between overflow-hidden`}
              >
                {/* Background Pattern */}
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
                  <div className="flex items-center gap-2">
                    {plan.isPopular && (
                      <Crown className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)] animate-pulse" />
                    )}
                    <h3 className="text-2xl font-black text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] uppercase tracking-wider">
                      {plan.planName}
                    </h3>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(plan);
                      }}
                      className="p-2 bg-blue-600/90 hover:bg-blue-500 rounded-lg backdrop-blur-sm transition-colors shadow-lg hover:scale-110"
                      title="Edit Plan"
                    >
                      <Edit className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(plan._id);
                      }}
                      className="p-2 bg-red-600/90 hover:bg-red-500 rounded-lg backdrop-blur-sm transition-colors shadow-lg hover:scale-110"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Price Section */}
                <div className="relative z-10">
                  <p className="text-5xl font-black text-white drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                    ${plan.price}
                    <span className="text-lg font-bold text-gray-300 ml-2">
                      /{plan.duration}
                    </span>
                  </p>
                </div>

                {/* Decorative Line */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Description */}
                <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed min-h-[40px]">
                  {plan.description}
                </p>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-red-900/40 to-transparent"></div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <div>
                      <p className="text-gray-500 uppercase font-bold text-[10px]">
                        Tier
                      </p>
                      <p className="text-white font-semibold">
                        {plan.tierRank}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="text-gray-500 uppercase font-bold text-[10px]">
                        Devices
                      </p>
                      <p className="text-white font-semibold">
                        {plan.connectedDevices}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <p className="text-xs text-gray-500 font-black mb-2 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-red-500" />
                    Features
                  </p>
                  <div className="space-y-2">
                    {plan.features.slice(0, 3).map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-xs text-gray-300">{feature}</span>
                      </div>
                    ))}
                    {plan.features.length > 3 && (
                      <p className="text-xs text-red-400 font-semibold ml-5">
                        +{plan.features.length - 3} more features
                      </p>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-red-900/40 to-transparent"></div>

                {/* Status Badges */}
                <div className="flex gap-2 flex-wrap">
                  {plan.isPopular && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-950 to-black text-yellow-400 border border-yellow-600/50 rounded-full text-xs font-black uppercase">
                      <Crown className="w-3 h-3" />
                      Popular
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase border ${
                      plan.isActive
                        ? "bg-gradient-to-r from-green-950 to-black text-green-400 border-green-600/50"
                        : "bg-gradient-to-r from-red-950 to-black text-red-400 border-red-600/50"
                    }`}
                  >
                    {plan.isActive ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <X className="w-3 h-3" />
                    )}
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => setSelectedPlan(plan)}
                  className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-lg font-bold text-white shadow-lg shadow-red-600/30 hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Info className="w-4 h-4" />
                  View Details
                </button>
              </div>

              {/* Shimmer Effect */}
              <span className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-red-500/20 to-transparent group-hover:animate-[shimmer_2s_infinite]" />
              </span>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredPlans.length === 0 && (
          <div className="text-center py-20">
            <CreditCard className="w-20 h-20 text-red-900/50 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">
              No plans found
            </h3>
            <p className="text-gray-500">Try adjusting your search terms</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <AddNewPlan
          plan={editingPlan}
          onClose={() => {
            setShowAddModal(false);
            setEditingPlan(null);
          }}
          onSave={handleSavePlan}
        />
      )}

      {/* Detail Modal */}
      {selectedPlan && (
        <PlanDetailsModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
};

export default AddPlans;
