<template>
  <LayoutWrapper>
    <template #content>
      <v-container class="result-container pa-4">
        <div v-if="isLoading" class="loading-state">
          <Loader />
          <div class="text-h6 mt-1 text-primary">Analyzing your plant...</div>
          <div class="text-body-2 text-medium-emphasis mt-1">
            Using AI to detect issues
          </div>
        </div>

        <div v-else class="result-content">
          <div class="text-center mb-1">
            <div class="text-h4 font-weight-bold text-primary mb-1">
              Analysis Results
            </div>
            <div class="text-subtitle-1 text-medium-emphasis">
              Here's what our system detected in your plant
            </div>
          </div>

          <v-card
            class="result-card mx-auto"
            max-width="500"
            rounded="lg"
            elevation="8"
          >
            <v-img
              :src="userScans?.image_path || ''"
              alt="Scanned Plant"
              :aspect-ratio="4 / 3"
              cover
              class="result-image"
              @load="onImageLoaded"
            >
              <template v-slot:placeholder>
                <div class="image-loader" v-if="imageLoading">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="64"
                  ></v-progress-circular>
                </div>
              </template>

              <!-- Overlay for loading state -->
              <div v-if="imageLoading" class="image-overlay">
                <v-progress-circular
                  indeterminate
                  color="white"
                  size="64"
                ></v-progress-circular>
              </div>
            </v-img>

            <div v-if="!imageLoading && scanResultStore.ScanResult.length">
              <v-card-text class="pa-4">
                <div class="d-flex align-center justify-space-between mb-4">
                  <div class="text-h6 font-weight-medium">
                    <v-icon color="primary" class="mr-2">mdi-magnify</v-icon>
                    Detection Results
                  </div>
                  <v-chip color="primary" size="small" variant="elevated">
                    {{ scanResultStore.ScanResult.length }}
                    {{
                      scanResultStore.ScanResult.length === 1
                        ? "Issue"
                        : "Issues"
                    }}
                    Found
                  </v-chip>
                </div>

                <div class="results-list">
                  <v-card
                    v-for="(result, index) in scanResultStore.ScanResult"
                    :key="index"
                    variant="outlined"
                    class="mb-3 result-item"
                    rounded="lg"
                    elevation="1"
                  >
                    <v-card-text class="pa-4">
                      <div
                        class="d-flex align-center justify-space-between mb-2"
                      >
                        <div class="d-flex align-center">
                          <v-icon
                            :color="getIssueColor(result.confidence)"
                            size="24"
                            class="mr-2"
                          >
                            {{ getIssueIcon(result.class) }}
                          </v-icon>
                          <span class="text-h6">{{
                            formatClassName(result.class)
                          }}</span>
                        </div>
                        <v-chip
                          :color="getConfidenceColor(result.confidence)"
                          :text-color="
                            result.confidence > 0.6 ? 'white' : 'black'
                          "
                          size="small"
                          elevation="1"
                        >
                          {{ (result.confidence * 100).toFixed(0) }}% Confidence
                        </v-chip>
                      </div>

                      <v-progress-linear
                        :model-value="result.confidence * 100"
                        :color="getConfidenceColor(result.confidence)"
                        height="8"
                        rounded
                        class="mt-2"
                      ></v-progress-linear>

                      <div class="text-body-2 text-medium-emphasis mt-3">
                        {{ getIssueDescription(result.class) }}
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
              </v-card-text>

              <v-card-actions class="pa-2 d-flex flex-column">
                <v-btn
                  block
                  color="white"
                  size="large"
                  rounded="lg"
                  @click="$router.push('/scan')"
                  elevation="3"
                  class="scan-button text-none"
                >
                  <v-icon start>mdi-camera</v-icon>
                  Scan Another Plant
                </v-btn>

                <v-btn
                  block
                  color="black"
                  variant="text"
                  @click="$router.push('/scan-history')"
                >
                  <v-icon start>mdi-history</v-icon>
                  View Scan History
                </v-btn>
              </v-card-actions>
            </div>
          </v-card>
        </div>
      </v-container>
    </template>
  </LayoutWrapper>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useScanResultStore } from "@/stores/scanResultStore";
import LayoutWrapper from "@/layouts/LayoutWrapper.vue";
import Loader from "@/components/common/Loader.vue";
import { supabase } from "@/lib/supabase";


interface UserScan {
  image_path: string;
  created_at?: string;
}

const scanResultStore = useScanResultStore();
const userScans = ref<UserScan | null>(null);
const isLoading = ref<boolean>(true);
const imageLoading = ref<boolean>(true);

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.8) return "success";
  if (confidence >= 0.6) return "warning";
  return "error";
};

const getIssueColor = (confidence: number): string => {
  if (confidence >= 0.8) return "error";
  if (confidence >= 0.6) return "warning";
  return "info";
};

const getIssueIcon = (className: string): string => {
  const icons: Record<string, string> = {
    aphids: "mdi-bug",
    "leaf-spot": "mdi-leaf-off",
    healthy: "mdi-leaf",
    default: "mdi-alert-circle",
  };
  return icons[className.toLowerCase()] || icons.default;
};

const formatClassName = (className: string): string => {
  return className
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getIssueDescription = (className: string): string => {
  const descriptions: Record<string, string> = {
    aphids:
      "Small sap-sucking insects that can cause significant damage to plants.",
    "leaf-spot":
      "Fungal disease causing spots on leaves that can lead to defoliation.",
    healthy: "No significant issues detected in the plant.",
    default: "Potential plant health issue detected.",
  };
  return descriptions[className.toLowerCase()] || descriptions.default;
};

const fetchUserScans = async (): Promise<UserScan | null> => {
  const userId = localStorage.getItem("user_id");
  if (!userId) return null;

  const { data, error } = await supabase
    .from("pest_scans")
    .select("image_path, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return error ? null : data;
};

const onImageLoaded = (): void => {
  imageLoading.value = false;
};


onMounted(async () => {
  const data = await fetchUserScans();
  userScans.value = data;
  isLoading.value = false;
});
</script>

<style scoped>
.result-container {
  max-width: 100%;
  min-height: 100dvh;
  background: #8ca189;
  overflow-y: auto;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.result-card {
  transition: all 0.3s ease;
  padding: 10px;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
}

.result-image {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
}

.scan-button {
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  background: #526e48;
}

.image-loader {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.9);
}

.result-item {
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.result-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

@media (max-width: 600px) {
  .result-container {
    padding: 16px;
  }

  .text-h4 {
    font-size: 1.75rem !important;
  }

  .result-card {
    margin: 0 !important;
  }
}
</style>
