
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Import backend services
const searchEngine = require('../backend/node/search/searchEngine.js');
const pythonBridge = require('../backend/node/pythonBridge.js');

async function loadBackend() {
  console.log('Backend services loaded via CommonJS');
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: '学术论文检索系统',
    icon: path.join(__dirname, '../public/icon.png'),
    show: false,
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await loadBackend();
  createWindow();

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

// IPC Handlers
ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'PDF 文件', extensions: ['pdf'] },
      { name: '所有文件', extensions: ['*'] },
    ],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePaths = result.filePaths.slice(0, 5);
    return filePaths;
  }
  return [];
});

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    return {
      success: true,
      data: buffer,
      fileName: path.basename(filePath),
      filePath: filePath,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-file', async (event, { defaultPath, content }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath,
    filters: [
      { name: 'CSV 文件', extensions: ['csv'] },
      { name: '所有文件', extensions: ['*'] },
    ],
  });

  if (!result.canceled && result.filePath) {
    try {
      fs.writeFileSync(result.filePath, content);
      return { success: true, path: result.filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false };
});

// New IPC Handlers for Search and Parsing
ipcMain.handle('parse-pdf', async (event, filePath) => {
  if (!pythonBridge) return { success: false, error: 'Backend not loaded' };
  try {
    return await pythonBridge.parsePDF(filePath);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('search-papers', async (event, { referencePapers, options }) => {
  if (!searchEngine) return { success: false, error: 'Backend not loaded' };
  try {
    return await searchEngine.searchWithReferences(referencePapers, options);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('translate-text', async (event, { text, target }) => {
  if (!pythonBridge) return { success: false, error: 'Backend not loaded' };
  try {
    return await pythonBridge.translateText(text, target);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Export papers handler
ipcMain.handle('export-papers', async (event, { papers, format }) => {
  try {
    const ExportService = require(path.join(__dirname, '../backend/node/services/ExportService.js'));
    const content = ExportService.export(papers, format);
    const extension = ExportService.getFileExtension(format);

    return {
      success: true,
      content,
      extension,
    };
  } catch (error) {
    console.error('[Main] Export error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
});
