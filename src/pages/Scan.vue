<template>
   <LayoutWrapper>
      <template #content>
        <div class="container">
          <!-- <ScanHistory /> -->
          <Camera />
        </div>
      </template>
    </LayoutWrapper>
</template>

<script>
import Camera from '@/components/common/Camera.vue';
import ScanHistory from '@/components/views/ScanHistory.vue';
import LayoutWrapper from '@/layouts/LayoutWrapper.vue';

export default {
  components: {
    Camera,
    ScanHistory,
    LayoutWrapper
  },
}
</script>

<style>
.view{
  height: 100%;
}
</style>

