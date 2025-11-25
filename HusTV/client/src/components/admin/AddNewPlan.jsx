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
    tierRank: 1,
    isPopular: false,
    isActive: true,
  });

  const [newFeature, setNewFeature] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (plan) {
      setFormData(plan);
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const planData = {
      ...formData,
      _id: formData._id || `plan_${Date.now()}`,
      price: parseFloat(formData.price),
      tierRank: parseFloat(formData.tierRank),
      connectedDevices:
        formData.connectedDevices === "Unlimited"
          ? "Unlimited"
          : parseInt(formData.connectedDevices),
    };

    onSave(planData);
    onClose();
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
            <h2 className="text-3xl font-black text-white">
              {plan ? "Edit Plan" : "Add New Plan"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-900/30 rounded-lg transition-colors group"
          >
            <X className="w-6 h-6 text-gray-400 group-hover:text-red-500" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 max-h-[70vh] overflow-y-auto"
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
                className={`w-full px-4 py-3 bg-black/50 border-2 ${
                  errors.planName ? "border-red-500" : "border-red-900/30"
                } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors`}
                placeholder="Enter plan name"
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
                rows="3"
                className={`w-full px-4 py-3 bg-black/50 border-2 ${
                  errors.description ? "border-red-500" : "border-red-900/30"
                } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors resize-none`}
                placeholder="Enter plan description"
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-3 bg-black/50 border-2 ${
                    errors.price ? "border-red-500" : "border-red-900/30"
                  } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors`}
                  placeholder="19.99"
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">
                  Duration
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-black/50 border-2 border-red-900/30 rounded-lg text-white focus:outline-none focus:border-red-600 transition-colors"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">
                  Tier Rank
                </label>
                <input
                  type="number"
                  name="tierRank"
                  value={formData.tierRank}
                  onChange={handleChange}
                  step="0.5"
                  min="1"
                  max="5"
                  className="w-full px-4 py-3 bg-black/50 border-2 border-red-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                  placeholder="3"
                />
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
                Connected Devices
              </label>
              <input
                type="text"
                name="connectedDevices"
                value={formData.connectedDevices}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black/50 border-2 border-red-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                placeholder="5 or Unlimited"
              />
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Features <span className="text-red-500">*</span>
            </h3>

            {/* Feature List */}
            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
              {formData.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-2 bg-black/30 border border-red-900/30 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <p className="text-white">{feature}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="p-1 hover:bg-red-900/30 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Feature */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddFeature())
                }
                className="flex-1 px-4 py-3 bg-black/50 border-2 border-red-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                placeholder="Enter feature"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-bold text-white transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            {errors.features && (
              <p className="text-red-500 text-xs mt-1">{errors.features}</p>
            )}
          </div>

          {/* Status Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-red-500">Status Options</h3>

            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPopular"
                  checked={formData.isPopular}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-2 border-red-900/30 bg-black/50 text-red-600 focus:ring-2 focus:ring-red-600"
                />
                <span className="text-white font-semibold flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  Popular Plan
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-2 border-red-900/30 bg-black/50 text-red-600 focus:ring-2 focus:ring-red-600"
                />
                <span className="text-white font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Active
                </span>
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4 border-t border-red-900/30">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-lg font-bold text-white shadow-lg shadow-red-600/30 hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {plan ? "Update Plan" : "Add Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewPlan;
