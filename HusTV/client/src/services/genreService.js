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

  // Search genres
  searchGenres: async (query) => {
    return api.get("/genres/search", {
      params: { q: query },
    });
  },

  // ADMIN: Get genre stats
  getGenreStats: async () => {
    return api.get("/genres/stats");
  },

  // ADMIN: Create genre
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
