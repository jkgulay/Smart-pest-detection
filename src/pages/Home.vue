<template>
  <LayoutWrapper>
    <template #content>
      <ion-page>
        <ion-content>
          <div class="dashboard-container">
            <!-- Welcome Section -->
            <div class="welcome-section">
              <h2 class="title mt-15">Welcome to PestLens</h2>
              <p class="username">John Doe</p>
            </div>

            <!-- Filter Buttons -->
            <div class="filter-section">
              <ion-segment v-model="selectedFilter" class="custom-segment">
                <ion-segment-button value="hour">
                  Hours
                </ion-segment-button>
                <ion-segment-button value="day">
                  Days
                </ion-segment-button>
                <ion-segment-button value="month" >
                  Month
                </ion-segment-button>
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
                  <BarChart />
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
import {
  IonPage,
  IonHeader,
  IonContent,
  IonSegment,
  IonSegmentButton,
} from "@ionic/vue";
import BarChart from "@/components/common/BarChart.vue";
import LayoutWrapper from "@/layouts/LayoutWrapper.vue";

const selectedFilter = ref("day");
</script>

<style lang="scss" scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #81977a;
  padding: 20px;
  gap: 20px;
}

.welcome-section {
  text-align: center;
  color: white;
  margin-bottom: 10px;

  .title {
    font-family: 'Poppins', sans-serif;
    font-weight: 800;
    font-size: 1.8rem;
    margin-bottom: 5px;
  }

  .username {
    font-family: 'Poppins', sans-serif;
    font-size: 1rem;
    opacity: 0.8;
  }
}

.filter-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;

  .custom-segment {
    --background: #677861;
    border-radius: 12px;
    max-width: 400px;
    width: 100%;

    ion-segment-button {
      --color: #FFFFFF;
      --color-checked: white;
      --indicator-color: #97af90;
      --indicator-height: 36px;
      --border-radius: 8px;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stats-card {
  background-color: #97af90;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  color: white;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  .card-title {
    font-family: 'Poppins', sans-serif;
    font-size: 1.2rem;
    margin-bottom: 10px;
    opacity: 0.8;
  }

  .card-value {
    font-family: 'Poppins', sans-serif;
    font-size: 2.5rem;
    font-weight: bold;
  }
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
    font-family: 'Poppins', sans-serif;
    text-align: center;
    margin-bottom: 15px;
  }

  .chart-container {
    height: 300px;
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
    grid-template-columns: 1fr;
  }

  .chart-section .chart-container {
    height: 250px;
  }

  .stats-card .card-value {
    font-size: 2rem;
  }
}
</style>