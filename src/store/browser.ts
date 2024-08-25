import { defineStore } from 'pinia';

export interface Tab {
  id: number;
  url: string;
  history: string[];
  historyIndex: number;
  title: string;
  favicon: string;
}

export const useBrowserStore = defineStore('browser', {
  state: () => ({
    tabs: [] as Tab[],
    activeTabId: 1,
    nextTabId: 1,
  }),
  getters: {
    activeTab(state) {
      return state.tabs.find(tab => tab.id === state.activeTabId);
    },
  },
  actions: {
    addTab(url: string, title: string) {
      this.tabs.push({
        id: this.nextTabId++,
        url,
        history: [url],
        historyIndex: 0,
        title,
        favicon: '',
      });

      this.activeTabId = this.nextTabId - 1;
      window.electron.ipcRenderer.send('create-new-tab', { id: this.activeTabId, url });
    },
    removeTab(id: number) {
      const index = this.tabs.findIndex(tab => tab.id === id);

      if (index !== -1) {
        this.tabs.splice(index, 1);
        if (this.activeTabId === id && this.tabs.length > 0) {
          this.activeTabId = this.tabs[0].id;
        }

        window.electron.ipcRenderer.send('close-tab', id);

        if (this.tabs.length === 0) {
          window.electron.ipcRenderer.send('close-app');
        } else {
          const newActiveTab = this.tabs[index - 1] || this.tabs[0];
          this.setActiveTab(newActiveTab.id);
        }
      }
    },
    setActiveTab(id: number) {
      this.activeTabId = id;
      const tab = this.tabs.find((tab) => tab.id === id);

      if (tab) {
        window.electron.ipcRenderer.send('activate-tab', id);

        window.electron.ipcRenderer.on(`tab-title-updated-${id}`, ({ id, title }) => {
          this.updateTabTitle(id, title);
        });

        window.electron.ipcRenderer.on(`tab-favicon-updated-${id}`, (favicon: string) => {
          this.updateTabFavicon(id, favicon);
        });
      }
    },
    navigateToUrl(id: number, url: string) {
      const tab = this.tabs.find(tab => tab.id === id);

      if (tab) {
        tab.history = [...tab.history.slice(0, tab.historyIndex + 1), url];
        tab.historyIndex++;
        tab.url = url;

        window.electron.ipcRenderer.send('navigate-to-url', { id, url });

        window.electron.ipcRenderer.on(`tab-title-updated-${id}`, ({ id, title }) => {
          this.updateTabTitle(id, title);
        });

        window.electron.ipcRenderer.on(`tab-favicon-updated-${id}`, (favicon: string) => {
          this.updateTabFavicon(id, favicon);
        });
      }
    },
    updateTabUrl(id: number, url: string) {
      const tab = this.tabs.find((tab) => tab.id === id);

      if (tab) {
        if (tab.url !== url) {
          tab.history = [...tab.history.slice(0, tab.historyIndex + 1), url];
          tab.historyIndex = tab.history.length - 1;
          tab.url = url;
        }
      }
    },
    updateTabTitle(id: number, title: string) {
      const tab = this.tabs.find(tab => tab.id === id);
      if (tab) {
        tab.title = title;
      }
    },
    updateTabFavicon(id: number, favicon: string) {
      const tab = this.tabs.find(tab => tab.id === id);
      if (tab) {
        tab.favicon = favicon;
      }
    },
    reloadTab(id: number) {
      const tab = this.tabs.find(tab => tab.id === id);

      if (tab) {
        window.electron.ipcRenderer.send('reload-tab', id);
      }
    },
    goBack(id: number) {
      const tab = this.tabs.find(tab => tab.id === id);

      if (tab && tab.historyIndex > 0) {
        tab.historyIndex--;
        tab.url = tab.history[tab.historyIndex];

        window.electron.ipcRenderer.send('go-back', id);
      }
    },
    goForward(id: number) {
      const tab = this.tabs.find(tab => tab.id === id);

      if (tab && tab.historyIndex < tab.history.length - 1) {
        tab.historyIndex++;
        tab.url = tab.history[tab.historyIndex];

        window.electron.ipcRenderer.send('go-forward', id);
      }
    },
    minimizeWindow() {
      window.electron.ipcRenderer.send('minimize-window');
    },
    toggleFullScreenWindow() {
      window.electron.ipcRenderer.send('toggle-fullscreen-window');
    },
    closeWindow() {
      window.electron.ipcRenderer.send('close-window');
    },
  },
});
