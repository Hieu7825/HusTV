// client/src/components/admin/movie-form/CastManager.jsx
import React from "react";
import { Users, Plus, Trash2 } from "lucide-react";

const CastManager = ({
  casts = [],
  newCast,
  onNewCastChange,
  onAddCast,
  onRemoveCast,
}) => {
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onAddCast();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
        <Users className="w-5 h-5" />
        Cast Members
      </h3>

      {/* Cast List */}
      {casts.length > 0 && (
        <div className="space-y-2 mb-3 max-h-40 overflow-y-auto custom-scrollbar">
          {casts.map((cast) => (
            <div
              key={cast.id}
              className="flex items-center justify-between px-4 py-2 bg-black/30 border border-red-900/30 rounded-lg"
            >
              <div>
                <p className="text-white font-semibold">{cast.name}</p>
                {cast.character && (
                  <p className="text-gray-400 text-sm">as {cast.character}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onRemoveCast(cast.id)}
                className="p-1 hover:bg-red-900/30 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Cast Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          type="text"
          value={newCast.name}
          onChange={(e) =>
            onNewCastChange({ ...newCast, name: e.target.value })
          }
          className="px-4 py-2 bg-black/50 border-2 border-red-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
          placeholder="Actor name"
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={newCast.character}
            onChange={(e) =>
              onNewCastChange({ ...newCast, character: e.target.value })
            }
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-2 bg-black/50 border-2 border-red-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
            placeholder="Character name"
          />
          <button
            type="button"
            onClick={onAddCast}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-bold text-white transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default CastManager;
