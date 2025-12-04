// client/src/services/genreService.js
import api from "../lib/axios";

export const genreService = {
  // Get all genres (sorted A-Z)
  getAllGenres: async () => {
    return api.get("/genres");
  },

  // Get single genre
  getGenreById: async (id) => {
    return api.get(`/genres/${id}`);
  },

  // ADMIN: Create genre (no ID needed - auto-generated)
  createGenre: async (data) => {
    return api.post("/genres", data);
  },

  // ADMIN: Update genre
  updateGenre: async (id, data) => {
    return api.put(`/genres/${id}`, data);
  },

  // ADMIN: Delete genre
  deleteGenre: async (id) => {
    return api.delete(`/genres/${id}`);
  },
};

export default genreService;
