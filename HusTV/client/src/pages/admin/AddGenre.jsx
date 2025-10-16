import React, { useState, useEffect } from "react";
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Sparkles,
  Save,
} from "lucide-react";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import { dummyGenreData } from "../../assets/assets";
import Pagination from "../../components/Pagination";

const AddGenre = () => {
  const [genres, setGenres] = useState(dummyGenreData);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [genreName, setGenreName] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const genresPerPage = 12;

  // Filter genres by name or ID
  const filteredGenres = genres
    .filter((genre) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesName = genre.name.toLowerCase().includes(searchLower);
      const matchesId = genre.id.toString().includes(searchTerm);
      return matchesName || matchesId;
    })
    .sort((a, b) => a.name.localeCompare(b.name)); // Sắp xếp theo bảng chữ cái

  // Pagination calculation
  const totalPages = Math.ceil(filteredGenres.length / genresPerPage);
  const indexOfLast = currentPage * genresPerPage;
  const indexOfFirst = indexOfLast - genresPerPage;
  const currentGenres = filteredGenres.slice(indexOfFirst, indexOfLast);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Scroll when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this genre?")) {
      setGenres(genres.filter((genre) => genre.id !== id));
    }
  };

  const handleEdit = (genre) => {
    setEditingGenre(genre);
    setGenreName(genre.name);
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!genreName.trim()) {
      alert("Please enter a genre name!");
      return;
    }

    if (editingGenre) {
      // Update existing genre
      setGenres(
        genres.map((g) =>
          g.id === editingGenre.id ? { ...g, name: genreName } : g
        )
      );
    } else {
      // Add new genre
      const newGenre = {
        id: Math.max(...genres.map((g) => g.id)) + 1,
        name: genreName,
      };
      setGenres([newGenre, ...genres]);
    }

    setShowModal(false);
    setEditingGenre(null);
    setGenreName("");
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden">
      {/* Background Effects */}
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
            <Title text1="Manage" text2="Genres" />
            <p className="text-gray-400 text-lg mt-2 ml-1">
              Total:{" "}
              <span className="text-red-500 font-bold">{genres.length}</span>{" "}
              genres
              {searchTerm && (
                <span className="text-gray-500">
                  {" "}
                  • Showing{" "}
                  <span className="text-red-400 font-bold">
                    {filteredGenres.length}
                  </span>{" "}
                  results
                </span>
              )}
            </p>
          </div>

          {/* Add New Button */}
          <button
            onClick={() => {
              setEditingGenre(null);
              setGenreName("");
              setShowModal(true);
            }}
            className="group relative px-6 py-3 bg-gradient-to-r from-red-600 via-red-700 to-red-800 rounded-xl font-bold text-white shadow-2xl shadow-red-600/40 hover:shadow-red-500/60 transition-all duration-300 hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>Add New Genre</span>
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
                placeholder="Search genres by name or ID..."
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

        {/* Genres Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 h-[600px]">
          {currentGenres.map((genre, index) => (
            <div
              key={genre.id}
              className="group relative bg-gradient-to-br from-zinc-950 via-black to-zinc-950 rounded-xl overflow-hidden border-2 border-red-900/30 hover:border-red-600/50 shadow-xl shadow-red-900/10 hover:shadow-red-600/30 transition-all duration-300 hover:-translate-y-1 h-[180px]"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-br from-red-900/20 via-transparent to-red-900/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 rounded-xl"></div>

              {/* Content */}
              <div className="relative p-6 flex flex-col items-center justify-center h-full">
                {/* Icon */}
                <div className="mb-3 p-3 bg-red-900/20 rounded-full group-hover:bg-red-900/30 transition-colors">
                  <Tag className="w-6 h-6 text-red-500" />
                </div>

                {/* Genre Name */}
                <h3 className="text-lg font-bold text-white text-center mb-2">
                  {genre.name}
                </h3>

                {/* Genre ID */}
                <p className="text-xs text-gray-500">ID: {genre.id}</p>

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={() => handleEdit(genre)}
                    className="p-2 bg-blue-600/90 hover:bg-blue-500 rounded-lg backdrop-blur-sm transition-colors shadow-lg hover:scale-110"
                    title="Edit Genre"
                  >
                    <Edit className="w-3 h-3 text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(genre.id)}
                    className="p-2 bg-red-600/90 hover:bg-red-500 rounded-lg backdrop-blur-sm transition-colors shadow-lg hover:scale-110"
                    title="Delete Genre"
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>

              {/* Shimmer Effect */}
              <span className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-red-500/20 to-transparent group-hover:animate-[shimmer_2s_infinite]" />
              </span>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredGenres.length === 0 && (
          <div className="text-center py-20">
            <Tag className="w-20 h-20 text-red-900/50 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">
              No genres found
            </h3>
            <p className="text-gray-500">Try adjusting your search terms</p>
          </div>
        )}

        {/* Pagination */}
        {filteredGenres.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-zinc-950 via-black to-zinc-950 border-2 border-red-900/50 rounded-2xl max-w-md w-full shadow-2xl shadow-red-900/50">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-red-900/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600/20 rounded-lg">
                  <Tag className="w-6 h-6 text-red-500" />
                </div>
                <h2 className="text-2xl font-black text-white">
                  {editingGenre ? "Edit Genre" : "Add New Genre"}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingGenre(null);
                  setGenreName("");
                }}
                className="p-2 hover:bg-red-900/30 rounded-lg transition-colors group"
              >
                <X className="w-6 h-6 text-gray-400 group-hover:text-red-500" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">
                  Genre Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={genreName}
                  onChange={(e) => setGenreName(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border-2 border-red-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                  placeholder="Enter genre name"
                  autoFocus
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingGenre(null);
                    setGenreName("");
                  }}
                  className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-lg font-bold text-white shadow-lg shadow-red-600/30 hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingGenre ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddGenre;
