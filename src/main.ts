// src/main.ts
import "./plugins/axios";

import "vuetify/dist/vuetify.min.css";
import "./style.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

import router from "./router";
import store from "@/store";
import vuetify from "@/plugins/vuetify";

// BURASI ÖNEMLİ: Chart.js'i tüm özellikleriyle birlikte import et.
// Bu, BarElement, Tooltip gibi bileşenlerin otomatik olarak kaydedilmesini sağlar.
import Chart from 'chart.js/auto'; // Bu import, tüm Chart.js bileşenlerini kaydeder
import { defaults } from 'chart.js'; // defaults için ayrı import

const app = createApp(App);

// Chart.js global ayarlarını Vue uygulamasından önce tanımlamak
// Bu sayede, Chart.js componentleri (SimilarityBarChart gibi) bu varsayılanları kullanabilir.
defaults.font.family = 'Inter, sans-serif'; // Genel varsayılan font ailesi
defaults.font.size = 14; // Genel varsayılan font boyutu
defaults.color = '#334155'; // Genel varsayılan metin rengi

defaults.plugins.tooltip.backgroundColor = 'rgba(30, 41, 59, 0.9)'; // Tooltip arka planı
defaults.plugins.tooltip.padding = 12;
defaults.plugins.tooltip.cornerRadius = 6;
defaults.plugins.tooltip.displayColors = true; // Renk kutucuklarını göster
defaults.plugins.tooltip.boxPadding = 4;

// Hata veren kısımların düzeltilmesi:
// bodyFont ve titleFont doğrudan bir FontSpec objesi olarak atanmalı
defaults.plugins.tooltip.bodyFont = {
  family: 'Inter, sans-serif',
  size: 14, // Body font boyutu
};
defaults.plugins.tooltip.titleFont = {
  family: 'Inter, sans-serif',
  size: 16, // Başlık font boyutu
  weight: 'bold', // Başlık font kalınlığı
};


// Plugin’leri sırayla kullanın
app.use(createPinia()); // Pinia (veya Vuex store’unuz)
app.use(store);         // Vuex Store
app.use(router);        // Vue Router
app.use(vuetify);       // Vuetify

// Uygulamayı mount edin
app.mount("#app");