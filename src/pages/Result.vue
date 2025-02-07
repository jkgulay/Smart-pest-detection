<template>
  <LayoutWrapper>
    <template #content>
      <div class="container">
        <Loader v-if="isLoading" />
        <div v-else>
          <h1>Scan Result</h1>
          <v-card class="mt-4" elevation="4" max-width="400">
            <v-img :src="userScans ? userScans.image_path : ''" alt="Scanned Image" aspect-ratio="1" cover @load="onImageLoaded">
              <template v-slot:placeholder>
                <div class="image-loader" v-if="imageLoading">
                  <Loader />
                </div>
              </template>
            </v-img>
            <div v-if="!imageLoading && scanResultStore.scanResult.length">
              <v-list>
                <v-list-item
                  v-for="(result, index) in scanResultStore.scanResult"
                  :key="index"
                >
                  <v-list-item-content>
                    <v-list-item-title>
                      <v-icon left>mdi-bug</v-icon> {{ result.class }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      Confidence: {{ (result.confidence * 100).toFixed(2) }}%
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </div>
          </v-card>
        </div>
      </div>
    </template>
  </LayoutWrapper>
</template>

<script>
import { useScanResultStore } from '@/stores/scanResultStore';
import LayoutWrapper from '@/layouts/LayoutWrapper.vue';
import { ref, onMounted } from 'vue';
import { supabase } from '@/lib/supabase';
import Loader from '@/components/common/Loader.vue';

export default {
  components: {
    LayoutWrapper,
    Loader
  },
  setup() {
    const scanResultStore = useScanResultStore();
    const userScans = ref(null);
    const isLoading = ref(true);
    const imageLoading = ref(true);

    async function fetchUserScans() {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        return { error: "User not logged in" };
      }
    
      const { data, error } = await supabase
        .from("pest_scans")
        .select("image_path")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
    
      if (error) {
        return { error };
      }
      console.log('data:', data);
      return { data };
    }

    function onImageLoaded() {
      imageLoading.value = false;
    }

    onMounted(async () => {
      const { data, error } = await fetchUserScans();
      if (!error) {
        userScans.value = data;
      }
      isLoading.value = false;
    });

    return { scanResultStore, userScans, isLoading, imageLoading, onImageLoaded };
  }
}
</script>

<style scoped>
.container {
  padding: 20px;
}
.image-loader {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
}
</style>
