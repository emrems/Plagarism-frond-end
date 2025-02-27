import { createRouter, createWebHistory } from "vue-router";

import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import AdminDashboard from "../views/AdminDashboard.vue";
import TeacherDashboard from "../views/TeacherDashboard.vue";
import StudentDashboard from "../views/StudentDashboard.vue";
import store from "@/store/index"; // Vuex store

const routes = [
  // Kök rota doğrudan Login sayfasına yönlendirilir
  { path: "/", redirect: "/login" },
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },
  {
    path: "/admin",
    name: "AdminDashboard",
    component: AdminDashboard,
    meta: { requiresAuth: true, role: "Admin" },
  },
  {
    path: "/teacher",
    name: "TeacherDashboard",
    component: TeacherDashboard,
    meta: { requiresAuth: true, role: "Teacher" },
  },
  {
    path: "/student",
    name: "StudentDashboard",
    component: StudentDashboard,
    meta: { requiresAuth: true, role: "Student" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global Route Guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.isAuthenticated; // Kullanıcı giriş yapmış mı?
  const userRole = store.getters.userRole; // Kullanıcının rolü nedir?

  // Kimlik doğrulaması gereken sayfalar için kontrol
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next("/login"); // Giriş yapılmamışsa Login sayfasına yönlendir
  }

  // Kullanıcının rolü, sayfanın rolüyle uyuşmuyor ise Login'e yönlendir
  if (to.meta.role && to.meta.role !== userRole) {
    return next("/login");
  }

  // Admin kullanıcı Login sayfasına geldiğinde AdminDashboard'a yönlendir
  if (to.path === "/login" && isAuthenticated && userRole === "Admin") {
    return next("/admin-dashboard");
  }

  next();
});

export default router;
