import React, { useState, useEffect } from "react";
import {
  X,
  Film,
  FileText,
  Image as ImageIcon,
  Calendar,
  Clock,
  Globe,
  Star,
  Users,
  Youtube,
  Video,
  Save,
  Plus,
  Trash2,
  Upload,
  PlayCircle,
  FileVideo,
  ChevronDown,
} from "lucide-react";
import { dummyGenreData } from "../../assets/assets";

const AddNewMovie = ({ movie, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    _id: "",
    id: "",
    title: "",
    overview: "",
    trailer: "",
    video: "",
    poster_path: "",
    backdrop_path: "",
    genres: [],
    casts: [],
    release_date: "",
    original_language: "",
    tagline: "",
    vote_average: 0,
    vote_count: 0,
    runtime: 0,
  });

  const [selectedGenreId, setSelectedGenreId] = useState("");
  const [newCast, setNewCast] = useState({ id: "", name: "", character: "" });
  const [errors, setErrors] = useState({});
  const [posterPreview, setPosterPreview] = useState(null);
  const [backdropPreview, setBackdropPreview] = useState(null);
  const [trailerFile, setTrailerFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  // Load movie data if editing
  useEffect(() => {
    if (movie) {
      setFormData(movie);
      if (movie.poster_path) setPosterPreview(movie.poster_path);
      if (movie.backdrop_path) setBackdropPreview(movie.backdrop_path);
      // Giả định movie.trailer và movie.video là URL/base64 string nếu đã tồn tại
      if (movie.trailer)
        setTrailerFile({ name: "Existing trailer", url: movie.trailer });
      if (movie.video)
        setVideoFile({ name: "Existing video", url: movie.video });
    }
  }, [movie]);

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        if (type === "poster") {
          setPosterPreview(base64String);
          setFormData((prev) => ({ ...prev, poster_path: base64String }));
        } else if (type === "backdrop") {
          setBackdropPreview(base64String);
          setFormData((prev) => ({ ...prev, backdrop_path: base64String }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        alert("Please upload a video file");
        return;
      }
      // Giả định giới hạn kích thước video là 100MB
      if (file.size > 100 * 1024 * 1024) {
        alert("File size should be less than 100MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        if (type === "trailer") {
          setTrailerFile({
            name: file.name,
            size: file.size,
            url: base64String,
          });
          // Lưu base64 hoặc URL vào formData
          setFormData((prev) => ({ ...prev, trailer: base64String }));
        } else if (type === "video") {
          setVideoFile({ name: file.name, size: file.size, url: base64String });
          // Lưu base64 hoặc URL vào formData
          setFormData((prev) => ({ ...prev, video: base64String }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (type) => {
    if (type === "poster") {
      setPosterPreview(null);
      setFormData((prev) => ({ ...prev, poster_path: "" }));
    } else if (type === "backdrop") {
      setBackdropPreview(null);
      setFormData((prev) => ({ ...prev, backdrop_path: "" }));
    }
  };

  const handleRemoveVideo = (type) => {
    if (type === "trailer") {
      setTrailerFile(null);
      setFormData((prev) => ({ ...prev, trailer: "" }));
    } else if (type === "video") {
      setVideoFile(null);
      setFormData((prev) => ({ ...prev, video: "" }));
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Thêm genre từ dropdown
  const handleAddGenre = () => {
    if (!selectedGenreId) return;

    const genreToAdd = dummyGenreData.find(
      (g) => g.id === parseInt(selectedGenreId)
    );

    if (genreToAdd) {
      // Kiểm tra xem genre đã tồn tại chưa
      const exists = formData.genres.some((g) => g.id === genreToAdd.id);
      if (!exists) {
        setFormData((prev) => ({
          ...prev,
          genres: [...prev.genres, genreToAdd],
        }));
      }
      setSelectedGenreId(""); // Reset dropdown
    }
  };

  const handleRemoveGenre = (genreId) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.filter((g) => g.id !== genreId),
    }));
  };

  const handleAddCast = () => {
    if (newCast.name.trim()) {
      const cast = {
        id: newCast.id || Date.now(),
        name: newCast.name.trim(),
        character: newCast.character.trim(),
      };
      setFormData((prev) => ({
        ...prev,
        casts: [...prev.casts, cast],
      }));
      setNewCast({ id: "", name: "", character: "" });
    }
  };

  const handleRemoveCast = (castId) => {
    setFormData((prev) => ({
      ...prev,
      casts: prev.casts.filter((c) => c.id !== castId),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.overview.trim()) newErrors.overview = "Overview is required";
    if (!formData.release_date)
      newErrors.release_date = "Release date is required";
    if (!formData.poster_path.trim())
      newErrors.poster_path = "Poster path is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const movieData = {
      ...formData,
      _id: formData._id || Date.now().toString(),
      id: formData.id || Date.now(),
      vote_average: parseFloat(formData.vote_average) || 0,
      vote_count: parseInt(formData.vote_count) || 0,
      runtime: parseInt(formData.runtime) || 0,
    };

    onSave(movieData);
    onClose();
  };

  // Lọc ra các genre chưa được chọn
  const availableGenres = dummyGenreData.filter(
    (genre) => !formData.genres.some((selected) => selected.id === genre.id)
  );

  // Component phụ để hiển thị trạng thái upload video
  const VideoUploadInput = ({ type, file, onUpload, onRemove }) => {
    const label = type === "trailer" ? "Trailer Video" : "Full Movie Video";
    const icon = type === "trailer" ? Youtube : FileVideo;

    return (
      <div className="space-y-3">
        <label className="block text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
          {React.createElement(icon, { className: "w-4 h-4 text-red-500" })}
          {label}
        </label>
        <div className="relative group">
          {file ? (
            <div className="bg-black/50 border-2 border-red-900/30 rounded-xl p-4 flex items-center justify-between transition-all group-hover:border-red-600/50">
              <div className="flex items-center gap-3 truncate">
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
                  {/* Có thể thêm nút Play để xem trước video trong môi trường production */}
                  {/* <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 text-xs hover:text-blue-300 transition-colors block mt-1"
                  >
                    Preview Link
                  </a> */}
                  {/* Giả sử bạn đang hiển thị file video vừa tải lên */}
                  {file && file.url && (
                    <div className="mt-4">
                      <p className="text-sm font-medium">Video Preview:</p>
                      <video
                        controls
                        src={file.url}
                        className="w-full max-w-md border rounded-lg"
                        // Thêm các thuộc tính khác như chiều rộng, chiều cao nếu cần
                      >
                        Trình duyệt của bạn không hỗ trợ video.
                      </video>
                    </div>
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
          ) : (
            <label className="flex flex-col items-center justify-center h-32 border-2 border-red-900/30 border-dashed rounded-xl cursor-pointer hover:border-red-600/50 transition-all bg-black/30 hover:bg-black/50 group">
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-red-900/20 rounded-full group-hover:bg-red-900/30 transition-colors">
                  <Upload className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-white font-semibold text-sm">
                  Upload {type === "trailer" ? "Trailer" : "Video"}
                </p>
                <p className="text-gray-500 text-xs">
                  MP4, MOV up to 100MB (Demo limit)
                </p>
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

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-zinc-950 via-black to-zinc-950 border-2 border-red-900/50 rounded-2xl max-w-4xl w-full shadow-2xl shadow-red-900/50 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-red-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/20 rounded-lg">
              <Film className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-3xl font-black text-white">
              {movie ? "Edit Movie" : "Add New Movie"}
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
          className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar"
        >
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Basic Information
            </h3>

            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-black/50 border-2 ${
                  errors.title ? "border-red-500" : "border-red-900/30"
                } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors`}
                placeholder="Enter movie title"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">
                Tagline
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black/50 border-2 border-red-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                placeholder="Enter movie tagline"
              />
            </div>

            {/* Overview */}
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">
                Overview <span className="text-red-500">*</span>
              </label>
              <textarea
                name="overview"
                value={formData.overview}
                onChange={handleChange}
                rows="4"
                className={`w-full px-4 py-3 bg-black/50 border-2 ${
                  errors.overview ? "border-red-500" : "border-red-900/30"
                } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors resize-none`}
                placeholder="Enter movie overview"
              />
              {errors.overview && (
                <p className="text-red-500 text-xs mt-1">{errors.overview}</p>
              )}
            </div>
          </div>
          {/* --- */}

          {/* Media & Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Media & Images
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Poster Upload - code như cũ */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-400 mb-2">
                  Poster Image <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  {posterPreview ? (
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden border-2 border-red-900/30 group-hover:border-red-600/50 transition-all">
                      <img
                        src={posterPreview}
                        alt="Poster preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold transition-colors flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Change
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "poster")}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage("poster")}
                          className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      className={`flex flex-col items-center justify-center aspect-[2/3] border-2 ${
                        errors.poster_path
                          ? "border-red-500"
                          : "border-red-900/30 border-dashed"
                      } rounded-xl cursor-pointer hover:border-red-600/50 transition-all bg-black/30 hover:bg-black/50 group`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-red-900/20 rounded-full group-hover:bg-red-900/30 transition-colors">
                          <Upload className="w-8 h-8 text-red-500" />
                        </div>
                        <div className="text-center">
                          <p className="text-white font-semibold mb-1">
                            Upload Poster
                          </p>
                          <p className="text-gray-400 text-xs">
                            Click to browse
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "poster")}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {errors.poster_path && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.poster_path}
                  </p>
                )}
              </div>

              {/* Backdrop Upload - tương tự poster */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-400 mb-2">
                  Backdrop Image
                </label>
                <div className="relative group">
                  {backdropPreview ? (
                    <div className="relative aspect-[16/9] rounded-xl overflow-hidden border-2 border-red-900/30 group-hover:border-red-600/50 transition-all">
                      <img
                        src={backdropPreview}
                        alt="Backdrop preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold transition-colors flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Change
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "backdrop")}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage("backdrop")}
                          className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center aspect-[16/9] border-2 border-red-900/30 border-dashed rounded-xl cursor-pointer hover:border-red-600/50 transition-all bg-black/30 hover:bg-black/50 group">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-red-900/20 rounded-full group-hover:bg-red-900/30 transition-colors">
                          <Upload className="w-8 h-8 text-red-500" />
                        </div>
                        <div className="text-center">
                          <p className="text-white font-semibold mb-1">
                            Upload Backdrop
                          </p>
                          <p className="text-gray-400 text-xs">
                            Click to browse
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "backdrop")}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* --- */}

          {/* Video Uploads - PHẦN MỚI */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
              <Video className="w-5 h-5" />
              Trailer & Movie File
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trailer Upload */}
              <VideoUploadInput
                type="trailer"
                file={trailerFile}
                onUpload={handleVideoUpload}
                onRemove={handleRemoveVideo}
              />

              {/* Full Video Upload */}
              <VideoUploadInput
                type="video"
                file={videoFile}
                onUpload={handleVideoUpload}
                onRemove={handleRemoveVideo}
              />
            </div>
          </div>
          {/* --- */}

          {/* Movie Details - giữ nguyên code cũ */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Movie Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">
                  Release Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="release_date"
                  value={formData.release_date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-black/50 border-2 ${
                    errors.release_date ? "border-red-500" : "border-red-900/30"
                  } rounded-lg text-white focus:outline-none focus:border-red-600 transition-colors`}
                />
                {errors.release_date && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.release_date}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Runtime (min)
                </label>
                <input
                  type="number"
                  name="runtime"
                  value={formData.runtime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-black/50 border-2 border-red-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                  placeholder="120"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Language
                </label>
                <input
                  type="text"
                  name="original_language"
                  value={formData.original_language}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-black/50 border-2 border-red-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                  placeholder="en"
                  maxLength="2"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Rating
                </label>
                <input
                  type="number"
                  name="vote_average"
                  value={formData.vote_average}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-black/50 border-2 border-red-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                  placeholder="7.5"
                  step="0.1"
                  min="0"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">
                  Vote Count
                </label>
                <input
                  type="number"
                  name="vote_count"
                  value={formData.vote_count}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-black/50 border-2 border-red-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                  placeholder="1000"
                  min="0"
                />
              </div>
            </div>
          </div>
          {/* --- */}

          {/* Genres - PHẦN MỚI VỚI DROPDOWN */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-red-500">Genres</h3>

            {/* Genre List */}
            <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
              {formData.genres.length === 0 ? (
                <p className="text-gray-500 text-sm italic">
                  No genres selected
                </p>
              ) : (
                formData.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-950/30 border border-red-900/40 rounded-lg text-sm font-semibold text-red-300 hover:border-red-700/60 hover:bg-red-900/20 transition-all duration-300"
                  >
                    {genre.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveGenre(genre.id)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add Genre - DROPDOWN */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select
                  value={selectedGenreId}
                  onChange={(e) => setSelectedGenreId(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border-2 border-red-900/30 rounded-lg text-white focus:outline-none focus:border-red-600 transition-colors appearance-none cursor-pointer pr-10"
                >
                  <option value="" className="bg-zinc-900">
                    {availableGenres.length === 0
                      ? "All genres selected"
                      : "Select a genre"}
                  </option>
                  {availableGenres.map((genre) => (
                    <option
                      key={genre.id}
                      value={genre.id}
                      className="bg-zinc-900 hover:bg-zinc-800"
                    >
                      {genre.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              <button
                type="button"
                onClick={handleAddGenre}
                disabled={!selectedGenreId}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-bold text-white transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
          {/* --- */}

          {/* Casts - giữ nguyên code cũ */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Cast Members
            </h3>

            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto custom-scrollbar">
              {formData.casts.map((cast) => (
                <div
                  key={cast.id}
                  className="flex items-center justify-between px-4 py-2 bg-black/30 border border-red-900/30 rounded-lg"
                >
                  <div>
                    <p className="text-white font-semibold">{cast.name}</p>
                    {cast.character && (
                      <p className="text-gray-400 text-sm">
                        as {cast.character}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCast(cast.id)}
                    className="p-1 hover:bg-red-900/30 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                value={newCast.name}
                onChange={(e) =>
                  setNewCast({ ...newCast, name: e.target.value })
                }
                className="px-4 py-2 bg-black/50 border-2 border-red-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                placeholder="Actor name"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCast.character}
                  onChange={(e) =>
                    setNewCast({ ...newCast, character: e.target.value })
                  }
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddCast())
                  }
                  className="flex-1 px-4 py-2 bg-black/50 border-2 border-red-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                  placeholder="Character name"
                />
                <button
                  type="button"
                  onClick={handleAddCast}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-bold text-white transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
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
              {movie ? "Update Movie" : "Add Movie"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewMovie;
