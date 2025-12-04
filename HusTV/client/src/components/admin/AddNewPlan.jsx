// client/src/components/admin/AddNewPlan.jsx
import React, { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  Save,
  Plus,
  Trash2,
  DollarSign,
  FileText,
  Users,
  Sparkles,
  CheckCircle,
  Crown,
  Info,
  Loader2,
} from "lucide-react";

const AddNewPlan = ({ plan, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    _id: "",
    planName: "",
    price: 0,
    description: "",
    features: [],
    connectedDevices: 0,
    duration: "Monthly",
    isPopular: false,
    isActive: true, // Always true by default, hidden from UI
  });

  const [newFeature, setNewFeature] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (plan) {
      // Don't include tierRank when editing
      const { tierRank, ...planWithoutRank } = plan;
      setFormData(planWithoutRank);
    }
  }, [plan]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.planName.trim()) newErrors.planName = "Plan name is required";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (formData.features.length === 0)
      newErrors.features = "At least one feature is required";
    if (!formData.connectedDevices || formData.connectedDevices === 0)
      newErrors.connectedDevices = "Connected devices is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);

    const planData = {
      ...formData,
      _id: formData._id || `plan_${Date.now()}`,
      price: parseFloat(formData.price),
      connectedDevices:
        formData.connectedDevices === "Unlimited"
          ? "Unlimited"
          : parseInt(formData.connectedDevices),
      isActive: true, // Always set to true
    };

    try {
      await onSave(planData);
    } catch (error) {
      console.error("Error in AddNewPlan:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-zinc-950 via-black to-zinc-950 border-2 border-red-900/50 rounded-2xl max-w-3xl w-full shadow-2xl shadow-red-900/50 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-red-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/20 rounded-lg">
              <CreditCard className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">
                {plan ? "Edit Plan" : "Add New Plan"}
              </h2>
              <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Tier rank will be auto-calculated based on price
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-red-900/30 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-6 h-6 text-gray-400 group-hover:text-red-500" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar"
        >
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Basic Information
            </h3>

            {/* Plan Name */}
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">
                Plan Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="planName"
                value={formData.planName}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-3 bg-black/50 border-2 ${
                  errors.planName ? "border-red-500" : "border-red-900/30"
                } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder="e.g., Premium Plan"
              />
              {errors.planName && (
                <p className="text-red-500 text-xs mt-1">{errors.planName}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={isSubmitting}
                rows="3"
                className={`w-full px-4 py-3 bg-black/50 border-2 ${
                  errors.description ? "border-red-500" : "border-red-900/30"
                } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder="Describe what makes this plan special..."
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Pricing Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    step="0.01"
                    min="0"
                    className={`w-full pl-8 pr-4 py-3 bg-black/50 border-2 ${
                      errors.price ? "border-red-500" : "border-red-900/30"
                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="19.99"
                  />
                </div>
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  💡 Lower price = Lower tier rank
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">
                  Duration <span className="text-red-500">*</span>
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-black/50 border-2 border-red-900/30 rounded-lg text-white focus:outline-none focus:border-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  💡 Ranks are calculated separately for each duration
                </p>
              </div>
            </div>
          </div>

          {/* Device Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Device Settings
            </h3>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">
                Connected Devices <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="connectedDevices"
                value={formData.connectedDevices}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-3 bg-black/50 border-2 ${
                  errors.connectedDevices
                    ? "border-red-500"
                    : "border-red-900/30"
                } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder="e.g., 5 or Unlimited"
              />
              {errors.connectedDevices && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.connectedDevices}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Enter a number (e.g., 1, 2, 5) or type "Unlimited"
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Features <span className="text-red-500">*</span>
            </h3>

            {/* Feature List */}
            {formData.features.length > 0 && (
              <div className="space-y-2 mb-3 max-h-40 overflow-y-auto custom-scrollbar">
                {formData.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-4 py-3 bg-black/30 border border-red-900/30 rounded-lg hover:border-red-700/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <p className="text-white text-sm">{feature}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      disabled={isSubmitting}
                      className="p-1.5 hover:bg-red-900/30 rounded transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-30"
                      title="Remove feature"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Feature */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-black/50 border-2 border-red-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="e.g., HD Streaming, Offline Downloads..."
              />
              <button
                type="button"
                onClick={handleAddFeature}
                disabled={!newFeature.trim() || isSubmitting}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-bold text-white transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            {errors.features && (
              <p className="text-red-500 text-xs mt-1">{errors.features}</p>
            )}
            <p className="text-xs text-gray-400">
              Press Enter or click Add to include a feature
            </p>
          </div>

          {/* Status Options - ONLY Popular checkbox */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-red-500">Status Options</h3>

            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-black/30 border border-red-900/30 rounded-lg hover:border-red-700/50 transition-colors">
                <input
                  type="checkbox"
                  name="isPopular"
                  checked={formData.isPopular}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-5 h-5 rounded border-2 border-red-900/30 bg-black/50 text-red-600 focus:ring-2 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-white font-semibold flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  Popular Plan
                </span>
              </label>

              {/* Active Plan Info - Read-only display */}
              <div className="flex items-center gap-3 p-3 bg-green-950/20 border border-green-600/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold text-sm">
                  Plan will be active by default
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              All new plans are automatically active and visible to users
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4 border-t border-red-900/30">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed rounded-lg font-bold text-white shadow-lg shadow-red-600/30 hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{plan ? "Update Plan" : "Create Plan"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewPlan;
