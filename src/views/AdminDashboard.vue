<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Başlık -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">Admin Paneli</h1>
        <div class="flex items-center space-x-4">
          <div class="flex items-center">
            <i class="fas fa-user-circle text-indigo-600 text-2xl mr-2"></i>
            <span class="text-gray-700 font-medium">
              Hoş geldiniz, <span class="font-semibold">{{ userName }}</span>
            </span>
          </div>
          <button
            @click="logout"
            class="flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            <i class="fas fa-sign-out-alt mr-2"></i> Çıkış Yap
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- İstatistik Kartları -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm font-medium">Toplam Kullanıcı</p>
              <p class="text-3xl font-bold">{{ totalUsers }}</p>
            </div>
            <i class="fas fa-users text-3xl opacity-20"></i>
          </div>
        </div>

        <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm font-medium">Oluşturulan Ödev</p>
              <p class="text-3xl font-bold">{{ totalAssignments }}</p>
            </div>
            <i class="fas fa-tasks text-3xl opacity-20"></i>
          </div>
        </div>

        <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm font-medium">Teslim Edilen Ödev</p>
              <p class="text-3xl font-bold">{{ totalAssignmentsForStudent }}</p>
            </div>
            <i class="fas fa-file-upload text-3xl opacity-20"></i>
          </div>
        </div>
      </div>

      <!-- Kullanıcı Yönetimi -->
      <div class="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div class="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-900">Kullanıcı Yönetimi</h2>
          <div class="relative">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Kullanıcı ara..."
              class="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            <button 
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ad Soyad
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E-Posta
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in filteredUsers" :key="user.kullaniciId" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <i class="fas fa-user text-indigo-600"></i>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.ad }} {{ user.soyad }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ user.eposta }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="{
                    'bg-blue-100 text-blue-800': user.rol === 'Admin',
                    'bg-green-100 text-green-800': user.rol === 'Teacher',
                    'bg-purple-100 text-purple-800': user.rol === 'Student'
                  }" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ user.rol }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button @click="editUser(user)" class="text-indigo-600 hover:text-indigo-900 mr-4">
                    <i class="fas fa-edit mr-1"></i> Düzenle
                  </button>
                  <button @click="deleteUser(user.kullaniciId)" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash-alt mr-1"></i> Sil
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Ödevler Bölümü -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Öğretmene Göre Ödevler -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden">
          <div class="px-6 py-4 bg-indigo-50 border-b border-indigo-100 flex items-center">
            <i class="fas fa-chalkboard-teacher text-indigo-600 mr-3 text-xl"></i>
            <h2 class="text-lg font-semibold text-gray-900">Öğretmene Göre Ödevler</h2>
          </div>
          <div class="p-6">
            <form @submit.prevent="fetchAssignmentsByTeacher" class="space-y-4">
              <div class="flex items-center space-x-4">
                <div class="flex-1 relative">
                  <input
                    v-model="teacherName"
                    type="text"
                    class="block w-full pl-10 pr-12 py-3 sm:text-sm border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Öğretmen adı girin"
                  />
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i class="fas fa-user-tie text-gray-400"></i>
                  </div>
                </div>
                <button
                  type="submit"
                  class="flex-shrink-0 inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <i class="fas fa-search mr-2"></i> Ara
                </button>
              </div>
            </form>

            <div v-if="assignments.length > 0" class="mt-6 space-y-4">
              <div v-for="assignment in assignments" :key="assignment.id" class="group p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="text-lg font-medium text-gray-900 group-hover:text-indigo-600">{{ assignment.baslik }}</h3>
                    <p class="mt-1 text-sm text-gray-600 line-clamp-2">{{ assignment.aciklama }}</p>
                  </div>
                  <span class="text-xs px-2 py-1 rounded-full" :class="{
                    'bg-green-100 text-green-800': !isDeadlinePassed(assignment.bitisTarihi),
                    'bg-red-100 text-red-800': isDeadlinePassed(assignment.bitisTarihi)
                  }">
                    {{ isDeadlinePassed(assignment.bitisTarihi) ? 'Süresi Doldu' : 'Aktif' }}
                  </span>
                </div>
                <div class="mt-3 flex items-center text-sm text-gray-500">
                  <i class="far fa-calendar-alt mr-2 text-indigo-500"></i>
                  <span>Teslim Tarihi: {{ formatDate(assignment.bitisTarihi) }}</span>
                </div>
                <div class="mt-3 flex justify-end">
                  <button class="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                    Detayları Gör <i class="fas fa-chevron-right ml-1 text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
            <div v-else-if="teacherName" class="mt-6 text-center py-8 bg-gray-50 rounded-lg">
              <i class="fas fa-exclamation-circle text-gray-400 text-4xl mb-3"></i>
              <p class="text-gray-500">Bu öğretmene ait ödev bulunamadı</p>
            </div>
            <div v-else class="mt-6 text-center py-8 bg-gray-50 rounded-lg">
              <i class="fas fa-info-circle text-gray-400 text-4xl mb-3"></i>
              <p class="text-gray-500">Öğretmen adı girerek ödevleri listeleyin</p>
            </div>
          </div>
        </div>

        <!-- Aktif Ödevler -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden">
          <div class="px-6 py-4 bg-green-50 border-b border-green-100 flex items-center">
            <i class="fas fa-clock text-green-600 mr-3 text-xl"></i>
            <h2 class="text-lg font-semibold text-gray-900">Aktif Ödevler</h2>
          </div>
          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <p class="text-sm text-gray-500">Son güncellenme: {{ new Date().toLocaleTimeString() }}</p>
              <button
                @click="fetchActiveAssignments"
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                <i class="fas fa-sync-alt mr-1"></i> Yenile
              </button>
            </div>

            <div v-if="activeAssignments.length > 0" class="space-y-4">
              <div v-for="assignment in activeAssignments" :key="assignment.id" class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="text-lg font-medium text-gray-900">{{ assignment.baslik }}</h3>
                    <p class="mt-1 text-sm text-gray-600 line-clamp-2">{{ assignment.aciklama }}</p>
                  </div>
                  <span class="flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <i class="fas fa-circle text-green-500 mr-1 text-xs"></i> Aktif
                  </span>
                </div>
                
                <div class="mt-4">
                  <div class="flex items-center justify-between text-sm text-gray-500 mb-1">
                    <span><i class="far fa-calendar-alt mr-1"></i> Teslim: {{ formatDate(assignment.bitisTarihi) }}</span>
                    <span class="font-medium" :class="{
                      'text-green-600': daysRemaining(assignment.bitisTarihi) > 3,
                      'text-yellow-600': daysRemaining(assignment.bitisTarihi) <= 3 && daysRemaining(assignment.bitisTarihi) > 0,
                      'text-red-600': daysRemaining(assignment.bitisTarihi) === 0
                    }">
                      {{ daysRemaining(assignment.bitisTarihi) > 0 ? 
                         `${daysRemaining(assignment.bitisTarihi)} gün kaldı` : 
                         'Son gün' 
                      }}
                    </span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      class="h-2 rounded-full" 
                      :class="{
                        'bg-green-500': daysRemaining(assignment.bitisTarihi) > 3,
                        'bg-yellow-500': daysRemaining(assignment.bitisTarihi) <= 3 && daysRemaining(assignment.bitisTarihi) > 0,
                        'bg-red-500': daysRemaining(assignment.bitisTarihi) === 0
                      }"
                      :style="{ width: progressPercentage(assignment.bitisTarihi) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 bg-gray-50 rounded-lg">
              <i class="fas fa-check-circle text-gray-400 text-4xl mb-3"></i>
              <p class="text-gray-500">Şu anda aktif ödev bulunmamaktadır</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      users: [],
      allUsers: [],
      totalUsers: 0,
      totalAssignments: 0,
      totalAssignmentsForStudent: 0,
      teacherName: "",
      assignments: [],
      assigmentForStudent: [],
      activeAssignments: [],
      searchQuery: "",
    };
  },
  computed: {
    userName() {
      return this.$store.getters.getUserName;
    },
    filteredUsers() {
      if (!this.searchQuery) {
        return this.users;
      }
      const query = this.searchQuery.toLowerCase();
      return this.users.filter(user => {
        return (
          user.ad.toLowerCase().includes(query) ||
          user.soyad.toLowerCase().includes(query) ||
          user.eposta.toLowerCase().includes(query) ||
          user.rol.toLowerCase().includes(query)
        );
      });
    }
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await axios.get("https://localhost:7057/api/Kullanici");
        this.users = response.data;
        this.allUsers = response.data;
        this.totalUsers = this.users.length;
      } catch (error) {
        console.error("Kullanıcılar yüklenirken hata oluştu:", error);
      }
    },
    async fetchAssignmentsByTeacher() {
      try {
        const response = await axios.get(
          `https://localhost:7057/api/Icerik/teacher/${this.teacherName}`
        );
        this.assignments = response.data;
      } catch (error) {
        console.error("Ödevler yüklenirken hata oluştu:", error);
        this.assignments = [];
      }
    },
    async fetchActiveAssignments() {
      try {
        const response = await axios.get(
          "https://localhost:7057/api/Icerik/active"
        );
        this.activeAssignments = response.data;
      } catch (error) {
        console.error("Aktif ödevler yüklenirken hata oluştu:", error);
        this.activeAssignments = [];
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    isDeadlinePassed(deadline) {
      return new Date(deadline) < new Date();
    },
    daysRemaining(deadline) {
      const diffTime = new Date(deadline) - new Date();
      return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    },
    progressPercentage(deadline) {
      const startDate = new Date();
      const endDate = new Date(deadline);
      const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const daysLeft = this.daysRemaining(deadline);
      return Math.min(100, Math.max(0, ((totalDays - daysLeft) / totalDays) * 100));
    },
    editUser(user) {
      console.log("Düzenlenecek kullanıcı:", user);
      // Burada kullanıcı düzenleme modalını açabilirsiniz
    },
    async deleteUser(id) {
      if (confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) {
        try {
          await axios.delete(`https://localhost:7057/api/Kullanici/${id}`);
          this.users = this.users.filter((user) => user.kullaniciId !== id);
          this.totalUsers = this.users.length;
        } catch (error) {
          console.error("Kullanıcı silinirken hata oluştu:", error);
          alert("Kullanıcı silinirken bir hata oluştu");
        }
      }
    },
    async GetAssigmentForTeacher() {
      try {
        const response = await axios.get(`https://localhost:7057/api/Icerik`);
        this.assignments = response.data;
        this.totalAssignments = this.assignments.length;
      } catch (error) {
        console.error("Ödevler yüklenirken hata oluştu:", error);
        this.assignments = [];
      }
    },
    async GetAssigmentForStudent() {
      try {
        const response = await axios.get(`https://localhost:7057/api/Dosya`);
        this.assigmentForStudent = response.data;
        this.totalAssignmentsForStudent = this.assigmentForStudent.length;
      } catch (error) {
        console.error("Öğrenci ödevleri yüklenirken hata oluştu:", error);
      }
    },
    logout() {
      this.$store.dispatch("logout");
      this.$router.push({ name: "Login" });
    },
  },
  async mounted() {
    this.GetAssigmentForTeacher();
    this.GetAssigmentForStudent();
    this.fetchUsers();
    this.fetchActiveAssignments();
  },
};
</script>

<style>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Animasyonlar */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

/* Geçişler */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Özel scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>