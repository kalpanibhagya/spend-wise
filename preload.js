const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAllExpenses: () => ipcRenderer.invoke('db:getAllExpenses'),
  addExpense: (expense) => ipcRenderer.invoke('db:addExpense', expense),
  updateExpense: (id, expense) => ipcRenderer.invoke('db:updateExpense', id, expense),
  deleteExpense: (id) => ipcRenderer.invoke('db:deleteExpense', id),
  getExpensesByMonth: (year, month) => ipcRenderer.invoke('db:getExpensesByMonth', year, month)
});