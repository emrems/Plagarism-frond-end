<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
      <h1 class="text-2xl font-bold text-center text-gray-700 mb-6">Giriş Yap</h1>
      <form @submit.prevent="login">
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700">E-posta:</label>
          <input
            v-model="email"
            type="email"
            id="email"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            placeholder="E-postanızı giriniz"
            required
          />
        </div>
        <div class="mb-4">
          <label for="password" class="block text-sm font-medium text-gray-700">Şifre:</label>
          <input
            v-model="password"
            type="password"
            id="password"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            placeholder="Şifrenizi giriniz"
            required
          />
        </div>
        <div class="mt-6">
          <button
            type="submit"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Giriş Yap
          </button>
        </div>
      </form>
      <p v-if="error" class="text-red-500 text-sm text-center mt-4">{{ error }}</p>
      <!-- Kayıt Ol Butonu -->
      <div class="mt-4 text-center">
        <button 
          @click="goToRegister" 
          type="button" 
          class="text-blue-600 hover:underline"
        >
          Kayıt Ol
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: "",
      password: "",
      error: null,
    };
  },
  methods: {
    async login() {
      try {
        const response = await fetch("https://localhost:7057/api/Auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Eposta: this.email, Sifre: this.password }),
        });

        if (!response.ok) {
          throw new Error("Login failed");
        }

        const data = await response.json();
        console.log(data);

        // Store'da oturum açma işlemi
        this.$store.dispatch("login", {
          token: data.token,
          role: data.rol,
          id: data.id,  // Gelen "id" bilgisi ile store'a kaydediyoruz
          refreshToken: data.refreshToken,  // Refresh token'ı da kaydediyoruz
        });

        // Kullanıcı rolüne göre yönlendirme
        if (data.rol === "Admin") {
          this.$router.push({ name: "AdminDashboard" });
        } else if (data.rol === "Teacher") {
          this.$router.push({ name: "TeacherDashboard" });
        } else if (data.rol === "Student") {
          this.$router.push({ name: "StudentDashboard" });
        }
      } catch (error) {
        console.error("Login error:", error);
        this.error = "E-posta veya şifre yanlış. Lütfen tekrar deneyin.";
      }
    },
    goToRegister() {
      this.$router.push({ name: "Register" });
    },
  },
};
</script>
