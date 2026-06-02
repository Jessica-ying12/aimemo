import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { initDatabase, closeDatabase } from './services/database';
import { initConfig } from './services/config';
import { registerIpcHandlers } from './ipc-handlers';
import { setupCollectors } from './services/collector/setup';
import { collectorManager } from './services/collector/manager';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
  });

  const rendererUrl = process.env['ELECTRON_RENDERER_URL'];
  if (rendererUrl) {
    mainWindow.loadURL(rendererUrl);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  const userData = app.getPath('userData');
  const dbPath = join(userData, 'data', 'aimemo.db');
  const configPath = join(userData, 'config.json');

  initConfig(configPath);
  initDatabase(dbPath);
  setupCollectors();
  registerIpcHandlers();
  createWindow();

  setTimeout(() => {
    collectorManager.start();
  }, 3000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  collectorManager.stop();
  closeDatabase();
});
