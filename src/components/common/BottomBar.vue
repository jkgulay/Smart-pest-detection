<template>
  <v-bottom-navigation
    v-model="activeTab"
    color="#526E48"
    grow
    class="custom-nav"
    :class="{ 'dark-theme': isDarkTheme }"
  >
    <v-btn 
      class="nav-button" 
      :class="{ 'nav-active': activeTab === 0 }" 
      to="/home"
    >
      <template v-slot:default>
        <v-icon size="25">mdi-home</v-icon>
        <span class="button-text">Home</span>
      </template>
    </v-btn>

    <div class="scan-button-container">
      <div class="scan-button-background"></div>
      <v-btn 
        class="scan-button"
        elevation="2"
        to="/scan"
        :class="{ 'nav-active': activeTab === 1 }"
      >
        <v-icon size="22">mdi-qrcode-scan</v-icon>
      </v-btn>
    </div>

    <v-btn 
      class="nav-button" 
      :class="{ 'nav-active': activeTab === 2 }" 
      to="/profiles"
    >
      <template v-slot:default>
        <v-icon size="25">mdi-account</v-icon>
        <span class="button-text">Profile</span>
      </template>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTheme } from 'vuetify';
import { useRoute } from 'vue-router';

const route = useRoute();
const theme = useTheme();
const isDarkTheme = computed(() => theme.global.current.value.dark);
const activeTab = ref(0);
const isScanActive = ref(false);
</script>

<style scoped>
.custom-nav {
  position: fixed !important;
  bottom: 4px !important;
  left: 4px !important;
  right: 4px !important;
  border-radius: 16px !important;
  background-color: #ffffff !important;
  box-shadow: 0 1px 6px rgba(82, 110, 72, 0.1) !important;
  height: 58px !important;  /* Reduced height */
  padding: 0 4px !important;  /* Reduced padding */
  width: calc(100% - 8px) !important;  /* Adjusted width */
  z-index: 100;
  margin-top: 4rem;
}

.nav-button {
  height: 100% !important;
  border-radius: 12px !important;
  transition: all 0.2s ease;
  color: #526E48 !important;
  min-width: 40px !important; 
  padding: 0 4px !important;  
}

.nav-button.active {
  background-color: rgba(0, 0, 0, 0.08) !important;
}

.button-text {
  margin-top: 1px; 
  font-size: 13px;  
  font-weight: 500;
  letter-spacing: 0.2px;
  transition: color 0.2s ease;
}

.scan-button-container {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}



.scan-button {
  position: absolute !important;
  width: 56px !important;
  height: 56px !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  top: 50% !important;
  color: #526E48 !important;
  background-color: white !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  z-index: 101;
}

.scan-button.nav-active {
  background-color: #526E48 !important;
  box-shadow: 0 6px 12px rgba(82, 110, 72, 0.3) !important;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 0.4;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.7;
  }
}

.scan-button:hover {
  transform: translate(-50%, -65%) scale(1.08) !important;
  box-shadow: 0 4px 8px rgba(82, 110, 72, 0.25) !important;
}

.button-bounce {
  animation: micro-pulse 0.3s ease;
}

@keyframes micro-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* Remove or comment out the micro-bounce animation */
/* @keyframes micro-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-1px); }
} */

@media (max-width: 340px) {
  .button-text {
    display: none; 
  }
  
  .nav-button {
    min-width: 32px !important;
  }
  
  .scan-button {
    width: 48px !important;
    height: 48px !important;
  }
  
  .scan-button-background {
    width: 56px;
    height: 56px;
  }
}

@media (hover: none) {
  .scan-button:hover {
    transform: translateX(-50%) translateY(-50%) scale(1) !important;
  }
}

.nav-active {
  background-color: #526E48 !important;
  color: white !important;
  transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.nav-active .v-icon,
.nav-active .button-text {
  color: white !important;
}

.nav-active .v-icon {
  transform: translateY(-4px) !important;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}

.nav-button, .scan-button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.nav-button:hover {
  box-shadow: 0 2px 4px rgba(82, 110, 72, 0.1) !important;
}

.scan-button:hover {
  box-shadow: 0 2px 4px rgba(82, 110, 72, 0.1) !important;
}

.scan-button.nav-active .v-icon {
  color: white !important;
  transform: translateY(-4px) !important;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}

.v-icon {
  transform: translateY(0);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}
</style>