<template>
  <v-container class="scan-container pa-4">
    <div class="text-center mb-3">
      <h1 class="text-h4 font-weight-bold mb-2">Plant Scanner</h1>
      <p class="text-subtitle-1 text-medium-emphasis">
        Detect and identify plant pests
      </p>
    </div>

    <!-- Main Card Section -->
    <v-card
      class="mx-auto scan-card"
      :class="{
        'elevation-8': !isTakingPicture,
        'elevation-2': isTakingPicture,
      }"
      max-width="500"
      rounded="lg"
    >
      <!-- Loading Overlay -->
      <v-overlay
        v-model="isTakingPicture"
        class="align-center justify-center"
        contained
        scrim="#ffffff"
      >
        <v-card-text class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
          <div class="text-body-1 mt-4">Processing your image...</div>
        </v-card-text>
      </v-overlay>

      <!-- Image Preview -->
      <v-img
        :src="selectedImage || defaultImage"
        :aspect-ratio="1"
        cover
        class="scan-image"
      >
        <template v-slot:placeholder>
          <v-row class="fill-height ma-0" align="center" justify="center">
            <v-progress-circular
              indeterminate
              color="grey-lighten-5"
            ></v-progress-circular>
          </v-row>
        </template>

        <!-- Image Overlay Guidelines -->
        <div class="image-overlay" v-if="!selectedImage">
          <div class="text-center text-white">
            <v-icon size="64" color="white" class="mb-2"
              >mdi-camera-outline</v-icon
            >
            <div class="text-body-1">
              Take a clear photo of the affected area
            </div>
          </div>
        </div>
      </v-img>

      <!-- Action Buttons -->
      <v-card-actions class="pa-4 d-flex flex-wrap gap-3">
        <v-btn
          block
          color="white"
          size="large"
          :loading="isTakingPicture"
          :disabled="isTakingPicture"
          @click="takePicture"
          class="scan-button"
          elevation="2"
        >
          <v-icon start>mdi-camera</v-icon>
          {{ selectedImage ? "Scan Again" : "Scan a Pest" }}
        </v-btn>

        <v-btn
          v-if="selectedImage"
          block
          color="error"
          size="large"
          variant="outlined"
          @click="clearImage"
          class="clear-button"
          elevation="0"
        >
          <v-icon start>mdi-refresh</v-icon>
          Clear Image
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Scanning Tips -->
    <v-card
      class="mt-6 mx-auto tips-card"
      max-width="500"
      variant="outlined"
      rounded="lg"
    >
      <v-list lines="two">
        <v-list-subheader class="text-primary font-weight-medium"
          >Scanning Tips</v-list-subheader
        >

        <v-list-item
          prepend-icon="mdi-light-flood-up"
          title="Good Lighting"
          subtitle="Ensure the plant is well-lit and avoid shadows"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-image-filter-center-focus"
          title="Clear Focus"
          subtitle="Keep the camera steady and close to the affected area"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-leaf"
          title="Affected Areas"
          subtitle="Include both healthy and damaged parts of the plant"
        ></v-list-item>
      </v-list>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { useDisplay } from "vuetify";
import { usePestScan } from "@/composables/usePestScan";
import { useScanResultStore } from "@/stores/scanResultStore";
import { useRouter } from "vue-router";

const selectedImage = ref<string | null>(null);
const { mobile } = useDisplay();
const defaultImage = "/src/assets/default/pest1.jpg";
const { uploadPestScan, uploadError, isLoading } = usePestScan();
const scanResultStore = useScanResultStore();
const isTakingPicture = ref(false);
const router = useRouter();

const takePicture = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 50,
      resultType: CameraResultType.Uri,
      allowEditing: false,
      saveToGallery: true,
      source: CameraSource.Prompt,
      promptLabelCancel: "Go Back",
      promptLabelPhoto: "Choose from Gallery",
      promptLabelPicture: "Take a Picture",
    });

    selectedImage.value = image.webPath || null;

    if (image.webPath) {
      const response = await fetch(image.webPath);
      const blob = await response.blob();
      const file = new File([blob], "image.jpg", { type: blob.type });
      isTakingPicture.value = true;

      const imageUrl = await uploadPestScan(file);
      if (uploadError.value) {
        console.error("Upload error:", uploadError.value);
      } else {
        console.log("Image uploaded to:", imageUrl);
        router.push("/result");
      }
    }
  } catch (error) {
    console.error("Camera error:", error);
  } finally {
    isTakingPicture.value = false;
  }
};

const clearImage = () => {
  selectedImage.value = null;
};
</script>

<style scoped>
.scan-container {
  max-width: 100%;
  min-height: 100vh; 
  background: #8ca189;
  overflow: auto;
}

.scan-card {
  position: relative;
  border-radius: 20px;
  padding: 0.5rem;
  overflow: auto;
}

.scan-image {
  position: relative;
  border-radius: 12px;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.scan-button {
  transition: transform 0.2s ease;
  background-color: #43673d;
}

.scan-button:active {
  transform: scale(0.98);
}

.tips-card {
  background: rgba(255, 255, 255, 0.9);
  overflow: auto;
}

.gap-3 {
  gap: 12px;
}

@media (max-width: 600px) {
  .scan-container {
    padding: 16px !important;
  }

  .text-h4 {
    font-size: 1.5rem !important;
  }

  .scan-card {
    margin: 0 !important;
  }
}
</style>
