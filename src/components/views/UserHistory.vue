<template>
  <LayoutWrapper>
    <template #content>
      <v-container
        :class="{
          'pa-4': $vuetify.display.xs,
          'dark-theme': isDarkTheme,
        }"
        fluid
      >
        <!-- Header Card with User Info and Stats -->
        <v-card
          class="mx-auto mb-2 header-card"
          max-width="500"
          rounded="lg"
          :class="[isDarkTheme ? 'dark-card' : 'light-card']"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center mb-3">
              <v-avatar color="primary" class="mr-3">
                <v-img :src="profileImage" cover>
                  <template v-slot:placeholder>
                    <v-row
                      align="center"
                      justify="center"
                      class="fill-height pt-4"
                    >
                      <v-progress-circular
                        indeterminate
                        color="success"
                      ></v-progress-circular>
                    </v-row>
                  </template>
                </v-img>
              </v-avatar>
              <div>
                <h2 class="text-h5 font-weight-bold mb-0">
                  {{ userName }}'s Scan History
                </h2>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ formattedLastActivity }}
                </p>
              </div>
            </div>

            <!-- User Stats -->
            <v-row class="stats-row mt-3" dense>
              <v-col cols="4">
                <v-card
                  flat
                  :class="[isDarkTheme ? 'dark-stat-card' : 'light-stat-card']"
                  class="stat-card pa-2"
                >
                  <div class="text-center">
                    <div class="text-h5 font-weight-bold">{{ totalScans }}</div>
                    <div class="text-caption text-medium-emphasis">
                      Total Scans
                    </div>
                  </div>
                </v-card>
              </v-col>
              <v-col cols="4">
                <v-card
                  flat
                  :class="[isDarkTheme ? 'dark-stat-card' : 'light-stat-card']"
                  class="stat-card pa-2"
                >
                  <div class="text-center">
                    <div
                      class="text-h5 font-weight-bold"
                      :class="highSeverityColor"
                    >
                      {{ highSeverityCount }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      High Severity
                    </div>
                  </div>
                </v-card>
              </v-col>
              <v-col cols="4">
                <v-card
                  flat
                  :class="[isDarkTheme ? 'dark-stat-card' : 'light-stat-card']"
                  class="stat-card pa-2"
                >
                  <div class="text-center">
                    <div class="text-h5 font-weight-bold">
                      {{ lastDaysScans }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Last 7 Days
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Search and Filter Section -->
        <v-card
          class="mx-auto mb-2 search-filter-card"
          max-width="500"
          rounded="lg"
          :class="[isDarkTheme ? 'dark-card' : 'light-card']"
        >
          <v-card-text>
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Search my scans..."
              variant="outlined"
              density="compact"
              hide-details
              class="mb-4"
              @update:model-value="debounceSearch"
            ></v-text-field>

            <div class="d-flex gap-2">
              <v-select
                v-model="sortBy"
                :items="sortOptions"
                label="Sort by"
                density="compact"
                hide-details
                variant="outlined"
                class="flex-grow-1"
              ></v-select>

              <v-menu
                v-model="filterMenu"
                :close-on-content-click="false"
                location="bottom end"
              >
                <template v-slot:activator="{ props }">
                  <v-btn
                    color="primary"
                    size="medium"
                    variant="outlined"
                    v-bind="props"
                    class="filter-btn"
                  >
                    <v-icon left>mdi-filter</v-icon>
                    Filter
                    <v-badge
                      v-if="activeFiltersCount > 0"
                      :content="activeFiltersCount"
                      color="primary"
                      class="ml-2"
                    ></v-badge>
                  </v-btn>
                </template>

                <v-card
                  min-width="300"
                  class="filter-menu"
                  :class="[isDarkTheme ? 'dark-card' : 'light-card']"
                >
                  <v-card-title class="text-subtitle-1">Filters</v-card-title>
                  <v-card-text>
                    <v-select
                      v-model="filters.severity"
                      :items="severityOptions"
                      label="Severity"
                      density="comfortable"
                      hide-details
                      variant="outlined"
                      class="mb-4"
                    ></v-select>

                    <v-select
                      v-model="filters.timeRange"
                      :items="timeRangeOptions"
                      label="Time Range"
                      density="comfortable"
                      hide-details
                      variant="outlined"
                      class="mb-4"
                    ></v-select>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn variant="text" @click="resetFilters"> Reset </v-btn>
                    <v-btn color="primary" @click="applyFilters"> Apply </v-btn>
                  </v-card-actions>
                </v-card>
              </v-menu>
            </div>
          </v-card-text>
        </v-card>

        <!-- History Lists with Personal Scans Only -->
        <v-card
          class="mb-10 history-card"
          max-width="500"
          rounded="lg"
          :loading="loading"
          :class="[isDarkTheme ? 'dark-card' : 'light-card']"
        >
          <v-list class="py-2 history-list">
            <template v-if="filteredScans.length > 0">
              <v-list-item
                v-for="scan in filteredScans"
                :key="scan.id"
                :title="scan.pest_scan.name"
                :subtitle="`${formatDate(scan.created_at)} - by ${
                  scan.user?.username || 'Unknown User'
                }`"
                class="history-item"
                link
                @click="viewScanDetails(scan)"
              >
                <template v-slot:prepend>
                  <v-avatar size="56" rounded="lg" class="mr-3">
                    <v-img :src="scan.pest_scan.image_path" cover></v-img>
                  </v-avatar>
                </template>

                <template v-slot:append>
                  <v-chip
                    :color="getSeverityColor(scan.pest_scan.alert_lvl)"
                    size="small"
                    class="text-caption"
                  >
                    {{ scan.pest_scan.alert_lvl }}
                  </v-chip>
                </template>
              </v-list-item>

              <div v-if="hasMore" class="text-center pa-4">
                <v-btn
                  color="primary"
                  variant="text"
                  :loading="loadingMore"
                  @click="loadMore"
                >
                  Load More
                </v-btn>
              </div>
            </template>

            <v-list-item v-else-if="!loading" class="pa-4">
              <div class="text-center w-100">
                <v-icon size="48" color="grey" class="mb-2"
                  >mdi-leaf-off</v-icon
                >
                <div class="text-body-1 text-medium-emphasis">
                  {{ searchQuery ? "No matches found" : "No scans yet" }}
                </div>
                <v-btn
                  color="primary"
                  variant="text"
                  class="mt-3"
                  @click="$router.push('/')"
                >
                  Start Scanning
                </v-btn>
              </div>
            </v-list-item>
          </v-list>

          <!-- Add Pagination -->
          <div class="d-flex align-center justify-space-between pa-4">
            <v-btn
              variant="tonal"
              color="success"
              block
              prepend-icon="mdi-account-group"
              @click="$router.push('/scan-history')"
              class="view-all-btn"
              >View Community Scans
            </v-btn>
            <v-pagination
              v-if="totalPages > 1"
              v-model="currentPage"
              :length="totalPages"
              :total-visible="5"
              density="comfortable"
              rounded="circle"
              class="ml-2"
              @update:model-value="handlePageChange"
            ></v-pagination>
          </div>
        </v-card>

        <ScanDetailsDialog v-model="isDialogOpen" :scan="selectedScan" />
      </v-container>
    </template>
  </LayoutWrapper>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import ScanDetailsDialog from "./ScanDetails.vue";
import LayoutWrapper from "@/layouts/LayoutWrapper.vue";
import { supabase } from "@/lib/supabase";
import { useTheme } from "vuetify";

// Define types
interface PestScan {
  id: number;
  created_at: string;
  image_path: string;
  name: string;
  alert_lvl: string;
  comment: string;
  confidence: number;
  recommended_action: string;
}

interface User {
  id: number;
  username: string;
}

interface ScanHistoryItem {
  id: number;
  created_at: string;
  scan_id: number;
  user_id: number;
  pest_scan: PestScan;
  user: User;
}

interface ScanStats {
  id: string;
  created_at: string;
  pest_scan: {
    id: string;
    alert_lvl: "High" | "Medium" | "Low";
  };
}
// State
const scans = ref<ScanHistoryItem[]>([]);
const userStats = ref<ScanStats[]>([]);
const loading = ref(true);
const hasMore = ref(false);
const searchQuery = ref("");
const selectedScan = ref<ScanHistoryItem | undefined>(undefined);
const isDialogOpen = ref(false);
const filterMenu = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const userName = ref("Your");
const lastActivity = ref<Date | null>(null);
const email = ref("");
const profileImage = ref("");
const profileLoading = ref(false);
const loadingMore = ref(false);

const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return;

  loadingMore.value = true;
  currentPage.value++;
  await fetchScanHistory();
  loadingMore.value = false;
};
const theme = useTheme();
const isDarkTheme = computed(() => theme.global.current.value.dark);

// Responsive items per page
const itemsPerPage = computed(() => {
  const height = window.innerHeight;
  if (height <= 667) return 4;
  if (height <= 740) return 5;
  if (height <= 915) return 6;
  return 7; // default for larger screens
});

// Filters and Sort
const sortBy = ref("date");
const filters = ref({
  severity: "all",
  timeRange: "all",
});

const sortOptions = [
  { title: "Date (Newest First)", value: "date" },
  { title: "Severity (High to Low)", value: "severity" },
  { title: "Name (A-Z)", value: "name" },
];

const severityOptions = [
  { title: "All Severities", value: "all" },
  { title: "High", value: "high" },
  { title: "Medium", value: "medium" },
  { title: "Low", value: "low" },
];

const timeRangeOptions = [
  { title: "All Time", value: "all" },
  { title: "Last 7 Days", value: "7days" },
  { title: "Last 30 Days", value: "30days" },
  { title: "Last 90 Days", value: "90days" },
];

// Stats computations
const totalScans = computed(() => userStats.value.length);

const highSeverityCount = computed(
  () =>
    userStats.value.filter((scan) => scan.pest_scan.alert_lvl === "High").length
);

const highSeverityColor = computed(() =>
  highSeverityCount.value > 0 ? "text-error" : ""
);

const lastDaysScans = computed(() => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return userStats.value.filter(
    (scan) => new Date(scan.created_at) >= sevenDaysAgo
  ).length;
});

const formattedLastActivity = computed(() => {
  if (!lastActivity.value) return "No activity yet";

  const now = new Date();
  const diff = now.getTime() - lastActivity.value.getTime();
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Last activity: Today";
  } else if (diffDays === 1) {
    return "Last activity: Yesterday";
  } else {
    return `Last activity: ${diffDays} days ago`;
  }
});

watch([filters, searchQuery], () => {
  currentPage.value = 1;
});

const fetchUserInfo = async () => {
  profileLoading.value = true;
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;
    if (!user) throw new Error("User not authenticated");

    email.value = user.email || "";
    await fetchUserProfile(user.id);
  } catch (error) {
    console.error("Error fetching user:", error);
  } finally {
    profileLoading.value = false;
  }
};

const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("username, profile_image")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return;
    }

    if (data) {
      userName.value = data.username || "Your";
      profileImage.value = data.profile_image || "";
    }
  } catch (error) {
    console.error("Error in fetchUserProfile:", error);
  }
};

const fetchUserStats = async () => {
  try {
    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Not authenticated");

    const localUserId = localStorage.getItem("user_id");

    // Fetch all user scans without pagination for accurate statistics
    const { data, error } = await supabase
      .from("scan_history")
      .select(
        `
    id,
    created_at,
    pest_scan:pest_scans!inner (id, alert_lvl)
  `
      )
      .eq("user_id", localUserId);

    if (error) {
      console.error("Error fetching all user scans:", error);
      return;
    }

    userStats.value = (data || []).map((item) => ({
      id: item.id,
      created_at: item.created_at,
      pest_scan: Array.isArray(item.pest_scan)
        ? item.pest_scan[0]
        : item.pest_scan, 
    }));

    // Update last activity date if there are scans
    if (data && data.length > 0) {
      lastActivity.value = new Date(data[0].created_at);
    }
  } catch (error) {
    console.error("Error fetching all user scans:", error);
  }
};

const fetchScanHistory = async () => {
  loading.value = true;

  try {
    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Not authenticated");

    const localUserId = localStorage.getItem("user_id");

    // Get total count of all scans for pagination
    const { count, error: countError } = await supabase
      .from("scan_history")
      .select("*", { count: "exact", head: true })
      .eq("user_id", localUserId);
    if (countError) throw countError;

    totalPages.value = Math.ceil((count || 0) / itemsPerPage.value); // Update to use .value

    // Fetch paginated data with both pest_scans and users data
    const { data, error } = await supabase
      .from("scan_history")
      .select(
        `
        *,
        pest_scan:pest_scans (*),
        user:users (username)
      `
      )
      .eq("user_id", localUserId) // Ensure you filter by user_id
      .order("created_at", { ascending: false })
      .range(
        (currentPage.value - 1) * itemsPerPage.value, // Update to use .value
        currentPage.value * itemsPerPage.value - 1 // Update to use .value
      );

    if (error) {
      console.error("Error fetching scan history:", error);
      return;
    }

    scans.value = data || [];
  } catch (error) {
    console.error("Error:", error);
  } finally {
    loading.value = false;
  }
};

// Computed
const activeFiltersCount = computed(() => {
  let count = 0;
  if (filters.value.severity !== "all") count++;
  if (filters.value.timeRange !== "all") count++;
  return count;
});

// Filter user's scan history
const filteredScans = computed(() => {
  let result = [...scans.value];

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((scan) =>
      scan.pest_scan.name.toLowerCase().includes(query)
    );
  }

  // Apply severity filter
  if (filters.value.severity !== "all") {
    result = result.filter(
      (scan) =>
        scan.pest_scan.alert_lvl.toLowerCase() ===
        filters.value.severity.toLowerCase()
    );
  }

  // Apply time range filter
  if (filters.value.timeRange !== "all") {
    const now = new Date();
    let days: number;

    switch (filters.value.timeRange) {
      case "7days":
        days = 7;
        break;
      case "30days":
        days = 30;
        break;
      case "90days":
        days = 90;
        break;
      default:
        days = 0;
    }

    if (days > 0) {
      const pastDate = new Date(now.setDate(now.getDate() - days));
      result = result.filter((scan) => new Date(scan.created_at) >= pastDate);
    }
  }

  // Apply sorting
  result.sort((a, b) => {
    switch (sortBy.value) {
      case "date":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "severity":
        const severityOrder: Record<string, number> = {
          High: 3,
          Medium: 2,
          Low: 1,
        };
        return (
          severityOrder[b.pest_scan.alert_lvl] -
          severityOrder[a.pest_scan.alert_lvl]
        );
      case "name":
        return a.pest_scan.name.localeCompare(b.pest_scan.name);
      default:
        return 0;
    }
  });

  return result;
});

onMounted(() => {
  fetchUserInfo();
  fetchScanHistory();
  fetchUserStats();
  window.addEventListener("resize", handleResize);
});

// Clean up the event listener
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

// Methods
const debounceSearch = (value: string) => {
  searchQuery.value = value;
};

const resetFilters = () => {
  filters.value = {
    severity: "all",
    timeRange: "all",
  };
  searchQuery.value = "";
};

const applyFilters = () => {
  filterMenu.value = false;
  fetchUserStats(); // Refresh statistics when filters are applied
};

const viewScanDetails = (scan: ScanHistoryItem) => {
  selectedScan.value = scan;
  isDialogOpen.value = true;
};

const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(new Date(dateString));
};

const getSeverityColor = (severity: PestScan["alert_lvl"]): string => {
  const colors: Record<PestScan["alert_lvl"], string> = {
    High: "error",
    Medium: "warning",
    Low: "success",
  };
  return colors[severity] || "grey";
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchScanHistory();
  fetchUserStats(); // Refresh statistics when changing pages
};

// Add window resize handling
const handleResize = () => {
  // Trigger a re-fetch when the itemsPerPage changes due to window resize
  fetchScanHistory();
};
</script>

<style scoped>
.search-filter-card,
.history-card,
.header-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.history-card .d-flex {
  flex-direction: column;
  gap: 1rem;
}

.history-list {
  flex: 1;
  overflow-y: hidden;
  max-height: calc(100vh - 380px);
}

.dark-theme {
  background: #1e2124 !important;
}

.dark-card {
  background-color: #2d3035 !important;
  border: 1px solid rgba(80, 80, 80, 0.7) !important;
  color: #e0e0e0 !important;
}

.light-stat-card {
  background-color: rgba(245, 245, 245, 0.7) !important;
  border-radius: 8px;
}

.dark-stat-card {
  background-color: rgba(60, 60, 70, 0.5) !important;
  border-radius: 8px;
}

.stats-row {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 12px;
}

.dark-theme .stats-row {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.history-list {
  max-height: calc(100vh - 380px);
  overflow-y: auto;
}

.history-item {
  transition: background-color 0.2s ease;
}

.history-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.dark-theme .history-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.filter-btn {
  min-width: 100px;
}

.filter-menu {
  border-radius: 12px;
}

@media (max-width: 600px) {
  .v-container {
    padding: 12px !important;
  }

  .text-h4 {
    font-size: 1.5rem !important;
  }

  .text-h5 {
    font-size: 1.25rem !important;
  }

  .history-list {
    max-height: calc(100vh - 340px);
  }
}

.v-pagination {
  justify-content: center;
  width: 100%;
}
</style>
