import { createApp } from "vue";
import 'vuetify/dist/vuetify.min.css';

import { createPinia } from "pinia";
import router from "./router";
import "./style.css";
import App from "./App.vue";
import store from "@/store/index"; // Vuex Store
import vuetify from '@/plugins/vuetify'; // Vuetify eklentisini çağırıyoruz

const app = createApp(App);

app.use(createPinia());
app.use(store); // Vuex Store'u ekledik
app.use(router);
app.use(vuetify);
app.mount("#app")