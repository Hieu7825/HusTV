// client/src/pages/admin/ListMovies.jsx
import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Film,
  Eye,
  Star,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import Loading from "../../components/Loading";
import Pagination from "../../components/Pagination";
import { videoService } from "../../services";
import toast from "react-hot-toast";
import MovieDetailsModal from "../../components/admin/MovieDetailsModal";

const ListMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 10;

  // Fetch movies from API
  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await videoService.getAllVideos();
      setMovies(response.data.videos || []);
    } catch (error) {
      console.error("Error fetching movies:", error);
      toast.error("Failed to load movies");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // Filter movies based on search
  const filteredMovies = movies.filter(
    (movie) =>
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.genres?.some((genre) =>
        genre.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Sort movies
  const sortedMovies = [...filteredMovies].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (sortConfig.key === "title") {
      aValue = a.title.toLowerCase();
      bValue = b.title.toLowerCase();
    }

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedMovies.length / moviesPerPage);
  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = sortedMovies.slice(indexOfFirstMovie, indexOfLastMovie);

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewDetails = (movie) => {
    setSelectedMovie(movie);
    setShowModal(true);
  };

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) {
      return;
    }

    try {
      setDeleteLoading(movieId);
      await videoService.deleteVideo(movieId);
      toast.success("Movie deleted successfully");
      fetchMovies(); // Refresh list
    } catch (error) {
      console.error("Error deleting movie:", error);
      toast.error("Failed to delete movie");
    } finally {
      setDeleteLoading(null);
    }
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 text-gray-500" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-4 h-4 text-red-500" />
    ) : (
      <ArrowDown className="w-4 h-4 text-red-500" />
    );
  };

  return loading ? (
    <Loading />
  ) : (
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
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Title text1="List" text2="Movies" />
              <p className="text-gray-400 text-lg mt-2 ml-1">
                Total:{" "}
                <span className="text-red-500 font-bold">{movies.length}</span>{" "}
                movies
                {searchTerm && (
                  <span className="text-gray-500">
                    {" "}
                    • Showing{" "}
                    <span className="text-red-400 font-bold">
                      {sortedMovies.length}
                    </span>{" "}
                    results
                  </span>
                )}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-4">
              <div className="bg-gradient-to-br from-zinc-950 via-black to-zinc-950 border-2 border-red-900/30 rounded-xl px-6 py-3">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">
                  Total Views
                </p>
                <p className="text-2xl font-black text-red-500">
                  {movies
                    .reduce((sum, m) => sum + (m.view || 0), 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-br from-zinc-950 via-black to-zinc-950 border-2 border-red-900/30 rounded-xl px-6 py-3">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">
                  Avg Rating
                </p>
                <p className="text-2xl font-black text-yellow-400">
                  {movies.length > 0
                    ? (
                        movies.reduce(
                          (sum, m) => sum + (m.vote_average || 0),
                          0
                        ) / movies.length
                      ).toFixed(1)
                    : "0.0"}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative flex items-center bg-gradient-to-br from-zinc-950 via-black to-zinc-950 border-2 border-red-900/30 rounded-xl overflow-hidden group-hover:border-red-700/50 transition-all duration-300">
              <Search className="w-5 h-5 text-red-500 ml-4" />
              <input
                type="text"
                placeholder="Search movies by title or genre..."
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

        {/* Table */}
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl blur opacity-10"></div>
          <div className="relative bg-gradient-to-br from-zinc-950 via-black to-zinc-950 border-2 border-red-900/30 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-red-950/50 via-red-900/30 to-red-950/50 border-b-2 border-red-900/50">
                    <th className="p-4 text-left">
                      <div className="flex items-center gap-2">
                        <Film className="w-4 h-4 text-red-500" />
                        <span className="font-black uppercase text-sm tracking-wider text-gray-300">
                          Poster
                        </span>
                      </div>
                    </th>
                    <th
                      className="p-4 text-left cursor-pointer hover:bg-red-900/20 transition-colors group"
                      onClick={() => handleSort("title")}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-black uppercase text-sm tracking-wider text-gray-300">
                          Movie Title
                        </span>
                        <SortIcon columnKey="title" />
                      </div>
                    </th>
                    <th
                      className="p-4 text-left cursor-pointer hover:bg-red-900/20 transition-colors group"
                      onClick={() => handleSort("vote_average")}
                    >
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-black uppercase text-sm tracking-wider text-gray-300">
                          Rating
                        </span>
                        <SortIcon columnKey="vote_average" />
                      </div>
                    </th>
                    <th className="p-4 text-left">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-red-500" />
                        <span className="font-black uppercase text-sm tracking-wider text-gray-300">
                          Release
                        </span>
                      </div>
                    </th>
                    <th className="p-4 text-left">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-500" />
                        <span className="font-black uppercase text-sm tracking-wider text-gray-300">
                          Runtime
                        </span>
                      </div>
                    </th>
                    <th
                      className="p-4 text-left cursor-pointer hover:bg-red-900/20 transition-colors group"
                      onClick={() => handleSort("view")}
                    >
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-red-500" />
                        <span className="font-black uppercase text-sm tracking-wider text-gray-300">
                          Views
                        </span>
                        <SortIcon columnKey="view" />
                      </div>
                    </th>
                    <th className="p-4 text-left">
                      <span className="font-black uppercase text-sm tracking-wider text-gray-300">
                        Genres
                      </span>
                    </th>
                    <th className="p-4 text-left">
                      <span className="font-black uppercase text-sm tracking-wider text-gray-300">
                        Actions
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentMovies.map((movie, index) => (
                    <tr
                      key={movie._id}
                      className="border-b border-red-900/20 hover:bg-red-950/20 transition-all duration-300 group"
                      style={{
                        animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                      }}
                    >
                      <td className="p-4">
                        <div className="relative w-16 h-24 rounded-lg overflow-hidden border-2 border-red-900/50 group-hover:border-red-500/70 transition-all duration-300 shadow-lg">
                          <img
                            src={movie.poster_path}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = "/placeholder-movie.jpg";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="max-w-xs">
                          <p className="font-bold text-white text-base group-hover:text-red-400 transition-colors line-clamp-2">
                            {movie.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {movie.overview}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full w-fit border border-red-900/30">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-white font-bold text-sm">
                            {(movie.vote_average || 0).toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-300 font-medium">
                          {movie.release_date
                            ? new Date(movie.release_date).getFullYear()
                            : "N/A"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-300 font-medium">
                          {movie.runtime || 0} min
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 bg-gradient-to-r from-red-950/50 to-transparent px-3 py-1.5 rounded-full w-fit border border-red-900/30">
                          <Eye className="w-4 h-4 text-red-500" />
                          <span className="text-white font-bold text-sm">
                            {(movie.view || 0).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {movie.genres?.slice(0, 2).map((genre) => (
                            <span
                              key={genre.id}
                              className="px-2 py-1 bg-red-900/30 text-red-400 text-xs font-bold rounded-full border border-red-800/50"
                            >
                              {genre.name}
                            </span>
                          ))}
                          {movie.genres?.length > 2 && (
                            <span className="px-2 py-1 bg-gray-900/50 text-gray-400 text-xs font-bold rounded-full">
                              +{movie.genres.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(movie)}
                            className="p-2 bg-blue-900/30 hover:bg-blue-700/50 rounded-lg transition-colors group/btn"
                            title="View Details"
                          >
                            <Edit className="w-4 h-4 text-blue-400 group-hover/btn:text-blue-300" />
                          </button>
                          <button
                            onClick={() => handleDeleteMovie(movie._id)}
                            disabled={deleteLoading === movie._id}
                            className="p-2 bg-red-900/30 hover:bg-red-700/50 rounded-lg transition-colors group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Movie"
                          >
                            {deleteLoading === movie._id ? (
                              <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-red-400 group-hover/btn:text-red-300" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* No Results */}
            {sortedMovies.length === 0 && (
              <div className="text-center py-20">
                <Film className="w-20 h-20 text-red-900/50 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-400 mb-2">
                  No movies found
                </h3>
                <p className="text-gray-500">Try adjusting your search terms</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-8 flex items-center justify-between text-sm text-gray-500">
          <p>
            Showing{" "}
            <span className="text-red-400 font-bold">
              {indexOfFirstMovie + 1}
            </span>{" "}
            to{" "}
            <span className="text-red-400 font-bold">
              {Math.min(indexOfLastMovie, sortedMovies.length)}
            </span>{" "}
            of{" "}
            <span className="text-red-400 font-bold">
              {sortedMovies.length}
            </span>{" "}
            movies
          </p>
          {sortConfig.key && (
            <p>
              Sorted by{" "}
              <span className="text-red-400 font-bold capitalize">
                {sortConfig.key === "vote_average" ? "Rating" : sortConfig.key}
              </span>{" "}
              ({sortConfig.direction === "asc" ? "Ascending" : "Descending"})
            </p>
          )}
        </div>

        {/* Pagination */}
        {sortedMovies.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Movie Details Modal */}
      {showModal && selectedMovie && (
        <MovieDetailsModal
          movie={selectedMovie}
          onClose={() => {
            setShowModal(false);
            setSelectedMovie(null);
          }}
        />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ListMovies;
