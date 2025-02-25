<template>
  <v-app>
    <InnerNavBar />
   
    <v-main  :class="{
          'dark-theme': isDarkTheme
        }">
      <slot name="content"></slot>
    </v-main>
    <BottomBar />
  </v-app>
</template>

<script lang="ts" setup>
import InnerNavBar from "@/components/common/InnerNavBar.vue";
import BottomBar from "@/components/common/BottomBar.vue";
// import Animate from "@/components/common/3dContainer.vue";

import { useTheme } from "vuetify";
const theme = useTheme();
const isDarkTheme = computed(() => theme.global.current.value.dark);

</script>

<style scoped>
.v-main {
  background-color: #8ca189 !important;
  padding-bottom: 62px !important;
  padding-top: 64px !important;
  min-height: 100vh; 
}

.dark-theme {
  background: #1e2124 !important;
}
</style>
