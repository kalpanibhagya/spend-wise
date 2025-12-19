import { Component, OnInit  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { BarSeriesOption, EChartsOption } from 'echarts';
import { Expense } from '../../models/expense';
import { ExpenseService } from '../../services/expense.service';

@Component({
  selector: 'app-yearly-overview',
  imports: [ CommonModule, NgxEchartsModule ],
  templateUrl: './yearly-overview.html',
  styleUrl: './yearly-overview.css',
})
export class YearlyOverview implements OnInit {
  selectedYear: number = new Date().getFullYear();
  chartOptions: EChartsOption = {};
  expenses: Expense[] = [];
  categories: string[] = [];
  availableYears: number[] = [];
  loading = false;

  constructor(private expenseService: ExpenseService) {}

  async ngOnInit() {
    console.log('Initializing Yearly Overview for year:', this.selectedYear);
    await this.filteredExpenses();
  }

  async filteredExpenses() {
    try {
      const allExpenses = await this.expenseService.getExpensesByYear(this.selectedYear);
      this.expenses = allExpenses.filter(exp => {
        const expDate = exp.dueDate || exp.date;
        const date = expDate instanceof Date ? expDate : new Date(expDate);
        return date.getFullYear() === this.selectedYear;
      });
      this.updateChart(this.expenses);
      return this.expenses;
    } catch (error) {
      console.error('Error filtering expenses by year:', error);
    } finally {
      this.loading = false;
    }
    return [];
  }

  updateChart(expenses: Expense[] = []) {
    console.log('Filtered Expenses for', this.selectedYear, expenses);
    if (expenses.length === 0) {
      this.chartOptions = {};
      this.categories = [];
      return;
    }
    // Get unique categories
    this.categories = [...new Set(expenses.map(e => e.category))];
    // Prepare data per category
    const seriesData: BarSeriesOption[] = this.categories.map(cat => {
      const data = Array(12).fill(0); // One entry per month
      expenses
        .filter(e => e.category === cat)
        .forEach(e => {
          // Ensure date is a Date object
          const expDate = e.dueDate || e.date;
          const date = expDate instanceof Date ? expDate : new Date(expDate);
          const month = date.getMonth();
          data[month] += e.amount;
        });

      return {
        name: cat,
        type: 'bar',
        stack: 'total',
        data,
        emphasis: {
          focus: 'series'
        }
      } as BarSeriesOption;
    });

    this.chartOptions = {
      title: { 
        text: `Annual Expenditure Summary`, 
        left: 'center',
        top: 10
      },
      tooltip: { 
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          let result = `<strong>${params[0].axisValue}</strong><br/>`;
          let total = 0;
          params.forEach((item: any) => {
            result += `${item.marker} ${item.seriesName}: €${item.value}<br/>`;
            total += item.value;
          });
          result += `<strong>Total: €${total.toFixed(2)}</strong>`;
          return result;
        }
      },
      legend: { 
        top: 40,
        data: this.categories 
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: { 
        type: 'category',
        data: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      },
      yAxis: { 
        type: 'value',
        axisLabel: {
          formatter: '€{value}'
        }
      },
      series: seriesData
    } as EChartsOption;
  }

  onYearChange(event: any) {
    this.selectedYear = +event.target.value;
    this.filteredExpenses();
  }

  prevYear() {
    this.selectedYear--;
    this.filteredExpenses();
  }

  nextYear() {
    this.selectedYear++;
    this.filteredExpenses();
  }

  // Calculate total expense for the year
  getTotalExpenseForYear() {
    return this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }

  // Get total for a specific category
  getCategoryTotal(category: string) {
    return this.expenses
    .filter(e => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);
  }

  getAvailableYears(): number[] {
    this.availableYears = Array.from({ length: 20 }, (_, i) => this.selectedYear - i);
    console.log('Available years:', this.availableYears);
    return this.availableYears;
  }
}
