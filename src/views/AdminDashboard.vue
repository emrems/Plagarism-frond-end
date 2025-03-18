<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      <div class="absolute top-4 right-4">
      <button
        @click="logout"
        class="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Çıkış Yap
      </button>
    </div>

      <!-- Statistics Overview -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Tüm Kullanıcılar</h3>
          <p class="text-3xl font-bold text-indigo-600">{{ totalUsers }}</p>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Oluşturulan Ödevler</h3>
          <p class="text-3xl font-bold text-indigo-600">{{ totalAssignments }}</p>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Gönderilen Ödevler</h3>
          <p class="text-3xl font-bold text-indigo-600">{{ totalAssignmentsForStudent }}</p>
          
        </div>
      </div>

      <!-- Kullanıcı Yönetimi -->
      <div class="bg-white rounded-lg shadow mb-8">
        <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 class="text-xl font-semibold">Kullanıcı Yönetimi</h2>
        </div>
        <div class="border-t border-gray-200">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Soyad</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-Posta</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Eylemler</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user.kullaniciId">
                <td class="px-6 py-4 whitespace-nowrap">{{ user.ad }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ user.soyad }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ user.eposta }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{{ user.rol }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button @click="editUser(user)" class="text-indigo-600 hover:text-indigo-900 mr-4">Düzenle</button>
                  <button @click="deleteUser(user.kullaniciId)" class="text-red-600 hover:text-red-900">Sil</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Row with Teacher's Assignments and Active Assignments -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Öğretmen Adı ile Ödev Getirme -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-4 py-5 sm:px-6">
            <h2 class="text-xl font-semibold">Öğretmene Göre Ödevleri Getir</h2>
          </div>
          <div class="px-4 py-5 sm:px-6">
            <form @submit.prevent="fetchAssignmentsByTeacher">
              <div class="flex items-center space-x-4">
                <input
                  v-model="teacherName"
                  type="text"
                  placeholder="Öğretmen Adı"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <button
                  type="submit"
                  class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Getir
                </button>
              </div>
            </form>
          </div>
          <div v-if="assignments.length > 0" class="px-4 py-5">
            <details class="group bg-gray-100 rounded-lg p-4 mb-4 cursor-pointer hover:bg-gray-200">
              <summary class="text-lg font-medium text-gray-900">Ödevler</summary>
              <ul class="mt-4 space-y-2">
                <li
                  v-for="assignment in assignments"
                  :key="assignment.id"
                  class="p-4 border rounded-md shadow hover:bg-gray-100"
                >
                  <h3 class="text-lg font-medium text-gray-900">{{ assignment.baslik }}</h3>
                  <p class="text-sm text-gray-500">{{ assignment.aciklama }}</p>
                  <p class="text-sm text-gray-500">Bitiş Tarihi: {{ formatDate(assignment.bitisTarihi) }}</p>
                </li>
              </ul>
            </details>
          </div>
          <div v-else class="px-4 py-5 text-center text-red-500">
            Girilen öğretmene ait ödev bulunamadı.
          </div>
        </div>

        <!-- Aktif Ödevleri Getirme -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-4 py-5 sm:px-6">
            <h2 class="text-xl font-semibold">Aktif Ödevler</h2>
          </div>
          <div class="px-4 py-5 sm:px-6">
            <button
              @click="fetchActiveAssignments"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Getir
            </button>
          </div>
          <div v-if="activeAssignments.length > 0" class="px-4 py-5">
            <details class="group bg-gray-100 rounded-lg p-4 mb-4 cursor-pointer hover:bg-gray-200">
              <summary class="text-lg font-medium text-gray-900">Aktif Ödevler</summary>
              <ul class="mt-4 space-y-2">
                <li
                  v-for="assignment in activeAssignments"
                  :key="assignment.id"
                  class="p-4 border rounded-md shadow hover:bg-gray-100"
                >
                  <h3 class="text-lg font-medium text-gray-900">{{ assignment.baslik }}</h3>
                  <p class="text-sm text-gray-500">{{ assignment.aciklama }}</p>
                  <p class="text-sm text-gray-500">Bitiş Tarihi: {{ formatDate(assignment.bitisTarihi) }}</p>
                </li>
              </ul>
            </details>
          </div>
          <div v-else class="px-4 py-5 text-center text-red-500">
            Aktif ödev bulunamadı.
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
      users: [],
      totalUsers: 0,
      totalAssignments: 0,
      totalAssignmentsForStudent:0,
      teacherName: "",
      assignments: [],
      assigmentForStudent:[],
      activeAssignments: [],
    };
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await axios.get("https://localhost:7057/api/Kullanici");
        this.users = response.data;
        this.totalUsers = this.users.length;
      } catch (error) {
        console.error("Kullanıcıları çekerken bir hata oluştu:", error);
      }
    },
    async fetchAssignmentsByTeacher() {
      try {
        const response = await axios.get(
          `https://localhost:7057/api/Icerik/teacher/${this.teacherName}`
        );
        this.assignments = response.data;
       // this.totalAssignments = this.assignments.length;
      } catch (error) {
        console.error("Ödevleri çekerken bir hata oluştu:", error);
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
        console.error("Aktif ödevleri çekerken bir hata oluştu:", error);
        this.activeAssignments = [];
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    },
    editUser(user) {
      console.log("Düzenlenecek kullanıcı:", user);
    },
    async deleteUser(id) {
      try{
        const response = await axios.delete(`https://localhost:7057/api/Kullanici/${id}`);
      this.users = this.users.filter((user) => user.id !== id);
      this.fetchUsers();
      }catch(error){
        console.log("Kullanıcı silerken bir hata oluştu:", error);
      }
      console.log("Silinecek kullanıcı ID:", id);
    },
    async GetAssigmentForTeacher(){
      try {
        const response = await axios.get(
          `https://localhost:7057/api/Icerik`
        );
        //console.log(response.data)
        this.assignments = response.data;
        this.totalAssignments = this.assignments.length;
      } catch (error) {
        console.error("Ödevleri çekerken bir hata oluştu:", error);
        this.assignments = [];
      }
    },
    async GetAssigmentForStudent(){
      try {
        const response = await axios.get(
          `https://localhost:7057/api/Dosya`
        );
        console.log(response.data)
        this.assigmentForStudent = response.data;
        this.totalAssignmentsForStudent = this.assigmentForStudent.length;
      } catch (error) {
        console.error("Ödevleri çekerken bir hata oluştu:", error);
        
      }
    },
    logout() {
      this.$store.dispatch("logout");
      this.$router.push({ name: "Login" });
    },
  },
  async mounted(){
    this.GetAssigmentForTeacher();
    this.GetAssigmentForStudent();  
  },
  created() {
    this.fetchUsers();
  },
};
</script>
