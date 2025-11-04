const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  database: {
    getAllTasks: () => ipcRenderer.invoke('database:getAllTasks'),
    createTask: (task) => ipcRenderer.invoke('database:createTask', task),
    updateTask: (id, updates) => ipcRenderer.invoke('database:updateTask', id, updates),
    deleteTask: (id) => ipcRenderer.invoke('database:deleteTask', id),
    getSetting: (key) => ipcRenderer.invoke('database:getSetting', key),
    setSetting: (key, value) => ipcRenderer.invoke('database:setSetting', key, value),
  }
});