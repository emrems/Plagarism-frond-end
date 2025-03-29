<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Top Navigation Bar -->
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h2 class="font-semibold text-xl text-gray-800">EduPortal</h2>
        </div>
        <div class="flex items-center gap-6">
          <div class="flex items-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd" />
            </svg>
            <span class="text-gray-700 font-medium">{{ userName }}</span>
          </div>
          <button
            @click="logout"
            class="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 9a1 1 0 11-2 0v-3H7v3a1 1 0 01-2 0V7a1 1 0 012 0v1h5V7a1 1 0 112 0v5z" clip-rule="evenodd" />
            </svg>
            <span>Çıkış</span>
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 class="text-3xl font-bold text-gray-900 mb-1 text-center">
        Öğrenci Paneli
      </h1>
      <p class="text-gray-600 text-center mb-10">Ödevlerinizi görüntüleyin ve teslim edin</p>

      <!-- Assignment Cards -->
      <div v-if="assignments.length === 0" class="text-center py-16">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-gray-500 text-lg">Henüz mevcut ödev yok.</p>
        <p class="text-gray-400 text-sm mt-2">Ödevler eklendiğinde burada görünecek.</p>
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="assignment in assignments"
          :key="assignment.icerikId"
          class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md"
        >
          <div class="p-6">
            <div class="flex items-start justify-between">
              <div>
                <div class="text-xs font-medium text-indigo-600 mb-1">
                  {{ getAssignmentPrefix(assignment) }}
                </div>
                <h3 class="font-semibold text-lg text-gray-800 mb-2">{{ assignment.baslik }}</h3>
              </div>
              <span :class="isDeadlinePassed(assignment.icerikId) ? 'bg-red-100 text-red-800' : 'bg-indigo-100 text-indigo-800'" class="text-xs px-2 py-1 rounded-full font-medium">
                {{ isDeadlinePassed(assignment.icerikId) ? 'Süresi Doldu' : 'Aktif' }}
              </span>
            </div>
            
            <div class="flex items-center text-sm text-gray-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {{ assignment.olusturanKullanici }}
            </div>
            
            <div class="space-y-3 mb-6">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Teslim Tarihi:</span>
                <span class="font-medium">{{ formatDate(assignment.bitisTarihi) }}</span>
              </div>
              
              <div v-if="!isDeadlinePassed(assignment.icerikId)">
                <div class="flex items-center justify-between text-sm mb-1">
                  <span class="text-gray-600">Kalan Süre:</span>
                  <span class="font-medium text-indigo-600">{{ formatTimeLeft(assignment.bitisTarihi) }}</span>
                </div>
                
                <!-- Progress bar -->
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-indigo-500 h-2 rounded-full"
                    :style="{ width: calculateProgress(assignment.bitisTarihi) + '%' }"
                  ></div>
                </div>
              </div>
              
              <div v-else class="text-red-600 text-sm font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                Teslim süresi geçti
              </div>
            </div>
            
            <div class="space-y-4">
              <div v-if="!isDeadlinePassed(assignment.icerikId)" class="relative">
                <input
                  type="file"
                  :id="'file-upload-' + assignment.icerikId"
                  class="hidden"
                  @change="($event) => fileSelected($event, assignment.icerikId)"
                  accept=".pdf,.docx"
                />
                <label
                  :for="'file-upload-' + assignment.icerikId"
                  class="flex items-center justify-center w-full py-2.5 px-4 bg-gray-50 border border-gray-200 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span class="text-sm text-gray-500">Dosya Seç veya Sürükle</span>
                </label>
                
                <div v-if="uploadedFiles[assignment.icerikId]" class="mt-2 bg-green-50 rounded-lg p-2 flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                  <div>
                    <p class="text-sm text-green-800 font-medium break-all">{{ uploadedFiles[assignment.icerikId].name }}</p>
                    <p class="text-xs text-green-600">{{ formatFileSize(uploadedFiles[assignment.icerikId].size) }}</p>
                  </div>
                </div>
              </div>
              
              <div class="flex space-x-3">
                <button
                  v-if="!isDeadlinePassed(assignment.icerikId)"
                  @click="submitFile(assignment.icerikId)"
                  :disabled="!uploadedFiles[assignment.icerikId]"
                  class="flex-1 flex items-center justify-center py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Gönder
                </button>
                
                <button
                  @click="viewDetails(assignment.icerikId)"
                  class="flex items-center justify-center py-2 px-4 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Detaylar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Toast Message -->
      <div
        v-if="showToast" 
        class="fixed bottom-8 right-8 bg-white text-gray-800 py-3 px-4 rounded-lg shadow-lg border-l-4 border-green-500 flex items-center gap-3 transform transition-all duration-300 ease-in-out animate-slideUp max-w-md"
        style="z-index: 9999"
      >
        <div class="flex-shrink-0 bg-green-100 rounded-full p-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div>
          <h4 class="font-medium text-gray-800">Başarılı!</h4>
          <p class="text-sm text-gray-600">Ödev dosyanız başarıyla gönderildi.</p>
        </div>
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
      showToast: false,
      timeIntervals: {},
      // Ödev türleri ve açıklamaları
      assignmentTypes: {
        HOMEWORK: "Ödev",
        PROJECT: "Proje",
        QUIZ: "Quiz",
        EXAM: "Sınav",
        PRESENTATION: "Sunum",
        REPORT: "Rapor",
        RESEARCH: "Araştırma",
        ESSAY: "Makale"
      }
    };
  },
  computed: {
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

        this.assignments = response.data.map((assignment) => ({
          ...assignment,
          deadlinePassed: new Date(assignment.bitisTarihi) < new Date(),
          
          assignmentType: this.determineAssignmentType(assignment)
        }));

       
        this.assignments.forEach((assignment) => {
          this.updateTimeLeft(assignment.icerikId, assignment.bitisTarihi);
        });
      } catch (error) {
        console.error("Ödevler alınamadı:", error);
      }
    },

    
    determineAssignmentType(assignment) {
      
      const types = Object.keys(this.assignmentTypes);
      const randomIndex = Math.floor(Math.random() * types.length);
      return types[randomIndex];
    },

    getAssignmentPrefix(assignment) {
      // Ödev tipine göre prefix oluştur
      const type = this.assignmentTypes[assignment.assignmentType] || "Ödev";
      
      const course = assignment.dersAdi || assignment.modulAdi || "Ders";
      
      return `${type} · ${course}`;
    },

    updateTimeLeft(icerikId, bitisTarihi) {
      this.timeIntervals[icerikId] = setInterval(() => {
        this.$forceUpdate(); // Componenti güncellemek için
      }, 1000);
    },

    fileSelected(event, icerikId) {
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
      const assignment = this.assignments.find(
        (assignment) => assignment.icerikId === icerikId
      );
      if (assignment.deadlinePassed) {
        alert("Ödev teslim tarihi geçtiği için dosya gönderilemez.");
        return;
      }

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
        this.showToast = true; // Başarı mesajını göster

        setTimeout(() => {
          this.showToast = false; // 3 saniye sonra başarı mesajını gizle
        }, 3000);

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
      return new Date(date).toLocaleString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    },

    isDeadlinePassed(icerikId) {
      const assignment = this.assignments.find(
        (assignment) => assignment.icerikId === icerikId
      );
      return assignment && assignment.deadlinePassed;
    },

    formatTimeLeft(deadline) {
      const now = new Date();
      const endDate = new Date(deadline);
      const timeDiff = endDate - now;

      if (timeDiff <= 0) {
        return "Bitiş tarihi geçti";
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        return `${days} gün ${hours} saat`;
      } else if (hours > 0) {
        return `${hours} saat ${minutes} dk`;
      } else {
        return `${minutes} dakika`;
      }
    },

    calculateProgress(deadline) {
      const now = new Date();
      const endDate = new Date(deadline);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 7); // Assume 7 days assignment period
      
      const total = endDate - startDate;
      const elapsed = now - startDate;
      
      const progress = 100 - Math.min(100, Math.max(0, (elapsed / total) * 100));
      return progress.toFixed(0);
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    logout() {
      this.$store.dispatch("logout");
      this.$router.push({ name: "Login" });
    },
  },
  mounted() {
    this.fetchAssignments();
  },
  beforeDestroy() {
    Object.values(this.timeIntervals).forEach(clearInterval);
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* {
  font-family: 'Inter', sans-serif;
}

.animate-slideUp {
  animation: slideUp 0.3s ease-out forwards;
}

@keyframes slideUp {
  from {
    transform: translateY(1rem);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>