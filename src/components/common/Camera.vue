<script setup lang="ts">
import { ref } from 'vue';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useDisplay } from 'vuetify';

const selectedImage = ref<string | null>(null);
const { mobile } = useDisplay();

const takePicture = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 50,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt, 
    });

    selectedImage.value = image.webPath || null;
    console.log('Selected image file:', image);
  } catch (error) {
    console.error('Camera error:', error);
  }
};

const onSubmit = () => {
  console.log('Form submitted');
};
</script>

<template>
  <v-container class="text-center">
    <v-btn color="primary" @click="takePicture" size="large">
      <v-icon left>mdi-camera</v-icon> Take Photo
    </v-btn>

    <v-card v-if="selectedImage" class="mt-4" elevation="4" max-width="400">
      <v-img :src="selectedImage" alt="Selected Image" aspect-ratio="1" cover></v-img>
    </v-card>
  </v-container>
</template>

<style scoped>
.v-btn {
  margin-top: 20px;
}
</style>
