// client/src/components/admin/movie-form/GenreSelector.jsx
import React from "react";
import { X, Plus, ChevronDown } from "lucide-react";

const GenreSelector = ({
  selectedGenres = [],
  availableGenres = [],
  selectedGenreId,
  onGenreIdChange,
  onAddGenre,
  onRemoveGenre,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-red-500">Genres</h3>

      {/* Selected Genres List */}
      <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
        {selectedGenres.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No genres selected</p>
        ) : (
          selectedGenres.map((genre) => (
            <span
              key={genre.id}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-950/30 border border-red-900/40 rounded-lg text-sm font-semibold text-red-300 hover:border-red-700/60 hover:bg-red-900/20 transition-all duration-300"
            >
              {genre.name}
              <button
                type="button"
                onClick={() => onRemoveGenre(genre.id)}
                className="hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
      </div>

      {/* Add Genre Dropdown */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <select
            value={selectedGenreId}
            onChange={(e) => onGenreIdChange(e.target.value)}
            className="w-full px-4 py-3 bg-black/50 border-2 border-red-900/30 rounded-lg text-white focus:outline-none focus:border-red-600 transition-colors appearance-none cursor-pointer pr-10"
          >
            <option value="" className="bg-zinc-900">
              {availableGenres.length === 0
                ? "All genres selected"
                : "Select a genre"}
            </option>
            {availableGenres.map((genre) => (
              <option
                key={genre.id}
                value={genre.id}
                className="bg-zinc-900 hover:bg-zinc-800"
              >
                {genre.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
        <button
          type="button"
          onClick={onAddGenre}
          disabled={!selectedGenreId}
          className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-bold text-white transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
    </div>
  );
};

export default GenreSelector;
