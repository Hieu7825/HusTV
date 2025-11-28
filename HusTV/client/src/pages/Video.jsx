// client/src/pages/Video.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { videoService, userService } from "../services";
import { assets } from "../assets/assets";
import { ChevronRight, Home } from "lucide-react";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";
import toast from "react-hot-toast";

export const Video = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [streamingUrl, setStreamingUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);

        // ✅ FIX 1: Fetch movie details
        const movieResponse = await videoService.getVideoById(id);
        console.log("📥 Video page - movie response:", movieResponse);

        // Parse: { success: true, video: {...} }
        const movieData = movieResponse.data?.video || movieResponse.data;
        console.log("✅ Parsed movie:", movieData);
        setMovie(movieData);

        // ✅ FIX 2: Get streaming URL (protected endpoint)
        try {
          const streamResponse = await videoService.getStreamingUrl(id);
          console.log("📥 Streaming URL response:", streamResponse);

          // Parse: { success: true, streamUrl: "...", video: {...} }
          const url =
            streamResponse.data?.streamUrl ||
            streamResponse.data?.streamingUrl ||
            streamResponse.streamUrl ||
            movieData.video || // Fallback to video URL from movie data
            "";

          console.log("✅ Streaming URL:", url);
          setStreamingUrl(url);
        } catch (streamError) {
          console.warn(
            "⚠️ Streaming URL fetch failed, using fallback:",
            streamError
          );
          // Fallback to direct video URL
          setStreamingUrl(movieData.video || "");
        }

        // Update watch progress on mount
        try {
          await userService.updateWatchProgress(id, {
            watchedDuration: 0,
            totalDuration: movieData.runtime * 60, // Convert to seconds
          });
        } catch (progressError) {
          console.warn(
            "⚠️ Watch progress update failed (non-critical):",
            progressError
          );
          // Don't fail the whole page if watch progress fails
        }
      } catch (error) {
        console.error("❌ Failed to fetch video:", error);
        toast.error("Failed to load video");
        navigate("/movies");
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id, navigate]);

  // Fetch related movies
  useEffect(() => {
    const fetchRelatedMovies = async () => {
      if (!movie?.genres?.length) return;

      try {
        const genreId = movie.genres[0].id;
        const response = await videoService.getVideosByGenre(genreId);

        console.log("📥 Related movies response:", response);

        // ✅ FIX 3: Parse response.data.videos
        const movies = response.data?.videos || [];

        const related = movies.filter((m) => m._id !== id).slice(0, 3);

        console.log("✅ Parsed related movies:", related.length);
        setRelatedMovies(related);
      } catch (error) {
        console.error("❌ Failed to fetch related movies:", error);
        // Don't show error - related movies are optional
      }
    };

    fetchRelatedMovies();
  }, [movie, id]);

  // Track watch progress
  const handleTimeUpdate = async (event) => {
    const video = event.target;
    const watchedDuration = Math.floor(video.currentTime);
    const totalDuration = Math.floor(video.duration);

    // Update every 30 seconds
    if (watchedDuration % 30 === 0 && watchedDuration > 0) {
      try {
        await userService.updateWatchProgress(id, {
          watchedDuration,
          totalDuration,
        });
        console.log(
          `⏱️ Watch progress updated: ${watchedDuration}/${totalDuration}s`
        );
      } catch (error) {
        console.error("Failed to update watch progress:", error);
        // Don't show error - this is background tracking
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!movie) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-white text-xl">Video not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white dark:from-black dark:via-gray-900 dark:to-black text-gray-900 dark:text-white px-6 md:px-16 lg:px-40 pt-24 md:pt-28">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/")}
          className="gradient cursor-pointer flex items-center gap-2 transition-colors font-bold text-xl drop-shadow-lg"
        >
          <Home className="text-blue-500 dark:text-red-500 w-5 h-5" />
          HusTV
        </button>
        <ChevronRight className="w-5 h-5 text-gray-500" />
        <button
          onClick={() => navigate(`/movies/${id}`)}
          className="cursor-pointer text-gray-600 dark:text-gray-300 font-medium text-lg drop-shadow-md"
        >
          {movie.title}
        </button>
      </div>

      {/* TV-Style Video Player */}
      <div className="w-full max-w-7xl mx-auto relative">
        <BlurCircle top="-150px" right="-150px" />
        <BlurCircle top="50%" left="-200px" />

        {/* TV Frame */}
        <div className="relative bg-gradient-to-br from-gray-100 via-gray-200 to-white dark:from-gray-900 dark:via-gray-800 dark:to-black p-8 md:p-12 rounded-3xl shadow-2xl">
          {/* TV Stand/Base */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-8 bg-gradient-to-b from-gray-800 to-gray-900 rounded-b-2xl shadow-xl"></div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-gray-950 rounded-full shadow-2xl"></div>

          {/* TV Inner Bezel */}
          <div className="relative bg-black p-4 rounded-2xl shadow-inner">
            {/* Screen Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-transparent to-blue-600/10 rounded-2xl blur-2xl animate-pulse"></div>

            {/* Video Screen */}
            <div
              className="relative w-full bg-black overflow-hidden group"
              style={{ paddingBottom: "56.25%" }}
            >
              <div className="absolute inset-0">
                {streamingUrl ? (
                  <video
                    className="w-full h-full"
                    src={streamingUrl}
                    controls
                    autoPlay
                    onTimeUpdate={handleTimeUpdate}
                    poster={movie.backdrop_path}
                    onError={(e) => {
                      console.error("❌ Video playback error:", e);
                      toast.error(
                        "Failed to load video. Please try again later."
                      );
                    }}
                  >
                    <source src={streamingUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : movie.trailer ? (
                  // Fallback to trailer if no video URL
                  <video
                    className="w-full h-full"
                    src={movie.trailer}
                    controls
                    autoPlay
                    poster={movie.backdrop_path}
                  >
                    <source src={movie.trailer} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  // Last resort: YouTube embed or placeholder
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <div className="text-center">
                      <p className="text-white text-xl mb-4">
                        Video not available
                      </p>
                      <button
                        onClick={() => navigate(`/movies/${id}`)}
                        className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                      >
                        Back to Details
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Screen Reflection Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>

          {/* TV Control Panel */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50 animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-gray-700"></div>
            <div className="w-3 h-3 rounded-full bg-gray-700"></div>
          </div>

          {/* TV Brand/Logo */}
          <div className="absolute top-1 left-5">
            <img
              src={assets.logo}
              alt="HusTV"
              className="h-12 w-auto opacity-70"
            />
          </div>

          {/* TV Speaker Grills */}
          <div className="absolute bottom-8 left-8 right-8 flex justify-center gap-1">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-8 bg-gray-700/50 rounded-full"
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Movie Info Below Video */}
      <div className="mt-12 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{movie.title}</h1>
        {movie.tagline && (
          <p className="text-red-400 italic text-lg mb-4">"{movie.tagline}"</p>
        )}
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {movie.overview}
        </p>
      </div>

      {/* Related Movies Section */}
      {relatedMovies.length > 0 && (
        <div className="mt-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-1 w-12 bg-gradient-to-r from-blue-500 dark:from-red-600 to-transparent rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white drop-shadow-lg">
              You May Also Like
            </h2>
          </div>

          <div className="flex flex-wrap max-sm:justify-center gap-8">
            {relatedMovies.map((relatedMovie) => (
              <MovieCard key={relatedMovie._id} movie={relatedMovie} />
            ))}
          </div>
        </div>
      )}

      {/* Show More Button */}
      <div className="flex justify-center mt-20 pb-20">
        <button
          onClick={() => {
            navigate("/movies");
            scrollTo(0, 0);
          }}
          className="px-12 py-3.5 text-sm bg-gray-900 hover:bg-red-900 text-white transition-all duration-300 rounded-full font-medium cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 border-2 border-red-600 hover:border-red-400 hover:shadow-red-600/50 active:scale-95"
        >
          Show More Movies
        </button>
      </div>
    </div>
  );
};
