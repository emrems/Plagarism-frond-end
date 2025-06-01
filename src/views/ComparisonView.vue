<template>
  <div class="min-h-screen bg-gray-100 md:p-4 relative">
    <LoadingOverlay
      :visible="loading"
      message="Veriler yükleniyor, lütfen bekleyin..."
    />

    <div
      v-if="!loading && stats"
      class="max-w-screen-2xl mx-auto bg-white shadow-xl md:rounded-lg overflow-hidden"
    >
      <ReportHeader
        :user1="stats.user1"
        :user2="stats.user2"
        :similarity="stats.similarity"
        @toggle-chart="toggleChart"
        :show-chart="showChart"
        class="px-4 sm:px-6 lg:px-8"
      />

      <div class="p-3 sm:p-4 text-center text-xs sm:text-sm text-gray-700 bg-slate-100 border-y border-slate-200">
        Birbiriyle eşleşen metin blokları her iki tarafta da aynı renkle vurgulanmıştır.
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-px bg-slate-300">
        <div class="bg-white p-3 sm:p-4 lg:p-5 overflow-x-auto">
          <h3 class="text-md sm:text-lg font-semibold text-slate-800 mb-2 sm:mb-3 sticky top-0 bg-white/80 backdrop-blur-sm py-2 border-b border-slate-200 -mx-3 sm:-mx-4 lg:-mx-5 px-3 sm:px-4 lg:px-5 z-10">{{ stats.user1 }}</h3>
          <div
            class="comparison-pane"
            v-html="highlightedText1Html"
            ref="pane1Content"
            @click="handleContentClick"
          ></div>
        </div>

        <div class="bg-white p-3 sm:p-4 lg:p-5 overflow-x-auto">
          <h3 class="text-md sm:text-lg font-semibold text-slate-800 mb-2 sm:mb-3 sticky top-0 bg-white/80 backdrop-blur-sm py-2 border-b border-slate-200 -mx-3 sm:-mx-4 lg:-mx-5 px-3 sm:px-4 lg:px-5 z-10">{{ stats.user2 }}</h3>
          <div
            class="comparison-pane"
            v-html="highlightedText2Html"
            ref="pane2Content"
            @click="handleContentClick"
          ></div>
        </div>
      </div>

      <transition name="slide-fade">
        <div
          v-if="showChart"
          class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4"
          @click.self="toggleChart"
          aria-modal="true"
          role="dialog"
        >
          <div
            class="bg-slate-50 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-out-quart"
            @click.stop
          >
            <div class="px-5 sm:px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h2 class="text-lg sm:text-xl font-semibold text-slate-800">
                Detaylı Rapor ve İstatistikler
              </h2>
              <button
                @click="toggleChart"
                class="text-slate-400 hover:text-slate-600 p-1.5 -mr-1 sm:-mr-2 rounded-full hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Kapat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="p-4 sm:p-6 space-y-6 overflow-y-auto styled-scrollbar">
              <div v-if="stats">
                <section aria-labelledby="similarity-stats-title" class="mb-6">
                  <h3 id="similarity-stats-title" class="text-md sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 border-b border-slate-300 pb-2">Genel Benzerlik İstatistikleri</h3>
                  <StatisticsGrid :stats="statCardsForReport" />
                </section>

                <hr class="my-6 border-slate-200">

                <section aria-labelledby="word-distribution-chart-title">
                  <h3 id="word-distribution-chart-title" class="text-md sm:text-lg font-semibold text-slate-800 mb-2 border-b border-slate-300 pb-2">Kelime Dağılım Grafiği</h3>
                  <p class="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4">Metinler arasındaki ortak ve özgün kelime sayılarının görselleştirilmesi.</p>
                  <div class="h-72 sm:h-80 md:h-96">
                    <SimilarityBarChart :data="chartDataForReport" :options="chartOptions" />
                  </div>
                </section>
              </div>
              <div v-else class="text-center py-10">
                <p class="text-slate-500 text-md sm:text-lg">İstatistik verileri şu anda yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
    <div v-else-if="!loading && !stats" class="text-center py-10">
        <p class="text-green-500 text-lg">Raporunuz hazırlanıyor lütfen daha sonra tekrar ziyaret ediniz</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { ChartData, ChartOptions, TooltipItem, Plugin } from "chart.js"; // Plugin tipi eklendi
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // 1. Eklentiyi import et

// Diğer component importları
import LoadingOverlay from "@/components/ui/LoadingOverlay.vue";
import ReportHeader from "@/components/reports/ReportHeader.vue";
import SimilarityBarChart from "@/components/charts/SimilarityBarChart.vue";
import StatisticsGrid from "@/components/reports/StatisticsGrid.vue";

// Interface tanımlamaları (ApiMatchSpan, ProcessedMatchSpanWithColor, ReportDataFromApi, StatCard)
interface ApiMatchSpan { start1: number; length: number; start2: number; }
interface ProcessedMatchSpanWithColor extends ApiMatchSpan { id: string; color: string; }
interface ReportDataFromApi {
  user1: string; user2: string; similarity: number; raw_text1: string; raw_text2: string;
  matchSpans: ApiMatchSpan[]; matchingWords?: string[]; matchingWordCount?: number;
  uniqueWords1?: number; uniqueWords2?: number; totalWords1?: number; totalWords2?: number;
  timeElapsed?: number;
}
interface StatCard { title: string; value: string | number; description?: string; icon?: string; }

// Renkler ve İkonlar (Kullanıcının sağladığı şekilde bırakıldı)
const enhancedChartColors = {
  green: 'rgba(52, 211, 153, 0.8)',
  blue: 'rgba(96, 165, 250, 0.8)',
  orange: 'rgba(251, 146, 60, 0.8)'
};
const statIcons = {
  totalWords: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 3.75V16.5m-4.5-12.75v12.75m-4.5-12.75v12.75m0-12.75H5.25m13.5 0H18.75m-9 12.75h.008v.008H9.75V16.5zm.75-8.25h.008v.008H10.5V8.25zm.75 8.25h.008v.008H11.25V16.5zm.75-8.25h.008v.008H12V8.25zm.75 8.25h.008v.008H12.75V16.5zm.75-8.25h.008v.008H13.5V8.25Z M5.25 16.5c-.621 0-1.125-.504-1.125-1.125V6.375c0-.621.504-1.125 1.125-1.125h9.5c.621 0 1.125.504 1.125 1.125v9c0 .621-.504 1.125-1.125 1.125H5.25Z" /></svg>`,
  matchingWords: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.4-1.593 3.068M21 12a8.997 8.997 0 0 0-8.997-8.997A8.997 8.997 0 0 0 3 12c0 1.268.63 2.4 1.593 3.068m16.814-3.068A9.003 9.003 0 0 1 12 21.003a9.003 9.003 0 0 1-9.003-9.003m18.006 0A9.003 9.003 0 0 0 12 3.003a9.003 9.003 0 0 0-9.003 9.003" /></svg>`,
  uniqueWords: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>`,
  timeElapsed: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`
};
const textHighlightColors = [
  '#FECACA', '#FDE68A', '#A7F3D0', '#BFDBFE', '#DDD6FE',
  '#FBCFE8', '#FED7AA', '#CCFBF1', '#CFFAFE', '#E0E7FF'
];

// Yardımcı Fonksiyonlar
function getColorForIndex(index: number): string { return textHighlightColors[index % textHighlightColors.length]; }
function escapeHtml(unsafe: string | undefined): string { return unsafe?.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;") || ""; }


export default defineComponent({
  name: "ComparisonView",
  components: {
    LoadingOverlay, ReportHeader, SimilarityBarChart, StatisticsGrid,
  },
  setup() {
    const route = useRoute();
    const stats = ref<ReportDataFromApi | null>(null);
    const showChart = ref(false);
    const loading = ref(true);
    const pane1Content = ref<HTMLElement | null>(null);
    const pane2Content = ref<HTMLElement | null>(null);

    onMounted(() => {
      // 2. Eklentiyi Chart.js'e tanıt (register et)
      // Bu, SimilarityBarChart.vue içinde zaten yapılıyorsa burada tekrar yapmaya gerek yoktur.
      // Ancak emin olmak için veya bu component'e özel tutmak için burada da yapılabilir.
      // Chart.register birden çok kez çağrılabilir, ancak aynı eklenti tekrar kaydedilmez.
      // En iyi pratik, tüm eklentilerin merkezi bir yerde (örn: main.ts veya SimilarityBarChart.vue) kaydedilmesidir.
      try {
        Chart.register(ChartDataLabels);
      } catch (e) {
        // Eklenti zaten kayıtlıysa veya bir sorun oluşursa hata vermemesi için uyarı
        console.warn("ChartDataLabels could not be registered here, possibly already registered or an issue occurred:", e);
      }
      fetchData();
    });

    const processedSpansWithColors = computed((): ProcessedMatchSpanWithColor[] => {
      if (!stats.value?.matchSpans) return [];
      return stats.value.matchSpans.map((span, index) => ({
        ...span,
        id: `match-${index}`,
        color: getColorForIndex(index),
      }));
    });

    const generateHighlightedHtml = ( /* ... generateHighlightedHtml fonksiyonu ... */
      text: string | undefined, spans: ProcessedMatchSpanWithColor[], spanType: 'start1' | 'start2'
    ): string => {
      if (!text || !spans || spans.length === 0) { return escapeHtml(text); }
      let html = ""; let lastIndex = 0;
      const sortedSpans = [...spans].sort((a, b) => a[spanType] - b[spanType]);
      sortedSpans.forEach(span => {
        const startPosition = span[spanType]; const endPosition = startPosition + span.length;
        if (startPosition < lastIndex) {
          if (endPosition > lastIndex) {
            html += `<mark data-span-id="${escapeHtml(span.id)}" style="background-color: ${span.color}; cursor:pointer; padding: 0.1em 0.2em; border-radius: 0.2em;">${escapeHtml(text.substring(lastIndex, endPosition))}</mark>`;
            lastIndex = endPosition;
          } return;
        }
        const originalTextSegment = text.substring(startPosition, endPosition);
        html += escapeHtml(text.substring(lastIndex, startPosition));
        html += `<mark data-span-id="${escapeHtml(span.id)}" style="background-color: ${span.color}; cursor:pointer; padding: 0.1em 0.2em; border-radius: 0.2em; line-height: 1.5;">${escapeHtml(originalTextSegment)}</mark>`;
        lastIndex = endPosition;
      });
      html += escapeHtml(text.substring(lastIndex)); return html;
    };

    const highlightedText1Html = computed(() => generateHighlightedHtml(stats.value?.raw_text1, processedSpansWithColors.value, 'start1'));
    const highlightedText2Html = computed(() => generateHighlightedHtml(stats.value?.raw_text2, processedSpansWithColors.value, 'start2'));

    const fetchData = async () => { /* ... fetchData içeriği ... */
      loading.value = true;
      const content_id_from_path = route.params.contentId as string;
      const file1_id_from_query = route.query.file1_id as string;
      const file2_id_from_query = route.query.file2_id as string;
      if (!content_id_from_path || !file1_id_from_query || !file2_id_from_query) {
        stats.value = null; loading.value = false; return;
      }
      try {
        const response = await axios.post<ReportDataFromApi>(
          "http://localhost:5000/get_comparison_detail_json",
          { content_id: Number(content_id_from_path), file1_id: Number(file1_id_from_query), file2_id: Number(file2_id_from_query) }
        );
        stats.value = response.data;
      } catch (err) {
        console.error("Veri alınırken hata:", err); stats.value = null;
      } finally {
        loading.value = false;
      }
    };
    const scrollToElementInPane = (paneContentRef: typeof pane1Content | typeof pane2Content, spanId: string) => { /* ... scrollToElementInPane içeriği ... */
      if (paneContentRef.value) {
        const element = paneContentRef.value.querySelector(`mark[data-span-id="${spanId}"]`) as HTMLElement;
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.style.transition = 'transform 0.2s ease-out, box-shadow 0.2s ease-out';
          element.style.setProperty('outline', '2px solid #4f46e5', 'important');
          element.style.setProperty('box-shadow', '0 0 0 3px rgba(79, 70, 229, 0.3)', 'important');
          element.style.setProperty('border-radius', '0.3em', 'important');
          setTimeout(() => {
            element.style.removeProperty('outline');
            element.style.removeProperty('box-shadow');
          }, 1800);
        }
      }
    };
    const handleActualSpanClick = (spanId: string) => { /* ... handleActualSpanClick içeriği ... */ scrollToElementInPane(pane1Content, spanId); scrollToElementInPane(pane2Content, spanId); };
    const handleContentClick = (event: MouseEvent) => { /* ... handleContentClick içeriği ... */  const target = event.target as HTMLElement; if (target.tagName === 'MARK' && target.dataset.spanId) { handleActualSpanClick(target.dataset.spanId); } };


    const chartDataForReport = computed<ChartData<"bar">>(() => {
      const s = stats.value;
      return {
        labels: [`Eşleşen`, `${s?.user1 || 'Metin 1'}'e Özgü`, `${s?.user2 || 'Metin 2'}'e Özgü`],
        datasets: [{
          label: "Kelime Sayısı",
          data: [s?.matchingWordCount || 0, s?.uniqueWords1 || 0, s?.uniqueWords2 || 0],
          backgroundColor: [
            enhancedChartColors.green, // Kullanıcının sağladığı renkler
            enhancedChartColors.blue,
            enhancedChartColors.orange
          ],
          borderColor: [
            enhancedChartColors.green.replace('0.8', '1'),
            enhancedChartColors.blue.replace('0.8', '1'),
            enhancedChartColors.orange.replace('0.8', '1')
          ],
          borderWidth: 1, // Kenarlık kalınlığı
          borderRadius: 5, // Bar köşe yuvarlaklığı
          barPercentage: 0.55,
          categoryPercentage: 0.7,
        }],
      };
    });

    const chartOptions = computed<ChartOptions<"bar">>(() => {
      const s = stats.value;
      const totalWordsForPercentage = (s?.matchingWordCount || 0) + (s?.uniqueWords1 || 0) + (s?.uniqueWords2 || 0);

      return {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        layout: { // Grafik etiketleri için sağda boşluk
          padding: { top: 5, right: 55, bottom: 5, left: 5 }
        },
        plugins: { // 3. Eklenti yapılandırmasını ekle
          legend: { display: false },
          title: {
            display: true, text: 'Kelime Kullanım Özeti',
            font: { size: 15, weight: '600', family: 'Inter, sans-serif' },
            color: '#1f2937', padding: { top: 0, bottom: 15 }
          },
          tooltip: { // Tooltip yapılandırması (yüzde eklendi)
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            titleFont: { size: 13, weight: '600', family: 'Inter, sans-serif' },
            bodyFont: { size: 12, family: 'Inter, sans-serif' },
            padding: 10, cornerRadius: 4, displayColors: true, boxPadding: 3,
            callbacks: {
              label: (context: TooltipItem<"bar">) => {
                const value = context.parsed.x;
                const percentage = totalWordsForPercentage > 0 ? ((value / totalWordsForPercentage) * 100).toFixed(1) : 0;
                return `${context.dataset.label || ''}: ${value.toLocaleString()} kelime (${percentage}%)`;
              },
              title: (tooltipItems) => tooltipItems.length > 0 ? tooltipItems[0].label.replace(/'/g, "") : ''
            }
          },
          datalabels: { // chartjs-plugin-datalabels yapılandırması
            display: true,
            anchor: 'end', // Etiketin bar sonundaki konumu
            align: 'right', // Sağa hizalı
            offset: 8, // Bardan ne kadar dışarıda olacağı
            color: '#374151', // Tailwind Gray-700
            font: {
              size: 11, // Etiket font boyutu
              weight: '500',
              family: 'Inter, sans-serif'
            },
            formatter: (value, context) => {
              // Çok küçük değerler için etiketi gizle veya farklı formatla (opsiyonel)
              if (value === 0) return ''; // Eğer değer 0 ise etiketi gösterme
              // if (value < (totalWordsForPercentage * 0.02)) return ''; // Toplamın %2'sinden küçükse gizle
              return value.toLocaleString();
            },
          } as Plugin<'bar'>['options'] // Tip uyumluluğu için (Chart.js v4+ ile gerekebilir)
        },
        scales: { /* ... scales yapılandırması ... */
          x: {
            beginAtZero: true,
            grid: { color: 'rgba(209, 213, 219, 0.4)', drawBorder: false },
            ticks: {
              precision: 0, font: { size: 11, family: 'Inter, sans-serif' },
              color: '#4b5563', maxTicksLimit: 5,
              callback: (value) => Number(value) >= 1000 ? `${(Number(value) / 1000).toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:1})}K` : Number(value).toLocaleString()
            },
            title: {
              display: true, text: 'Kelime Adedi',
              font: { size: 12, weight: '500', family: 'Inter, sans-serif' },
              color: '#4b5563', padding: { top: 8, bottom: 0 }
            }
          },
          y: {
            grid: { display: false },
            ticks: {
              font: { size: 12, family: 'Inter, sans-serif', weight: '500' },
              color: '#374151',
            },
          }
        },
        animation: { duration: 800, easing: 'easeOutCubic' },
        onHover: (event, chartElement) => { // Basit hover cursor
          const target = event.native?.target as HTMLElement | null;
          if (target) {
            target.style.cursor = chartElement.length > 0 ? 'pointer' : 'default';
          }
        }
      };
    });

    const statCardsForReport = computed<StatCard[]>(() => { /* ... statCardsForReport içeriği ... */
      if (!stats.value) return [];
      const s = stats.value;
      return [
        { title: `${s.user1} Toplam Kelime`, value: s.totalWords1?.toLocaleString() || 'N/A', description: `İlk metindeki toplam kelime.`, icon: statIcons.totalWords },
        { title: `${s.user2} Toplam Kelime`, value: s.totalWords2?.toLocaleString() || 'N/A', description: `İkinci metindeki toplam kelime.`, icon: statIcons.totalWords },
        { title: "Eşleşen Kelime Sayısı", value: s.matchingWordCount?.toLocaleString() || 'N/A', description: "Ortak kullanılan kelimeler.", icon: statIcons.matchingWords },
        { title: `${s.user1}'e Özgü Kelimeler`, value: s.uniqueWords1?.toLocaleString() || 'N/A', description: `Sadece ilk metinde olanlar.`, icon: statIcons.uniqueWords },
        { title: `${s.user2}'ye Özgü Kelimeler`, value: s.uniqueWords2?.toLocaleString() || 'N/A', description: `Sadece ikinci metinde olanlar.`, icon: statIcons.uniqueWords },
        { title: "Analiz Süresi", value: `${s.timeElapsed?.toFixed(2) || 'N/A'} sn`, description: "Raporun hazırlanma süresi.", icon: statIcons.timeElapsed },
      ];
    });
    const toggleChart = () => { showChart.value = !showChart.value; };

    return { /* ... tüm return değerleri ... */
      stats, showChart, loading,
      processedSpansWithColors, handleContentClick, pane1Content, pane2Content,
      chartDataForReport, chartOptions, statCardsForReport, toggleChart,
      highlightedText1Html, highlightedText2Html,
    };
  },
});
</script>

<style scoped>
/* ... önceki stil tanımlamalarınız ... */
.min-h-screen { @apply bg-slate-100; }
.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.25s cubic-bezier(0.5, 0, 0.75, 0); }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(30px) scale(0.98); opacity: 0; }
.comparison-pane {
  font-family: 'Inter', sans-serif; font-size: 0.875rem; line-height: 1.7;
  color: #334155; text-align: left; white-space: pre-wrap; word-wrap: break-word;
  padding-top: 0.5rem; min-height: 360px; max-height: 65vh; overflow-y: auto;
  @apply styled-scrollbar;
}
.styled-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
.styled-scrollbar::-webkit-scrollbar-track { @apply bg-slate-200 rounded-full; }
.styled-scrollbar::-webkit-scrollbar-thumb { @apply bg-slate-400 rounded-full border-2 border-slate-200; }
.styled-scrollbar::-webkit-scrollbar-thumb:hover { @apply bg-slate-500; }
.comparison-pane { scrollbar-width: thin; scrollbar-color: #94a3b8 #cbd5e1; }
:global(.comparison-pane mark) {
  padding: 0.1em 0.25em !important; border-radius: 0.25em !important;
  transition: filter 0.15s ease-in-out, transform 0.15s ease-in-out !important;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
:global(.comparison-pane mark:hover) {
  filter: brightness(105%) saturate(110%); transform: translateY(-1px);
}
</style>