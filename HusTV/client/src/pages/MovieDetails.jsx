// client/src/pages/MovieDetails.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { videoService, userService } from "../services";
import timeFormat from "../lib/timeFormat";
import { Heart, PlayCircle, Star } from "lucide-react";
import BlurCircle from "../components/BlurCircle";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";
import toast from "react-hot-toast";

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch movie details
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        const response = await videoService.getVideoById(id);

        console.log("📥 Movie details response:", response);

        // ✅ FIX 1: Parse response.data.video (backend returns { success: true, video: {...} })
        const movieData = response.data?.video || response.data;

        console.log("✅ Parsed movie:", movieData);
        setMovie(movieData);

        // Increment view count
        await videoService.incrementView(id);
      } catch (error) {
        console.error("❌ Failed to fetch movie details:", error);
        toast.error("Failed to load movie details");
        navigate("/movies");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id, navigate]);

  // Check if movie is in favorites
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!movie?._id) return; // Wait for movie to load

      try {
        const response = await userService.checkFavorite(movie._id);
        const isFavorite =
          response.data?.isFavorite || response.isFavorite || false;
        setIsLiked(isFavorite);
      } catch (error) {
        console.error("Failed to check favorite status:", error);
      }
    };

    if (id) {
      checkFavoriteStatus();
    }
  }, [movie?._id]);

  // Fetch related movies (by genre)
  useEffect(() => {
    const fetchRelatedMovies = async () => {
      if (!movie?.genres?.length) return;

      try {
        const genreId = movie.genres[0].id;
        const response = await videoService.getVideosByGenre(genreId);

        console.log("📥 Related movies response:", response);

        // ✅ FIX 2: Parse response.data.videos
        const movies = response.data?.videos || [];

        // Filter out current movie and take first 3
        const related = movies.filter((m) => m._id !== id).slice(0, 3);

        console.log("✅ Parsed related movies:", related.length);
        setRelatedMovies(related);
      } catch (error) {
        console.error("❌ Failed to fetch related movies:", error);
        // Don't show error toast - related movies are optional
      }
    };

    fetchRelatedMovies();
  }, [movie, id]);

  // Toggle favorite
  const toggleFavorite = async () => {
    try {
      // Validate movie exists and has _id
      if (!movie?._id) {
        toast.error("Movie data not loaded");
        return;
      }

      console.log("🎬 Full movie object:", movie);
      console.log("❤️ movie._id:", movie._id);
      console.log("❤️ movie._id type:", typeof movie._id);
      console.log("❤️ movie._id length:", movie._id?.length);
      console.log("❤️ movie._id is string?:", typeof movie._id === "string");

      // Check if it's a valid MongoDB ObjectId (24 hex chars)
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(movie._id);
      console.log("❤️ Is valid ObjectId?:", isValidObjectId);

      const response = await userService.toggleFavorite(movie._id);

      // Toggle local state
      setIsLiked(!isLiked);
      toast.success(isLiked ? "Removed from favorites" : "Added to favorites");
    } catch (error) {
      console.error("Failed to toggle favorite:", error);

      // Check if it's an auth error
      if (error.response?.status === 401) {
        toast.error("Please login to add favorites");
      } else {
        toast.error("Failed to update favorites");
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!movie) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-white text-xl">Movie not found</p>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-25 min-h-screen bg-gradient-to-b from-white via-gray-50 to-white dark:from-black dark:via-gray-900 dark:to-black">
      {/* Hero Background */}
      <div className="relative w-full h-96 mb-12 rounded-3xl overflow-hidden">
        <img
          src={movie.backdrop_path}
          alt={movie.title}
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            e.target.src = movie.poster_path; // Fallback to poster
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/40 dark:from-black dark:via-black/80 dark:to-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white/60 dark:from-black dark:via-transparent dark:to-black/60"></div>

        {/* Floating Info on Backdrop */}
        <div className="absolute bottom-8 left-8 right-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              {movie.featured && (
                <span className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg shadow-red-600/50">
                  Featured
                </span>
              )}
              <span className="px-4 py-1.5 bg-black/70 backdrop-blur-sm text-gray-300 text-xs font-semibold rounded-full border border-red-600/30">
                {new Date(movie.release_date).getFullYear()}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-2xl mb-2">
              {movie.title}
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-600/30">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-white font-bold">
                  {movie.vote_average?.toFixed(1) || "N/A"}
                </span>
                <span className="text-gray-400">/ 10</span>
              </div>
              <span className="text-gray-300 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full border border-red-600/30">
                {movie.vote_count?.toLocaleString() || 0} votes
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto relative p-10 md:p-12 bg-white dark:bg-black rounded-3xl border-4 border-blue-500 dark:border-red-600 shadow-2xl shadow-blue-500/30 dark:shadow-red-600/50 hover:shadow-blue-500/50 dark:hover:shadow-red-600/70 hover:border-blue-400 dark:hover:border-red-500 transition-all duration-500">
        <BlurCircle top="-100px" right="-100px" />

        {/* Movie Poster */}
        <div className="relative max-md:mx-auto group">
          <div className="absolute inset-0 bg-gradient-to-t from-red-600/30 via-transparent to-transparent rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <img
            src={movie.poster_path}
            alt={movie.title}
            className="relative rounded-xl h-104 max-w-70 object-cover border-4 border-red-600 shadow-2xl shadow-red-600/50 hover:shadow-red-600/70 hover:border-red-500 transition-all duration-500 hover:scale-105"
            onError={(e) => {
              e.target.src = "/placeholder-poster.jpg";
            }}
          />
        </div>

        {/* Movie Info */}
        <div className="flex flex-col gap-4">
          <span className="text-red-500 font-bold text-sm tracking-wider uppercase bg-red-950/50 px-3 py-1 rounded-full w-fit border border-red-600/30">
            {movie.original_language?.toUpperCase() || "EN"}
          </span>

          <h1 className="text-4xl md:text-5xl font-bold max-w-2xl text-balance text-white drop-shadow-2xl">
            {movie.title}
          </h1>

          {movie.tagline && (
            <p className="text-red-400 italic text-lg">"{movie.tagline}"</p>
          )}

          <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full w-fit border-2 border-red-600/30 shadow-lg shadow-red-600/20">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 drop-shadow-lg" />
            <span className="text-white font-semibold">
              {movie.vote_average?.toFixed(1) || "N/A"}
            </span>
            <span className="text-gray-400 text-sm">User Rating</span>
          </div>

          <p className="text-gray-300 mt-2 leading-relaxed max-w-xl text-base drop-shadow-md">
            {movie.overview}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-gray-300 text-sm">
            <span className="bg-gray-900 px-3 py-1.5 rounded-full border border-red-600/30 shadow-md">
              {timeFormat(movie.runtime)}
            </span>
            <span className="text-red-500">•</span>
            <span className="bg-gray-900 px-3 py-1.5 rounded-full border border-red-600/30 shadow-md">
              {movie.genres?.map((genre) => genre.name).join(", ") || "N/A"}
            </span>
            <span className="text-red-500">•</span>
            <span className="bg-gray-900 px-3 py-1.5 rounded-full border border-red-600/30 shadow-md">
              {new Date(movie.release_date).getFullYear()}
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-4 mt-6">
            <button
              onClick={() => {
                navigate(`/video/${id}`);
                scrollTo(0, 0);
              }}
              className="flex items-center gap-2 px-8 py-3 text-sm bg-gray-900 hover:bg-red-900 text-white transition-all duration-300 rounded-full font-medium cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 border-2 border-red-600 hover:border-red-400 hover:shadow-red-600/50 active:scale-95"
            >
              <PlayCircle className="w-5 h-5" />
              Play Now
            </button>

            <button
              onClick={toggleFavorite}
              className={`p-3 rounded-full transition-all duration-300 cursor-pointer border-2 shadow-lg hover:scale-110 active:scale-95 ${
                isLiked
                  ? "bg-red-600 border-red-500 shadow-red-600/50 hover:shadow-red-600/70"
                  : "bg-gray-900 border-red-600 shadow-red-600/30 hover:bg-red-900 hover:shadow-red-600/50"
              }`}
              title={isLiked ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Heart
                className={`w-5 h-5 transition-all duration-300 ${
                  isLiked ? "fill-white text-white" : "text-red-500"
                }`}
              />
            </button>
          </div>
        </div>
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

export default MovieDetails;
