import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseForm } from '../expense-form/expense-form'; 
import { Expense } from '../../models/expense';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { ExpenseService } from '../../services/expense.service';

@Component({
  selector: 'app-monthly-expenses',
  imports: [ CommonModule, ExpenseForm, NgxEchartsModule ],
  templateUrl: './monthly-expenses.html',
  styleUrl: './monthly-expenses.css',
})
export class MonthlyExpenses implements OnInit{
  // Sample expenses data - later get from database/service
  // expenses_all: Expense[] = [
  //   {
  //     id: 1,
  //     name: 'Groceries',
  //     description: 'Monthly food purchase',
  //     amount: 150,
  //     category: 'Food',
  //     date: new Date('2025-11-01'),
  //     recurring: false,
  //     status: 'paid'
  //   },
  //   {
  //     id: 2,
  //     name: 'Electricity Bill',
  //     description: 'June bill',
  //     amount: 75,
  //     category: 'Utilities',
  //     date: new Date('2025-11-03'),
  //     recurring: true,
  //     dueDate: new Date('2025-12-03'),
  //     remindBeforeDays: 3,
  //     status: 'overdue'
  //   },
  //   {
  //     id: 3,
  //     name: 'Internet Subscription',
  //     description: 'Monthly subscription plan',
  //     amount: 50,
  //     category: 'Utilities',
  //     date: new Date('2025-12-05'),
  //     recurring: true,
  //     dueDate: new Date('2025-12-08'),
  //     remindBeforeDays: 2,
  //     status: 'unpaid'
  //   },
  //   {
  //     id: 4,
  //     name: 'Groceries',
  //     description: 'food purchase',
  //     amount: 64,
  //     category: 'Food',
  //     date: new Date('2025-12-01'),
  //     recurring: false,
  //     status: 'paid'
  //   }
  // ];

  showForm = false;
  selectedDate: Date = new Date();
  expenses: Expense[] = [];
  loading = false;

  constructor(private expenseService: ExpenseService) {}

  async ngOnInit() {
    console.log('Selected Date:', this.selectedDate);
    await this.loadExpenses();
    console.log('Filtered Expenses:', this.expenses);
  }

  async loadExpenses() {
    this.loading = true;
    try {
      const year = this.selectedDate.getFullYear();
      const month = this.selectedDate.getMonth() + 1; // Service expects 1-12
      this.expenses = await this.expenseService.getExpensesByMonth(year, month);
      this.expenses.sort((a, b) => {
        const dateA = new Date(a.dueDate ?? a.date).getTime();
        const dateB = new Date(b.dueDate ?? b.date).getTime();
        return dateA - dateB;
      });
      this.updateChart();
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      this.loading = false;
    }
  }

  totalExpenses(): number {
    return this.expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  openAddForm() {
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
  }

  async onExpenseAdded(expense: Expense) {
    try {
      // Ensure dates are valid Date objects
      expense.date = expense.date ? new Date(expense.date) : new Date();
      expense.dueDate = expense.dueDate ? new Date(expense.dueDate) : undefined;
      expense.endDate = expense.endDate ? new Date(expense.endDate) : undefined;
      expense.status = expense.status || 'unpaid';
      expense.recurring = expense.recurring || false;
      expense.remindBeforeDays = expense.remindBeforeDays || 1;
      
      // Validate dates
      if (isNaN(expense.date.getTime())) {
        console.error('Invalid date:', expense.date);
        expense.date = new Date();
      }
      
      const id = await this.expenseService.addExpense(expense);
      console.error('Added expense:', expense);
      // Handle recurring expenses
      if (expense.recurring && expense.dueDate && (expense.numOccurrences || expense.endDate)) {
        for (let i = 1; i < (expense.numOccurrences || 12); i++) {
          const nextDate = new Date(expense.dueDate);
          nextDate.setMonth(nextDate.getMonth() + i);
          if (expense.endDate && nextDate > expense.endDate) break;
          
          await this.expenseService.addExpense({
            ...expense,
            dueDate: nextDate
          });
          console.error('Added expense:', expense);
        }
      }
      
      this.closeForm();
      await this.loadExpenses();
      alert('Successfully added the expense!');
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please check the form and try again.');
    }
  }

  async deleteExpense(id: number) {
    try {
      await this.expenseService.deleteExpense(id);
      await this.loadExpenses();
      this.updateChart();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  }

  async prevMonth() {
    this.selectedDate = new Date(
      this.selectedDate.getFullYear(),
      this.selectedDate.getMonth() - 1,
      1
    );
    await this.loadExpenses();
  }

  async nextMonth() {
    this.selectedDate = new Date(
      this.selectedDate.getFullYear(),
      this.selectedDate.getMonth() + 1,
      1
    );
    await this.loadExpenses();
  }

  chartOptions: EChartsOption = {};

  updateChart() {
    if (!this.expenses || this.expenses.length === 0) {
      this.chartOptions = {};
      return;
    }

    // Group totals by category
    const categoryTotals: Record<string, number> = {};

    this.expenses.forEach(exp => {
      categoryTotals[exp.category] =
        (categoryTotals[exp.category] || 0) + exp.amount;
    });

    // Transform for pie series
    const pieData = Object.entries(categoryTotals).map(([category, total]) => ({
      name: category,
      value: total
    }));

    // Complete chart configuration
    this.chartOptions = {
      title: {
        text: 'Expense Breakdown by Category',
        left: 'center',
        top: 10
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}<br/>€ {c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 10
      },
      series: [
        {
          name: 'Expenses',
          type: 'pie',
          radius: '60%',
          center: ['50%', '55%'],
          data: pieData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0,0,0,0.5)'
            }
          },
          label: {
            show: true,
            formatter: '{b}: €{c}'
          }
        }
      ]
    };
  }

}