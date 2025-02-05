<template>
  <v-app-bar app>
    <v-container fluid>
      <v-row align="center" class="d-flex">
        <v-col class="d-flex align-center">
          <v-img
          class="logo pt-1"
            src="@/assets/5-removebg-preview.png"
           max-width="100"
          ></v-img>
          <v-app-bar-title class="title">
           PESTLENS
          </v-app-bar-title>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>


<script lang="ts" setup>
import { computed, provide, onMounted } from "vue";
import { useTheme } from "vuetify";

const theme = useTheme();
const isDarkTheme = computed(() => theme.global.current.value.dark);

provide("isDarkTheme", isDarkTheme);

onMounted(() => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    theme.global.name.value = savedTheme;
  }
});
</script>

<style scoped>
.title {
  color: #526e48;
  font-family: "Montserrat", sans-serif !important;
  font-weight: 900;
  margin-left: 0;
}

.logo {
  margin-right: 0;
  margin-top: 9px;
}
</style>
