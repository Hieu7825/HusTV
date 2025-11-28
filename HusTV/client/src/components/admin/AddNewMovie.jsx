// client/src/components/admin/AddNewMovie.jsx
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
  Save,
  Video,
  Loader2,
} from "lucide-react";
import { genreService } from "../../services";
import { useMovieForm } from "../../hooks/useMovieForm";
import ImageUploadInput from "./movie-form/ImageUploadInput";
import VideoUploadInput from "./movie-form/VideoUploadInput";
import GenreSelector from "./movie-form/GenreSelector";
import CastManager from "./movie-form/CastManager";
import toast from "react-hot-toast";

// Ensure toast.info exists (some code may call toast.info but react-hot-toast doesn't expose it)
if (typeof toast.info !== "function") {
  // map info -> normal toast (or use toast.success/toast depending desired style)
  toast.info = (message, options) => toast(message, options);
}

const AddNewMovie = ({ movie, onClose, onSave }) => {
  const [genres, setGenres] = useState([]);
  const [genresLoading, setGenresLoading] = useState(true);

  const {
    formData,
    posterPreview,
    backdropPreview,
    trailerFile,
    videoFile,
    selectedGenreId,
    newCast,
    errors,
    isSubmitting,
    setSelectedGenreId,
    handleChange,
    handleImageUpload,
    handleVideoUpload,
    handleRemoveImage,
    handleRemoveVideo,
    handleAddGenre,
    handleRemoveGenre,
    handleAddCast,
    handleRemoveCast,
    setNewCast,
    handleSubmit,
  } = useMovieForm(movie, (savedMovie) => {
    onSave(savedMovie);
    onClose();
  });

  // Fetch genres from backend
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setGenresLoading(true);
        const response = await genreService.getAllGenres();

        // Hỗ trợ nhiều shape trả về khác nhau từ API/Service
        let fetched = [];
        if (!response) {
          fetched = [];
        } else if (Array.isArray(response)) {
          fetched = response;
        } else if (Array.isArray(response.data)) {
          fetched = response.data;
        } else if (response.data?.genres) {
          fetched = response.data.genres;
        } else if (response.genres) {
          fetched = response.genres;
        } else if (response.data?.data) {
          // một số API wrap thêm 1 level data.data
          if (Array.isArray(response.data.data)) fetched = response.data.data;
          else if (response.data.data.genres)
            fetched = response.data.data.genres;
        } else {
          // fallback: nếu response là object chứa danh sách dưới các key khác
          fetched = [];
        }

        setGenres(fetched || []);
      } catch (error) {
        console.error("Error fetching genres:", error);
        toast.error("Failed to load genres");
        setGenres([]);
      } finally {
        setGenresLoading(false);
      }
    };

    fetchGenres();
  }, []);

  // Filter available genres (an toàn nếu formData.genres chưa là mảng)
  const availableGenres = genres.filter(
    (genre) =>
      !(
        Array.isArray(formData.genres) &&
        formData.genres.some(
          (selected) => Number(selected.id) === Number(genre.id)
        )
      )
  );

  const handleGenreAdd = () => {
    if (!selectedGenreId) return;
    const id =
      typeof selectedGenreId === "number"
        ? selectedGenreId
        : parseInt(String(selectedGenreId), 10);

    const genreToAdd = genres.find((g) => Number(g.id) === Number(id));
    if (genreToAdd) {
      handleAddGenre(genreToAdd);
    }
  };

  // Thêm wrapper để hiện toast khi submit
  const onFormSubmit = async (e) => {
    e.preventDefault();
    // hiển thị loading toast và giữ id để update sau
    const toastId = toast.loading("Đang đăng tải...");
    try {
      // gọi handleSubmit từ hook (nếu handleSubmit không trả Promise, await vẫn an toàn)
      await handleSubmit(e);
      toast.success("Đăng tải thành công", { id: toastId });
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(
        error?.message
          ? `Đăng tải thất bại: ${error.message}`
          : "Đăng tải thất bại",
        { id: toastId }
      );
    }
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
            disabled={isSubmitting}
            className="p-2 hover:bg-red-900/30 rounded-lg transition-colors group disabled:opacity-50"
          >
            <X className="w-6 h-6 text-gray-400 group-hover:text-red-500" />
          </button>
        </div>

        {/* Loading State for Genres */}
        {genresLoading ? (
          <div className="flex items-center justify-center p-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
              <p className="text-white text-lg font-bold">
                Loading form data...
              </p>
            </div>
          </div>
        ) : (
          /* Form */
          <form
            onSubmit={onFormSubmit} // <-- đổi tại đây
            className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar"
          >
            {/* Basic Information */}
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
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 bg-black/50 border-2 ${
                    errors.title ? "border-red-500" : "border-red-900/30"
                  } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors disabled:opacity-50`}
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
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-black/50 border-2 border-red-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors disabled:opacity-50"
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
                  disabled={isSubmitting}
                  rows="4"
                  className={`w-full px-4 py-3 bg-black/50 border-2 ${
                    errors.overview ? "border-red-500" : "border-red-900/30"
                  } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors resize-none disabled:opacity-50`}
                  placeholder="Enter movie overview"
                />
                {errors.overview && (
                  <p className="text-red-500 text-xs mt-1">{errors.overview}</p>
                )}
              </div>
            </div>

            {/* Media & Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Media & Images
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUploadInput
                  label="Poster Image"
                  preview={posterPreview}
                  onUpload={(e) => handleImageUpload(e, "poster")}
                  onRemove={() => handleRemoveImage("poster")}
                  error={errors.poster_path}
                  required={true}
                  aspectRatio="2/3"
                  disabled={isSubmitting}
                />

                <ImageUploadInput
                  label="Backdrop Image"
                  preview={backdropPreview}
                  onUpload={(e) => handleImageUpload(e, "backdrop")}
                  onRemove={() => handleRemoveImage("backdrop")}
                  aspectRatio="16/9"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Video Uploads */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
                <Video className="w-5 h-5" />
                Trailer & Movie File
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <VideoUploadInput
                  type="trailer"
                  file={trailerFile}
                  onUpload={handleVideoUpload}
                  onRemove={handleRemoveVideo}
                  disabled={isSubmitting}
                />

                <VideoUploadInput
                  type="video"
                  file={videoFile}
                  onUpload={handleVideoUpload}
                  onRemove={handleRemoveVideo}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Movie Details */}
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
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 bg-black/50 border-2 ${
                      errors.release_date
                        ? "border-red-500"
                        : "border-red-900/30"
                    } rounded-lg text-white focus:outline-none focus:border-red-600 transition-colors disabled:opacity-50`}
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
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-black/50 border-2 border-red-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors disabled:opacity-50"
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
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-black/50 border-2 border-red-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors disabled:opacity-50"
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
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-black/50 border-2 border-red-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors disabled:opacity-50"
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
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-black/50 border-2 border-red-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors disabled:opacity-50"
                    placeholder="1000"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Genres - Now with backend data */}
            <GenreSelector
              selectedGenres={formData.genres}
              availableGenres={availableGenres}
              selectedGenreId={selectedGenreId}
              onGenreIdChange={setSelectedGenreId}
              onAddGenre={handleGenreAdd}
              onRemoveGenre={handleRemoveGenre}
              disabled={isSubmitting}
            />

            {/* Casts */}
            <CastManager
              casts={formData.casts}
              newCast={newCast}
              onNewCastChange={setNewCast}
              onAddCast={handleAddCast}
              onRemoveCast={handleRemoveCast}
              disabled={isSubmitting}
            />

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
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-lg font-bold text-white shadow-lg shadow-red-600/30 hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {movie ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {movie ? "Update Movie" : "Add Movie"}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddNewMovie;
