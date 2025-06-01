<template>
  <div class="h-full w-full">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ChartData,
  ChartOptions
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'; // 1. Eklentiyi import et

// 2. Chart.js bileşenlerini VE YENİ EKLENTİYİ kaydet
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ChartDataLabels // Eklenti buraya eklendi
);

export default defineComponent({
  name: 'SimilarityBarChart',
  components: { Bar },
  props: {
    data: {
      type: Object as PropType<ChartData<'bar'>>,
      required: true,
      validator: (value: ChartData<'bar'>) => {
        return !!value.labels && Array.isArray(value.datasets) && value.datasets.length > 0;
      }
    },
    options: {
      type: Object as PropType<ChartOptions<'bar'>>,
      required: true
    }
  },
  setup(props) {
    const chartData = computed<ChartData<'bar'>>(() => props.data);

    // chartOptions, ComparisonView.vue'dan gelen options prop'unu temel alır.
    // Datalabels eklentisinin konfigürasyonu ComparisonView.vue'daki
    // chartOptions içinde yapılacaktır. Bu component sadece eklentinin
    // ChartJS'e kayıtlı olmasını sağlar.
    const chartOptions = computed<ChartOptions<'bar'>>(() => ({
      ...props.options, // ComparisonView'dan gelen tüm ayarları al (datalabels dahil)
      responsive: true,
      maintainAspectRatio: false,
      plugins: { // Gelen plugin ayarlarını koru ve legend'ı özellikle gizle
        ...props.options.plugins,
        legend: {
          display: false // Legend'ı bu component özelinde gizli tutmak isteyebiliriz
                         // veya bu ayarı da ComparisonView'a bırakabiliriz.
                         // Şimdilik burada bırakıyorum.
        }
      }
    }));

    return {
      chartData,
      chartOptions
    }
  }
})
</script>

<style scoped>
.h-full {
  height: 100%;
}
.w-full {
  width: 100%;
}
</style>