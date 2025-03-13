<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Öğretmen Paneli</h1>

      <!-- Yeni Ödev Oluşturma Formu -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">Yeni Ödev Oluştur</h2>
        <form @submit.prevent="createAssignment" class="space-y-4">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700">Ödev Başlığı</label>
            <input
              id="title"
              v-model="newAssignment.title"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">Açıklama</label>
            <textarea
              id="description"
              v-model="newAssignment.description"
              rows="4"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div>
            <label for="startDate" class="block text-sm font-medium text-gray-700">Başlangıç Tarihi</label>
            <input
              id="startDate"
              v-model="newAssignment.startDate"
              type="datetime-local"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label for="deadline" class="block text-sm font-medium text-gray-700">Son Teslim Tarihi</label>
            <input
              id="deadline"
              v-model="newAssignment.deadline"
              type="datetime-local"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Ödev Oluştur
          </button>
        </form>
      </div>

      <!-- Ödevler Listesi -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-4 py-5 sm:px-6">
          <h2 class="text-xl font-semibold">Ödevleriniz</h2>
        </div>
        <div class="border-t border-gray-200">
          <ul v-if="assignments.length > 0" class="divide-y divide-gray-200">
            <li
              v-for="assignment in assignments"
              :key="assignment.id"
              class="px-4 py-4 sm:px-6"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-medium text-gray-900">
                    {{ assignment.baslik }}
                  </h3>
                  <p class="mt-1 text-sm text-gray-500">
                    Başlangıç: {{ formatDate(assignment.olusturmaTarihi) }}
                  </p>
                  <p class="mt-1 text-sm text-gray-500">
                    Teslim: {{ formatDate(assignment.bitisTarihi) }}
                  </p>
                </div>
                <div class="flex space-x-2">
                  <button
                    @click="editAssignment(assignment)"
                    class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                  >
                    Düzenle
                  </button>
                  <button
                    @click="deleteAssignment(assignment.id)"
                    class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                  >
                    Sil
                  </button>
                  <button
                    @click="toggleSubmissions(assignment.icerikId)"
                    class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                  >
                    Gönderilen Ödevler
                  </button>
                </div>
              </div>

              <!-- Gönderilen Ödevler -->
              <div v-if="assignment.showSubmissions" class="mt-4">
                <h4 class="text-lg font-medium text-gray-900 mb-2">Gönderilen Ödevler</h4>
                <ul v-if="assignment.submissions && assignment.submissions.length > 0" class="divide-y divide-gray-200">
                  <li
                    v-for="submission in assignment.submissions"
                    :key="submission.dosyaId"
                    class="px-4 py-4 sm:px-6 bg-gray-50 rounded-lg shadow-sm"
                  >
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm text-gray-500">
                          <span class="font-medium">Öğrenci:</span> {{ submission.kullanici.ad }} {{ submission.kullanici.soyad }}
                        </p>
                        <p class="text-sm text-gray-500">
                          <span class="font-medium">Dosya:</span> {{ submission.cleanedPath }}
                        </p>
                      </div>
                      <div class="flex space-x-2">
                        <button
                          @click="downloadFile(submission)"
                          class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                          </svg>
                          İndir
                        </button>
                        <button
                          @click="viewFile(submission)"
                          class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 17l1.5 1.5L5 17m14 0l1.5 1.5L22 17m-8-5h.01M12 16h.01M16 12h.01M8 12h.01"></path>
                          </svg>
                          Görüntüle
                        </button>
                      </div>
                    </div>
                  </li>
                </ul>
                <div v-else class="px-4 py-8 text-center text-gray-500">
                  Henüz gönderilen ödev yok.
                </div>
              </div>
            </li>
          </ul>
          <div v-else class="px-4 py-8 text-center text-gray-500">
            Henüz ödev oluşturulmamış.
          </div>
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
      assignments: [], // Ödevler listesi
      newAssignment: {
        title: "",
        description: "",
        startDate: "", // Başlangıç tarihi
        deadline: "",
      },
      error: "", // Hata mesajı
    };
  },
  methods: {
    async fetchAssignments() {
      try {
        const teacherId = this.$store.getters.userId;
        if (!teacherId) {
          console.error("Öğretmen ID'si bulunamadı.");
          this.error = "Öğretmen ID'si bulunamadı.";
          return;
        }

        const response = await axios.get(`https://localhost:7057/api/Icerik/teacher/${teacherId}/all`, {
          headers: { Authorization: `Bearer ${this.$store.state.token}` },
        });

        if (response.status === 200) {
          console.log("Ödevler alındı:", response.data);
          this.assignments = response.data.map(assignment => ({
            ...assignment,
            showSubmissions: false,
            submissions: []
          }));
        } else {
          this.error = "Ödevler alınamadı. Lütfen tekrar deneyin.";
        }
      } catch (error) {
        console.error("Ödevler alınamadı:", error);
        this.error = "Bir hata oluştu. Lütfen tekrar deneyin.";
      }
    },

    async toggleSubmissions(assignmentId) {
      const assignment = this.assignments.find(a => a.icerikId === assignmentId);
      if (!assignment) {
        console.error("Ödev bulunamadı:", assignmentId);
        this.error = "Ödev bulunamadı.";
        return;
      }

      if (assignment.showSubmissions) {
        assignment.showSubmissions = false;
      } else {
        try {
          const response = await axios.get(`https://localhost:7057/api/Dosya/${assignmentId}`, {
            headers: { Authorization: `Bearer ${this.$store.state.token}` },
          });

          if (response.status === 200) {
            console.log("Gönderilen ödevler alındı:", response.data);
            assignment.submissions = response.data;
            assignment.showSubmissions = true;
          } else {
            console.error("Gönderilen ödevler alınamadı. Status:", response.status);
            this.error = "Gönderilen ödevler alınamadı.";
          }
        } catch (error) {
          console.error("Gönderilen ödevler alınamadı:", error);
          this.error = "Gönderilen ödevler alınamadı. Lütfen tekrar deneyin.";
        }
      }
    },

    async createAssignment() {
      try {
        const response = await axios.post(
          "https://localhost:7057/api/Icerik",
          {
            Baslik: this.newAssignment.title,
            Aciklama: this.newAssignment.description,
            OlusturmaTarihi: this.newAssignment.startDate,
            BitisTarihi: this.newAssignment.deadline,
          },
          {
            headers: { Authorization: `Bearer ${this.$store.state.token}` },
          }
        );

        this.assignments.push({
          ...response.data,
          showSubmissions: false,
          submissions: []
        });

        // Formu sıfırla
        this.newAssignment.title = "";
        this.newAssignment.description = "";
        this.newAssignment.startDate = "";
        this.newAssignment.deadline = "";
      } catch (error) {
        console.error("Ödev oluşturulamadı:", error);
        this.error = "Ödev oluşturulamadı. Lütfen tekrar deneyin.";
      }
    },

    editAssignment(assignment) {
      console.log("Edit assignment:", assignment);
    },

    async deleteAssignment(id) {
      try {
        await axios.delete(`https://localhost:7057/api/Icerik/${id}`, {
          headers: { Authorization: `Bearer ${this.$store.state.token}` },
        });
        this.assignments = this.assignments.filter((a) => a.id !== id);
      } catch (error) {
        console.error("Ödev silinemedi:", error);
        this.error = "Ödev silinemedi. Lütfen tekrar deneyin.";
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleString();
    },

    async downloadFile(submission) {
      try {
        const response = await axios.get(`https://localhost:7057/api/Dosya/download/${submission.dosyaId}`, {
          headers: { Authorization: `Bearer ${this.$store.state.token}` },
          responseType: 'blob', // Dosya indirme için responseType blob olmalı
        });

        // Dosyayı indirme işlemi
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', submission.cleanedPath.split('\\').pop()); // Dosya adını al
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Dosya indirilemedi:", error);
        this.error = "Dosya indirilemedi. Lütfen tekrar deneyin.";
      }
    },

    viewFile(submission) {
      const fileUrl = `https://localhost:7057/api/Dosya/download/${submission.dosyaId}`;
      window.open(fileUrl, '_blank'); // Yeni sekmede aç
    },
  },
  mounted() {
    this.fetchAssignments();
  },
};
</script>

<style>
.container {
  max-width: 500px;
}
.card {
  border: none;
  border-radius: 10px;
}
.btn {
  border-radius: 5px;
}
.submission-list {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}
.submission-item {
  padding: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}
.submission-item:last-child {
  border-bottom: none;
}

/* İndir ve Görüntüle Butonları */
.bg-blue-600 {
  background-color: #2563eb;
}
.bg-blue-700 {
  background-color: #1d4ed8;
}
.bg-green-600 {
  background-color: #16a34a;
}
.bg-green-700 {
  background-color: #15803d;
}

/* Kart Tasarımı */
.bg-gray-50 {
  background-color: #f9fafb;
}
.rounded-lg {
  border-radius: 0.5rem;
}
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
</style>