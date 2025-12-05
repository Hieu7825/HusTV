// client/src/hooks/useMovieForm.js
import { useState, useEffect, useRef } from "react";
import { videoService } from "../services";
import toast from "react-hot-toast";

export const useMovieForm = (movie, onSuccess) => {
  // ✅ Dùng useRef để lưu File objects - KHÔNG bị serialize
  const filesRef = useRef({
    poster: null,
    backdrop: null,
    trailer: null,
    video: null,
  });

  const [formData, setFormData] = useState({
    _id: "",
    id: "",
    title: "",
    overview: "",
    tagline: "",
    release_date: "",
    original_language: "",
    runtime: 0,
    vote_average: 0,
    vote_count: 0,
    adult: false,
    featured: false,
    trending: false,
    genres: [],
    casts: [],
    // Old URLs (for edit mode)
    poster_path: "",
    backdrop_path: "",
    trailer_url: "",
    video_url: "",
  });

  const [posterPreview, setPosterPreview] = useState(null);
  const [backdropPreview, setBackdropPreview] = useState(null);
  const [trailerFile, setTrailerFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [selectedGenreId, setSelectedGenreId] = useState("");
  const [newCast, setNewCast] = useState({ id: "", name: "", character: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load movie data if editing
  useEffect(() => {
    if (movie) {
      setFormData({
        ...movie,
        trailer_url: movie.trailer || "",
        video_url: movie.video || "",
      });

      // Reset files ref khi edit
      filesRef.current = {
        poster: null,
        backdrop: null,
        trailer: null,
        video: null,
      };

      if (movie.poster_path) setPosterPreview(movie.poster_path);
      if (movie.backdrop_path) setBackdropPreview(movie.backdrop_path);
      if (movie.trailer)
        setTrailerFile({ name: "Existing trailer", url: movie.trailer });
      if (movie.video)
        setVideoFile({ name: "Existing video", url: movie.video });
    }
  }, [movie]);

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

  // ✅ Upload Image - Store File in ref
  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log(`📎 Selected ${type}:`, file.name, file.size);

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    if (type === "poster") {
      filesRef.current.poster = file;
      setPosterPreview(URL.createObjectURL(file));
      setFormData((prev) => ({
        ...prev,
        poster_path: "",
      }));
      console.log("✅ Poster saved to ref:", filesRef.current.poster.name);

      if (errors.poster_path) {
        setErrors((prev) => ({ ...prev, poster_path: "" }));
      }
    } else if (type === "backdrop") {
      filesRef.current.backdrop = file;
      setBackdropPreview(URL.createObjectURL(file));
      setFormData((prev) => ({
        ...prev,
        backdrop_path: "",
      }));
      console.log("✅ Backdrop saved to ref:", filesRef.current.backdrop.name);
    }
  };

  // ✅ Upload Video - Store File in ref
  const handleVideoUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log(`📎 Selected ${type}:`, file.name, file.size);

    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a video file");
      return;
    }

    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      toast.error("Video size should be less than 500MB");
      return;
    }

    const loadingToast = toast.loading(`Reading ${type}...`);

    if (type === "trailer") {
      filesRef.current.trailer = file;
      setTrailerFile({ name: file.name, size: file.size, file: file });
      setFormData((prev) => ({
        ...prev,
        trailer_url: "",
      }));
      console.log("✅ Trailer saved to ref:", filesRef.current.trailer.name);
    } else if (type === "video") {
      filesRef.current.video = file;
      setVideoFile({ name: file.name, size: file.size, file: file });
      setFormData((prev) => ({
        ...prev,
        video_url: "",
      }));
      console.log("✅ Video saved to ref:", filesRef.current.video.name);
    }
    toast.success(`${type} loaded successfully`, { id: loadingToast });
  };

  const handleRemoveImage = (type) => {
    if (type === "poster") {
      filesRef.current.poster = null;
      setPosterPreview(null);
      setFormData((prev) => ({
        ...prev,
        poster_path: "",
      }));
    } else if (type === "backdrop") {
      filesRef.current.backdrop = null;
      setBackdropPreview(null);
      setFormData((prev) => ({
        ...prev,
        backdrop_path: "",
      }));
    }
  };

  const handleRemoveVideo = (type) => {
    if (type === "trailer") {
      filesRef.current.trailer = null;
      setTrailerFile(null);
      setFormData((prev) => ({
        ...prev,
        trailer_url: "",
      }));
    } else if (type === "video") {
      filesRef.current.video = null;
      setVideoFile(null);
      setFormData((prev) => ({
        ...prev,
        video_url: "",
      }));
    }
  };

  const handleAddGenre = (genreToAdd) => {
    if (!genreToAdd) return;
    const exists = formData.genres.some((g) => g.id === genreToAdd.id);
    if (!exists) {
      setFormData((prev) => ({
        ...prev,
        genres: [...prev.genres, genreToAdd],
      }));
    }
    setSelectedGenreId("");
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

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.overview.trim()) {
      newErrors.overview = "Overview is required";
    }

    if (!formData.release_date) {
      newErrors.release_date = "Release date is required";
    }

    // ✅ Validate poster - check ref
    const hasPosterFile = filesRef.current.poster instanceof File;
    const hasPosterUrl =
      formData.poster_path && formData.poster_path.trim() !== "";

    if (!hasPosterFile && !hasPosterUrl && !posterPreview) {
      newErrors.poster_path = "Poster image is required";
    }

    if (formData.genres.length === 0) {
      toast.info("Consider adding at least one genre");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==================== 🆕 CLOUDINARY UPLOAD LOGIC ====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    const loadingToast = toast.loading(
      movie ? "Updating movie..." : "Creating movie..."
    );

    try {
      // ==================== 🆕 STEP 1: Upload files to Cloudinary ====================
      const uploadedUrls = {};

      // Track which files need uploading
      const filesToUpload = {
        video:
          filesRef.current.video instanceof File
            ? filesRef.current.video
            : null,
        trailer:
          filesRef.current.trailer instanceof File
            ? filesRef.current.trailer
            : null,
        poster:
          filesRef.current.poster instanceof File
            ? filesRef.current.poster
            : null,
        backdrop:
          filesRef.current.backdrop instanceof File
            ? filesRef.current.backdrop
            : null,
      };

      // Count total files to upload
      const totalFiles = Object.values(filesToUpload).filter(Boolean).length;

      if (totalFiles > 0) {
        console.log(`📤 Uploading ${totalFiles} files to Cloudinary...`);
        toast.loading(`Uploading files to Cloudinary... (0/${totalFiles})`, {
          id: loadingToast,
        });

        let uploadedCount = 0;

        // Upload each file with progress
        const uploadFile = async (file, type, folder, resourceType) => {
          if (!file) return null;

          console.log(`📤 Uploading ${type}...`);

          const result = await videoService.uploadToCloudinary(
            file,
            { folder, resourceType },
            (percent) => {
              setUploadProgress(
                Math.round(
                  (uploadedCount / totalFiles + percent / 100 / totalFiles) *
                    100
                )
              );
              toast.loading(
                `Uploading ${type}... ${percent}% (${uploadedCount}/${totalFiles} files)`,
                { id: loadingToast }
              );
            }
          );

          uploadedCount++;
          toast.loading(`Uploaded ${uploadedCount}/${totalFiles} files`, {
            id: loadingToast,
          });

          return result;
        };

        // Upload video
        if (filesToUpload.video) {
          const videoResult = await uploadFile(
            filesToUpload.video,
            "video",
            "hustv/videos",
            "video"
          );
          uploadedUrls.video_url = videoResult.url;
          uploadedUrls.cloudinary_public_id = videoResult.publicId;
          uploadedUrls.duration = videoResult.duration;
        }

        // Upload trailer
        if (filesToUpload.trailer) {
          const trailerResult = await uploadFile(
            filesToUpload.trailer,
            "trailer",
            "hustv/trailers",
            "video"
          );
          uploadedUrls.trailer_url = trailerResult.url;
        }

        // Upload poster
        if (filesToUpload.poster) {
          const posterResult = await uploadFile(
            filesToUpload.poster,
            "poster",
            "hustv/posters",
            "image"
          );
          uploadedUrls.poster_path = posterResult.url;
        }

        // Upload backdrop
        if (filesToUpload.backdrop) {
          const backdropResult = await uploadFile(
            filesToUpload.backdrop,
            "backdrop",
            "hustv/backdrops",
            "image"
          );
          uploadedUrls.backdrop_path = backdropResult.url;
        }

        console.log("✅ All files uploaded to Cloudinary:", uploadedUrls);
      }

      // ==================== STEP 2: Send metadata + URLs to backend ====================
      toast.loading("Saving movie to database...", { id: loadingToast });

      const movieData = {
        title: formData.title,
        overview: formData.overview,
        tagline: formData.tagline || "",
        release_date: formData.release_date,
        original_language: formData.original_language || "en",
        runtime: parseInt(formData.runtime) || 0,
        vote_average: parseFloat(formData.vote_average) || 0,
        vote_count: parseInt(formData.vote_count) || 0,
        featured: formData.featured || false,
        trending: formData.trending || false,
        adult: formData.adult || false,
        genres: formData.genres || [],
        casts: formData.casts || [],

        // 🆕 Use Cloudinary URLs (if uploaded) or keep existing URLs
        video_url: uploadedUrls.video_url || formData.video_url || "",
        trailer_url: uploadedUrls.trailer_url || formData.trailer_url || "",
        poster_path: uploadedUrls.poster_path || formData.poster_path || "",
        backdrop_path:
          uploadedUrls.backdrop_path || formData.backdrop_path || "",
        cloudinary_public_id: uploadedUrls.cloudinary_public_id || "",
      };

      console.log("📤 Sending to backend:", movieData);

      // Send to API (as JSON, not FormData!)
      let response;
      if (movie && movie._id) {
        console.log("🔄 Updating movie:", movie._id);
        response = await videoService.updateVideo(movie._id, movieData);
        toast.success("Movie updated successfully!", { id: loadingToast });
      } else {
        console.log("➕ Creating new movie");
        response = await videoService.createVideo(movieData);
        toast.success("Movie created successfully!", { id: loadingToast });
      }

      console.log("✅ Save successful:", response.data);

      setUploadProgress(0);
      if (onSuccess) {
        onSuccess(response.data.video || response.data);
      }
    } catch (error) {
      console.error("❌ Error saving movie:", error);
      console.error("Error response:", error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save movie";
      toast.error(errorMessage, { id: loadingToast });

      if (error.response?.status === 400) {
        const validationErrors = error.response?.data?.errors || {};
        setErrors(validationErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    posterPreview,
    backdropPreview,
    trailerFile,
    videoFile,
    selectedGenreId,
    newCast,
    errors,
    isSubmitting,
    uploadProgress,
    setSelectedGenreId,
    setFormData,
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
  };
};
