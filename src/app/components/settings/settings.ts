import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';

@Component({
  selector: 'app-settings',
  imports: [ CommonModule, FormsModule ],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {

  months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  year: number = new Date().getFullYear();
  month?: number;

  constructor(private expenseService: ExpenseService) {}

  async deleteSelectedMonth() {
    if (!this.year || !this.month) {
      alert('Please select both year and month.');
      return;
    }

    const ok = confirm(`Delete all expenses for ${this.month}/${this.year}? This action cannot be undone.`);
    if (!ok) return;

    try {
      const deleted = await this.expenseService.deleteExpensesByMonth(this.year, this.month);
      alert(`Deleted ${deleted} expenses for ${this.month}/${this.year}.`);
    } catch (error) {
      console.error('Error deleting expenses by month:', error);
      alert('Failed to delete expenses. See console for details.');
    }
  }

  async deleteSelectedYear() {
    if (!this.year) {
      alert('Please select a year.');
      return;
    }

    const ok = confirm(`Delete all expenses for ${this.year}? This action cannot be undone.`);
    if (!ok) return;

    try {
      const deleted = await this.expenseService.deleteExpensesByYear(this.year);
      alert(`Deleted ${deleted} expenses for ${this.year}.`);
    } catch (error) {
      console.error('Error deleting expenses by year:', error);
      alert('Failed to delete expenses. See console for details.');
    }
  }

  async exportSelectedMonth() {
    if (!this.year || !this.month) {
      alert('Please select both year and month.');
      return;
    }

    try {
      const filePath = await this.expenseService.exportExpenses({ scope: 'month', year: this.year, month: this.month });
      if (filePath) alert(`Exported to ${filePath}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. See console for details.');
    }
  }

  async exportSelectedYear() {
    if (!this.year) {
      alert('Please select a year.');
      return;
    }

    try {
      const filePath = await this.expenseService.exportExpenses({ scope: 'year', year: this.year });
      if (filePath) alert(`Exported to ${filePath}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. See console for details.');
    }
  }

  async exportAll() {
    try {
      const filePath = await this.expenseService.exportExpenses({ scope: 'all' });
      if (filePath) alert(`Exported to ${filePath}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. See console for details.');
    }
  }

}
