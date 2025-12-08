const Database = require('better-sqlite3');
const { app } = require('electron');
const path = require('path');

const dbPath = path.join(app.getPath('userData'), 'expenses.db');
const db = new Database(dbPath);

// Initialize database schema
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      dueDate TEXT,
      recurring INTEGER DEFAULT 0,
      status TEXT DEFAULT 'unpaid',
      remindBeforeDays INTEGER DEFAULT 1,
      numOccurrences INTEGER,
      endDate TEXT
    )
  `);
  
  console.log('Database initialized at:', dbPath);
}

// CRUD Operations
function getAllExpenses() {
  try {
    return db.prepare('SELECT * FROM expenses').all();
  } catch (error) {
    console.error('Error getting all expenses:', error);
    return [];
  }
}

function addExpense(expense) {
  try {
    const stmt = db.prepare(`
      INSERT INTO expenses (name, description, amount, category, date, dueDate, recurring, status, remindBeforeDays, numOccurrences, endDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      expense.name,
      expense.description || '',
      expense.amount,
      expense.category,
      expense.date,
      expense.dueDate || null,
      expense.recurring ? 1 : 0,
      expense.status || 'unpaid',
      expense.remindBeforeDays || 1,
      expense.numOccurrences || null,
      expense.endDate || null
    );
    
    return result.lastInsertRowid;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
}

function updateExpense(id, expense) {
  try {
    const stmt = db.prepare(`
      UPDATE expenses 
      SET name = ?, description = ?, amount = ?, category = ?, date = ?, dueDate = ?, recurring = ?, status = ?, remindBeforeDays = ?, numOccurrences = ?, endDate = ?
      WHERE id = ?
    `);
    
    return stmt.run(
      expense.name,
      expense.description || '',
      expense.amount,
      expense.category,
      expense.date,
      expense.dueDate || null,
      expense.recurring ? 1 : 0,
      expense.status || 'unpaid',
      expense.remindBeforeDays || 1,
      expense.numOccurrences || null,
      expense.endDate || null,
      id
    );
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
}

function deleteExpense(id) {
  try {
    return db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
}

function getExpensesByMonth(year, month) {
  try {
    // Month should be 1-12, pad to 2 digits
    const monthStr = month.toString().padStart(2, '0');
    
    return db.prepare(`
      SELECT * FROM expenses 
      WHERE strftime('%Y', COALESCE(dueDate, date)) = ? 
      AND strftime('%m', COALESCE(dueDate, date)) = ?
    `).all(year.toString(), monthStr);
  } catch (error) {
    console.error('Error getting expenses by month:', error);
    return [];
  }
}

module.exports = {
  initDatabase,
  getAllExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpensesByMonth
};