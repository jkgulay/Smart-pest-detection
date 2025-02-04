<template>
  <div id="welcome">
    <v-container>
      <!-- Heading -->
      <v-row class="mb-6 mb-sm-10">
        <v-col cols="12" lg="8" md="10" sm="12">
          <h1 class="text mx-auto text-sm-left">
            To detect and identify plant pests
          </h1>
        </v-col>
      </v-row>
    </v-container>

    <!-- Buttons -->
    <v-container style="margin-top: 29vh">
      <v-row justify="center">
        <v-btn class="button-background mt-4" rounded="lg" color="black">
          <span class="button">Sign In</span>
        </v-btn>
      </v-row>
      <v-row justify="center">
        <RouterLink
          to="RegisterView"
          style="text-decoration: none"
          class="mt-1"
        >
          <span class="router">Create an Account</span>
        </RouterLink>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
</script>

<style>
#welcome {
  background-image: url("@/assets/background2.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 100vh;
  position: relative;
  opacity: 0.7;
  background-color: #9edf9c;
}

.text {
  font-family: "Montserrat", sans-serif !important;
  font-weight: 700;
  font-size: 3rem; /* Responsive font size */
  color: #ffffff;
  margin-top: 50px;
}

.button {
  font-family: "Roboto", sans-serif !important;
  font-weight: 500;
  font-size: 1.25rem; 
  color: #ffffff;
  text-transform: none !important;
}

.router {
  font-family: "Roboto", sans-serif !important;
  font-weight: 400;
  font-size: 1rem; 
  color: #ffffff;
  text-transform: none !important;
}

.button-background {
  opacity: 0.7;
  width: 296px; 
  height: 52px;
}


@media (max-width: 600px) {
  .text {
    font-size: 2.5rem; 
  }
  .button {
    font-size: 1rem; 
  }
  .router {
    font-size: 0.875rem; 
  }
}
</style>