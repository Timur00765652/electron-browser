<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useBrowserStore } from '@/store/browser';
import TabItem from "@/components/TabItem.vue";
import OmniboxPanel from "@/components/OmniboxPanel.vue";
import {searchEngines} from "@/assets/constants/searchEngines";
import CloseIcon from "@/components/icons/CloseIcon.vue";
import CloseFullScreenIconComponent from '@/components/icons/CloseFullScreenIcon.vue';
import FullScreenIconComponent from '@/components/icons/FullScreenIcon.vue';
import HideIcon from "@/components/icons/HideIcon.vue";
import PlusIcon from "@/components/icons/PlusIcon.vue";
import DefaultFavicon from "@/components/icons/DefaultFavicon.vue";

const browserStore = useBrowserStore();

const toggleFullScreen = ref(false);

const tabs = computed(() => browserStore.tabs);
const activeTabId = computed(() => browserStore.activeTabId);
const activeTab = computed(() => browserStore.activeTab);
const activeTabUrl = computed({
  get() {
    return activeTab.value?.url || '';
  },
  set(value: string) {
    if (activeTab.value) {
      activeTab.value.url = value;
    }
  }
});
const currentFullScreenIcon = computed(() => {
  return toggleFullScreen.value ? CloseFullScreenIconComponent : FullScreenIconComponent;
});

onMounted(() => {
  createNewTab();
  updateTabUrl();
});

const createNewTab = () => {
  browserStore.addTab(searchEngines.google, 'New tab');
};

const setActiveTab = (id: number) => {
  browserStore.setActiveTab(id);
};

const removeTab = (id: number) => {
  browserStore.removeTab(id);
};

const goBack = () => {
  if (activeTab.value) {
    browserStore.goBack(activeTab.value.id);
  }
};

const goForward = () => {
  if (activeTab.value) {
    browserStore.goForward(activeTab.value.id);
  }
};

const reloadTab = () => {
  if (activeTab.value) {
    browserStore.reloadTab(activeTab.value.id);
  }
};

const isValidUrl = (value: string): boolean => {
  return value.startsWith('http://') || value.startsWith('https://');
};

const updateTabUrl = () => {
  window.electron.ipcRenderer.on(`tab-navigated-${browserStore.activeTabId}`, ({ id, newUrl }) => {
    if (id === browserStore.activeTabId) {
      browserStore.updateTabUrl(id, newUrl);
    }
  });
};

const navigateToUrl = () => {
  if (activeTab.value) {
    const currentUrl = !isValidUrl(activeTab.value.url)
      ? `${searchEngines.google}/search?q=${encodeURIComponent(activeTab.value.url)}`
      : activeTab.value.url;

    browserStore.navigateToUrl(activeTab.value.id, currentUrl);
    updateTabUrl();
  }
};

const minimizeWindow = () => {
  browserStore.minimizeWindow();
};

const toggleFullScreenWindow = () => {
  toggleFullScreen.value = !toggleFullScreen.value;
  browserStore.toggleFullScreenWindow();
};

const closeWindow = () => {
  browserStore.closeWindow();
};
</script>

<template>
  <header class="flex items-center w-full justify-between relative">
    <div class="drag-area absolute w-full h-full"/>

    <div class="tabs flex z-10">
      <ul class="flex flex-row flex-wrap pt-2 px-2">
        <TabItem
          v-for="tab in tabs"
          :key="tab.id"
          :title="`${tab.title}: ${tab.url}`"
          :activeClass="tab.id === activeTabId"
          @click="setActiveTab(tab.id)"
        >
          <template #icon>
            <img v-if="tab.favicon" :src="tab.favicon" alt="favicon" class="size-4 min-w-4 mr-2" >
            <DefaultFavicon v-else parent-class="size-4 min-w-4 mr-2 hover:text-active" />
          </template>

          <template #text>
            {{ tab.title }}
          </template>

          <template #button>
            <button class="min-w-4 hover:text-active ml-auto mr-1" @click.stop="removeTab(tab.id)">
              <CloseIcon parent-class="size-4 cursor-pointer hover:text-active" />
            </button>
          </template>
        </TabItem>
      </ul>

      <button class="pt-2 min-w-5" @click="createNewTab">
        <PlusIcon parent-class="size-5 cursor-pointer hover:text-active" />
      </button>
    </div>

    <div class="flex gap-2 px-3 z-10 controls">
      <button class="max-h-4 mt-auto" @click="minimizeWindow">
        <HideIcon parent-class="size-5 cursor-pointer min-w-5 hover:text-active" />
      </button>

      <button @click="toggleFullScreenWindow">
        <component :is="currentFullScreenIcon" parent-class="size-5 cursor-pointer min-w-5 hover:text-active"/>
      </button>

      <button @click="closeWindow">
        <CloseIcon parent-class="size-5 cursor-pointer min-w-5 hover:text-active" />
      </button>
    </div>
  </header>

  <main class="p-2 bg-secondary">
    <OmniboxPanel
      v-model="activeTabUrl"
      class="pb-2"
      @enter="navigateToUrl"
      @reload-tab="reloadTab"
      @previous-tab="goBack"
      @next-tab="goForward"
    />
  </main>
</template>

<style lang="scss">
header {
  .tabs, .controls {
    -webkit-app-region: no-drag;
  }
  .drag-area {
    -webkit-app-region: drag;
  }
}
</style>