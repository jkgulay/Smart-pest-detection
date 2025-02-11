<template>
  <v-app>
    <v-main>
      <div id="main-content">
        <InnerNavBar />
        <slot name="content"></slot>
        <ScrollDown />
        <BottomBar />
      </div>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import InnerNavBar from "@/components/common/InnerNavBar.vue";
import ScrollDown from "@/components/common/ScrollDown.vue";
</script>

<style scoped>
.v-main {
  background: #8ca189 !important;
}
</style>
