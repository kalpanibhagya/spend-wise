import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  
  // Get today's date in YYYY-MM-DD format for the date input
  get todayString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  defaultValues = {
    status: 'unpaid',
    dueDate: this.todayString,
    numOccurrences: 1,
    remindBeforeDays: 1
  };

  addExpense(form: any) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      return;
    }
    console.log('Form values:', form.value);
    const expense = {
      name: form.value.name,
      category: form.value.category,
      amount: +form.value.amount,
      description: form.value.description || '',
      date: form.value.dueDate ? new Date(form.value.dueDate) : new Date(),
      dueDate: form.value.dueDate ? new Date(form.value.dueDate) : undefined,
      status: form.value.status || 'unpaid',
      recurring: this.isRecurring,
      remindBeforeDays: form.value.remindBeforeDays || 1,
      numOccurrences: form.value.numOccurrences || undefined,
      endDate: form.value.endDate ? new Date(form.value.endDate) : undefined
    };
    
    console.log('Expense to be added:', expense);
    // Emit the new expense to the parent component
    this.expenseAdded.emit(expense);
    // Reset form and component state
    form.reset();
    this.isRecurring = false;
    this.defaultValues = {
      status: 'unpaid',
      dueDate: this.todayString,
      numOccurrences: 1,
      remindBeforeDays: 1
    };
  }

  onCancel() {
    this.isRecurring = false;
    this.close.emit();
  }
}