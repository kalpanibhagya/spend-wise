const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const url = require("url");
const path = require("path");
const { initDatabase, getAllExpenses, addExpense, updateExpense, deleteExpense, getExpensesByMonth, deleteExpensesByMonth, deleteExpensesByYear } = require('./database');
const fs = require('fs');

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
  
  ipcMain.handle('db:deleteExpensesByMonth', async (event, year, month) => {
    return deleteExpensesByMonth(year, month);
  });

  ipcMain.handle('db:deleteExpensesByYear', async (event, year) => {
    return deleteExpensesByYear(year);
  });

  ipcMain.handle('db:exportExpenses', async (event, options) => {
    // options: { scope: 'all'|'month'|'year', year?: number, month?: number }
    try {
      let data = [];
      if (options.scope === 'all') {
        data = getAllExpenses();
      } else if (options.scope === 'year') {
        // Reuse month query across 12 months
        const year = options.year;
        for (let m = 1; m <= 12; m++) {
          const rows = getExpensesByMonth(year, m);
          data = data.concat(rows);
        }
      } else if (options.scope === 'month') {
        data = getExpensesByMonth(options.year, options.month);
      } else {
        throw new Error('Invalid export scope');
      }

      // CSV header
      const header = ['id','name','description','amount','category','date','dueDate','recurring','status','remindBeforeDays','numOccurrences','endDate'];

      const csvRows = [header.join(',')];

      for (const r of data) {
        const row = header.map(h => {
          let val = r[h] === null || r[h] === undefined ? '' : String(r[h]);
          // Escape quotes
          val = '"' + val.replace(/"/g, '""') + '"';
          return val;
        }).join(',');
        csvRows.push(row);
      }

      const defaultName = options.scope === 'all' ? `spendwise-export-all-${new Date().toISOString().slice(0,10)}.csv` : (options.scope === 'year' ? `spendwise-export-${options.year}.csv` : `spendwise-export-${options.year}-${String(options.month).padStart(2,'0')}.csv`);

      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Export expenses',
        defaultPath: defaultName,
        filters: [ { name: 'CSV', extensions: ['csv'] } ]
      });

      if (canceled || !filePath) return null;

      fs.writeFileSync(filePath, csvRows.join('\n'), 'utf8');
      return filePath;
    } catch (error) {
      console.error('Error exporting expenses:', error);
      throw error;
    }
  });
});

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
    if (mainWindow === null) createWindow();
});
