const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const database = require('./electron/db/database');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // Disable direct Node.js integration for security
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      // Preload script exposes a safe, limited API to renderer
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize database when app is ready
app.whenReady().then(() => {
  // Database is auto-initialized when required
  createWindow();
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    database.close();
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers for database operations
ipcMain.handle('database:getAllTasks', async () => {
  try {
    return database.getAllTasks();
  } catch (error) {
    console.error('Error getting tasks:', error);
    throw error;
  }
});

ipcMain.handle('database:createTask', async (event, task) => {
  try {
    return database.createTask(task);
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
});

ipcMain.handle('database:updateTask', async (event, id, updates) => {
  try {
    return database.updateTask(id, updates);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
});

ipcMain.handle('database:deleteTask', async (event, id) => {
  try {
    return database.deleteTask(id);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
});

ipcMain.handle('database:getSetting', async (event, key) => {
  try {
    return database.getSetting(key);
  } catch (error) {
    console.error('Error getting setting:', error);
    throw error;
  }
});

ipcMain.handle('database:setSetting', async (event, key, value) => {
  try {
    return database.setSetting(key, value);
  } catch (error) {
    console.error('Error setting setting:', error);
    throw error;
  }
});