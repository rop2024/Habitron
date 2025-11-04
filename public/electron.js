const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const database = require('./electron/db/database');
const habitManager = require('./electron/managers/HabitManager');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
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

// Habit IPC Handlers
ipcMain.handle('habits:getAll', async () => {
  try {
    return habitManager.getAllHabits();
  } catch (error) {
    console.error('Error getting all habits:', error);
    throw error;
  }
});

ipcMain.handle('habits:getWithTodayStatus', async () => {
  try {
    return habitManager.getHabitsWithTodayStatus();
  } catch (error) {
    console.error('Error getting habits with today status:', error);
    throw error;
  }
});

ipcMain.handle('habits:getById', async (event, id) => {
  try {
    return habitManager.getHabitById(id);
  } catch (error) {
    console.error('Error getting habit by id:', error);
    throw error;
  }
});

ipcMain.handle('habits:create', async (event, habitData) => {
  try {
    return habitManager.addHabit(habitData);
  } catch (error) {
    console.error('Error creating habit:', error);
    throw error;
  }
});

ipcMain.handle('habits:update', async (event, id, updates) => {
  try {
    return habitManager.updateHabit(id, updates);
  } catch (error) {
    console.error('Error updating habit:', error);
    throw error;
  }
});

ipcMain.handle('habits:delete', async (event, id) => {
  try {
    return habitManager.deleteHabit(id);
  } catch (error) {
    console.error('Error deleting habit:', error);
    throw error;
  }
});

ipcMain.handle('habits:checkin', async (event, checkinData) => {
  try {
    return habitManager.addHabitCheckin(checkinData);
  } catch (error) {
    console.error('Error adding habit checkin:', error);
    throw error;
  }
});

ipcMain.handle('habits:getCheckins', async (event, habitId, startDate, endDate) => {
  try {
    return habitManager.getHabitCheckins(habitId, startDate, endDate);
  } catch (error) {
    console.error('Error getting habit checkins:', error);
    throw error;
  }
});

ipcMain.handle('habits:getTodaysCheckins', async () => {
  try {
    return habitManager.getTodaysCheckins();
  } catch (error) {
    console.error('Error getting today\'s checkins:', error);
    throw error;
  }
});

ipcMain.handle('habits:getStats', async (event, habitId, days) => {
  try {
    return habitManager.getHabitStats(habitId, days);
  } catch (error) {
    console.error('Error getting habit stats:', error);
    throw error;
  }
});

ipcMain.handle('habits:getStreak', async (event, habitId) => {
  try {
    return habitManager.getHabitStreak(habitId);
  } catch (error) {
    console.error('Error getting habit streak:', error);
    throw error;
  }
});

// Existing task IPC handlers remain the same...
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