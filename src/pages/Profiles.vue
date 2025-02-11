<template>
  <LayoutWrapper>
    <template #content>
      <div
        v-if="loading"
        class="d-flex justify-center align-center"
        style="height: 100vh"
      >
        <v-progress-circular indeterminate></v-progress-circular>
      </div>

      <div
        v-else-if="error"
        class="d-flex justify-center align-center"
        style="height: 100vh"
      >
        <v-alert type="error" title="Error" :text="error.message"></v-alert>
      </div>
      <div class="profile-page">
        <div class="profile-header">
          <v-img
            :src="profileBackground"
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
                  <v-img :src="profileImage" cover>
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
              <v-list-item>
             <!--  <v-list-item v-for="scan in recentScans" :key="scan.id"> -->
                <v-list-item-title><!-- {{ scan.pestType }} --></v-list-item-title>
                <v-list-item-subtitle><!-- {{ scan.date }} --></v-list-item-subtitle>
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

      <v-dialog v-model="dialog" persistent max-width="500px">
        <v-card>
          <v-card-title>Edit Profile</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="username"
              prepend-inner-icon="mdi-account-outline"
              label="Username"
              variant="outlined"
            ></v-text-field>
            <v-file-input
              label="Profile Picture"
              accept="image/*"
              @change="uploadProfileImage"
            ></v-file-input>
            <v-file-input
              label="Background Image"
              accept="image/*"
              @change="uploadBackgroundImage"
            ></v-file-input>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey" variant="text" @click="dialog = false"
              >Cancel</v-btn
            >
            <v-btn
              color="primary"
              variant="text"
              @click="saveProfile"
              :loading="saving"
              >Save</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </LayoutWrapper>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import LayoutWrapper from "@/layouts/LayoutWrapper.vue";
import { useUserData, supabase } from "@/stores/authUser";

const { user, loading, error, refresh } = useUserData();

// Local state
const dialog = ref(false);
const saving = ref(false);
const activeTab = ref("scans");
const recentScans = ref([]);
const stats = ref([
  { label: "Scans", value: "5" },
  { label: "Reports", value: "0" },
  { label: "Saved", value: "0" },
]);
const username = ref("");
const email = ref("");
const profileImage = ref("https://randomuser.me/api/portraits/lego/1.jpg");
const profileBackground = ref("https://randomuser.me/api/portraits/men/91.jpg");

// Fetch user data
const fetchUserInfo = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;
    if (!user) throw new Error("User not authenticated");

    email.value = user.email || "";
    await fetchUserProfile(user.id);
  } catch (error) {
    console.error("Error fetching user:", error);
  } finally {
    loading.value = false;
  }
};

const fetchUserProfile = async (userId: string) => {
  if (!userId) return;

  const { data, error } = await supabase
    .from("users")
    .select("username, profile_image, profile_background") 
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
  } else if (data) {
    username.value = data.username || "";
    profileImage.value = data.profile_image || profileImage.value;
    profileBackground.value =
      data.profile_background || profileBackground.value;
  }
};

const uploadImage = async (file: File, path: string, userId: string) => {
  if (!file || !userId) return null;

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from("profiles")
      .upload(filePath, file, {
        upsert: true,
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return null;
    }

    const { data } = await supabase.storage.from("profiles").getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error("Error in upload process:", error);
    return null;
  }
};

const uploadProfileImage = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return;

  const url = await uploadImage(input.files[0], "avatars", authUser.id);
  if (url && user.value) {
    users.value.profile_image = url; 
  }
};

const uploadBackgroundImage = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return;

  const url = await uploadImage(input.files[0], "backgrounds", authUser.id);
  if (url && user.value) {
    user.value.profile_background = url; // Update the user object
  }
};

const saveProfile = async () => {
  if (!user.value?.id) return;

  saving.value = true;
  try {
    console.log("Updating profile with:", {
      username: user.value.username,
      profile_image: user.value.profile_image,
      profile_background: user.value.profile_background,
    });

    const { error: updateError } = await supabase
      .from("users")
      .update({
        username: user.value.username,
        profile_image: user.value.profile_image,
        profile_background: user.value.profile_background,
      })
      .eq("user_id", user.value.id);

    if (updateError) throw updateError;

    dialog.value = false;
    await refresh();
  } catch (e) {
    console.error("Error updating profile:", e);
  } finally {
    saving.value = false;
  }
};

onMounted(fetchUserInfo);
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
