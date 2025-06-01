<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"> <div
      v-for="stat in stats"
      :key="stat.title"
      class="stat-card group"
    >
      <div class="flex items-center mb-2">
        <div
          v-if="stat.icon"
          class="mr-2 icon-container text-indigo-500 group-hover:text-indigo-600 transition-colors duration-300"
          v-html="stat.icon"
        ></div>
        <div class="card-title">{{ stat.title }}</div>
      </div>
      <div class="card-value">{{ stat.value }}</div>
      <p v-if="stat.description" class="card-description">{{ stat.description }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

interface StatCard {
  title: string
  value: string | number
  description?: string
  icon?: string
}

export default defineComponent({
  name: 'StatisticsGrid',
  props: {
    stats: {
      type: Array as PropType<StatCard[]>,
      required: true
    }
  }
})
</script>

<style scoped>
/* Genel kart stili */
.stat-card {
  @apply bg-white border border-gray-200 rounded-lg p-4 shadow-sm /* p-5/p-6 -> p-4, shadow-md/lg -> shadow-sm */
        hover:shadow-lg transition-all duration-300 ease-in-out
        flex flex-col;
  min-height: 100px; /* Daha kompakt bir min yükseklik (110px -> 100px) */
  position: relative;
  overflow: hidden;
}

/* Kart başlığı */
.card-title {
  @apply text-xs font-medium text-gray-500 group-hover:text-gray-700 uppercase tracking-normal /* font-semibold -> font-medium, text-gray-600 -> text-gray-500 */
        font-inter transition-colors duration-300;
}

/* Kart değeri */
.card-value {
  @apply text-2xl font-semibold mt-1 mb-1 text-indigo-600 group-hover:text-indigo-700 /* text-3xl -> text-2xl, font-bold -> font-semibold */
        font-inter transition-colors duration-300;
  line-height: 1.2;
}

/* Kart açıklaması */
.card-description {
  @apply text-xs text-gray-500 mt-1.5 leading-normal /* mt-1 -> mt-1.5 */
        font-inter;
}

/* Inter fontunu doğrudan stil içinde tanımlama */
.font-inter {
  font-family: 'Inter', sans-serif;
}

/* Üstteki gradyan efekti daha ince ve hover'da belirgin */
.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px; /* Daha ince (3px -> 2px) */
  background: linear-gradient(to right, #818cf8, #a78bfa); /* Tailwind indigo-400 to purple-400 */
  border-top-left-radius: 0.375rem; /* rounded-lg ile uyumlu (6px) */
  border-top-right-radius: 0.375rem;
  opacity: 0.6;
  transition: opacity 0.3s ease-in-out, height 0.3s ease-in-out;
}

.stat-card:hover::before {
  opacity: 1;
  height: 3px; /* Hover'da biraz kalınlaşsın (4px -> 3px) */
}

/* Breakpoint'lerde gap ayarları (yukarıda ana grid class'ında birleştirildi) */
</style>