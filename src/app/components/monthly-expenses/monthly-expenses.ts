import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseForm } from '../expense-form/expense-form'; 
import { Expense } from '../../models/expense';

@Component({
  selector: 'app-monthly-expenses',
  imports: [ CommonModule, ExpenseForm ],
  templateUrl: './monthly-expenses.html',
  styleUrl: './monthly-expenses.css',
})
export class MonthlyExpenses {

  showForm = false;
  today: Date = new Date();
  selectedDate: Date = new Date();
  rowSelected: boolean = false;
  // Sample expenses data - later get from datbase/service
  expenses_all: Expense[] = [
    {
      id: 1,
      name: 'Groceries',
      description: 'Monthly food purchase',
      amount: 150,
      category: 'Food',
      date: new Date('2025-11-01'),
      recurring: false,
      status: 'paid'
    },
    {
      id: 2,
      name: 'Electricity Bill',
      description: 'June bill',
      amount: 75,
      category: 'Utilities',
      date: new Date('2025-11-03'),
      recurring: true,
      dueDate: new Date('2025-12-03'),
      remindBeforeDays: 3,
      status: 'unpaid'
    },
    {
      id: 3,
      name: 'Internet Subscription',
      description: 'Monthly subscription plan',
      amount: 50,
      category: 'Utilities',
      date: new Date('2025-12-05'),
      recurring: true,
      dueDate: new Date('2025-12-05'),
      remindBeforeDays: 2,
      status: 'paid'
    }
  ];

  expenses: Expense[] = this.filteredExpenses();

  totalExpenses(): number {
    return this.expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  openAddForm() {
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
  }

  onExpenseAdded(expense: Expense) {
    expense.id = Date.now(); // assign ID dynamically
    expense.name = expense.name;
    expense.category = expense.category;
    expense.amount = expense.amount;
    expense.description = expense.description || '';
    expense.dueDate = expense.dueDate;
    expense.date = new Date(expense.date);
    expense.status = expense.status || 'unpaid';
    expense.recurring = expense.recurring || false;
    expense.remindBeforeDays = expense.remindBeforeDays || 1;
    this.expenses.push(expense);
    if (expense.recurring)  {
      if (expense.numOccurrences || expense.endDate) {
        for (let i = 1; i < (expense.numOccurrences || 12); i++) {
          const nextDate = new Date(expense.dueDate!);
          nextDate.setMonth(nextDate.getMonth() + i);
          if (expense.endDate && nextDate > expense.endDate) break;
          this.expenses.push({
            ...expense,
            id: Date.now() + i,
            dueDate: nextDate
          });
        }
      }
    }
    this.showForm = false;
    this.expenses = this.filteredExpenses();
  }

  updateStatus(expense: Expense) {
    const today = new Date();
    if (!expense.dueDate) return;

    if (expense.dueDate < today && expense.status !== 'paid') {
      expense.status = 'overdue';
    }
  }

  filteredExpenses() {
    return this.expenses_all.filter(exp => {
      const d = new Date(exp.dueDate ?? exp.date);
      return (
        d.getMonth() === this.selectedDate.getMonth() &&
        d.getFullYear() === this.selectedDate.getFullYear()
      );
    });
  }

  prevMonth() {
    this.selectedDate = new Date(
      this.selectedDate.getFullYear(),
      this.selectedDate.getMonth() - 1,
      1
    );
    this.expenses = this.filteredExpenses();
  }

  nextMonth() {
    this.selectedDate = new Date(
      this.selectedDate.getFullYear(),
      this.selectedDate.getMonth() + 1,
      1
    );
    this.expenses = this.filteredExpenses();
  }

}
