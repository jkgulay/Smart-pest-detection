<template>
  <div class="bar-chart">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { Chart, registerables } from "chart.js";

// Register all Chart.js components
Chart.register(...registerables);

const props = defineProps<{
  chartData: {
    labels: string[];
    datasets: { label: string; backgroundColor: string; data: number[] }[];
  };
}>();

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

// Function to render the chart
const renderChart = () => {
  if (chartInstance) {
    chartInstance.destroy(); // Destroy the previous instance to prevent memory leaks
  }

  if (chartCanvas.value) {
    chartInstance = new Chart(chartCanvas.value, {
      type: "bar",
      data: props.chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true },
          x: { grid: { display: false } },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });
  }
};

// Watch for changes in chartData and update chart
watch(() => props.chartData, renderChart, { deep: true });

onMounted(renderChart);

onMounted(() => {
  window.addEventListener("resize", renderChart);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", renderChart);
});
</script>

<style scoped>
.bar-chart {
  width: 100%;
  height: 150px;
  position: relative;
}
</style>
