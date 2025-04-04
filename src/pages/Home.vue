<template>
  <LayoutWrapper>
    <template #content>
      <!-- Main Container -->
      <v-container
        :class="{
          'pa-4': $vuetify.display.xs,
          'dark-theme': isDarkTheme,
        }"
        fluid
      >
        <!-- Welcome Section -->
        <v-card
          :class="[
            'dashboard-card rounded-xl',
            isDarkTheme ? 'dark-card' : 'light-card',
          ]"
          elevation="1"
          class="mb-2"
        >
          <v-row class="">
            <v-col cols="12">
              <v-card-item>
                <div>
                  <div class="welcome-title mb-1">Welcome back</div>
                  <div class="text-h5 mb-1">{{ username }}</div>
                  <div class="d-flex align-center">
                    <v-icon
                      color="success"
                      class="status-indicator mr-2"
                      size="small"
                      >mdi-circle</v-icon
                    >
                    <span class="status-text">System Active</span>
                  </div>
                </div>
                <template v-slot:append>
                  <v-avatar size="70" class="profile_avatar">
                    <v-img :src="profileImage" cover height="100%">
                      <template v-slot:placeholder>
                        <v-row
                          class="fill-height"
                          align="center"
                          justify="center"
                        >
                          <v-progress-circular
                            indeterminate
                            color="success"
                          ></v-progress-circular>
                        </v-row>
                      </template>
                    </v-img>
                  </v-avatar>
                </template>
              </v-card-item>
            </v-col>
          </v-row>
        </v-card>

        <!-- Stats Section -->
        <v-row>
          <v-col
            v-for="(stat, index) in stats"
            :key="index"
            cols="6"
            sm="6"
            md="4"
          >
            <v-skeleton-loader
              v-if="statsLoading"
              type="card"
              class="rounded-lg dashboard-card"
            ></v-skeleton-loader>
            <v-card
              v-else
              class="rounded-lg dashboard-card"
              elevation="0"
              :class="[stat.color, isDarkTheme ? 'dark-card' : 'light-card']"
            >
              <v-card-item>
                <template v-slot:prepend>
                  <v-icon
                    :icon="stat.icon"
                    :color="stat.iconColor"
                    :size="stat.iconSize"
                  />
                </template>
                <v-card-title class="text-h4">{{ stat.value }}</v-card-title>
                <v-card-subtitle :class="{ 'dark-text': isDarkTheme }">{{
                  stat.title
                }}</v-card-subtitle>
              </v-card-item>
            </v-card>
          </v-col>
        </v-row>

        <!-- Time Filter -->
        <v-skeleton-loader
          v-if="statsLoading"
          type="card"
          class="rounded-lg dashboard-card mt-2"
        ></v-skeleton-loader>
        <v-card
          v-else
          class="rounded-lg dashboard-card mb-2 mt-2"
          elevation="0"
          text-align="center"
          justify-content="center"
          :class="isDarkTheme ? 'dark-card' : 'light-card'"
        >
          <v-row>
            <v-col cols="12">
              <v-card-text>
                <v-btn-toggle
                  v-model="selectedTimeframe"
                  mandatory
                  color="primary"
                  rounded="lg"
                  class="w-100"
                >
                  <v-btn
                    v-for="option in timeframeOptions"
                    :key="option.value"
                    :value="option.value"
                    :prepend-icon="option.icon"
                    class="flex-grow-1"
                  >
                    {{ option.label }}
                  </v-btn>
                </v-btn-toggle>
              </v-card-text>
            </v-col>
          </v-row>
        </v-card>

        <!-- Chart Section -->
        <v-skeleton-loader
          v-if="statsLoading"
          type="card"
          class="rounded-lg dashboard-card mt-2 mb-15"
        ></v-skeleton-loader>
        <v-card
          v-else
          class="rounded-lg dashboard-card mb-15"
          elevation="0"
          :class="isDarkTheme ? 'dark-card' : 'light-card'"
        >
          <v-row>
            <v-col cols="12">
              <v-card-title class="px-4 pt-4">
                Scan Activity
                <v-spacer></v-spacer>
                <span class="text-caption">
                  Total scans: {{ totalScans }}
                </span>
              </v-card-title>
              <v-card-text>
                <v-chart
                  class="chart"
                  :option="chartOption"
                  :autoresize="true"
                />
              </v-card-text>
            </v-col>
          </v-row>
        </v-card>
      </v-container>
    </template>
  </LayoutWrapper>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart } from "echarts/charts";
import { useScanResultStore } from "@/stores/scanResultStore";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import LayoutWrapper from "@/layouts/LayoutWrapper.vue";
import { useTheme } from "vuetify";

// Register necessary ECharts components
echarts.use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
]);

import { supabase } from "@/stores/authUser";
const theme = useTheme();
const isDarkTheme = computed(() => theme.global.current.value.dark);

const fetchUserInfo = async () => {
  try {
    const { data: userData, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!userData?.user) throw new Error("User  not authenticated");

    const authUserId = userData.user.id;
    email.value = userData.user.email || "";

    await fetchUserProfile(authUserId);
    await loadStats(authUserId, supabase);
    await loadChartData(authUserId, supabase);
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};

const fetchUserProfile = async (userId: string) => {
  if (!userId) return;

  const { data, error } = await supabase
    .from("users")
    .select("username, profile_image")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
  } else if (data) {
    username.value = data.username || "";
    profileImage.value = data.profile_image || profileImage.value;
  }
};

interface TimeframeOption {
  label: string;
  value: string;
  icon: string;
}

interface StatCard {
  title: string;
  value: number | string;
  icon: string;
  iconColor: string;
  iconSize: string | number;
  color: string;
}

interface ScanStats {
  scansTodayCount: number;
  successRate: number;
  totalScans: number;
}

const scanResultStore = useScanResultStore();
const totalScans = computed(() => {
  return scanResultStore.ScanResult.length;
});

const username = ref("");
const profileImage = ref(
  "https://touhyblbobrrtoebgkzb.supabase.co/storage/v1/object/public/profiles/avatars/user.png"
);
const selectedTimeframe = ref<Timeframe>("day");
const email = ref("");

type Timeframe = "hour" | "day" | "month";

const stats = ref<StatCard[]>([
  {
    title: "Scans Today",
    value: "Loading",
    icon: "mdi-bug-outline",
    iconColor: "success",
    iconSize: "large",
    color: "bg-success-lighten-4",
  },
  {
    title: "Success Rate",
    value: "Loading",
    icon: "mdi-percent",
    iconColor: "success",
    iconSize: "large",
    color: "bg-success-lighten-4",
  },
]);

const statsLoading = ref(true);

const loadStats = async (
  authUserId: string,
  supabaseClient: SupabaseClient
): Promise<void> => {
  const statsData = await fetchUserScanStats(authUserId, supabaseClient);

  if (statsData) {
    stats.value = [
      {
        title: "Scans Today",
        value: statsData.scansTodayCount,
        icon: "mdi-bug-outline",
        iconColor: "primary",
        iconSize: "large", // Added icon size
        color: "bg-primary-lighten-4",
      },
      {
        title: "Success Rate",
        value: `${(statsData.successRate * 100).toFixed(1)}%`,
        icon: "mdi-percent",
        iconColor: "success",
        iconSize: "large", // Added icon size
        color: "bg-success-lighten-4",
      },
    ];
  }
  statsLoading.value = false; // Set loading to false after fetching stats
};

const timeframeOptions: TimeframeOption[] = [
  { label: "Hours", value: "hour", icon: "mdi-clock-outline" },
  { label: "Days", value: "day", icon: "mdi-calendar-week" },
  { label: "Months", value: "month", icon: "mdi-calendar-month" },
];

interface ChartData {
  labels: string[];
  data: number[];
}

const chartData = ref<Record<Timeframe, ChartData>>({
  hour: { labels: [], data: [] },
  day: { labels: [], data: [] },
  month: { labels: [], data: [] },
});

const chartOption = computed(() => ({
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true,
  },
  xAxis: [
    {
      type: "category",
      data: chartData.value[selectedTimeframe.value].labels,
      axisTick: {
        alignWithLabel: true,
      },
      axisLabel: {
        color: "#ffffff",
        rotate: selectedTimeframe.value === "day" ? 0 : 30,
        interval: selectedTimeframe.value === "hour" ? 1 : 0,
        formatter: (value: string) => {
          if (selectedTimeframe.value === "hour") {
            const hour = parseInt(value);
            return hour % 2 === 0 ? value : "";
          }
          return value;
        },
      },
    },
  ],
  yAxis: [
    {
      type: "value",
      axisLabel: {
        color: "#ffffff",
      },
    },
  ],
  series: [
    {
      name: "Scans",
      type: "bar",
      barWidth: "60%",
      data: chartData.value[selectedTimeframe.value].data,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "#ffffff" },
          { offset: 1, color: "rgba(255, 255, 255, 0.8)" },
        ]),
      },
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#ffffff" },
            { offset: 1, color: "rgba(255, 255, 255, 0.9)" },
          ]),
        },
      },
    },
  ],
}));

const fetchUserProfileId = async (
  authUserId: string,
  supabaseClient: SupabaseClient
): Promise<number | null> => {
  try {
    const { data, error } = await supabaseClient
      .from("users")
      .select("id")
      .eq("user_id", authUserId)
      .single();

    if (error) throw error;
    return data?.id || null;
  } catch (error) {
    console.error("Error fetching user profile ID:", error);
    return null;
  }
};

const fetchUserScanStats = async (
  authUserId: string,
  supabaseClient: SupabaseClient
): Promise<ScanStats | null> => {
  try {
    const profileId = await fetchUserProfileId(authUserId, supabaseClient);
    if (!profileId) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todayScans, error: todayError } = await supabaseClient
      .from("scan_history")
      .select("id")
      .eq("user_id", profileId)
      .gte("created_at", today.toISOString())
      .lte("created_at", new Date().toISOString());

    if (todayError) throw todayError;

    const { data: statsData, error: statsError } = await supabaseClient
      .from("pest_scans")
      .select("confidence")
      .order("created_at", { ascending: false })
      .limit(10);

    if (statsError) throw statsError;

    const scansTodayCount = todayScans?.length ?? 0;
    const successRate =
      statsData?.reduce((acc, scan) => acc + (scan.confidence || 0), 0) /
      (statsData?.length || 1);
    const totalScans = statsData?.length ?? 0;

    return {
      scansTodayCount,
      successRate,
      totalScans,
    };
  } catch (error) {
    console.error("Error fetching scan stats:", error);
    return null;
  }
};

const loadChartData = async (
  authUserId: string,
  supabaseClient: SupabaseClient
): Promise<void> => {
  try {
    const profileId = await fetchUserProfileId(authUserId, supabaseClient);
    if (!profileId) return;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    const { data, error } = await supabaseClient
      .from("scan_history")
      .select("created_at")
      .eq("user_id", profileId)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: true });

    if (error) throw error;

    const hourlyData = new Array(24).fill(0);
    const dailyData = new Array(7).fill(0);
    const monthlyData = new Array(12).fill(0);

    data?.forEach((scan) => {
      const date = new Date(scan.created_at);
      hourlyData[date.getHours()]++;
      dailyData[date.getDay()]++;
      monthlyData[date.getMonth()]++;
    });

    chartData.value = {
      hour: {
        labels: Array.from(
          { length: 24 },
          (_, i) => `${i.toString().padStart(2, "0")}:00`
        ),
        data: hourlyData,
      },
      day: {
        labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        data: dailyData,
      },
      month: {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        data: monthlyData,
      },
    };
  } catch (error) {
    console.error("Error loading chart data:", error);
  }
};

onMounted(async () => {
  await fetchUserInfo();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap");

.pest-scanner-app {
  background: #8ca189;
  min-height: 100dvh;
}

.dark-theme {
  background: #1e2124 !important;
}
.dark-card {
  background-color: #2d3035 !important;
  border: 1px solid rgba(80, 80, 80, 0.7) !important;
  color: #e0e0e0 !important;
}

.v-main {
  background: #8ca189 !important;
  overflow: auto;
}

.profile-avatar {
  border: 4px solid rgb(0, 0, 0);
  transition: transform 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.v-container {
  overflow-y: auto;
  max-height: calc(100vh - 64px);
}



.dashboard-card {
  background-color: #5e7962;
  border: 1px solid rgba(32, 63, 42, 0.7);
  transition: all 0.3s ease;
  border-radius: 10px;
  color: #ffffff;
}

.welcome-title {
  font-family: "Montserrat", sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.3;
}

.status-text {
  font-family: "Roboto", sans-serif;
  font-size: 0.875rem;
  color: #ffffff;
}

@media (max-width: 600px) {
  .welcome-title {
    font-size: 1.25rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .icon-wrapper {
    width: 40px;
    height: 40px;
  }

  .scan-button-wrapper {
    bottom: 16px;
  }
}

.chart {
  height: 300px;
  width: 100%;
}
</style>
