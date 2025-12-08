const { app, BrowserWindow, ipcMain } = require("electron");
const url = require("url");
const path = require("path");
const { initDatabase, getAllExpenses, addExpense, updateExpense, deleteExpense, getExpensesByMonth } = require('./database');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 750,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        autoHideMenuBar: true,
    });

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, `/dist/spend-wise/browser/index.html`),
            protocol: "file:",
            slashes: true,
        })
    );

    mainWindow.on("closed", function () {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
  initDatabase();
  createWindow();
  
  // IPC Handlers
  ipcMain.handle('db:getAllExpenses', async () => {
    return getAllExpenses();
  });

  ipcMain.handle('db:addExpense', async (event, expense) => {
    return addExpense(expense);
  });

  ipcMain.handle('db:updateExpense', async (event, id, expense) => {
    return updateExpense(id, expense);
  });

  ipcMain.handle('db:deleteExpense', async (event, id) => {
    return deleteExpense(id);
  });

  ipcMain.handle('db:getExpensesByMonth', async (event, year, month) => {
    return getExpensesByMonth(year, month);
  });
});

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
    if (mainWindow === null) createWindow();
});
