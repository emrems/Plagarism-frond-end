<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Öğretmen Paneli</h1>
      <!-- Font Awesome CDN -->
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        rel="stylesheet"
      />

      <div
        class="absolute top-4 right-4 flex items-center gap-4 bg-white p-2 rounded-lg shadow-md"
      >
        <div class="flex items-center gap-2">
          <!-- Font Awesome kullanıcı ikonu -->
          <i class="fas fa-user-circle text-gray-700 text-3xl"></i>
          <span class="text-gray-700 font-medium text-sm">
            Hoş geldiniz,
            <span class="font-semibold">{{ userName }}</span>
          </span>
        </div>
        <button
          @click="logout"
          class="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
        >
          Çıkış Yap
        </button>
      </div>

      <!-- Yükleniyor İndikatörü -->
      <div
        v-if="isLoading"
        class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50"
      >
        <div
          class="loader border-t-4 border-blue-500 border-solid rounded-full w-16 h-16 animate-spin"
        ></div>
      </div>

      <!-- Hata Mesajı -->
      <div
        v-if="error"
        class="mb-4 p-4 text-red-700 bg-red-100 border border-red-400 rounded-lg"
      >
        {{ error }}
      </div>

      <!-- Yeni Ödev Oluşturma Formu -->
      <div class="container">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Yeni Ödev Oluştur</h2>
          </div>

          <form @submit.prevent="createAssignment">
            <div class="form-group">
              <label for="title">Ödev Başlığı</label>
              <input
                id="title"
                v-model="newAssignment.title"
                type="text"
                required
                placeholder="Örn: React ile Todo Uygulaması"
              />
            </div>

            <div class="form-group">
              <label for="description">Açıklama</label>
              <textarea
                id="description"
                v-model="newAssignment.description"
                required
                placeholder="Ödev detaylarını buraya yazın..."
              ></textarea>
            </div>

            <div class="form-group date-inputs">
              <div>
                <label for="startDate">Başlangıç Tarihi</label>
                <input
                  id="startDate"
                  v-model="newAssignment.startDate"
                  type="datetime-local"
                  required
                />
              </div>

              <div>
                <label for="deadline">Son Teslim Tarihi</label>
                <input
                  id="deadline"
                  v-model="newAssignment.deadline"
                  type="datetime-local"
                  required
                />
              </div>
            </div>

            <button type="submit" class="btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              Ödev Oluştur
            </button>
          </form>
        </div>
      </div>
      <!-- Başarı Mesajı Modal -->
      <div
        v-if="successMessage"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-11/12 sm:max-w-md transform transition-all duration-300 scale-95 hover:scale-100"
        >
          <div class="p-6">
            <div class="flex items-center justify-center mb-5">
              <div
                class="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full"
              >
                <svg
                  class="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
            </div>

            <div class="text-center">
              <h3
                class="text-2xl font-semibold text-gray-800 dark:text-white mb-2"
              >
                Başarıyla Ödev Oluşturuldu!
              </h3>
              <p class="text-gray-600 dark:text-gray-300 mb-6">
                Ödeviniz başarıyla oluşturuldu. Ödev listenizde
                görüntüleyebilirsiniz.
              </p>
            </div>

            <div class="flex justify-center">
              <button
                @click="closeSuccessMessage"
                class="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
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
                    <span class="inline-flex items-center">
                      <svg
                        class="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        ></path>
                      </svg>
                      {{ assignment.baslik }}
                    </span>
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
                    @click="openSubmissionModal(assignment.icerikId)"
                    class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                  >
                    Gönderilen Ödevler
                  </button>

                  <div>
                    <!-- Buton -->
                    <button
                      @click="openModel(assignment.icerikId)"
                      class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-400 to-teal-500 hover:bg-green-600 transition duration-300"
                    >
                      Benzerlik Sonuçlarını Görüntüle
                    </button>

                    <!-- Modal -->
                    <VDialog
                      v-model="similaritymodalOpen"
                      persistent
                      max-width="800px"
                    >
                      <VCard
                        class="shadow-lg rounded-lg border border-gray-300 p-5"
                      >
                        <VCardTitle
                          class="text-2xl font-bold text-center text-gray-800 mb-4"
                        >
                          Benzerlik Sonuçları
                        </VCardTitle>

                        <VCardText>
                          <!-- Filtreleme Alanı (Input Box ile) -->
                          <div
                            class="flex items-center justify-between mb-4 p-2 bg-gray-100 rounded-lg"
                          >
                            <label
                              for="similarityFilter"
                              class="text-gray-700 font-medium"
                            >
                              Min. Benzerlik Oranı (%):
                            </label>
                            <input
                              id="similarityFilter"
                              v-model="minSimilarity"
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              class="w-1/3 px-2 py-1 border rounded-md focus:outline-none"
                              placeholder="0"
                            />
                            <span class="text-gray-800 font-semibold"
                              >{{ minSimilarity }}%</span
                            >
                          </div>

                          <!-- Başlıklar -->
                          <div
                            class="grid grid-cols-5 gap-4 items-center bg-gray-100 py-2 px-4 rounded-md text-gray-700 font-semibold"
                          >
                            <div>Dosya 1</div>
                            <div class="text-center">➝</div>
                            <div>Dosya 2</div>
                            <div class="text-center">Benzerlik</div>
                            <div class="text-right">İnceleme</div>
                          </div>

                          <!-- Filtrelenmiş Sonuçlar -->
                          <div v-if="filteredSimilarityData.length > 0">
                            <div
                              v-for="(
                                similarity, index
                              ) in filteredSimilarityData"
                              :key="index"
                              class="grid grid-cols-5 gap-4 items-center border-b py-3 px-4 hover:bg-gray-50 transition duration-300"
                            >
                              <!-- Dosya 1 -->
                              <div class="flex items-center space-x-2">
                                <v-icon
                                  class="fa fa-file text-blue-600"
                                ></v-icon>
                                <span class="text-gray-700 truncate">{{
                                  similarity.ilkKullaniciAdi
                                }}</span>
                              </div>

                              <!-- Ok İşareti -->
                              <div class="text-center text-gray-600">➝</div>

                              <!-- Dosya 2 -->
                              <div class="flex items-center space-x-2">
                                <v-icon
                                  class="fa fa-file text-blue-600"
                                ></v-icon>
                                <span class="text-gray-700 truncate">{{
                                  similarity.ikinciKullaniciAdi
                                }}</span>
                              </div>

                              <!-- Benzerlik Oranı -->
                              <div
                                class="flex items-center justify-center space-x-2"
                              >
                                <v-icon
                                  class="fa fa-chart-bar text-green-600"
                                ></v-icon>
                                <span
                                  class="bg-green-100 text-green-800 text-sm font-semibold px-2 py-1 rounded-md"
                                >
                                  {{
                                    (similarity.benzerlikOrani * 100).toFixed(
                                      2
                                    )
                                  }}%
                                </span>
                              </div>

                              <!-- Detaylı İnceleme Butonu -->
                              <div class="text-right">
                                <button
                                  @click="viewDetails(similarity)"
                                  class="inline-flex items-center px-3 py-1.5 text-white text-sm font-medium rounded-md transition duration-300 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 hover:shadow-md"
                                >
                                  <v-icon
                                    class="fa fa-eye mr-2 text-sm"
                                  ></v-icon>
                                  İncele
                                </button>
                              </div>
                            </div>
                          </div>
                          <p v-else class="text-center text-gray-500 mt-4">
                            Eşleşen kayıt bulunamadı.
                          </p>
                        </VCardText>

                        <VCardActions class="justify-center">
                          <VBtn
                            @click="closeModalSimilarityResponse"
                            color="blue"
                            class="px-4 py-2 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700 transition duration-300"
                          >
                            Kapat
                          </VBtn>
                        </VCardActions>
                      </VCard>
                    </VDialog>
                  </div>
                </div>
              </div>
            </li>
          </ul>
          <div v-else class="px-4 py-8 text-center text-gray-500">
            Henüz ödev oluşturulmamış.
          </div>
        </div>
      </div>

      <!-- Gönderilen Ödevler Modal -->
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div
          class="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2 p-6"
        >
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold">Gönderilen Ödevler</h3>
            <button
              @click="closeModal"
              class="text-gray-500 hover:text-gray-700"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
          <div v-if="currentSubmissions.length > 0" class="space-y-4">
            <div
              v-for="submission in currentSubmissions"
              :key="submission.dosyaId"
              class="p-4 bg-gray-50 rounded-lg shadow-sm"
            >
              <div
                class="flex flex-col md:flex-row items-center justify-between"
              >
                <div class="flex-1">
                  <p class="text-sm text-gray-500">
                    <span class="font-medium">Öğrenci:</span>
                    {{ submission.kullanici.ad }}
                    {{ submission.kullanici.soyad }}
                  </p>
                  <p class="text-sm text-gray-500">
                    <span class="font-medium">Dosya:</span>
                    {{ submission.cleanedPath }}
                  </p>
                </div>
                <div class="flex space-x-2 mt-2 md:mt-0">
                  <button
                    @click="downloadFile(submission)"
                    class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <svg
                      class="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      ></path>
                    </svg>
                    İndir
                  </button>
                  <button
                    @click="viewFile(submission)"
                    class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <svg
                      class="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2 17l1.5 1.5L5 17m14 0l1.5 1.5L22 17m-8-5h.01M12 16h.01M16 12h.01M8 12h.01"
                      ></path>
                    </svg>
                    Görüntüle
                  </button>
                </div>
              </div>
            </div>
            <!-- Karşılaştır Butonu -->
            <div class="mt-4">
              <button
                @click="compareSubmissions"
                class="inline-flex justify-center w-full py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Karşılaştır
              </button>
              <!-- Karşılaştırma Başarı Mesajı -->
              <div
                v-if="isComparisonSuccess"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
              >
                <div
                  class="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2 p-6"
                >
                  <h3 class="text-xl font-semibold text-green-600">
                    Karşılaştırma Başarıyla Tamamlandı!
                  </h3>
                  <div class="mt-4">
                    <button
                      @click="isComparisonSuccess = false"
                      class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Tamam
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="px-4 py-8 text-center text-gray-500">
            Henüz gönderilen ödev yok.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

import {
  VDialog,
  VCard,
  VCardTitle,
  VCardText,
  VCardActions,
  VBtn,
  VProgressLinear,
} from "vuetify/components";

export default {
  components: {
    VDialog,
    VCard,
    VCardTitle,
    VCardText,
    VCardActions,
    VBtn,
    VProgressLinear,
  },
  data() {
    return {
      minSimilarity: 0,
      similaritymodalOpen: false,
      similarityData: [],
      isLoading: false,
      isComparisonSuccess: false, // Karşılaştırma başarılı mı?
      successMessage: "",
      assignments: [],
      newAssignment: {
        title: "",
        description: "",
        startDate: "",
        deadline: "",
      },
      error: "",
      isModalOpen: false, // Modal açık/kapalı durumu
      currentSubmissions: [], // Seçilen ödevin gönderimleri
      currentIcerikId: null, // Seçilen ödevin icerikId'si
    };
  },

  computed: {
    // Kullanıcı adını Vuex store'dan al
    userName() {
      return this.$store.getters.getUserName;
    },
    similarityPercentage() {
      // 0-1 arasındaki değeri % cinsine çevirme
      return this.similarityData[index]
        ? Math.round(this.similarityData[index].benzerlikOrani * 100)
        : 0;
    },
    filteredSimilarityData() {
      return this.similarityData.filter(
        (similarity) => similarity.benzerlikOrani * 100 >= this.minSimilarity
      );
    },
  },
  methods: {
    async fetchAssignments() {
      try {
        this.isLoading = true; // Loading başlat
        const teacherId = this.$store.getters.userId;
        if (!teacherId) {
          console.error("Öğretmen ID'si bulunamadı.");
          this.error = "Öğretmen ID'si bulunamadı.";
          return;
        }

        const response = await axios.get(
          `https://localhost:7057/api/Icerik/teacher/${teacherId}/all`,
          {
            headers: { Authorization: `Bearer ${this.$store.state.token}` },
          }
        );

        if (response.status === 200) {
          //console.log("Ödevler alındı:", response.data);
          this.assignments = response.data.map((assignment) => ({
            ...assignment,
            showSubmissions: false,
            submissions: [],
          }));
        } else {
          this.error = "Ödevler alınamadı. Lütfen tekrar deneyin.";
        }
      } catch (error) {
        console.error("Ödevler alınamadı:", error);
        this.error = "Bir hata oluştu. Lütfen tekrar deneyin.";
      } finally {
        this.isLoading = false; // Loading durdur
      }
    },
    closeModalSimilarityResponse() {
      this.similaritymodalOpen = false;
      this.similarityData = []; // Modal kapatıldığında verileri temizle
      this.minSimilarity = 0;
    },

    async openSubmissionModal(icerikId) {
      try {
        this.isLoading = true; // Loading başlat
        const response = await axios.get(
          `https://localhost:7057/api/Dosya/${icerikId}`,
          {
            headers: { Authorization: `Bearer ${this.$store.state.token}` },
          }
        );

        if (response.status === 200) {
          console.log("Gönderilen ödevler alındı:", response.data);
          this.currentSubmissions = response.data;
          this.currentIcerikId = icerikId; // İçerik ID'sini sakla
          this.isModalOpen = true;
        } else {
          console.error(
            "Gönderilen ödevler alınamadı. Status:",
            response.status
          );
          this.error = "Gönderilen ödevler alınamadı.";
        }
      } catch (error) {
        console.error("Gönderilen ödevler alınamadı:", error);
        this.error = "Gönderilen ödevler alınamadı. Lütfen tekrar deneyin.";
      } finally {
        this.isLoading = false; // Loading durdur
      }
    },

    closeModal() {
      this.isModalOpen = false;
      this.currentSubmissions = [];
      this.currentIcerikId = null;
    },

    async compareSubmissions() {
      if (!this.currentIcerikId) {
        this.error = "İçerik ID'si bulunamadı.";
        return;
      }

      try {
        this.isLoading = true; // Loading başlat
        const response = await axios.post(
          "http://127.0.0.1:5000/compare", // Flask backend URL'si
          { content_id: this.currentIcerikId }, // Gönderilen veri
          {
            headers: {
              "Content-Type": "application/json", // JSON formatında olduğunu belirt
              Authorization: `Bearer ${this.$store.state.token}`, // Gerekirse token ekleyin
            },
          }
        );

        if (response.status === 200) {
          this.isComparisonSuccess = true;
        } else {
          this.error = "Karşılaştırma sırasında bir hata oluştu.";
        }
      } catch (error) {
        console.error("Karşılaştırma hatası:", error);
        this.error = "Karşılaştırma sırasında bir hata oluştu.";
      } finally {
        this.isLoading = false; // Loading durdur
      }
    },
    async openModel(icerikId) {
      try {
        const response = await axios.get(
          `https://localhost:7057/api/BenzerlikSonuclari/icerik/${icerikId}`,
          {
            headers: { Authorization: `Bearer ${this.$store.state.token}` },
          }
        );
        if (response.status === 200) {
          console.log("Benzerlik sonuçları alındı:", response.data);
          this.similarityData = Array.isArray(response.data)
            ? response.data
            : [];
          this.similaritymodalOpen = true;
        } else {
          console.error(
            "Benzerlik sonuçları alınamadı. Status:",
            response.status
          );
          this.error = "Benzerlik sonuçları alınamadı.";
        }
      } catch (error) {
        console.error("Benzerlik sonuçları alınamadı:", error);
        this.error = "Benzerlik sonuçları alınamadı. Lütfen tekrar deneyin.";
      } finally {
        this.isLoading = false; // Loading durdur
      }
    },

    async createAssignment() {
      if (
        !this.newAssignment.title ||
        !this.newAssignment.description ||
        !this.newAssignment.startDate ||
        !this.newAssignment.deadline
      ) {
        alert("Tüm alanları doldurduğunuzdan emin olun.");
        return;
      }

      try {
        this.isLoading = true; // Loading başlat

        // Tarihleri ISO formatına çevir
        const formattedStartDate = new Date(
          this.newAssignment.startDate
        ).toISOString();
        const formattedDeadline = this.newAssignment.deadline
          ? new Date(this.newAssignment.deadline).toISOString()
          : null;

        console.log("Gönderilen Başlangıç Tarihi:", formattedStartDate);
        console.log("Gönderilen Bitiş Tarihi:", formattedDeadline);

        const response = await axios.post(
          "https://localhost:7057/api/Icerik",
          {
            Baslik: this.newAssignment.title,
            Aciklama: this.newAssignment.description,
            OlusturmaTarihi: formattedStartDate,
            BitisTarihi: formattedDeadline,
          },
          {
            headers: {
              Authorization: `Bearer ${this.$store.state.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          this.newAssignment = {
            title: "",
            description: "",
            startDate: "",
            deadline: "",
          };
          this.successMessage = "Başarıyla ödev oluşturuldu!"; // Başarı mesajı
          this.fetchAssignments();
        } else {
          alert("Ödev oluşturulurken bir hata oluştu.");
        }
      } catch (error) {
        alert("Ödev oluşturulurken bir hata oluştu.");
      } finally {
        this.isLoading = false; // Loading durdur
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
        this.isLoading = true;
        const response = await axios.get(
          `https://localhost:7057/api/Dosya/download/${submission.dosyaId}`,
          {
            headers: { Authorization: `Bearer ${this.$store.state.token}` },
            responseType: "blob", // Dosya indirme için responseType blob olmalı
          }
        );

        // Dosyayı indirme işlemi
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", submission.cleanedPath.split("\\").pop()); // Dosya adını al
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Dosya indirilemedi:", error);
        this.error = "Dosya indirilemedi. Lütfen tekrar deneyin.";
      } finally {
        this.isLoading = false;
      }
    },

    viewFile(submission) {
      const fileUrl = `https://localhost:7057/api/Dosya/download/${submission.dosyaId}`;
      window.open(fileUrl, "_blank");
    },
    closeSuccessMessage() {
      this.successMessage = "";
    },
    logout() {
      this.$store.dispatch("logout");
      this.$router.push({ name: "Login" });
    },
  },
  mounted() {
    this.fetchAssignments();
  },
};
</script>

<style>
/* Modal Stili */
:root {
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --primary-light: #eef2ff;
  --secondary: #f9fafb;
  --border: #e5e7eb;
  --text: #1f2937;
  --text-light: #6b7280;
  --danger: #ef4444;
  --success: #10b981;
  --radius: 0.5rem;
  --shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Base styles */
body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  color: var(--text);
  background-color: #f3f4f6;
  margin: 0;
  padding: 0;
  line-height: 1.5;
}

/* Layout */
.container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 0 1rem;
}

/* Card components */
.card {
  background-color: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  padding: 1.5rem;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

/* Form elements */
.form-group {
  margin-bottom: 1.25rem;
}

label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text);
}

input,
textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background-color: white;
  font-size: 0.95rem;
  transition: all 0.2s;
  outline: none;
  color: var(--text);
}

input:focus,
textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.date-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.btn:hover {
  background-color: var(--primary-hover);
}

.btn svg {
  margin-right: 0.5rem;
}

/* Modal styles */
.fixed {
  position: fixed;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.bg-opacity-50 {
  background-color: rgba(0, 0, 0, 0.5);
}

.rounded-lg {
  border-radius: 0.5rem;
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Width utilities */
.w-full {
  width: 100%;
}

.w-11\/12 {
  width: 91.666667%;
}

/* Padding */
.p-6 {
  padding: 1.5rem;
}

/* Colors */
.bg-white {
  background-color: #ffffff;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-700 {
  color: #374151;
}

.text-gray-900 {
  color: #111827;
}

.text-white {
  color: #ffffff;
}

/* Button variants */
.bg-blue-600 {
  background-color: #2563eb;
}

.hover\:bg-blue-700:hover {
  background-color: #1d4ed8;
}

.bg-green-600 {
  background-color: #16a34a;
}

.hover\:bg-green-700:hover {
  background-color: #15803d;
}

.bg-purple-600 {
  background-color: #9333ea;
}

.hover\:bg-purple-700:hover {
  background-color: #7e22ce;
}

.bg-red-600 {
  background-color: #dc2626;
}

.hover\:bg-red-700:hover {
  background-color: #b91c1c;
}

/* Focus states */
.focus\:ring-2:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.focus\:ring-offset-2:focus {
  outline-offset: 2px;
}

.focus\:ring-purple-500:focus {
  box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.5);
}

/* Modal specific styles */
.modal-content {
  padding: 2rem;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modal-header {
  font-size: 1.25rem;
  font-weight: bold;
  color: #374151;
  margin-bottom: 1rem;
}

.modal-body {
  font-size: 1rem;
  color: #6b7280;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.modal-button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
}

.modal-button-blue {
  background-color: #2563eb;
  color: #fff;
}

.modal-button-blue:hover {
  background-color: #1d4ed8;
}

.modal-button-red {
  background-color: #ef4444;
  color: #fff;
}

.modal-button-red:hover {
  background-color: #dc2626;
}

.modal-button-green {
  background-color: #16a34a;
  color: #fff;
}

.modal-button-green:hover {
  background-color: #15803d;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .date-inputs {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 768px) {
  .md\:w-3\/4 {
    width: 75%;
  }
}

@media (min-width: 1024px) {
  .lg\:w-1\/2 {
    width: 50%;
  }
}
</style>
