// client/src/components/admin/movie-form/ImageUploadInput.jsx
import React from "react";
import { Upload, Trash2 } from "lucide-react";

const ImageUploadInput = ({
  label,
  preview,
  onUpload,
  onRemove,
  error,
  required = false,
  aspectRatio = "2/3", // "2/3" for poster, "16/9" for backdrop
}) => {
  const aspectClass = aspectRatio === "16/9" ? "aspect-[16/9]" : "aspect-[2/3]";

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-gray-400 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative group">
        {preview ? (
          <div
            className={`relative ${aspectClass} rounded-xl overflow-hidden border-2 border-red-900/30 group-hover:border-red-600/50 transition-all`}
          >
            <img
              src={preview}
              alt={`${label} preview`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <label className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Change
                <input
                  type="file"
                  accept="image/*"
                  onChange={onUpload}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={onRemove}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label
            className={`flex flex-col items-center justify-center ${aspectClass} border-2 ${
              error ? "border-red-500" : "border-red-900/30 border-dashed"
            } rounded-xl cursor-pointer hover:border-red-600/50 transition-all bg-black/30 hover:bg-black/50 group`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-red-900/20 rounded-full group-hover:bg-red-900/30 transition-colors">
                <Upload className="w-8 h-8 text-red-500" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold mb-1">Upload {label}</p>
                <p className="text-gray-400 text-xs">Click to browse</p>
                <p className="text-gray-500 text-xs mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={onUpload}
              className="hidden"
            />
          </label>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default ImageUploadInput;
