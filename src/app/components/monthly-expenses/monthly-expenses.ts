import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseForm } from '../expense-form/expense-form'; 
import { Expense } from '../../models/expense';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-monthly-expenses',
  imports: [ CommonModule, ExpenseForm, NgxEchartsModule ],
  templateUrl: './monthly-expenses.html',
  styleUrl: './monthly-expenses.css',
})
export class MonthlyExpenses implements OnInit{

  showForm = false;
  selectedDate: Date = new Date();
  
  // Sample expenses data - later get from database/service
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
      status: 'overdue'
    },
    {
      id: 3,
      name: 'Internet Subscription',
      description: 'Monthly subscription plan',
      amount: 50,
      category: 'Utilities',
      date: new Date('2025-12-05'),
      recurring: true,
      dueDate: new Date('2025-12-08'),
      remindBeforeDays: 2,
      status: 'unpaid'
    },
    {
      id: 4,
      name: 'Groceries',
      description: 'food purchase',
      amount: 64,
      category: 'Food',
      date: new Date('2025-12-01'),
      recurring: false,
      status: 'paid'
    }
  ];

  // Initialize as empty array - will be populated in ngOnInit
  expenses: Expense[] = [];

  ngOnInit() {
    console.log('Selected Date:', this.selectedDate);
    console.log('All Expenses:', this.expenses_all);
    this.expenses = this.filteredExpenses();
    console.log('Filtered Expenses:', this.expenses);
    this.updateChart();
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
    
    // Add to expenses_all instead of expenses
    this.expenses_all.push(expense);
    
    if (expense.recurring)  {
      if (expense.numOccurrences || expense.endDate) {
        for (let i = 1; i < (expense.numOccurrences || 12); i++) {
          const nextDate = new Date(expense.dueDate!);
          nextDate.setMonth(nextDate.getMonth() + i);
          if (expense.endDate && nextDate > expense.endDate) break;
          this.expenses_all.push({
            ...expense,
            id: Date.now() + i,
            dueDate: nextDate
          });
        }
      }
    }
    
    this.showForm = false;
    this.expenses = this.filteredExpenses();
    this.updateChart();
  }

  updateStatus(expense: Expense) {
    const today = new Date();
    if (!expense.dueDate) return;

    if (expense.dueDate < today && expense.status !== 'paid') {
      expense.status = 'overdue';
    }
  }

  filteredExpenses() {
    console.log('Filtering for month:', this.selectedDate.getMonth(), 'year:', this.selectedDate.getFullYear());
    
    var filtered = this.expenses_all.filter(exp => {
      const d = new Date(exp.dueDate ?? exp.date);
      console.log('Expense:', exp.name, 'Date:', d, 'Month:', d.getMonth(), 'Year:', d.getFullYear());
      
      return (
        d.getMonth() === this.selectedDate.getMonth() &&
        d.getFullYear() === this.selectedDate.getFullYear()
      );
    });
    return this.sortByDate(filtered);
  }

  sortByDate(expenses: Expense[]): Expense[] {
    return expenses.sort((a, b) => {
      const dateA = new Date(a.dueDate ?? a.date).getTime();
      const dateB = new Date(b.dueDate ?? b.date).getTime();
      return dateA - dateB;
    });
  }

  prevMonth() {
    this.selectedDate = new Date(
      this.selectedDate.getFullYear(),
      this.selectedDate.getMonth() - 1,
      1
    );
    this.expenses = this.filteredExpenses();
    this.updateChart();
  }

  nextMonth() {
    this.selectedDate = new Date(
      this.selectedDate.getFullYear(),
      this.selectedDate.getMonth() + 1,
      1
    );
    this.expenses = this.filteredExpenses();
    this.updateChart();
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