<template>
  <ion-page>
    <ion-header>
      <InnerNavBar />
    </ion-header>

    <ion-content>
      <div class="dashboard-container">
        <!-- Welcome Section -->
        <div class="welcome-section">
          <h2 class="title mt-15">Welcome to PestLens</h2>
          <p class="username">John Doe</p>
        </div>

        <!-- Filter Section -->
        <div class="filter-section">
          <ion-row class="ion-justify-content-center">
            <ion-segment v-model="selectedFilter" class="custom-segment">
              <ion-segment-button value="hour" @click="updateChart('hour')">
                Hours
              </ion-segment-button>
              <ion-segment-button value="day" @click="updateChart('day')">
                Days
              </ion-segment-button>
              <ion-segment-button value="month" @click="updateChart('month')">
                Month
              </ion-segment-button>
            </ion-segment>
          </ion-row>
        </div>

        <!-- Statistics & Chart Card -->
        <ion-card class="stats-card">
          <ion-card-content>
            <!-- Statistics Grid -->
            <ion-grid class="stats-grid">
              <ion-col size="6" class="total-scanned">
                <div class="card-content">
                  <h3 class="card-title">Total Scanned</h3>
                  <p class="card-value">{{ totalScanned }}</p>
                </div>
              </ion-col>
              <ion-col size="6" class="scanned-today">
                <div class="card-content">
                  <h3 class="card-title">Scanned Today</h3>
                  <p class="card-value">{{ scannedToday }}</p>
                </div>
              </ion-col>
            </ion-grid>

            <!-- Chart Section -->
            <div class="chart-section">
              <div class="chart-card">
                <h3 class="card-title">Scan Overview</h3>
                <div class="chart-container">
                  <BarChart :chartData="chartData" />
                </div>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
        <v-row justify="center">
          <v-col cols="auto">
            <v-btn height="72" style="border-radius: 100px" @click="openCamera">
              <v-icon size="40">mdi-magnify-scan</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </ion-content>

    <ion-footer>
      <BottomBar />
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
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
import InnerNavBar from "@/components/common/InnerNavBar.vue";
import BottomBar from "@/components/common/BottomBar.vue";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

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
      data: [5, 8, 12, 20, 6], // Default daily data
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
    max-width: 350px;

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
