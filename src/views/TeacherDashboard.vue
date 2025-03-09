<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Öğretmen Paneli</h1>

      <!-- Assignment Creation Form -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">Yeni Ödev Oluştur</h2>
        <form @submit.prevent="createAssignment" class="space-y-4">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700"
              >Ödev Başlığı</label
            >
            <input
              id="title"
              v-model="newAssignment.title"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              for="description"
              class="block text-sm font-medium text-gray-700"
              >Açıklama</label
            >
            <textarea
              id="description"
              v-model="newAssignment.description"
              rows="4"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div>
            <label
              for="startDate"
              class="block text-sm font-medium text-gray-700"
              >Başlangıç Tarihi</label
            >
            <input
              id="startDate"
              v-model="newAssignment.startDate"
              type="datetime-local"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              for="deadline"
              class="block text-sm font-medium text-gray-700"
              >Son Teslim Tarihi</label
            >
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

      <!-- Assignments List -->
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
    };
  },
  methods: {
    async fetchAssignments() {
  try {
    // Kullanıcı ID'sine erişim
    const teacherId = this.$store.getters.userId;

    // teacherId'nin null veya undefined olup olmadığını kontrol et
    if (!teacherId) {
      console.error("Öğretmen ID'si bulunamadı.");
      this.error = "Öğretmen ID'si bulunamadı."; // Kullanıcıya hata mesajı göster
      return;
    }

    const response = await axios.get(`https://localhost:7057/api/Icerik/teacher/${teacherId}/all`, {
      headers: { Authorization: `Bearer ${this.$store.state.token}` },
    });

    // Eğer response başarılıysa, veriyi assignments'a kaydet
    if (response.status === 200) {
      this.assignments = response.data;
    } else {
      this.error = "Ödevler alınamadı. Lütfen tekrar deneyin.";
      console.error("Ödevler alınamadı. Status:", response.status);
    }
  } catch (error) {
    console.error("Ödevler alınamadı:", error);
    this.error = "Bir hata oluştu. Lütfen tekrar deneyin."; // Hata mesajı kullanıcıya gösteriliyor
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

        this.assignments.push(response.data);

        // Formu sıfırla
        this.newAssignment.title = "";
        this.newAssignment.description = "";
        this.newAssignment.startDate = "";
        this.newAssignment.deadline = "";
      } catch (error) {
        console.error("Ödev oluşturulamadı:", error);
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
</style>
