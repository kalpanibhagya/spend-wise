import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  today: Date = new Date();

  constructor(
    private expenseService: ExpenseService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    console.log('Initializing Yearly Overview for year:', this.selectedYear);
    this.getAvailableYears();
    await this.filteredExpenses();
  }

  async filteredExpenses() {
    this.loading = true;
    this.cdr.detectChanges(); // Update loading state
    
    try {
      const allExpenses = await this.expenseService.getExpensesByYear(this.selectedYear);
      
      this.expenses = allExpenses.filter(exp => {
        const expDate = exp.dueDate || exp.date;
        const date = expDate instanceof Date ? expDate : new Date(expDate);
        
        // Filter by year and exclude future expenses
        return date.getFullYear() === this.selectedYear && date <= this.today;
      });
      
      console.log('Filtered Expenses for', this.selectedYear, this.expenses);
      this.updateChart(this.expenses);
      
    } catch (error) {
      console.error('Error filtering expenses by year:', error);
      this.expenses = [];
      this.updateChart([]);
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); // Force change detection after loading
    }
  }

  updateChart(expenses: Expense[] = []) {
    if (expenses.length === 0) {
      this.chartOptions = {
        title: {
          text: 'No expenses for this year',
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#999',
            fontSize: 14
          }
        }
      };
      this.categories = [];
      this.cdr.detectChanges();
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
        text: `Annual Expenditure Summary - ${this.selectedYear}`, 
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
            result += `${item.marker} ${item.seriesName}: €${item.value.toFixed(2)}<br/>`;
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
    
    this.cdr.detectChanges(); // Force chart update
  }

  async onYearChange(event: any) {
    this.selectedYear = +event.target.value;
    await this.filteredExpenses();
  }

  async prevYear() {
    this.selectedYear--;
    await this.filteredExpenses();
  }

  async nextYear() {
    const today = new Date();
    const currentYear = today.getFullYear();
    if (this.selectedYear < currentYear) {
      this.selectedYear++;
      await this.filteredExpenses();
    }
  }

  isNextYearDisabled(): boolean {
    const today = new Date();
    const currentYear = today.getFullYear();
    return this.selectedYear >= currentYear;
  }

  // Calculate total expense for the year
  getTotalExpenseForYear(): number {
    return this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }

  // Get total for a specific category
  getCategoryTotal(category: string): number {
    return this.expenses
      .filter(e => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);
  }

  getAvailableYears(): number[] {
    const currentYear = new Date().getFullYear();
    this.availableYears = Array.from({ length: 20 }, (_, i) => currentYear - i);
    console.log('Available years:', this.availableYears);
    return this.availableYears;
  }
}