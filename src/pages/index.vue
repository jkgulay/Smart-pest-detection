<template>
  <div id="background">
    <v-container>
      <v-row class="mb-10">
        <v-col cols="12" lg="8">
          <h1 class="text mx-auto">To detect and identify plant pests</h1>
        </v-col>
      </v-row>
    </v-container>

    <space></space>
    <space></space>
    <space></space>
    <space></space>

    <v-row justify="center">
      <v-btn class="button button-background" rounded="lg" color="black">
        Sign In
      </v-btn>
    </v-row>
    <v-row justify="center">
      <RouterLink to="RegisterView" style="text-decoration: none"
        ><span class="router">Create an Account</span></RouterLink
      >
    </v-row>
  </div>
</template>

<script lang="ts" setup></script>

<style>
#background {
  background-image: url("@/assets/background2.jpg"); /* Replace with your image path */
  background-size: cover; /* Cover the entire area */
  background-position: center; /* Center the image */
  background-repeat: no-repeat; /* Prevent the image from repeating */
  height: 100vh; /* Set the height to full viewport height */
  position: relative;
  opacity: 0.7;
  background-color: #9edf9c;
}

.text {
  font-family: "Montserrat", sans-serif !important;
  font-weight: 700;
  font-size: 58px;
  color: #ffffff;
  margin-top: 50px;
}

.button {
  font-family: "Roboto", sans-serif !important;
  font-weight: 500;
  font-size: 250px;
  color: #ffffff;
  text-transform: none !important;
  margin-top: 30px;
}

.router {
  font-family: "Roboto", sans-serif !important;
  font-weight: 400;
  font-size: 15px;
  color: #ffffff;
  text-transform: none !important;
}

.button-background {
  opacity: 0.7;
  width: 296px;
  height: 52px;
}
</style>
