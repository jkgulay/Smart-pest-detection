<script setup lang="ts">
import { ref } from 'vue';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useDisplay } from 'vuetify';

const selectedImage = ref<string | null>(null);
const { mobile } = useDisplay();
const defaultImage = 'path/to/default/image.jpg';

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
    console.log('Selected image file:', image);
  } catch (error) {
    console.error('Camera error:', error);
  }
};

const clearImage = () => {
  selectedImage.value = null;
};

const onSubmit = () => {
  console.log('Form submitted');
};
</script>

<template>
  <v-container class="text-center">
    <v-card class="mt-4" elevation="4" max-width="400">
      <v-img :src="selectedImage || defaultImage" alt="Selected Image" aspect-ratio="1" cover></v-img>
    </v-card>

    <v-btn color="primary" @click="takePicture" size="large">
      <v-icon left>mdi-camera</v-icon> Scan a Pest
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
