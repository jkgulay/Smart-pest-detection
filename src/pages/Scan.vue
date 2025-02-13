<template>
  <LayoutWrapper>
    <template #content>
      <div class="container">
        <Camera />
      </div>
    </template>
  </LayoutWrapper>
</template>

<script setup lang="ts">
import Camera from "@/components/common/Camera.vue";
import LayoutWrapper from "@/layouts/LayoutWrapper.vue";
</script>

<style scoped>
.container {
  min-height: 100vh; 
  overflow-y: auto; 
  display: flex;
  flex-direction: column;
}
</style>
