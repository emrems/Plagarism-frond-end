<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Logout Butonu -->
    <div class="absolute top-4 right-4 flex items-center gap-4">
      <span class="text-gray-700 font-medium">Hoş geldin, {{ userName }}</span>
      <button
        @click="logout"
        class="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Çıkış Yap
      </button>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-4xl font-extrabold text-gray-900 mb-12 text-center">
        Öğrenci Paneli
      </h1>

      <!-- Available Assignments -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="assignment in assignments"
          :key="assignment.icerikId"
          class="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition duration-300"
        >
          <!-- Ödev Detayları -->
          <div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">
              {{ assignment.baslik }}
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              Teslim Tarihi: {{ formatDate(assignment.bitisTarihi) }}
            </p>
            <p class="text-gray-700 mb-4">{{ assignment.aciklama }}</p>
            <p class="text-sm text-gray-500 mb-4">
              Oluşturan:
              <span class="font-medium text-indigo-700">{{
                assignment.olusturanKullanici
              }}</span>
            </p>
          </div>

          <!-- Dosya Yükleme Alanı -->
          <div class="mb-4">
            <input
              type="file"
              :id="'file-upload-' + assignment.icerikId"
              class="hidden"
              @change="($event) => fileSelected($event, assignment.icerikId)"
              accept=".pdf,.docx"
            />
            <label
              :for="'file-upload-' + assignment.icerikId"
              class="block w-full cursor-pointer text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              Dosya Seç
            </label>
            <p
              v-if="uploadedFiles[assignment.icerikId]"
              class="text-sm text-green-600 mt-2"
            >
              Seçilen Dosya: {{ uploadedFiles[assignment.icerikId].name }}
            </p>
          </div>

          <!-- Butonlar -->
          <div class="flex gap-4">
            <button
              @click="submitFile(assignment.icerikId)"
              :disabled="!uploadedFiles[assignment.icerikId]"
              class="flex-1 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              Gönder
            </button>

            <button
              @click="viewDetails(assignment.icerikId)"
              class="flex-1 py-2 px-4 border border-indigo-600 shadow-sm text-sm font-medium rounded-md text-indigo-600 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Detayları Gör
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="assignments.length === 0"
        class="text-center text-gray-500 mt-12"
      >
        <p>Henüz mevcut ödev yok.</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      assignments: [],
      uploadedFiles: {},
    };
  },
  computed: {
    // Kullanıcı adını Vuex store'dan al
    userName() {
      return this.$store.getters.getUserName;
    },
  },
  methods: {
    async fetchAssignments() {
      try {
        const token = this.$store.state.token;
        if (!token) {
          throw new Error("Token bulunamadı! Lütfen giriş yapın.");
        }

        const response = await axios.get("https://localhost:7057/api/Icerik", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Ödevler alındı:", response.data);
        this.assignments = response.data;
      } catch (error) {
        console.error("Ödevler alınamadı:", error);
      }
    },

    fileSelected(event, icerikId) {
      console.log("fileSelected çağrıldı, icerikId:", icerikId);
      const file = event.target.files[0];
      if (file) {
        this.uploadedFiles = {
          ...this.uploadedFiles,
          [icerikId]: file,
        };
        console.log(`Ödev ${icerikId} için dosya yüklendi:`, file.name);
      }
    },

    async submitFile(icerikId) {
      console.log("submitFile çağrıldı, icerikId:", icerikId);
      const file = this.uploadedFiles[icerikId];
      if (!file) {
        alert("Lütfen bir dosya seçin.");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("user_id", this.$store.getters.userId);
        formData.append("content_id", icerikId);
        formData.append("file", file);

        const response = await axios.post(
          "http://127.0.0.1:5000/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${this.$store.state.token}`,
            },
          }
        );

        console.log("Dosya başarıyla yüklendi:", response.data);
        alert("Dosya başarıyla yüklendi!");

        const newUploadedFiles = { ...this.uploadedFiles };
        delete newUploadedFiles[icerikId];
        this.uploadedFiles = newUploadedFiles;

        document.getElementById("file-upload-" + icerikId).value = "";
      } catch (error) {
        console.error("Dosya yükleme hatası:", error);
        alert("Dosya yüklenirken hata oluştu.");
      }
    },

    viewDetails(icerikId) {
      console.log(`Ödev ${icerikId} detayları gösteriliyor...`);
    },

    formatDate(date) {
      return new Date(date).toLocaleString();
    },

    // Logout Method'u
    logout() {
      this.$store.dispatch("logout"); // Vuex store'daki logout action'ını çağır
      this.$router.push({ name: "Login" }); // Login sayfasına yönlendir
    },
  },
  mounted() {
    this.fetchAssignments();
  },
};
</script>