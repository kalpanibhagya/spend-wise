import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Expense } from '../../models/expense';

@Component({
  selector: 'app-expense-form',
  imports: [ CommonModule, FormsModule],
  templateUrl: './expense-form.html',
  styleUrl: './expense-form.css',
})
export class ExpenseForm {
  @Output() expenseAdded = new EventEmitter<any>();
  @Output() close = new EventEmitter();

  isRecurring: boolean = false;
  recurrenceType: 'monthly' | 'daily' | 'yearly' = 'monthly';
  defaultValues = {
    status: 'unpaid',
    dueDate: new Date(),
    numOccurrences: 1,
    remindBeforeDays: 1
  };

  addExpense(form: any) {
    const expense = {
      name: form.value.name,
      category: form.value.category,
      amount: +form.value.amount,
      description: form.value.description,
      dueDate: form.value.dueDate ? new Date(form.value.dueDate) : undefined,
      status: form.value.status ?? 'unpaid',
      recurring: form.value.recurring || false,
      remindBeforeDays: form.remindBeforeDays || 1,
      numOccurrences: form.numOccurrences,
      endDate: form.endDate ? new Date(form.endDate) : undefined
    };
    // Emit the new expense to the parent component
    this.expenseAdded.emit(expense);
    // Reset form after submission
    form.reset();
  }
}
