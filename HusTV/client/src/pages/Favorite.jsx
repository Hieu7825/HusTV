import React, { useState, useMemo } from "react";
import { dummyShowsData } from "../assets/assets";
import MovieCard from "../components/MovieCard";
import BlurCircle from "../components/BlurCircle";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import { Heart, Sparkles, Film } from "lucide-react";

const Favorite = () => {
  // Lấy favorite movies từ localStorage
  const [favoriteIds, setFavoriteIds] = useState(() => {
    const saved = localStorage.getItem("favoriteMovies");
    return saved ? JSON.parse(saved) : [];
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenreIds, setSelectedGenreIds] = useState([]);
  const moviesPerPage = 12;

  // Lọc movies từ dummyShowsData dựa trên favoriteIds
  const favoriteMovies = useMemo(() => {
    return dummyShowsData.filter((movie) => favoriteIds.includes(movie._id));
  }, [favoriteIds]);

  // Lọc favorite movies theo tìm kiếm và thể loại
  const filteredMovies = useMemo(() => {
    let filtered = favoriteMovies;

    // Lọc theo search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((movie) => {
        const title = movie.title?.toLowerCase() || "";
        const overview = movie.overview?.toLowerCase() || "";

        // Lấy tên thể loại để search
        const genreNames = movie.genres
          ? movie.genres.map((g) => g.name.toLowerCase()).join(" ")
          : "";

        return (
          title.includes(query) ||
          overview.includes(query) ||
          genreNames.includes(query)
        );
      });
    }

    // Lọc theo thể loại (dựa vào genre id)
    if (selectedGenreIds.length > 0) {
      filtered = filtered.filter((movie) => {
        if (!movie.genres || !Array.isArray(movie.genres)) {
          return false;
        }

        // Kiểm tra xem movie có ít nhất 1 genre trùng với selectedGenreIds
        const movieGenreIds = movie.genres.map((g) => g.id);
        return selectedGenreIds.some((selectedId) =>
          movieGenreIds.includes(selectedId)
        );
      });
    }

    return filtered;
  }, [favoriteMovies, searchQuery, selectedGenreIds]);

  // Tính toán phân trang dựa trên phim đã lọc
  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);
  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = filteredMovies.slice(
    indexOfFirstMovie,
    indexOfLastMovie
  );

  // Reset về trang 1 khi tìm kiếm hoặc lọc
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilter = (genreIds) => {
    setSelectedGenreIds(genreIds);
    setCurrentPage(1);
  };

  // Hàm xử lý khi thay đổi trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Lấy tên thể loại đã chọn để hiển thị
  const getSelectedGenreNames = () => {
    if (selectedGenreIds.length === 0) return "";

    const genreNames = [];
    const genresMap = new Map();

    // Tạo map các genre từ tất cả favorite movies
    favoriteMovies.forEach((movie) => {
      if (movie.genres) {
        movie.genres.forEach((genre) => {
          genresMap.set(genre.id, genre.name);
        });
      }
    });

    // Lấy tên của các genre đã chọn
    selectedGenreIds.forEach((id) => {
      if (genresMap.has(id)) {
        genreNames.push(genresMap.get(id));
      }
    });

    return genreNames.join(", ");
  };

  return favoriteMovies.length > 0 ? (
    <div className="relative my-20 mb-60 px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden min-h-[80vh]">
      {/* Background Effects */}
      <BlurCircle top="150px" left="-80px" />
      <BlurCircle bottom="50px" right="50px" />

      {/* Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full grid-background" />
      </div>

      {/* Enhanced Header Section - Centered Title */}
      <div className="relative flex justify-center pt-20 pb-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Heart className="w-8 h-8 text-red-500 fill-red-500 animate-pulse" />
            <Sparkles className="w-4 h-4 text-pink-400 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <div className="relative">
            <h2 className="gradient-text text-4xl md:text-5xl font-bold tracking-wide uppercase letter-spacing-2 transform hover:scale-105 transition-all duration-300">
              ❤️ Your Favorites
            </h2>
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-pink-500 to-red-600 animate-pulse rounded-full"></div>
          </div>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-75"></div>
            <div className="w-3 h-3 bg-red-300 rounded-full animate-bounce delay-150"></div>
          </div>
        </div>
      </div>

      {/* Stats Badge */}
      <div className="flex justify-center mb-8">
        <div className="bg-gradient-to-r from-red-950/50 via-pink-950/50 to-red-950/50 border-2 border-red-600/30 rounded-full px-6 py-3 backdrop-blur-sm">
          <p className="text-gray-300 text-sm flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            You have{" "}
            <span className="text-red-500 font-bold text-lg mx-1">
              {favoriteMovies.length}
            </span>{" "}
            favorite {favoriteMovies.length === 1 ? "movie" : "movies"}
          </p>
        </div>
      </div>

      {/* Search Bar Component */}
      <SearchBar
        onSearch={handleSearch}
        onFilter={handleFilter}
        allMovies={favoriteMovies}
      />

      {/* Results Info */}
      {(searchQuery || selectedGenreIds.length > 0) && (
        <div className="mb-8 text-center animate-fade-in">
          <p className="text-gray-400 text-lg">
            Found{" "}
            <span className="text-red-500 font-bold text-xl">
              {filteredMovies.length}
            </span>{" "}
            {filteredMovies.length === 1 ? "movie" : "movies"}
            {searchQuery && (
              <span>
                {" "}
                matching "
                <span className="text-white font-semibold">{searchQuery}</span>"
              </span>
            )}
            {selectedGenreIds.length > 0 && (
              <span>
                {searchQuery ? " and" : ""} in{" "}
                <span className="text-red-400 font-semibold">
                  {getSelectedGenreNames()}
                </span>
              </span>
            )}
          </p>
        </div>
      )}

      {/* Movies Grid */}
      {currentMovies.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-8 max-sm:justify-center">
            {currentMovies.map((movie, index) => (
              <div
                key={movie._id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>

          {/* Pagination Component - Chỉ hiển thị khi có > 12 phim */}
          {filteredMovies.length > 12 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[40vh] animate-fade-in">
          <div className="relative mb-8">
            <Heart className="w-24 h-24 text-gray-600 animate-pulse" />
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
          </div>
          <h1 className="text-3xl font-bold text-center gradient-text mb-4">
            No Favorite Movies Found
          </h1>
          <p className="text-gray-500 text-center max-w-md mb-6">
            {searchQuery
              ? `No results found for "${searchQuery}"`
              : "No movies match the selected filters"}
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedGenreIds([]);
              setCurrentPage(1);
            }}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-500 text-white rounded-xl font-semibold hover:scale-105 transition-transform duration-300 shadow-lg shadow-red-600/50"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-screen animate-fade-in">
      <div className="relative mb-8">
        <Heart className="w-32 h-32 text-gray-600 animate-pulse" />
        <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
      </div>
      <h1 className="text-4xl font-bold text-center gradient-text mb-4">
        No Favorite Movies Yet
      </h1>
      <p className="text-gray-500 text-center max-w-md mb-8">
        Start adding movies to your favorites by clicking the heart icon on any
        movie card!
      </p>
      <a
        href="/movies"
        className="px-8 py-4 bg-gradient-to-r from-red-600 to-pink-500 text-white rounded-xl font-bold hover:scale-105 transition-transform duration-300 shadow-2xl shadow-red-600/50 flex items-center gap-2"
      >
        <Film className="w-5 h-5" />
        Browse Movies
      </a>
    </div>
  );
};

export default Favorite;
