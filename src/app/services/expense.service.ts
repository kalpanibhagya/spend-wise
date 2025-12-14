import { Injectable } from '@angular/core';
import { Expense } from '../models/expense';

declare global {
  interface Window {
    electronAPI: {
      getAllExpenses: () => Promise<any[]>;
      addExpense: (expense: any) => Promise<number>;
      updateExpense: (id: number, expense: any) => Promise<any>;
      deleteExpense: (id: number) => Promise<any>;
      getExpensesByMonth: (year: number, month: number) => Promise<any[]>;
      deleteExpensesByMonth: (year: number, month: number) => Promise<number>;
      deleteExpensesByYear: (year: number) => Promise<number>;
      exportExpenses: (options: { scope: 'all'|'month'|'year', year?: number, month?: number }) => Promise<string | null>;
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  
  async getAllExpenses(): Promise<Expense[]> {
    const expenses = await window.electronAPI.getAllExpenses();
    return this.mapDbToExpense(expenses);
  }

  async addExpense(expense: Expense): Promise<number> {
    const dbExpense = this.mapExpenseToDb(expense);
    return await window.electronAPI.addExpense(dbExpense);
  }

  async updateExpense(id: number, expense: Expense): Promise<void> {
    const dbExpense = this.mapExpenseToDb(expense);
    await window.electronAPI.updateExpense(id, dbExpense);
  }

  async deleteExpense(id: number): Promise<void> {
    await window.electronAPI.deleteExpense(id);
  }

  async deleteExpensesByMonth(year: number, month: number): Promise<number> {
    return await window.electronAPI.deleteExpensesByMonth(year, month);
  }

  async deleteExpensesByYear(year: number): Promise<number> {
    return await window.electronAPI.deleteExpensesByYear(year);
  }

  async exportExpenses(options: { scope: 'all'|'month'|'year', year?: number, month?: number }): Promise<string | null> {
    return await window.electronAPI.exportExpenses(options);
  }

  async getExpensesByMonth(year: number, month: number): Promise<Expense[]> {
    const expenses = await window.electronAPI.getExpensesByMonth(year, month);
    return this.mapDbToExpense(expenses);
  }

  private mapDbToExpense(dbExpenses: any[]): Expense[] {
    return dbExpenses.map(exp => ({
      id: exp.id,
      name: exp.name,
      description: exp.description,
      amount: exp.amount,
      category: exp.category,
      date: new Date(exp.date),
      dueDate: exp.dueDate ? new Date(exp.dueDate) : undefined,
      recurring: Boolean(exp.recurring),
      status: exp.status,
      remindBeforeDays: exp.remindBeforeDays,
      numOccurrences: exp.numOccurrences,
      endDate: exp.endDate ? new Date(exp.endDate) : undefined
    }));
  }

  private mapExpenseToDb(expense: Expense): any {
    // Helper to safely convert to ISO string
    const toISOStringOrNull = (date: any): string | null => {
      if (!date) return null;
      
      // If it's already a string, return it
      if (typeof date === 'string') return date;
      
      // Convert to Date if needed
      const dateObj = date instanceof Date ? date : new Date(date);
      
      // Check if valid date
      if (isNaN(dateObj.getTime())) {
        console.error('Invalid date:', date);
        return null;
      }
      
      return dateObj.toISOString();
    };

    return {
      name: expense.name,
      description: expense.description || '',
      amount: expense.amount,
      category: expense.category,
      date: toISOStringOrNull(expense.date) || new Date().toISOString(),
      dueDate: toISOStringOrNull(expense.dueDate),
      recurring: expense.recurring ? 1 : 0,
      status: expense.status || 'unpaid',
      remindBeforeDays: expense.remindBeforeDays || 1,
      numOccurrences: expense.numOccurrences || null,
      endDate: toISOStringOrNull(expense.endDate)
    };
  }
}