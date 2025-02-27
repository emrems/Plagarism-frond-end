<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-4xl font-extrabold text-gray-900 mb-12 text-center">Öğrenci Paneli</h1>

      <!-- Available Assignments -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="assignment in assignments"
          :key="assignment.id"
          class="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition duration-300"
        >
          <div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">{{ assignment.baslik }}</h3>
            <p class="text-sm text-gray-600 mb-4">
              Teslim Tarihi: {{ formatDate(assignment.bitisTarihi) }}
            </p>
            <p class="text-gray-700 mb-4">{{ assignment.aciklama }}</p>
            <p class="text-sm text-gray-500 mb-4">
              Oluşturan: <span class="font-medium text-indigo-700">{{ assignment.olusturanKullanici }}</span>
            </p>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1" for="file-upload-{{ assignment.id }}">
              Dosya Yükle
            </label>
            <input
              id="file-upload-{{ assignment.id }}"
              type="file"
              class="block w-full text-sm text-gray-500 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              @change="handleFileUpload($event, assignment.id)"
            />
          </div>

          <div class="mb-4">
            <select
              class="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              v-model="selectedOptions[assignment.id]"
            >
              <option value="">Bir işlem seçin</option>
              <option value="submit">Gönder</option>
              <option value="view">Detayları Gör</option>
            </select>
          </div>

          <button
            @click="handleAction(assignment.id)"
            class="w-full py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Devam Et
          </button>
        </div>
      </div>

      <div v-if="assignments.length === 0" class="text-center text-gray-500 mt-12">
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
      selectedOptions: {},
      uploadedFiles: {},
    };
  },
  methods: {
    async fetchAssignments() {
  try {
    // Vuex Store'dan token al
    const token = this.$store.state.token;

    if (!token) {
      throw new Error("Token bulunamadı! Lütfen giriş yapın.");
    }

    const response = await axios.get("https://localhost:7057/api/Icerik", {
      headers: { Authorization: `Bearer ${token}` },
    });
    this.assignments = response.data;
  } catch (error) {
    console.error("Error fetching assignments:", error);
  }
},

    handleAction(assignmentId) {
      const selectedOption = this.selectedOptions[assignmentId];
      const file = this.uploadedFiles[assignmentId];

      if (!selectedOption) {
        alert("Lütfen bir seçenek seçin.");
        return;
      }

      if (selectedOption === "submit" && !file) {
        alert("Lütfen bir dosya yükleyin.");
        return;
      }

      if (selectedOption === "submit") {
        console.log(`Ödev ${assignmentId} dosya ile gönderiliyor...`, file);
        // Gönderme işlemi için gerekli kodu buraya ekleyebilirsiniz
      } else if (selectedOption === "view") {
        console.log(`Ödev ${assignmentId} detayları gösteriliyor...`);
        // Detayları gösterme işlemi için gerekli kodu buraya ekleyebilirsiniz
      }
    },
    handleFileUpload(event, assignmentId) {
      const input = event.target;
      if (input.files && input.files[0]) {
        this.$set(this.uploadedFiles, assignmentId, input.files[0]);
        console.log(`Dosya yüklendi:`, input.files[0]);
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    },
  },
  mounted() {
    this.fetchAssignments();
  },
};
</script>


