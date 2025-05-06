<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-6 relative">
    <!-- Loading Overlay -->
    <LoadingOverlay :visible="loading" message="Veriler yükleniyor, lütfen bekleyin..." />

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
      <!-- Header Section -->
      <ReportHeader 
        :user1="stats?.user1" 
        :user2="stats?.user2" 
        :similarity="stats?.similarity"
        @toggle-chart="toggleChart"
        :show-chart="showChart"
      />

      <!-- Highlight Mode Selector -->
      <HighlightModeSelector 
        v-model="highlightMode"
        :modes="highlightModes"
      />

      <!-- Text Comparison Section -->
      <div class="grid md:grid-cols-2 gap-6 px-4 md:px-6 pb-6">
        <TextComparisonPane 
          :title="stats?.user1"
          :text="stats?.text1"
          :match-spans="processedSpans"
          :highlight-mode="highlightMode"
          type="start1"
          color="indigo"
          @span-clicked="handleSpanClick"
          ref="pane1"
        />
        <TextComparisonPane 
          :title="stats?.user2"
          :text="stats?.text2"
          :match-spans="processedSpans"
          :highlight-mode="highlightMode"
          type="start2"
          color="purple"
          @span-clicked="handleSpanClick"
          ref="pane2"
        />
      </div>

      <!-- Charts and Statistics Section -->
      <transition name="slide-fade">
        <div v-if="showChart" class="px-4 md:px-6 pb-8 space-y-6">
          <SimilarityBarChart 
            :data="chartData"
            :options="chartOptions"
          />
          <StatisticsGrid :stats="statCards" />
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { ChartData, ChartOptions } from 'chart.js'

// Components
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import ReportHeader from '@/components/reports/ReportHeader.vue'
import HighlightModeSelector from '@/components/reports/HighlightModeSelector.vue'
import TextComparisonPane from '@/components/reports/TextComparisonPane.vue'
import SimilarityBarChart from '@/components/charts/SimilarityBarChart.vue'
import StatisticsGrid from '@/components/reports/StatisticsGrid.vue'

interface MatchSpan {
  start1?: number
  start2?: number
  length: number
  id?: string // Eşleşme için benzersiz ID
}

interface ReportStats {
  user1: string
  user2: string
  similarity: number
  text1: string
  text2: string
  matchSpans: MatchSpan[]
  matchingWordCount: number
  uniqueWords1: number
  uniqueWords2: number
  totalWords1: number
  totalWords2: number
  timeElapsed: number
}

interface StatCard {
  title: string
  value: string | number
}

export default defineComponent({
  name: 'SimilarityReportView',
  components: {
    LoadingOverlay,
    ReportHeader,
    HighlightModeSelector,
    TextComparisonPane,
    SimilarityBarChart,
    StatisticsGrid
  },
  setup() {
    const route = useRoute()
    const stats = ref<ReportStats | null>(null)
    const showChart = ref(false)
    const loading = ref(true)
    const highlightMode = ref('none')
    const pane1 = ref()
    const pane2 = ref()

    const highlightModes = [
      { value: 'none', label: 'Tümü' },
      { value: 'match', label: 'Eşleşen' },
      { value: 'diff', label: 'Farklı' }
    ]

    // Eşleşen span'lara benzersiz ID'ler ekleyelim
    const processedSpans = computed(() => {
      if (!stats.value?.matchSpans) return []
      return stats.value.matchSpans.map((span, index) => ({
        ...span,
        id: `match-${index}` // Her eşleşme için benzersiz ID
      }))
    })

    const fetchData = async () => {
      const q = route.query
      try {
        const res = await axios.post('http://localhost:5000/compare_json', {
          KullaniciAdi1: q.user1,
          KullaniciAdi2: q.user2,
          Dosya1: decodeURIComponent(q.file1 as string),
          Dosya2: decodeURIComponent(q.file2 as string),
          BenzerlikOrani: Number(q.ratio) || 0
        })
        stats.value = res.data
      } catch (err) {
        console.error('Veri alınamadı', err)
        // Here you would add proper error handling and user notification
      } finally {
        loading.value = false
      }
    }

    const handleSpanClick = (spanId: string) => {
      // Tıklanan span'ın diğer paneldeki karşılığını bul ve kaydır
      if (pane1.value && pane2.value) {
        if (pane1.value.scrollToSpan) pane1.value.scrollToSpan(spanId)
        if (pane2.value.scrollToSpan) pane2.value.scrollToSpan(spanId)
      }
    }

    const chartData = computed<ChartData<'bar'>>(() => ({
      labels: ['Eşleşen', `Özgün (${stats.value?.user1})`, `Özgün (${stats.value?.user2})`],
      datasets: [{
        label: 'Kelime Sayısı',
        backgroundColor: ['#16a34a', '#2563eb', '#ea580c'],
        data: [
          stats.value?.matchingWordCount || 0,
          stats.value?.uniqueWords1 || 0,
          stats.value?.uniqueWords2 || 0
        ]
      }]
    }))

    const chartOptions = computed<ChartOptions<'bar'>>(() => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `${context.dataset.label}: ${context.raw}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }))

    const statCards = computed<StatCard[]>(() => {
      if (!stats.value) return []
      return [
        { title: `Toplam Kelime (${stats.value.user1})`, value: stats.value.totalWords1 },
        { title: `Toplam Kelime (${stats.value.user2})`, value: stats.value.totalWords2 },
        { title: 'Eşleşen Kelime', value: stats.value.matchingWordCount },
        { title: `Özgün (${stats.value.user1})`, value: stats.value.uniqueWords1 },
        { title: `Özgün (${stats.value.user2})`, value: stats.value.uniqueWords2 },
        { title: 'İşlem Süresi (s)', value: stats.value.timeElapsed.toFixed(2) }
      ]
    })

    const toggleChart = () => {
      showChart.value = !showChart.value
    }

    fetchData()

    return {
      stats,
      showChart,
      loading,
      highlightMode,
      highlightModes,
      chartData,
      chartOptions,
      statCards,
      toggleChart,
      processedSpans,
      handleSpanClick,
      pane1,
      pane2
    }
  }
})
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
</style>