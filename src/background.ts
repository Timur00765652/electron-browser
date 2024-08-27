import { app, protocol, BrowserWindow, BrowserView, ipcMain } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import path from 'path';

let mainWindow: BrowserWindow;
let views: { id: number, view: BrowserView }[] = [];

protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minHeight: 700,
    minWidth: 768,
    useContentSize: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    createProtocol('app');
    mainWindow.loadURL('app://./index.html');
  }
}

function createBrowserView(id: number, url: string) {
  const view = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.addBrowserView(view);

  view.webContents.loadURL(url);
  views.push({ id, view });

  view.webContents.on('did-navigate', (event: Event, newUrl: string) => {
    mainWindow.webContents.send(`tab-navigated-${id}`, newUrl);
  });

  view.webContents.on('did-navigate-in-page', (event: Event, newUrl: string) => {
    mainWindow.webContents.send(`tab-navigated-${id}`, { id, newUrl });
  });

  view.webContents.on('page-title-updated', (event: Event, title: string) => {
    mainWindow.webContents.send(`tab-title-updated-${id}`, { id, title });
  });

  view.webContents.on('page-favicon-updated', (event: Event, favicons: string[]) => {
    if (favicons.length > 0) {
      mainWindow.webContents.send(`tab-favicon-updated-${id}`, favicons[0]);
    }
  });

  mainWindow.removeAllListeners('resize');
  mainWindow.removeAllListeners('enter-full-screen');
  mainWindow.removeAllListeners('leave-full-screen');
  mainWindow.webContents.removeAllListeners('devtools-opened');
  mainWindow.webContents.removeAllListeners('devtools-closed');

  mainWindow.on('resize', () => {
    updateAllBrowserViewsSize();
  });

  mainWindow.webContents.on('devtools-opened', () => {
    updateAllBrowserViewsSize();
  });

  mainWindow.webContents.on('devtools-closed', () => {
    updateAllBrowserViewsSize();
  });

  mainWindow.on('enter-full-screen', () => {
    updateAllBrowserViewsSize();
  });

  mainWindow.on('leave-full-screen', () => {
    updateAllBrowserViewsSize();
  });

  updateAllBrowserViewsSize();
}

function updateAllBrowserViewsSize() {
  const bounds = mainWindow.getContentBounds();
  const heightOffset = 100;

  views.forEach(({ view }) => {
    view.setBounds({
      x: 0,
      y: heightOffset,
      width: bounds.width,
      height: bounds.height - heightOffset,
    });
  });
}

function setupListeners() {
  ipcMain.removeAllListeners('create-new-tab');
  ipcMain.removeAllListeners('activate-tab');
  ipcMain.removeAllListeners('close-tab');
  ipcMain.removeAllListeners('navigate-to-url');
  ipcMain.removeAllListeners('reload-tab');
  ipcMain.removeAllListeners('go-back');
  ipcMain.removeAllListeners('go-forward');
  ipcMain.removeAllListeners('minimize-window');
  ipcMain.removeAllListeners('toggle-fullscreen-window');
  ipcMain.removeAllListeners('close-window');
  ipcMain.removeAllListeners('close-app');

  ipcMain.on('create-new-tab', (event, { id, url }: { id: number, url: string }) => {
    createBrowserView(id, url);
  });

  ipcMain.on('activate-tab', (event, id: number) => {
    const view = views.find((v) => v.id === id);
    if (view) {
      mainWindow.setBrowserView(view.view);
      updateAllBrowserViewsSize();
    }
  });

  ipcMain.on('close-tab', (event, id: number) => {
    const view = views.find(v => v.id === id);
    if (view) {
      mainWindow.removeBrowserView(view.view);
      (view.view.webContents as any).destroy();
      views = views.filter(v => v.id !== id);
    }
  });

  ipcMain.on('navigate-to-url', (event, { id, url }: { id: number, url: string }) => {
    const view = views.find((v) => v.id === id);
    if (view) {
      view.view.webContents.loadURL(url);
    }
  });

  ipcMain.on('reload-tab', (event, id: number) => {
    const view = views.find(v => v.id === id);

    if (view) {
      view.view.webContents.reload();
    }
  });

  ipcMain.on('go-back', (event, id: number) => {
    const view = views.find(v => v.id === id);

    if (view && view.view.webContents.canGoBack()) {
      view.view.webContents.goBack();
    }
  });

  ipcMain.on('go-forward', (event, id: number) => {
    const view = views.find(v => v.id === id);

    if (view && view.view.webContents.canGoForward()) {
      view.view.webContents.goForward();
    }
  });

  ipcMain.on('minimize-window', () => {
    mainWindow.minimize();
  });

  ipcMain.on('toggle-fullscreen-window', () => {
    const isFullScreen = mainWindow.isFullScreen();
    mainWindow.setFullScreen(!isFullScreen);
  });

  ipcMain.on('close-window', () => {
    mainWindow.close();
  });

  ipcMain.on('close-app', () => {
    app.quit();
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('ready', () => {
  createWindow();
  setupListeners();
});

