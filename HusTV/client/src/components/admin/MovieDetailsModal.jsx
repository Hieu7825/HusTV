// client/src/components/admin/MovieDetailsModal.jsx
import React from "react";
import { X, Star, Youtube, Play } from "lucide-react";

const MovieDetailsModal = ({ movie, onClose }) => {
  if (!movie) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-zinc-950 via-black to-zinc-950 border-2 border-red-900/50 rounded-2xl max-w-4xl w-full shadow-2xl shadow-red-900/50 my-8">
        {/* Header Image */}
        <div className="relative h-96 overflow-hidden rounded-t-2xl">
          <img
            src={movie.backdrop_path || movie.poster_path}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/80 hover:bg-red-600 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Title */}
          <h2 className="text-4xl font-black text-white mb-4">{movie.title}</h2>

          {/* Tagline */}
          {movie.tagline && (
            <p className="text-red-400 italic text-lg mb-4">
              "{movie.tagline}"
            </p>
          )}

          {/* Overview */}
          <p className="text-gray-400 mb-6 leading-relaxed">{movie.overview}</p>

          {/* Video Links */}
          {(movie.trailer || movie.video) && (
            <div className="flex gap-4 mb-6">
              {movie.trailer && (
                <a
                  href={movie.trailer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-lg font-bold text-white shadow-lg shadow-red-600/30 hover:shadow-red-500/50 transition-all duration-300 hover:scale-105"
                >
                  <Youtube className="w-5 h-5" />
                  Watch Trailer
                </a>
              )}
              {movie.video && (
                <a
                  href={movie.video}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-500 hover:to-pink-600 rounded-lg font-bold text-white shadow-lg shadow-rose-600/30 hover:shadow-rose-500/50 transition-all duration-300 hover:scale-105"
                >
                  <Play className="w-5 h-5" />
                  Watch Full Movie
                </a>
              )}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 bg-black/30 rounded-lg border border-red-900/30">
              <p className="text-gray-500 text-xs uppercase mb-1">Rating</p>
              <div className="flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <p className="text-white font-bold text-lg">
                  {movie.vote_average}
                </p>
              </div>
            </div>

            {movie.runtime && (
              <div className="text-center p-4 bg-black/30 rounded-lg border border-red-900/30">
                <p className="text-gray-500 text-xs uppercase mb-1">Runtime</p>
                <p className="text-white font-bold text-lg">
                  {movie.runtime} min
                </p>
              </div>
            )}

            <div className="text-center p-4 bg-black/30 rounded-lg border border-red-900/30">
              <p className="text-gray-500 text-xs uppercase mb-1">Language</p>
              <p className="text-white font-bold text-lg uppercase">
                {movie.original_language}
              </p>
            </div>

            <div className="text-center p-4 bg-black/30 rounded-lg border border-red-900/30">
              <p className="text-gray-500 text-xs uppercase mb-1">Cast</p>
              <p className="text-white font-bold text-lg">
                {movie.casts?.length || 0}
              </p>
            </div>
          </div>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="mt-6">
              <p className="text-gray-500 text-sm uppercase mb-3">Genres</p>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-4 py-2 bg-red-950/30 border border-red-900/40 rounded-lg text-sm font-semibold text-red-300"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Release Date */}
          {movie.release_date && (
            <div className="mt-6">
              <p className="text-gray-500 text-sm uppercase mb-2">
                Release Date
              </p>
              <p className="text-white font-semibold">
                {new Date(movie.release_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsModal;
