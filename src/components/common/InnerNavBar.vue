<template>
  <v-app-bar class="bg-card">
    <v-img
      class="logo"
      src="@/assets/5-removebg-preview.png"
      max-width="100"
    ></v-img>
    <v-toolbar-title class="text-h6 title">PESTLENS</v-toolbar-title>
    <v-icon class="me-5" @click="toggleTheme">{{ themeIcon }}</v-icon>
    <v-menu transition="slide-y-transition">
      <template v-slot:activator="{ props }">
        <v-btn rounded="xl" size="large" variant="tonal" v-bind="props">
          <v-avatar size="25" class="mr-2">
            <v-img src="#"></v-img>
          </v-avatar>
          <v-icon color="white">mdi-cog</v-icon>
        </v-btn>
      </template>
      <v-sheet class="pa-0 mt-2 me-1 menu-card" color="grey-darken-3">
        <div>
          <v-btn
            class="justify-start"
            rounded="0"
            variant="text"
            size="large"
            block
            to="/profiles"
            style="text-transform: none"
          >
            <v-row align="center" no-gutters>
              <v-col cols="auto">
                <v-icon class="me-3" left>mdi-account</v-icon>
              </v-col>
              <v-col> {{ userEmail }}</v-col>
            </v-row>
          </v-btn>

          <v-btn
            class="justify-start"
            rounded="0"
            variant="text"
            size="large"
            block
            @click="handleLogoutClick"
            style="text-transform: none"
          >
            <v-row align="center" no-gutters>
              <v-col cols="auto">
                <v-icon class="me-3" left>mdi-logout</v-icon>
              </v-col>
              <v-col> Logout </v-col>
            </v-row>
          </v-btn>
        </div>
      </v-sheet>
    </v-menu>
  </v-app-bar>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useTheme } from "vuetify";
import { doLogout } from "@/lib/supabase";
import { useUserInfo } from "@/composables/userInfo";
import router from "@/router";

const theme = useTheme();
const isDarkTheme = computed(() => theme.global.current.value.dark);
const themeIcon = computed(() =>
  isDarkTheme.value ? "mdi-weather-sunny" : "mdi-weather-night"
);

function toggleTheme() {
  const newTheme = isDarkTheme.value ? "light" : "dark";
  theme.global.name.value = newTheme;
  localStorage.setItem("theme", newTheme);
}

const { userEmail } = useUserInfo();

function handleLogoutClick() {
  doLogout();
  router.push("/");
}
</script>

<style scoped>
.bg-card {
  background: rgba(161, 205, 247, 0.15);
  box-shadow: 0 4px 10px rgba(254, 79, 90, 0.3);
  backdrop-filter: blur(5px);
}

.title {
  color: #526e48;
  font-family: "Montserrat", sans-serif !important;
  font-weight: 900;
  margin-left: 0;
}

.logo {
  margin-right: -50px;
  margin-top: 9px;
}
</style>
