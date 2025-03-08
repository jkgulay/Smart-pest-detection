import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { OutputImage } from '../types/api';

export const useScanResultStore = defineStore('ScanResult', () => {
  const ScanResult = ref<Array<{ class: string, confidence: number }>>([]);
  const selectedImage = ref<OutputImage | null>(null);

  const setScanResult = (result: Array<{ class: string, confidence: number }>) => {
    ScanResult.value = result;
  };

  const setSelectedImage = (image: OutputImage | null) => {
    selectedImage.value = image;
  };

  return {
    ScanResult,
    selectedImage,
    setScanResult,
    setSelectedImage,
  };
});
