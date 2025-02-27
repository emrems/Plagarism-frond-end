<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <div class="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
      <h1 class="text-2xl font-semibold text-center mb-6 text-gray-800">Kayıt Ol</h1>
      <form @submit.prevent="handleRegister">
        <div class="mb-4">
          <label for="ad" class="block text-sm font-medium text-gray-700 mb-1">Ad:</label>
          <input
            v-model="ad"
            type="text"
            id="ad"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Adınızı girin"
            required
          />
        </div>
        <div class="mb-4">
          <label for="soyad" class="block text-sm font-medium text-gray-700 mb-1">Soyad:</label>
          <input
            v-model="soyad"
            type="text"
            id="soyad"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Soyadınızı girin"
            required
          />
        </div>
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">E-posta:</label>
          <input
            v-model="email"
            type="email"
            id="email"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="E-posta adresinizi girin"
            required
          />
        </div>
        <div class="mb-4">
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Şifre:</label>
          <input
            v-model="password"
            type="password"
            id="password"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Şifrenizi girin"
            required
          />
        </div>
        <div class="mb-6">
          <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Rol:</label>
          <select
            v-model="role"
            id="role"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          >
            <option value="Student">Student</option>
            <option value="Teacher">Teacher</option>
            
          </select>
        </div>
        <button
          type="submit"
          class="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Kayıt Ol
        </button>
      </form>
      <p v-if="error" class="text-red-500 text-sm text-center mt-4">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Login from "./Login.vue";

export default {
  data() {
    return {
      ad: "",
      soyad: "",
      email: "",
      password: "",
      role: "Student",
      error: null,
    };
  },
  methods: {
    async handleRegister() {
      this.error = null;
      try {
        await axios.post("https://localhost:7057/api/Kullanici", {
          Ad: this.ad,
          Soyad: this.soyad,
          Eposta: this.email,
          Sifre: this.password,
          Rol: this.role,
        });
        alert("Kayıt başarılı! Giriş yapabilirsiniz.");
        this.$router.push("/login");
      } catch (error) {
        this.error =
          error.response?.data?.errors
            ? Object.values(error.response.data.errors).flat().join(", ")
            : "Kayıt işlemi sırasında bir hata oluştu.";
      }
    },
  },
};
</script>


