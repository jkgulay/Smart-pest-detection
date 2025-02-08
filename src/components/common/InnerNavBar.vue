<template>
<<<<<<< HEAD
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
=======
  <v-navigation-drawer
    v-model="drawer"
    :location="$vuetify.display.mobile ? 'left' : 'left'"
    temporary
  >
    <v-list>
     
      <v-list-item style="padding: 8px; margin-top: 2rem;">
       
        <v-btn
          class="justify-start"
          rounded="0"
          variant="text"
          size="large"
          block
          to="/profiles"
          style="text-transform: none; font-size: 1rem;"
        >
          <v-row align="center" no-gutters>
            <v-col cols="auto">
              <v-icon class="me-3" left style="font-size: 1.5rem;">mdi-account</v-icon>
            </v-col>
            <v-col> {{ userEmail }} </v-col>
          </v-row>
        </v-btn>
      </v-list-item>

      <v-list-item style="padding: 8px; ">
        <v-btn
          class="justify-start"
          rounded="0"
          variant="text"
          size="large"
          block
          @click="toggleTheme"
          style="text-transform: none; font-size: 1rem;"
        >
          <v-row align="center" no-gutters>
            <v-col cols="auto">
              <v-icon class="me-3" left style="font-size: 1.5rem;">{{ themeIcon }}</v-icon>
            </v-col>
            <v-col> Theme </v-col>
          </v-row>
        </v-btn>
      </v-list-item>

      <v-list-item style="padding: 8px;">
        <v-btn
          class="justify-start"
          rounded="0"
          variant="text"
          size="large"
          block
          to="/scan"
          style="text-transform: none; font-size: 1rem;"
        >
          <v-row align="center" no-gutters>
            <v-col cols="auto">
              <v-icon class="me-3" left style="font-size: 1.5rem;">mdi-magnify</v-icon>
            </v-col>
            <v-col> Scan </v-col>
          </v-row>
        </v-btn>
      </v-list-item>

      <v-list-item style="padding: 10px;">
        <v-btn
          class="justify-start"
          rounded="0"
          variant="text"
          size="large"
          block
          to="/home"
          style="text-transform: none; font-size: 1rem;"
        >
          <v-row align="center" no-gutters>
            <v-col cols="auto">
              <v-icon class="me-3" left style="font-size: 1.5rem;">mdi-view-dashboard</v-icon>
            </v-col>
            <v-col> Dashboard </v-col>
          </v-row>
        </v-btn>
      </v-list-item>

      <v-list-item style="padding: 8px; margin-top: 20rem;">
        <v-btn
          class="justify-center"
          rounded="0"
          variant="text"
          size="large"
          block
          @click="handleLogoutClick"
          style="text-transform: none; font-size: 1rem;"
        >
          <v-row align="center" no-gutters>
            <v-col cols="auto">
              <v-icon class="me-3" left style="font-size: 1.5rem;">mdi-logout</v-icon>
            </v-col>
            <v-col> Logout </v-col>
          </v-row>
        </v-btn>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <v-app-bar :color="isDarkTheme ? 'dark-navbar' : 'light-navbar'" style="height: 100px; padding: 1rem;">
    <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

    <div class="title">Smart-Pest-Detection</div>

    <v-spacer></v-spacer>

    <v-img
      class="logo pt-1"
      src="@/assets/5-removebg-preview.png"
      max-width="100"
    ></v-img>
>>>>>>> bbe11855c06ea03da099d910666a6a7bc58108de
  </v-app-bar>

  <!-- Replacing v-main with a div -->
  <div style="height: 100%; padding: 16px;">
    <!-- Content goes here -->
  </div>
</template>

<script lang="ts" setup>
<<<<<<< HEAD
import { computed } from "vue";
import { useTheme } from "vuetify";
import { doLogout } from "@/lib/supabase";
import { useUserInfo } from "@/composables/userInfo";
import router from "@/router";
=======
import { computed, ref } from 'vue';
import { useTheme } from 'vuetify';
import { doLogout } from '@/lib/supabase';
import { useUserInfo } from '@/composables/userInfo'; 
import router from '@/router';
>>>>>>> bbe11855c06ea03da099d910666a6a7bc58108de

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
<<<<<<< HEAD
  router.push("/");
=======
  router.push('/');
>>>>>>> bbe11855c06ea03da099d910666a6a7bc58108de
}

const drawer = ref(false);
</script>

<style scoped>
.bg-card {
  background: rgba(161, 205, 247, 0.15);
  box-shadow: 0 4px 10px rgba(254, 79, 90, 0.3);
  backdrop-filter: blur(5px);
}

.title {
<<<<<<< HEAD
  color: #526e48;
=======
>>>>>>> bbe11855c06ea03da099d910666a6a7bc58108de
  font-family: "Montserrat", sans-serif !important;
  font-weight: 900;
  margin-left: 0;
}

.logo {
<<<<<<< HEAD
  margin-right: -50px;
  margin-top: 9px;
}
=======
  margin-right: 0;
  margin-top: 9px;
}

@media (max-width: 600px) {
  .title {
    font-size: 14px;
  }
}



>>>>>>> bbe11855c06ea03da099d910666a6a7bc58108de
</style>
