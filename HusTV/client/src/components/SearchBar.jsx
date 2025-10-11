import React, { useState, useEffect, useRef } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

const SearchBar = ({ onSearch, onFilter, allMovies = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const dropdownRef = useRef(null);

  // Lấy danh sách thể loại từ tất cả phim và sắp xếp theo alphabet
  const getAllGenres = () => {
    const genresMap = new Map();

    allMovies.forEach((movie) => {
      if (movie.genres && Array.isArray(movie.genres)) {
        movie.genres.forEach((genreObj) => {
          // Lưu cả id và name để dễ xử lý
          if (genreObj.id && genreObj.name) {
            genresMap.set(genreObj.id, genreObj.name);
          }
        });
      }
    });

    // Chuyển thành array và sắp xếp theo tên
    return Array.from(genresMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const genres = getAllGenres();

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = (value) => {
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Xử lý chọn/bỏ chọn thể loại
  const toggleGenre = (genreId) => {
    const updatedGenres = selectedGenres.includes(genreId)
      ? selectedGenres.filter((id) => id !== genreId)
      : [...selectedGenres, genreId];

    setSelectedGenres(updatedGenres);
    if (onFilter) {
      onFilter(updatedGenres);
    }
  };

  // Xóa tất cả bộ lọc
  const clearFilters = () => {
    setSelectedGenres([]);
    if (onFilter) {
      onFilter([]);
    }
  };

  // Lấy tên thể loại đã chọn để hiển thị
  const getSelectedGenreNames = () => {
    return genres
      .filter((genre) => selectedGenres.includes(genre.id))
      .map((genre) => genre.name);
  };

  return (
    <div className="flex justify-center mb-20">
      <div className="relative w-full max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          {/* Main Search Container */}
          <div className="relative flex-1 group">
            {/* Animated Background Effects */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div className="glow-effect"></div>
              <div className="dark-border-bg"></div>
              <div className="dark-border-bg"></div>
              <div className="dark-border-bg"></div>
              <div className="white-effect"></div>
              <div className="border-effect"></div>
            </div>

            {/* Search Input */}
            <div className="relative z-10">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search for movies, actors, directors, genres..."
                className="search-input w-full h-16 pl-16 pr-6 border-none rounded-2xl text-white text-lg placeholder-gray-400 focus:outline-none transition-all duration-300 font-medium focus:placeholder-gray-300"
              />

              {/* Search Icon */}
              <div className="absolute left-5 top-1/2 transform -translate-y-1/2 z-20">
                <Search className="w-6 h-6 text-red-500 transition-all duration-300 group-hover:text-red-400" />
              </div>

              {/* Input Effects */}
              <div className="input-mask top-4 left-16" />
              <div className="pink-mask top-3 left-3" />
            </div>
          </div>

          {/* Filter Button - Tách riêng */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="relative h-16 px-6 rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-red-500/50 transition-all duration-300 flex items-center gap-3 group overflow-hidden"
            >
              {/* Button Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <SlidersHorizontal className="w-5 h-5 text-red-500 relative z-10 transition-transform duration-300 group-hover:rotate-90" />
              <span className="text-white font-medium relative z-10">
                Filter
              </span>

              {/* Badge hiển thị số lượng bộ lọc đang áp dụng */}
              {selectedGenres.length > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse z-20">
                  {selectedGenres.length}
                </div>
              )}
            </button>

            {/* Filter Dropdown */}
            {showFilterDropdown && (
              <div className="absolute right-0 mt-4 w-80 max-h-96 overflow-hidden bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl z-50 animate-fade-in">
                {/* Dropdown Header */}
                <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm px-6 py-4 border-b border-gray-700/50 flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-red-500" />
                    <h3 className="text-white font-semibold">
                      Filter by Genre
                    </h3>
                  </div>
                  {selectedGenres.length > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-red-500 hover:text-red-400 text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Clear
                    </button>
                  )}
                </div>

                {/* Genres List with Scroll */}
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  <div className="p-4">
                    {genres.length > 0 ? (
                      <div className="space-y-2">
                        {genres.map((genre) => (
                          <label
                            key={genre.id}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800/50 transition-all duration-200 cursor-pointer group"
                          >
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={selectedGenres.includes(genre.id)}
                                onChange={() => toggleGenre(genre.id)}
                                className="w-5 h-5 rounded border-2 border-gray-600 bg-transparent checked:bg-red-500 checked:border-red-500 transition-all duration-200 cursor-pointer appearance-none"
                              />
                              {selectedGenres.includes(genre.id) && (
                                <svg
                                  className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="3"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              )}
                            </div>
                            <span className="text-gray-300 group-hover:text-white transition-colors duration-200 font-medium">
                              {genre.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No genres available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Tips */}
        <div className="absolute -bottom-8 left-0 right-0 text-center">
          <p className="text-gray-400 text-sm">
            <span className="text-red-400">✨</span> Try searching by movie
            title, actor, genre, or year
            {selectedGenres.length > 0 && (
              <span className="text-red-400 ml-2">
                • Filtering by: {getSelectedGenreNames().join(", ")}
              </span>
            )}
          </p>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.8);
        }
      `}</style>
    </div>
  );
};

export default SearchBar;
