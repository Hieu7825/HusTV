// client/src/pages/admin/AddMovies.jsx
import React, { useState, useEffect } from "react";
import {
  Film,
  Plus,
  Edit,
  Trash2,
  Star,
  Calendar,
  Clock,
  Globe,
  Search,
  X,
  Image as ImageIcon,
  Users,
  Play,
  Info,
  Youtube,
} from "lucide-react";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import AddNewMovie from "../../components/admin/AddNewMovie";
import MovieDetailsModal from "../../components/admin/MovieDetailsModal";
import Pagination from "../../components/Pagination";
import Loading from "../../components/Loading";
import { videoService } from "../../services";
import toast from "react-hot-toast";

const AddMovies = () => {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 9;

  // Fetch movies from API
  useEffect(() => {
    fetchMovies();
  }, []);

  // Thay thế hàm fetchMovies trong AddMovies.jsx (từ dòng 42-56)

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await videoService.getAllVideos({
        limit: 1000, // Get all for admin
      });

      console.log("📥 Fetch movies response:", response);

      // ✅ Handle different response formats
      let moviesData = [];

      if (Array.isArray(response)) {
        // Direct array
        moviesData = response;
      } else if (response.data) {
        // Response has data property
        if (Array.isArray(response.data)) {
          // data is array
          moviesData = response.data;
        } else if (
          response.data.videos &&
          Array.isArray(response.data.videos)
        ) {
          // data.videos is array
          moviesData = response.data.videos;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // data.data is array (nested)
          moviesData = response.data.data;
        }
      } else if (response.videos && Array.isArray(response.videos)) {
        // Direct videos property
        moviesData = response.videos;
      }

      console.log("✅ Parsed movies:", moviesData.length, "movies");
      setMovies(moviesData);
    } catch (error) {
      console.error("❌ Failed to fetch movies:", error);
      toast.error("Failed to load movies");
      setMovies([]); // ✅ Always set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Filter movies based on search
  const filteredMovies = (Array.isArray(movies) ? movies : []).filter(
    (movie) =>
      movie.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.overview?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);
  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = filteredMovies.slice(
    indexOfFirstMovie,
    indexOfLastMovie
  );

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this movie?")) return;

    try {
      await videoService.deleteVideo(id);
      toast.success("Movie deleted successfully");
      // Refresh movies list
      fetchMovies();
    } catch (error) {
      console.error("Failed to delete movie:", error);
      toast.error(error.response?.data?.message || "Failed to delete movie");
    }
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setShowAddModal(true);
  };

  const handleSaveMovie = async (movieData) => {
    try {
      if (editingMovie) {
        // Update existing movie
        await videoService.updateVideo(editingMovie._id, movieData);
        toast.success("Movie updated successfully");
      } else {
        // Add new movie - Note: This needs FormData for file upload
        // The actual upload should be handled in AddNewMovie component
        toast.success("Movie added successfully");
      }

      // Refresh movies list
      fetchMovies();
      setShowAddModal(false);
      setEditingMovie(null);
    } catch (error) {
      console.error("Failed to save movie:", error);
      toast.error(error.response?.data?.message || "Failed to save movie");
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <BlurCircle top="10%" left="10%" />
        <BlurCircle top="60%" left="70%" />
        <div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-red-700/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <Title text1="Manage" text2="Movies" />
            <p className="text-gray-400 text-lg mt-2 ml-1">
              Total:{" "}
              <span className="text-red-500 font-bold">{movies.length}</span>{" "}
              movies
              {searchTerm && (
                <span className="text-gray-500">
                  {" "}
                  • Showing{" "}
                  <span className="text-red-400 font-bold">
                    {filteredMovies.length}
                  </span>{" "}
                  results
                </span>
              )}
            </p>
          </div>

          {/* Add New Button */}
          <button
            onClick={() => {
              setEditingMovie(null);
              setShowAddModal(true);
            }}
            className="group relative px-6 py-3 bg-gradient-to-r from-red-600 via-red-700 to-red-800 rounded-xl font-bold text-white shadow-2xl shadow-red-600/40 hover:shadow-red-500/60 transition-all duration-300 hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>Add New Movie</span>
            </div>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8 relative">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative flex items-center bg-gradient-to-br from-zinc-950 via-black to-zinc-950 border-2 border-red-900/30 rounded-xl overflow-hidden group-hover:border-red-700/50 transition-all duration-300">
              <Search className="w-5 h-5 text-red-500 ml-4" />
              <input
                type="text"
                placeholder="Search movies by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-4 bg-transparent text-white placeholder-gray-500 focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mr-4 p-1 hover:bg-red-900/30 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[800px]">
          {currentMovies.map((movie, index) => (
            <div
              key={movie._id}
              className="group relative bg-gradient-to-br from-zinc-950 via-black to-zinc-950 rounded-2xl overflow-hidden border-2 border-red-900/30 hover:border-red-600/50 shadow-2xl shadow-red-900/20 hover:shadow-red-600/40 transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Outer Glow */}
              <div className="absolute -inset-1 bg-gradient-to-br from-red-900/20 via-transparent to-red-900/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 rounded-2xl"></div>

              {/* Poster */}
              <div className="relative h-80 overflow-hidden bg-black">
                {movie.poster_path ? (
                  <>
                    <img
                      src={movie.poster_path}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {movie.backdrop_path && (
                      <img
                        src={movie.backdrop_path}
                        alt={movie.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      />
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-950 to-black">
                    <ImageIcon className="w-16 h-16 text-red-900/50" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80"></div>

                {/* Top Info Bar */}
                <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-black/80 backdrop-blur-sm rounded-lg border border-red-600/30 shadow-lg">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-bold text-white">
                      {movie.vote_average}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({movie.vote_count?.toLocaleString()})
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(movie);
                      }}
                      className="p-2 bg-blue-600/90 hover:bg-blue-500 rounded-lg backdrop-blur-sm transition-colors shadow-lg hover:scale-110"
                      title="Edit Movie"
                    >
                      <Edit className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(movie._id);
                      }}
                      className="p-2 bg-red-600/90 hover:bg-red-500 rounded-lg backdrop-blur-sm transition-colors shadow-lg hover:scale-110"
                      title="Delete Movie"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Bottom Title */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-xl font-black text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.9)] line-clamp-2 mb-2">
                    {movie.title}
                  </h3>
                  {movie.tagline && (
                    <p className="text-sm text-red-400 italic drop-shadow-md line-clamp-1">
                      "{movie.tagline}"
                    </p>
                  )}

                  {/* Trailer & Video Buttons */}
                  <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    {movie.trailer && (
                      <a
                        href={movie.trailer}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/90 hover:bg-red-500 rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 shadow-lg"
                      >
                        <Youtube className="w-4 h-4 text-white" />
                        <span className="text-xs font-bold text-white">
                          Trailer
                        </span>
                      </a>
                    )}
                    {movie.video && (
                      <a
                        href={movie.video}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/90 hover:bg-rose-500 rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 shadow-lg"
                      >
                        <Play className="w-4 h-4 text-white" />
                        <span className="text-xs font-bold text-white">
                          Watch
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {/* Genres */}
                <div className="flex flex-wrap gap-2">
                  {movie.genres?.slice(0, 3).map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-red-950/30 border border-red-900/40 rounded-lg text-xs font-semibold text-red-300 hover:border-red-700/60 hover:bg-red-900/20 transition-all duration-300"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>

                {/* Overview */}
                <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
                  {movie.overview}
                </p>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-red-900/40 to-transparent"></div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="text-gray-500 uppercase font-bold text-[10px]">
                        Release
                      </p>
                      <p className="text-white font-semibold">
                        {new Date(movie.release_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {movie.runtime && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4 text-red-600" />
                      <div>
                        <p className="text-gray-500 uppercase font-bold text-[10px]">
                          Runtime
                        </p>
                        <p className="text-white font-semibold">
                          {movie.runtime} min
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-400">
                    <Globe className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="text-gray-500 uppercase font-bold text-[10px]">
                        Language
                      </p>
                      <p className="text-white font-semibold uppercase">
                        {movie.original_language}
                      </p>
                    </div>
                  </div>

                  {movie.casts && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Users className="w-4 h-4 text-red-600" />
                      <div>
                        <p className="text-gray-500 uppercase font-bold text-[10px]">
                          Cast
                        </p>
                        <p className="text-white font-semibold">
                          {movie.casts.length} actors
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Links */}
                {(movie.trailer || movie.video) && (
                  <>
                    <div className="h-px bg-gradient-to-r from-transparent via-red-900/40 to-transparent"></div>
                    <div className="flex gap-2">
                      {movie.trailer && (
                        <a
                          href={movie.trailer}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-lg font-bold text-white shadow-lg shadow-red-600/30 hover:shadow-red-500/50 transition-all duration-300 hover:scale-105"
                        >
                          <Youtube className="w-4 h-4" />
                          Trailer
                        </a>
                      )}
                      {movie.video && (
                        <a
                          href={movie.video}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-500 hover:to-pink-600 rounded-lg font-bold text-white shadow-lg shadow-rose-600/30 hover:shadow-rose-500/50 transition-all duration-300 hover:scale-105"
                        >
                          <Play className="w-4 h-4" />
                          Watch
                        </a>
                      )}
                    </div>
                  </>
                )}

                {/* View Details Button */}
                <button
                  onClick={() => setSelectedMovie(movie)}
                  className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-lg font-bold text-white shadow-lg shadow-red-600/30 hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Info className="w-4 h-4" />
                  View Details
                </button>
              </div>

              {/* Shimmer Effect */}
              <span className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-red-500/20 to-transparent group-hover:animate-[shimmer_2s_infinite]" />
              </span>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredMovies.length === 0 && (
          <div className="text-center py-20">
            <Film className="w-20 h-20 text-red-900/50 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">
              No movies found
            </h3>
            <p className="text-gray-500">Try adjusting your search terms</p>
          </div>
        )}

        {/* Pagination */}
        {filteredMovies.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <AddNewMovie
          movie={editingMovie}
          onClose={() => {
            setShowAddModal(false);
            setEditingMovie(null);
          }}
          onSave={handleSaveMovie}
          onRefresh={fetchMovies}
        />
      )}

      {/* Detail Modal */}
      {selectedMovie && (
        <MovieDetailsModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
};

export default AddMovies;
