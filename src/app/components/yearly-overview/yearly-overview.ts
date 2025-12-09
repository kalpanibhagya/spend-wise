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
  expenses_all: Expense[] = [];
  categories: string[] = [];
  availableYears: number[] = [];
  loading = false;

  constructor(private expenseService: ExpenseService) {}

  async ngOnInit() {
    await this.loadExpenses();
  }

  async loadExpenses() {
    this.loading = true;
    try {
      this.expenses_all = await this.expenseService.getAllExpenses();
      console.log('All Expenses:', this.expenses_all);
      
      // Calculate available years from data
      this.availableYears = this.calculateAvailableYears();
      console.log('Available years:', this.availableYears);
      
      // If current year has no data, default to the most recent year with data
      if (this.availableYears.length > 0 && !this.availableYears.includes(this.selectedYear)) {
        this.selectedYear = this.availableYears[0]; // Most recent year
        console.log('Current year has no data, switching to:', this.selectedYear);
      }
      
      this.updateChart();
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      this.loading = false;
    }
  }

  filteredExpenses() {
    return this.expenses_all.filter(exp => {
      // Ensure date is a Date object
      const expDate = exp.dueDate || exp.date;
      const date = expDate instanceof Date ? expDate : new Date(expDate);
      return date.getFullYear() === this.selectedYear;
    });
  }

  updateChart() {
    const expenses = this.filteredExpenses();
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
      const data = Array(12).fill(0);
      
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
        text: `Yearly Expenses Overview by Month and Categories`, 
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
    this.updateChart();
  }

  prevYear() {
    this.selectedYear--;
    this.updateChart();
  }

  nextYear() {
    this.selectedYear++;
    this.updateChart();
  }

  // Calculate total for the year
  getTotalForYear(): number {
    return this.filteredExpenses().reduce((sum, exp) => sum + exp.amount, 0);
  }

  // Get total for a specific category
  getCategoryTotal(category: string): number {
    return this.filteredExpenses()
      .filter(e => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);
  }

  // Get available years from data
  calculateAvailableYears(): number[] {
    const years = new Set<number>();
    this.expenses_all.forEach(exp => {
      const expDate = exp.dueDate || exp.date;
      const date = expDate instanceof Date ? expDate : new Date(expDate);
      if (!isNaN(date.getTime())) {
        years.add(date.getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a); // Most recent first
  }

  // Use cached available years
  getAvailableYears(): number[] {
    return this.availableYears;
  }
}
