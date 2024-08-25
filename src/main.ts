import { createApp } from 'vue';
import '@/assets/styles/global.scss';
import App from './App.vue';
import { createPinia } from 'pinia';

createApp(App).use(createPinia()).mount('#app')
