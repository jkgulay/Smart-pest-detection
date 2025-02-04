<template>
  <div id="background">
    <v-container>
      <v-row class="mb-10">
        <v-col cols="12" lg="8">
          <h1 class="text mx-auto">To detect and identify plant pests</h1>
        </v-col>
      </v-row>
    </v-container>

    <v-container style="margin-top: 200px;">
      <v-row justify="center">
        <v-btn class="button-background mt-4" rounded="lg" color="black">
          <span class="button">Sign In</span>
        </v-btn>
      </v-row>
      <v-row justify="center">
        <RouterLink to="RegisterView" style="text-decoration: none" class="mt-1"
          ><span class="router">Create an Account</span></RouterLink
        >
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts" setup></script>

<style>
#background {
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
  font-size: 55px;
  color: #ffffff;
  margin-top: 50px;
}

.button {
  font-family: "Roboto", sans-serif !important;
  font-weight: 500;
  font-size: 20px;
  color: #ffffff;
  text-transform: none !important;
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
