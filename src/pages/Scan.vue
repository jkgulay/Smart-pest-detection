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

<style lang="scss">
.view {
  height: 100%;
}
</style>
