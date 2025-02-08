<script setup lang="ts">
import { ref } from 'vue';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useDisplay } from 'vuetify';
import { usePestScan } from '@/composables/usePestScan';
import { useScanResultStore } from '@/stores/scanResultStore';
import { useRouter } from 'vue-router';
import Loader from '@/components/common/Loader.vue';

const selectedImage = ref<string | null>(null);
const { mobile } = useDisplay();
const defaultImage = '/src/assets/default/pest1.jpg';
console.log('defaultImage:', defaultImage);
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
      promptLabelCancel: 'Go Back',
      promptLabelPhoto: 'Choose from Gallery',
      promptLabelPicture: 'Take a Picture'
    });

    selectedImage.value = image.webPath || null;
   /*  console.log('Selected image file:', image); */
    
    if (image.webPath) {
      const response = await fetch(image.webPath);
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: blob.type });
      isTakingPicture.value = true;
      const imageUrl = await uploadPestScan(file);
      if (uploadError.value) {
        console.error('Upload error:', uploadError.value);
      } else {
        console.log('Image uploaded to:', imageUrl);
       
        router.push('/result');
      }
    }
  } catch (error) {
    console.error('Camera error:', error);
  } finally {
    isTakingPicture.value = false;
  }
};

const clearImage = () => {
  window.location.reload();
};
</script>

<template>
  <v-container class="text-center">
    <Loader v-if="isTakingPicture" />
    <v-card class="mt-4" elevation="4" max-width="400">
      <v-img :src="selectedImage || defaultImage" alt="Selected Image" aspect-ratio="1" cover></v-img>
     
    </v-card>

    <v-btn color="primary" @click="takePicture" size="large" :disabled="isTakingPicture">
      <v-icon left>mdi-camera</v-icon>
      <span v-if="!isTakingPicture">Scan a Pest</span>
    
    </v-btn>

    <v-btn color="secondary" @click="clearImage" size="large" class="ml-2">
      <v-icon left>mdi-close</v-icon> Clear
    </v-btn>
  </v-container>
</template>

<style scoped>
.v-btn {
  margin-top: 20px;
}
.ml-2 {
  margin-left: 8px;
}
</style>
