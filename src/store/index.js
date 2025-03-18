import { createStore } from "vuex";
import axios from "axios";

const store = createStore({
  state: {
    token: localStorage.getItem("token") || null,
    role: localStorage.getItem("role") || null,
    id: localStorage.getItem("id") || null,
    refreshToken: localStorage.getItem("refreshToken") || null,
  },
  mutations: {
    setToken(state, token) {
      state.token = token;
      localStorage.setItem("token", token);
    },
    setRole(state, role) {
      state.role = role;
      localStorage.setItem("role", role);
    },
    setId(state, id) {
      state.id = id;
      localStorage.setItem("id", id);
    },
    setRefreshToken(state, refreshToken) {
      state.refreshToken = refreshToken;
      localStorage.setItem("refreshToken", refreshToken);
      document.cookie = `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict;`;
    },
    clearAuth(state) {
      state.token = null;
      state.role = null;
      state.id = null;
      state.refreshToken = null;
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("id");
      localStorage.removeItem("refreshToken");
      document.cookie = "refreshToken=; Max-Age=0; Secure; SameSite=Strict;";
    },
  },
  actions: {
    async login({ commit }, { token, role, id, refreshToken }) {
      commit("setToken", token);
      commit("setRole", role);
      commit("setId", id);
      commit("setRefreshToken", refreshToken);
    },

    async refreshToken({ commit, dispatch }) {
      try {
        const response = await axios.post("/api/auth/refresh", {}, { withCredentials: true });
        commit("setToken", response.data.Token);
        commit("setRefreshToken", response.data.RefreshToken);
        return response.data;
      } catch (error) {
        console.error("Refresh token hatası:", error.response?.data || error.message);
        dispatch("logout"); // Refresh token başarısız olursa oturumu kapat
        throw error;
      }
    },

    logout({ commit }) {
      commit("clearAuth");
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.role,
    userId: (state) => state.id,
    getRefreshToken: (state) => state.refreshToken,
  },
});

export default store;