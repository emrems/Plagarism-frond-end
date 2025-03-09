import { createStore } from "vuex";

const store = createStore({
  state: {
    token: null,
    role: null,
    id: null,
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
      state.id = null;
    },
    setId(state, id) {
      state.id = id;
    },
  },
  actions: {
    login({ commit }, { token, role, id }) { // id parametresini burada da alıyoruz
      commit("setToken", token);
      commit("setRole", role);
      commit("setId", id); // id'yi burada Vuex state'ine kaydediyoruz
    },
    logout({ commit }) {
      commit("clearAuth");
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.role,
    userId: (state) => state.id,  // Kullanıcı ID'sine getter ile erişiyoruz
  },
});

export default store;
