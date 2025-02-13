<template>
  <LayoutWrapper>
    <template #content>
      <v-container class="result-container">
        <div v-if="isLoading" class="loading-state">
          <Loader />
          <div class="text-h6 mt-4 text-medium-emphasis">
            Analyzing your plant...
          </div>
        </div>

        <div v-else class="result-content">
          <div class="text-center mb-6">
            <h1 class="text-h4 font-weight-bold mb-2">Scan Results</h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Here's what we found in your plant
            </p>
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
              aspect-ratio="1"
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
            </v-img>

            <div v-if="!imageLoading && scanResultStore.scanResult.length">
              <v-card-text class="pa-4">
                <div class="text-h6 mb-4 font-weight-medium">
                  Detected Pests
                </div>

                <div class="results-list">
                  <v-card
                    v-for="(result, index) in scanResultStore.scanResult"
                    :key="index"
                    variant="outlined"
                    class="mb-3 result-item"
                    rounded="lg"
                  >
                    <v-card-text class="pa-4">
                      <div
                        class="d-flex align-center justify-space-between mb-2"
                      >
                        <div class="d-flex align-center">
                          <v-icon color="error" size="24" class="mr-2"
                            >mdi-bug</v-icon
                          >
                          <span class="text-h6">{{ result.class }}</span>
                        </div>
                        <v-chip
                          :color="getConfidenceColor(result.confidence)"
                          text-color="white"
                          size="small"
                        >
                          {{ (result.confidence * 100).toFixed(0) }}% Confidence
                        </v-chip>
                      </div>

                      <v-progress-linear
                        :model-value="result.confidence * 100"
                        :color="getConfidenceColor(result.confidence)"
                        height="6"
                        rounded
                      ></v-progress-linear>
                    </v-card-text>
                  </v-card>
                </div>
              </v-card-text>

              <v-card-actions class="pa-4 pt-0">
                <v-row>
                  <v-btn
                    block
                    color="primary"
                    size="large"
                    rounded="lg"
                    @click="$router.push('/scan')"
                    elevation="2"
                  >
                    <v-icon start>mdi-camera</v-icon>
                    Scan Again
                  </v-btn>

                  <v-btn
                    block
                    color="secondary"
                    variant="outlined"
                    size="large"
                    rounded="lg"
                    class="mt-3"
                    @click="viewTreatments"
                  >
                    <v-icon start>mdi-medical-bag</v-icon>
                    View Treatments
                  </v-btn>
                </v-row>
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

interface ScanResult {
  class: string;
  confidence: number;
}

interface UserScan {
  image_path: string;
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

const fetchUserScans = async (): Promise<{ data?: UserScan; error?: any }> => {
  const userId = localStorage.getItem("user_id");
  if (!userId) return { error: "User not logged in" };

  const { data, error } = await supabase
    .from("pest_scans")
    .select("image_path")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return error ? { error } : { data };
};

const onImageLoaded = (): void => {
  imageLoading.value = false;
};

const viewTreatments = (): void => {
  console.log("View treatments clicked");
};

onMounted(async () => {
  const { data, error } = await fetchUserScans();
  if (!error) userScans.value = data;
  isLoading.value = false;
});
</script>

<style scoped>
.result-container {
  min-height: 100vh;
  padding: 24px;
  background: #8ca189;
  overflow-y: auto;
}

.loading-state {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.result-card {
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 20px;
  overflow: auto;
}

.result-image {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
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
  transition: transform 0.2s ease;
}

.result-item:hover {
  transform: translateY(-2px);
}

@media (max-width: 600px) {
  .result-container {
    padding: 16px;
  }

  .text-h4 {
    font-size: 1.5rem !important;
  }

  .result-card {
    margin: 0 !important;
  }
}
</style>
