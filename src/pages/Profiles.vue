<template>
  <LayoutWrapper>
    <template #content>
      <div class="profile-page">
        <div class="profile-header">
          <v-img
            src="@/assets/background2.jpg"
            height="200"
            cover
            class="header-background"
          >
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular indeterminate></v-progress-circular>
              </v-row>
            </template>
          </v-img>

          <v-card class="profile-card mx-4 mt-2" elevation="3" rounded="lg">
            <v-row no-gutters>
              <v-col cols="4" class="pa-4">
                <v-avatar size="80" class="profile-avatar">
                  <v-img src="@/assets/background.jpg" cover>
                    <template v-slot:placeholder>
                      <v-row
                        class="fill-height ma-0"
                        align="center"
                        justify="center"
                      >
                        <v-progress-circular
                          indeterminate
                        ></v-progress-circular>
                      </v-row>
                    </template>
                  </v-img>
                </v-avatar>
              </v-col>
              <v-col cols="8" class="pa-4">
                <div class="d-flex flex-column justify-center h-100">
                  <div class="text-h6 font-weight-bold mb-1">
                    {{ username }}
                  </div>
                  <div class="text-subtitle-2 text-medium-emphasis">
                    {{ email }}
                  </div>
                </div>
              </v-col>
            </v-row>

            <v-row no-gutters class="stats-row" justify="center">
              <v-col
                v-for="stat in stats"
                :key="stat.label"
                cols="4"
                class="text-center"
              >
                <div class="stat-item pa-2">
                  <div class="text-h6 font-weight-bold">{{ stat.value }}</div>
                  <div class="text-caption">{{ stat.label }}</div>
                </div>
              </v-col>
            </v-row>

            <v-card-actions class="pa-4">
              <v-btn
                block
                color="primary"
                variant="tonal"
                prepend-icon="mdi-account-edit"
                @click="dialog = true"
              >
                Edit Profile
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>

        <v-tabs v-model="activeTab" grow class="mt-4">
          <v-tab value="scans">
            <v-icon>mdi-bug-check-outline</v-icon>
            Recent Scans
          </v-tab>
          <v-tab value="saved">
            <v-icon>mdi-bookmark-outline</v-icon>
            Saved Reports
          </v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <v-window-item value="scans">
            <v-list>
              <v-list-item v-for="scan in recentScans" :key="scan.id">
                <v-list-item-title>{{ scan.pestType }}</v-list-item-title>
                <v-list-item-subtitle>{{ scan.date }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-window-item>

          <v-window-item value="saved">
            <div class="pa-4 text-center text-medium-emphasis">
              <v-icon size="64" class="mb-4">mdi-bookmark-outline</v-icon>
              <div>No saved reports yet</div>
            </div>
          </v-window-item>
        </v-window>
      </div>
    </template>
  </LayoutWrapper>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import LayoutWrapper from "@/layouts/LayoutWrapper.vue";

const dialog = ref(false);
const activeTab = ref("scans");

const username = ref("Username");
const email = ref("profile23@gmail.com");

const stats = ref([
  { label: "Total Scans", value: "20" },
  { label: "Identified Pests", value: "15" },
  { label: "Saved Reports", value: "5" },
]);

const recentScans = ref([]);
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: rgb(249, 250, 251);
}
.stats-row {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
.hidden-input {
  display: none;
}
</style>
