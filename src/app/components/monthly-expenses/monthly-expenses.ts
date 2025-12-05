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
  // Sample expenses data
  expenses: Expense[] = [
    {
      id: 1,
      name: 'Groceries',
      description: 'Monthly food purchase',
      amount: 150,
      category: 'Food',
      date: new Date('2024-06-01'),
      recurring: false,
      status: 'paid'
    },
    {
      id: 2,
      name: 'Electricity Bill',
      description: 'June bill',
      amount: 75,
      category: 'Utilities',
      date: new Date('2024-06-03'),
      recurring: true,
      dueDate: new Date('2024-06-03'),
      recurrenceIntervalMonths: 1,
      remindBeforeDays: 3,
      status: 'unpaid'
    },
    {
      id: 3,
      name: 'Internet Subscription',
      description: 'Monthly subscription plan',
      amount: 50,
      category: 'Utilities',
      date: new Date('2024-06-05'),
      recurring: true,
      dueDate: new Date('2024-06-05'),
      recurrenceIntervalMonths: 1,
      remindBeforeDays: 2,
      numOccurrences: 12,
      status: 'paid'
    }
  ];

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
    expense.date = new Date(expense.date);
    expense.status = 'unpaid'; // default status
    this.expenses.push(expense);
    this.showForm = false;
  }

  updateStatus(expense: Expense) {
    const today = new Date();
    if (!expense.dueDate) return;

    if (expense.dueDate < today && expense.status !== 'paid') {
      expense.status = 'overdue';
    }
  }

}
