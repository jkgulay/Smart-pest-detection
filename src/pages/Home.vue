<template>
  <LayoutWrapper>
    <template #content>
      <ion-page>
        <ion-content>
          <div class="dashboard-container">
            <!-- Welcome Section -->
            <div class="welcome-section mt-16">
              <h2 class="title mt-10">Welcome</h2>
              <p class="username">username</p>
            </div>
            <!-- Filter Buttons -->
            <div class="filter-section">
              <ion-segment v-model="selectedFilter" class="custom-segment" @ionChange="updateChart(selectedFilter)">
                <ion-segment-button value="hour"> Hours </ion-segment-button>
                <ion-segment-button value="day"> Days </ion-segment-button>
                <ion-segment-button value="month"> Month </ion-segment-button>
              </ion-segment>
            </div>
            <!-- Statistics Grid -->
            <div class="stats-grid">
              <div class="stats-card total-scanned">
                <div class="card-content">
                  <h3 class="card-title">Total Scanned</h3>
                  <p class="card-value">23</p>
                </div>
              </div>
              <div class="stats-card scanned-today">
                <div class="card-content">
                  <h3 class="card-title">Scanned Today</h3>
                  <p class="card-value">5</p>
                </div>
              </div>
            </div>

            <!-- Chart Section -->
            <div class="chart-section">
              <div class="chart-card">
                <h3 class="card-title">Scan Overview</h3>
                <div class="chart-container">
                  <BarChart :chartData="chartData" />
                </div>
              </div>
            </div>
          </div>
        </ion-content>
      </ion-page>
    </template>
  </LayoutWrapper>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import {
  IonPage,
  IonHeader,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonCard,
  IonCardContent,
  IonGrid,
  IonCol,
} from "@ionic/vue";
import BarChart from "@/components/common/BarChart.vue";
import LayoutWrapper from "@/layouts/LayoutWrapper.vue";

const imageUrl = ref<string | null>(null);

const openCamera = async () => {
  try {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 90,
    });

    imageUrl.value = photo.webPath || null;
    console.log("Captured Image:", imageUrl.value);
  } catch (error) {
    console.error("Camera Error:", error);
  }
};
// Reactive Data
const totalScanned = ref(23);
const scannedToday = ref(5);
const selectedFilter = ref("day");

// Chart Data (Reactive)
const chartData = ref({
  labels: ["11/28", "11/30", "12/2", "12/6", "12/14"],
  datasets: [
    {
      label: "Scanned",
      backgroundColor: "#8BC34A",
      data: [5, 8, 12, 20, 6],
    },
  ],
});

// Function to Update Chart Data
const updateChart = (filter: string) => {
  selectedFilter.value = filter;
  console.log(`Updating chart for: ${filter}`);

  if (filter === "hour") {
    chartData.value = {
      labels: ["10AM", "11AM", "12PM", "1PM", "2PM"],
      datasets: [
        {
          label: "Hourly Scans",
          backgroundColor: "#8BC34A",
          data: [1, 3, 5, 2, 6],
        },
      ],
    };
  } else if (filter === "day") {
    chartData.value = {
      labels: ["11/28", "11/30", "12/2", "12/6", "12/14"],
      datasets: [
        {
          label: "Daily Scans",
          backgroundColor: "#4CAF50",
          data: [5, 8, 12, 20, 6],
        },
      ],
    };
  } else if (filter === "month") {
    chartData.value = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May"],
      datasets: [
        {
          label: "Monthly Scans",
          backgroundColor: "#388E3C",
          data: [50, 80, 100, 90, 120],
        },
      ],
    };
  }
};
</script>

<style lang="scss" scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background-color: #81977a;
  padding: 20px;
  gap: 20px;
}

.welcome-section {
  color: white;
  margin-bottom: 10px;

  .title {
    font-family: "Poppins", sans-serif;
    font-weight: 800;
    font-size: 1.8rem;
    margin-bottom: 5px;
  }

  .username {
    font-family: "Poppins", sans-serif;
    font-size: 1rem;
    opacity: 0.8;
  }
}

.filter-section {
  display: flex;
  justify-content: flex-end;

  .custom-segment {
    --background: #677861;
    border-radius: 8px;
    max-width: 250px;

    ion-segment-button {
      --color: #393535;
      --color-checked: white;
      --indicator-color: #97af90;
      --indicator-height: 58px;
      --border-radius: 8px;
    }
  }
}

.stats-card {
  background-color: #97af90;
  border-radius: 16px;
  text-align: center;
  color: white;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

  .card-title {
    font-family: "Poppins", sans-serif;
    font-size: 1.2rem;
    margin-bottom: 10px;
    opacity: 0.8;
    padding: 0.5rem;
  }

  .card-value {
    font-family: "Poppins", sans-serif;
    font-size: 2.5rem;
    font-weight: bold;
  }
}

.stats-grid {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.chart-section {
  flex-grow: 1;

  .chart-card {
    background-color: #97af90;
    border-radius: 16px;
    padding: 20px;
    height: 100%;
  }

  .card-title {
    color: white;
    font-family: "Poppins", sans-serif;
    text-align: center;
    margin-bottom: 15px;
  }

  .chart-container {
    height: auto;
    position: relative;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
    gap: 15px;
  }

  .welcome-section {
    .title {
      font-size: 1.5rem;
    }

    .username {
      font-size: 0.9rem;
    }
  }

  .stats-grid {
    flex-direction: row;
    align-items: center;
  }

  .stats-card .card-value {
    font-size: 2rem;
  }
}
</style>
