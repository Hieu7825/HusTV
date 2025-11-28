// client/src/components/admin/movie-form/VideoUploadInput.jsx
import React from "react";
import { PlayCircle, Upload, Trash2, Youtube, FileVideo } from "lucide-react";

const VideoUploadInput = ({ type, file, onUpload, onRemove }) => {
  const label = type === "trailer" ? "Trailer Video" : "Full Movie Video";
  const icon = type === "trailer" ? Youtube : FileVideo;

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
        {React.createElement(icon, { className: "w-4 h-4 text-red-500" })}
        {label}
      </label>
      <div className="relative group">
        {file ? (
          <div className="bg-black/50 border-2 border-red-900/30 rounded-xl p-4 space-y-3 transition-all group-hover:border-red-600/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 truncate min-w-0">
                <PlayCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-white font-semibold truncate">
                    {file.name}
                  </p>
                  {file.size && (
                    <p className="text-gray-400 text-xs">
                      {formatFileSize(file.size)}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(type)}
                className="p-2 ml-4 bg-red-900/30 hover:bg-red-700/50 rounded-lg transition-colors flex-shrink-0"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
            </div>

            {/* Video Preview */}
            {file.url && (
              <div className="mt-3">
                <video
                  controls
                  src={file.url}
                  className="w-full rounded-lg border border-red-900/30"
                  style={{ maxHeight: "200px" }}
                >
                  Your browser does not support video playback.
                </video>
              </div>
            )}
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-32 border-2 border-red-900/30 border-dashed rounded-xl cursor-pointer hover:border-red-600/50 transition-all bg-black/30 hover:bg-black/50 group">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-red-900/20 rounded-full group-hover:bg-red-900/30 transition-colors">
                <Upload className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-white font-semibold text-sm">
                Upload {type === "trailer" ? "Trailer" : "Video"}
              </p>
              <p className="text-gray-500 text-xs">MP4, MOV up to 500MB</p>
            </div>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => onUpload(e, type)}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default VideoUploadInput;
