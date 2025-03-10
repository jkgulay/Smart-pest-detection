<script setup lang="ts">
import { ref, onMounted, watch, toRefs } from "vue";
import { useUserData, supabase } from "@/stores/authUser";
import LayoutWrapper from "@/layouts/LayoutWrapper.vue";
import { useTheme } from "vuetify";

// State
const dialog = ref(false);
const saving = ref(false);
const { user, loading, error, refresh } = useUserData();
const userId = localStorage.getItem("user_id"); //kani ang gamita sa pag filter sa mga user.

// Additional loading states
const profileLoading = ref(true);
const statsLoading = ref(true);
const imageLoading = ref(false);
const scansLoading = ref(true);
const theme = useTheme();
const isDarkTheme = computed(() => theme.global.current.value.dark);

console.log(userId);
// Profile Data
const username = ref("");
const email = ref("");
const profileImage = ref(
  "https://touhyblbobrrtoebgkzb.supabase.co/storage/v1/object/public/profiles/avatars/user.png"
);
const currentPassword = ref("");
const newPassword = ref("");
const errorMessage = ref("");

// Clear passwords when dialog closes
watch(dialog, (newVal) => {
  if (!newVal) {
    currentPassword.value = "";
    newPassword.value = "";
    errorMessage.value = "";
  }
});

const fetchUserInfo = async () => {
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

const uploadProfileImage = async (event: Event) => {
  const fileInput = event.target as HTMLInputElement;
  const file = fileInput.files?.[0];

  if (!file) {
    errorMessage.value = "No file selected.";
    return;
  }

  if (!user.value?.id) {
    errorMessage.value = "Please log in to upload a profile image.";
    return;
  }
  imageLoading.value = true;
  try {
    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      throw new Error("Please upload an image file.");
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      throw new Error("Image size should be less than 5MB.");
    }

    // Create unique file name
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.value.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("profiles")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = await supabase.storage
      .from("profiles")
      .getPublicUrl(filePath);

    if (!urlData.publicUrl) {
      throw new Error("Failed to get public URL for the uploaded image.");
    }

    // Update user profile in database
    const { error: updateError } = await supabase
      .from("users")
      .update({ profile_image: urlData.publicUrl })
      .eq("user_id", user.value.id);

    if (updateError) throw updateError;

    // Update local state
    profileImage.value = urlData.publicUrl;

    // Show success message (if using vue-toastification)
  } catch (error) {
    console.error("Error uploading image:", error);
    errorMessage.value =
      error instanceof Error ? error.message : "An unknown error occurred.";
  } finally {
    imageLoading.value = false;
  }
};

// Typed save profile function
const saveProfile = async (): Promise<void> => {
  if (!user.value?.id) return;

  saving.value = true;
  errorMessage.value = "";

  try {
    if (newPassword.value) {
      if (!currentPassword.value) {
        throw new Error("Current password is required to change password.");
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.value.email!,
        password: currentPassword.value,
      });

      if (authError) throw authError;

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword.value,
      });

      if (updateError) throw updateError;
    }

    const { error: profileError } = await supabase
      .from("users")
      .update({
        username: username.value,
        profile_image: profileImage.value,
      })
      .eq("user_id", user.value.id);

    if (profileError) throw profileError;

    dialog.value = false;
    currentPassword.value = "";
    newPassword.value = "";
    await refresh();
  } catch (error: unknown) {
    console.error("Error saving profile:", error);
    if (error instanceof Error) {
      errorMessage.value = error.message;
    } else if (typeof error === "string") {
      errorMessage.value = error;
    } else {
      errorMessage.value = "An unknown error occurred";
    }
  } finally {
    saving.value = false;
  }
};

interface Scan {
  id: string;
  pestType: string;
  date: string;
  Severity: "High" | "Medium" | "Low";
}

interface StatsState {
  totalScans: number;
  totalPests: number;
  highAlertPests: number; 
  recentScans: Scan[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}

const usePestStats = () => {
  const state = ref<StatsState>({
    totalScans: 0,
    totalPests: 0,
    highAlertPests: 0, // Initialize the new property
    recentScans: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 5,
  });

  const fetchStats = async (userId: string) => {
    if (!userId) return;
    statsLoading.value = true;
    state.value.error = null;
    try {
      const localUserId = localStorage.getItem("user_id");
      // Fetch scan IDs for the user from scan_history
      const { data: scanHistoryData, error: scanHistoryError } = await supabase
        .from("scan_history")
        .select("*")
        .eq("user_id", localUserId);

      if (scanHistoryError) throw scanHistoryError;

      // Extract scan IDs
      const scanIds = scanHistoryData.map((item) => item.scan_id);

      // First fetch: Get total scans
      const { data: scansData, error: scansError } = await supabase
        .from("scan_history")
        .select("scan_id")
        .in("id", scanIds);

      if (scansError) throw scansError;

      // Second fetch: Count high alert pests
      const { data: highAlertData, error: highAlertError } = await supabase
        .from("pest_scans")
        .select("id")
        .eq("alert_lvl", "High")
        .in("id", scanIds);

      if (highAlertError) throw highAlertError;

      // Update state with both counts
      state.value.totalScans = scansData?.length || 0;
      state.value.totalPests = highAlertData?.length || 0; // Use high alert count for total pests
    } catch (error) {
      state.value.error =
        error instanceof Error ? error.message : "Failed to fetch stats";
    } finally {
      statsLoading.value = false;
    }
  };

  const fetchRecentScans = async (userId: string) => {
    if (!userId) return;
    scansLoading.value = true;
    state.value.error = null;
    try {
      const localUserId = localStorage.getItem("user_id");

      // First get total count for pagination
      const { count } = await supabase
        .from("scan_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", localUserId);

      state.value.totalPages = Math.ceil(
        (count || 0) / state.value.itemsPerPage
      );

      // Calculate offset
      const offset = (state.value.currentPage - 1) * state.value.itemsPerPage;

      // Fetch paginated scan history
      const { data: scanHistoryData, error: scanHistoryError } = await supabase
        .from("scan_history")
        .select("scan_id, created_at")
        .eq("user_id", localUserId)
        .order("created_at", { ascending: false })
        .range(offset, offset + state.value.itemsPerPage - 1);

      if (scanHistoryError) throw scanHistoryError;

      // Extract scan IDs
      const scanIds = scanHistoryData.map((item) => item.scan_id);

      // Fetch details from pest_scans using the scan IDs
      const { data: pestScansData, error: pestScansError } = await supabase
        .from("pest_scans")
        .select("id, name, created_at, alert_lvl")
        .in("id", scanIds);

      if (pestScansError) throw pestScansError;

      // Map data to the Scan interface
      state.value.recentScans = pestScansData.map((scan) => ({
        id: scan.id,
        pestType: scan.name,
        date: scan.created_at,
        Severity: scan.alert_lvl,
      }));
    } catch (error) {
      state.value.error =
        error instanceof Error ? error.message : "Failed to fetch recent scans";
    } finally {
      scansLoading.value = false;
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "grey";
    }
  };

  const formatDate = (date: string): string =>
    new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const refreshStats = async (userId: string) => {
    await Promise.all([fetchStats(userId), fetchRecentScans(userId)]);
  };

  const changePage = async (newPage: number) => {
    state.value.currentPage = newPage;
    if (userId) {
      await fetchRecentScans(userId);
    }
  };

  return {
    ...toRefs(state.value),
    getSeverityColor,
    formatDate,
    fetchStats,
    fetchRecentScans,
    refreshStats,
    changePage,
  };
};
const {
  totalScans,
  totalPests,
  recentScans,
  getSeverityColor,
  formatDate,
  refreshStats,
  currentPage,
  totalPages,
  changePage,
} = usePestStats();

onMounted(async () => {
  if (user.value?.id) {
    console.log("User ID:", user.value.id);
    await refreshStats(user.value.id);
  }
});

watch(
  () => user.value?.id,
  async (newUserId) => {
    if (newUserId) {
      await refreshStats(newUserId);
    }
  }
);

// Lifecycle
onMounted(async () => {
  await fetchUserInfo();
});
</script>

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
        <!-- Main Loading State -->
        <v-overlay v-if="loading" contained class="profile-overlay">
          <v-progress-circular
            indeterminate
            color="success"
          ></v-progress-circular>
        </v-overlay>

        <!-- Error State -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          title="Error"
          :text="error.message"
          class="ma-4"
        ></v-alert>

        <!-- Main Content -->
        <div v-else class="profile-content">
          <!-- Profile Header with Loading -->
          <v-sheet
            :class="[
              'profile-header',
              isDarkTheme ? 'dark-card' : 'light-card',
            ]"
            rounded="lg"
          >
            <v-container class="py-2">
              <v-row align="center" no-gutters>
                <v-col
                  cols="12"
                  sm="4"
                  md="3"
                  class="text-center text-sm-start ps-sm-4"
                >
                  <div class="avatar-wrapper d-inline-block">
                    <v-skeleton-loader
                      v-if="profileLoading"
                      type="avatar"
                      size="120"
                    ></v-skeleton-loader>
                    <v-avatar v-else size="120" class="profile-avatar">
                      <v-img :src="profileImage" cover>
                        <template v-slot:placeholder>
                          <v-row
                            align="center"
                            justify="center"
                            class="fill-height"
                          >
                            <v-progress-circular
                              indeterminate
                              color="success"
                            ></v-progress-circular>
                          </v-row>
                        </template>
                      </v-img>
                      <div class="edit-overlay" @click="dialog = true">
                        <v-icon color="white" size="20">mdi-pencil</v-icon>
                      </div>
                    </v-avatar>
                  </div>
                </v-col>

                <v-col
                  cols="12"
                  sm="8"
                  md="9"
                  class="text-center text-sm-start ps-sm-2"
                >
                  <div>
                    <template v-if="profileLoading">
                      <v-list-item v-for="n in 1" :key="n">
                        <v-skeleton-loader type="text"></v-skeleton-loader>
                      </v-list-item>
                    </template>
                    <template v-else>
                      <h2 class="text-h4 font-weight-bold text-white mb-1">
                        {{ username }}
                      </h2>
                      <p class="text-caption text-white mb-2">
                        {{ email }}
                      </p>
                    </template>
                    <v-btn
                      prepend-icon="mdi-account-edit"
                      variant="tonal"
                      color="white"
                      class="edit-profile-btn"
                      @click="dialog = true"
                      size="x-small"
                      :disabled="profileLoading"
                    >
                      Edit Profile
                    </v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </v-sheet>

          <!-- Stats Cards with Loading -->
          <v-container class="py-4">
            <v-row dense>
              <v-col cols="6" sm="4">
                <v-card
                  class="stat-card text-center"
                  elevation="0"
                  :class="[isDarkTheme ? 'dark-card' : 'light-card']"
                >
                  <v-card-text>
                    <v-skeleton-loader
                      v-if="statsLoading"
                      type="paragraph"
                    ></v-skeleton-loader>
                    <template v-else>
                      <v-icon color="success" size="36" class="mb-2"
                        >mdi-leaf</v-icon
                      >
                      <div class="text-h5 font-weight-bold">
                        {{ totalScans }}
                      </div>
                      <div class="text-caption">Total Scans</div>
                    </template>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6" sm="4">
                <v-card
                  class="stat-card text-center"
                  elevation="0"
                  :class="[isDarkTheme ? 'dark-card' : 'light-card']"
                >
                  <v-card-text>
                    <v-skeleton-loader
                      v-if="statsLoading"
                      type="paragraph"
                    ></v-skeleton-loader>
                    <template v-else>
                      <v-icon color="warning" size="36" class="mb-2"
                        >mdi-bug</v-icon
                      >
                      <div class="text-h5 font-weight-bold">
                        {{ totalPests }}
                      </div>
                      <div class="text-caption">High Alert Pests</div>
                    </template>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Recent Scans with Loading -->
            <v-card
              class="mt-4 scan-history-card"
              elevation="0"
              :class="[isDarkTheme ? 'dark-card' : 'light-card']"
            >
              <v-card-title class="d-flex align-center py-3 px-4">
                <v-icon color="success" class="mr-2">mdi-history</v-icon>
                Recent Scans
              </v-card-title>

              <v-divider></v-divider>

              <v-list class="scan-list">
                <template v-if="scansLoading">
                  <v-list-item v-for="n in 1" :key="n">
                    <v-skeleton-loader
                      type="list-item-avatar"
                    ></v-skeleton-loader>
                  </v-list-item>
                </template>
                <template v-else>
                  <v-list-item
                    v-for="scan in recentScans"
                    :key="scan.id"
                    :subtitle="formatDate(scan.date)"
                    class="scan-item"
                  >
                    <template v-slot:prepend>
                      <v-avatar size="40" color="success" class="mr-3">
                        <v-icon color="white">mdi-bug</v-icon>
                      </v-avatar>
                    </template>
                    <v-list-item-title class="font-weight-medium">
                      {{ scan.pestType }}
                      <v-chip
                        :color="getSeverityColor(scan.Severity)"
                        size="x-small"
                        class="ml-2"
                        variant="tonal"
                      >
                        {{ scan.Severity }}
                      </v-chip>
                    </v-list-item-title>
                  </v-list-item>
                </template>
              </v-list>

              <v-divider></v-divider>

              <div class="d-flex align-center justify-space-between pa-4">
                <v-btn
                  variant="tonal"
                  color="success"
                  block
                  prepend-icon="mdi-history"
                  @click="$router.push('/scan-history')"
                  class="view-all-btn"
                  :disabled="scansLoading"
                  >View All Scans
                </v-btn>

                <v-pagination
                  v-if="!scansLoading"
                  v-model="currentPage"
                  :length="totalPages"
                  :total-visible="3"
                  density="comfortable"
                  @update:model-value="changePage"
                  class="ml-2"
                ></v-pagination>
              </div>
            </v-card>
          </v-container>
        </div>

        <!-- Edit Profile Dialog -->
        <v-dialog v-model="dialog" max-width="500" class="profile-dialog">
          <v-card :class="[isDarkTheme ? 'dark-card' : 'light-card']"
            >
            <v-card-title class="text-h6 pa-4">Edit Profile</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="saveProfile">
                <v-text-field
                  v-model="username"
                  label="Username"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  density="comfortable"
                  :disabled="saving"
                ></v-text-field>

                <v-text-field
                  v-model="currentPassword"
                  label="Current Password (required for password change)"
                  type="password"
                  prepend-inner-icon="mdi-lock"
                  variant="outlined"
                  density="comfortable"
                  :disabled="saving"
                ></v-text-field>

                <v-text-field
                  v-model="newPassword"
                  label="New Password"
                  type="password"
                  prepend-inner-icon="mdi-lock-reset"
                  variant="outlined"
                  density="comfortable"
                  hint="Leave blank to keep current password"
                  persistent-hint
                  :disabled="saving"
                ></v-text-field>

                <v-file-input
                  accept="image/*"
                  label="Profile Picture"
                  prepend-icon="mdi-camera"
                  variant="outlined"
                  @change="uploadProfileImage"
                  density="comfortable"
                  :error-messages="errorMessage"
                  :loading="imageLoading"
                  :disabled="saving || imageLoading"
                ></v-file-input>
              </v-form>
              <v-alert
                v-if="errorMessage"
                type="error"
                variant="tonal"
                class="mb-4"
              >
                {{ errorMessage }}
              </v-alert>
            </v-card-text>
            <v-card-actions class="pa-4">
              <v-spacer></v-spacer>
              <v-btn
                color="grey"
                variant="tonal"
                @click="dialog = false"
                :disabled="saving"
              >
                Cancel
              </v-btn>
              <v-btn
                color="success"
                @click="saveProfile"
                :loading="saving"
                variant="tonal"
              >
                Save Changes
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </template>
  </LayoutWrapper>
</template>

<style scoped>
.pest-scanner-app {
  min-height: 100dvh;
  overflow: auto;
}

.dark-theme {
  background: #1e2124 !important;
}

.dark-card {
  background-color: #2d3035 !important;
  border: 1px solid rgba(80, 80, 80, 0.7) !important;
  color: #e0e0e0 !important;
}

.v-container {
  overflow-y: auto;
  max-height: calc(100vh - 64px);
}

.profile-header {
  background: linear-gradient(135deg, #5e7962 0%, #3d5141 100%);
  margin: 16px;
  border-radius: 20px !important;
  position: relative;
  overflow: hidden;
}

.avatar-wrapper {
  position: relative;
  margin-bottom: 0;
}

.profile-avatar {
  border: 4px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.edit-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-wrapper:hover .edit-overlay {
  opacity: 1;
}

.edit-profile-btn {
  background: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px !important;
  transition: transform 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-card:hover {
  transform: translateY(-2px);
}

.scan-history-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 50px;
}

.scan-item {
  transition: background-color 0.3s ease;
  border-radius: 8px;
  margin: 4px 8px;
}

.scan-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.view-all-btn {
  border-radius: 12px;
}

.scan-history-card .v-pagination {
  justify-content: flex-end;
}

@media (max-width: 600px) {
  .profile-header {
    margin: 8px;
    border-radius: 16px !important;
  }

  .stat-card {
    border-radius: 12px !important;
  }

  .scan-history-card {
    border-radius: 16px !important;
  }

  .scan-history-card .d-flex {
    flex-direction: column;
    gap: 1rem;
  }

  .scan-history-card .v-pagination {
    justify-content: center;
  }
}

:deep(.v-skeleton-loader__article) {
  background: rgba(255, 255, 255, 0.1) !important;
}

:deep(.v-skeleton-loader__image) {
  background: rgba(255, 255, 255, 0.1) !important;
}

:deep(.v-skeleton-loader__text) {
  background: rgba(255, 255, 255, 0.1) !important;
}
</style>
