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

  addExpense(form: any) {
    const expense = {
      date: form.value.date,
      description: form.value.description,
      amount: +form.value.amount
    };

    this.expenseAdded.emit(expense);
  }
}
