import { createStore } from "vuex";

const store = createStore({
  state: {
    token: null,
    role: null,
  },
  mutations: {
    setToken(state, token) {
      state.token = token;
    },
    setRole(state, role) {
      state.role = role;
    },
    clearAuth(state) {
      state.token = null;
      state.role = null;
    },
  },
  actions: {
    login({ commit }, { token, role }) {
      commit("setToken", token);
      commit("setRole", role);
    },
    logout({ commit }) {
      commit("clearAuth");
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.role,
  },
});

export default store;
