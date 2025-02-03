/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'
import "vue-toastification/dist/index.css";
import { IonicVue } from '@ionic/vue';

// Components
import App from './App.vue'
import router from './router';

// Composables
import { createApp } from 'vue'

const app = createApp(App).use(IonicVue).use(router);

app.config.warnHandler = () => {};

registerPlugins(app)

router.isReady().then(() => {
  app.mount('#app');
});
