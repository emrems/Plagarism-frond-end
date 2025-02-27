import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import "./style.css";
import App from "./App.vue";
import store from "@/store/index"; // Vuex Store

const app = createApp(App);

app.use(createPinia());
app.use(store); // Vuex Store'u ekledik
app.use(router);

app.mount("#app")