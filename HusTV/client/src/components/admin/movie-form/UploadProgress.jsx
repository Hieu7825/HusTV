// client/src/components/admin/movie-form/UploadProgress.jsx
import React from "react";
import { Upload, CheckCircle } from "lucide-react";

const UploadProgress = ({ progress, isVisible }) => {
  if (!isVisible || progress === 0) return null;

  const isComplete = progress === 100;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className="bg-gradient-to-br from-zinc-950 via-black to-zinc-950 border-2 border-red-900/50 rounded-xl shadow-2xl shadow-red-900/50 p-4 min-w-[300px]">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`p-2 rounded-lg ${
              isComplete ? "bg-green-600/20" : "bg-red-600/20"
            }`}
          >
            {isComplete ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Upload className="w-5 h-5 text-red-500 animate-pulse" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold">
              {isComplete ? "Upload Complete" : "Uploading..."}
            </p>
            <p className="text-gray-400 text-sm">{progress}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 bg-black/50 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full transition-all duration-300 ${
              isComplete
                ? "bg-gradient-to-r from-green-600 to-green-500"
                : "bg-gradient-to-r from-red-600 to-red-500"
            }`}
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>

        {!isComplete && (
          <p className="text-gray-500 text-xs mt-2 text-center">
            Please don't close this window
          </p>
        )}
      </div>
    </div>
  );
};

export default UploadProgress;
