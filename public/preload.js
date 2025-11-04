const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  habits: {
    getAll: () => ipcRenderer.invoke('habits:getAll'),
    getWithTodayStatus: () => ipcRenderer.invoke('habits:getWithTodayStatus'),
    getById: (id) => ipcRenderer.invoke('habits:getById', id),
    create: (habitData) => ipcRenderer.invoke('habits:create', habitData),
    update: (id, updates) => ipcRenderer.invoke('habits:update', id, updates),
    delete: (id) => ipcRenderer.invoke('habits:delete', id),
    checkin: (checkinData) => ipcRenderer.invoke('habits:checkin', checkinData),
    getCheckins: (habitId, startDate, endDate) => ipcRenderer.invoke('habits:getCheckins', habitId, startDate, endDate),
    getTodaysCheckins: () => ipcRenderer.invoke('habits:getTodaysCheckins'),
    getStats: (habitId, days) => ipcRenderer.invoke('habits:getStats', habitId, days),
    getStreak: (habitId) => ipcRenderer.invoke('habits:getStreak', habitId),
  },
  database: {
    getAllTasks: () => ipcRenderer.invoke('database:getAllTasks'),
    createTask: (task) => ipcRenderer.invoke('database:createTask', task),
    updateTask: (id, updates) => ipcRenderer.invoke('database:updateTask', id, updates),
    deleteTask: (id) => ipcRenderer.invoke('database:deleteTask', id),
    getSetting: (key) => ipcRenderer.invoke('database:getSetting', key),
    setSetting: (key, value) => ipcRenderer.invoke('database:setSetting', key, value),
  }
});