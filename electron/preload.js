const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    selectFiles: () => ipcRenderer.invoke('select-files'),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    saveFile: (data) => ipcRenderer.invoke('save-file', data),
    parsePDF: (filePath) => ipcRenderer.invoke('parse-pdf', filePath),
    searchPapers: (data) => ipcRenderer.invoke('search-papers', data),
    translateText: (data) => ipcRenderer.invoke('translate-text', data),
    exportPapers: (data) => ipcRenderer.invoke('export-papers', data),
});
