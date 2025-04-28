// src/main.ts

// 1. Axios interceptor’larını en başta yükleyin
import "./plugins/axios";

// 2. UI kütüphanelerinin CSS dosyalarını getir
import "vuetify/dist/vuetify.min.css";
import "./style.css";

// 3. Vue ve Pinia/Store/Router/Vuetify import’ları
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import store from "@/store";
import vuetify from "@/plugins/vuetify";

const app = createApp(App);

// 4. Plugin’leri sırayla kullanın
app.use(createPinia());  // Pinia (veya Vuex store’unuz)
app.use(store);          // Vuex Store
app.use(router);         // Vue Router
app.use(vuetify);        // Vuetify

// 5. Uygulamayı mount edin
app.mount("#app");
