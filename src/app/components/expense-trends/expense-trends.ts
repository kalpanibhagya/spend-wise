import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { LineSeriesOption, EChartsOption } from 'echarts';
import { Expense } from '../../models/expense';
import { ExpenseService } from '../../services/expense.service';

@Component({
  selector: 'app-expense-trends',
  imports: [ CommonModule, NgxEchartsModule ],
  templateUrl: './expense-trends.html',
  styleUrl: './expense-trends.css',
})
export class ExpenseTrends implements OnInit {
  chartOptions: EChartsOption = {};
  expenses_all: Expense[] = [];
  categories: string[] = [];
  years: number[] = [];
  loading = false;
  showTotal = true;
  selectedCategories: Set<string> = new Set();

  constructor(private expenseService: ExpenseService) {}

  async ngOnInit() {
    await this.loadExpenses();
  }

  async loadExpenses() {
    this.loading = true;
    try {
      this.expenses_all = await this.expenseService.getAllExpenses();
      console.log('All Expenses for trends:', this.expenses_all);
      
      // Extract unique years and categories
      this.extractYearsAndCategories();
      
      // Select all categories by default
      this.selectedCategories = new Set(this.categories);
      
      this.updateChart();
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      this.loading = false;
    }
  }

  extractYearsAndCategories() {
    const yearSet = new Set<number>();
    const categorySet = new Set<string>();

    this.expenses_all.forEach(exp => {
      const expDate = exp.dueDate || exp.date;
      const date = expDate instanceof Date ? expDate : new Date(expDate);
      if (!isNaN(date.getTime())) {
        yearSet.add(date.getFullYear());
        categorySet.add(exp.category);
      }
    });

    this.years = Array.from(yearSet).sort((a, b) => a - b);
    this.categories = Array.from(categorySet).sort();
  }

  getYearlyTotalByCategory(year: number, category: string): number {
    return this.expenses_all
      .filter(exp => {
        const expDate = exp.dueDate || exp.date;
        const date = expDate instanceof Date ? expDate : new Date(expDate);
        return date.getFullYear() === year && exp.category === category;
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
  }

  getYearlyTotal(year: number): number {
    return this.expenses_all
      .filter(exp => {
        const expDate = exp.dueDate || exp.date;
        const date = expDate instanceof Date ? expDate : new Date(expDate);
        return date.getFullYear() === year;
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
  }

  toggleCategory(category: string) {
    if (this.selectedCategories.has(category)) {
      this.selectedCategories.delete(category);
    } else {
      this.selectedCategories.add(category);
    }
    this.updateChart();
  }

  toggleTotal() {
    this.showTotal = !this.showTotal;
    this.updateChart();
  }

  selectAllCategories() {
    this.selectedCategories = new Set(this.categories);
    this.updateChart();
  }

  deselectAllCategories() {
    this.selectedCategories.clear();
    this.updateChart();
  }

  updateChart() {
    if (this.years.length === 0 || this.expenses_all.length === 0) {
      this.chartOptions = {};
      return;
    }

    const seriesData: LineSeriesOption[] = [];

    // Add line for each selected category
    this.categories.forEach(category => {
      if (this.selectedCategories.has(category)) {
        const data = this.years.map(year => 
          this.getYearlyTotalByCategory(year, category)
        );

        seriesData.push({
          name: category,
          type: 'line',
          data,
          smooth: true,
          emphasis: {
            focus: 'series'
          }
        } as LineSeriesOption);
      }
    });

    // Add total line
    if (this.showTotal) {
      const totalData = this.years.map(year => this.getYearlyTotal(year));
      
      seriesData.push({
        name: 'Total',
        type: 'line',
        data: totalData,
        smooth: true,
        lineStyle: {
          width: 3,
          type: 'solid'
        },
        itemStyle: {
          color: '#ff4444'
        },
        emphasis: {
          focus: 'series'
        }
      } as LineSeriesOption);
    }

    this.chartOptions = {
      title: {
        text: 'Expense Trends Over Time',
        left: 'center',
        top: 10
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        },
        formatter: (params: any) => {
          let result = `<strong>${params[0].axisValue}</strong><br/>`;
          params.forEach((item: any) => {
            result += `${item.marker} ${item.seriesName}: €${item.value.toFixed(2)}<br/>`;
          });
          return result;
        }
      },
      legend: {
        top: 40,
        data: [...(this.showTotal ? ['Total'] : []), ...Array.from(this.selectedCategories)]
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: this.years.map(y => y.toString()),
        name: 'Year',
        nameLocation: 'middle',
        nameGap: 30
      },
      yAxis: {
        type: 'value',
        name: 'Amount (€)',
        nameLocation: 'middle',
        nameGap: 50,
        axisLabel: {
          formatter: '€{value}'
        }
      },
      dataZoom: [
        {
          type: 'slider',
          show: this.years.length > 5,
          xAxisIndex: [0],
          start: 0,
          end: 100
        }
      ],
      series: seriesData
    } as EChartsOption;
  }

  // Get summary statistics
  getAverageYearlyExpense(): number {
    if (this.years.length === 0) return 0;
    const total = this.years.reduce((sum, year) => sum + this.getYearlyTotal(year), 0);
    return total / this.years.length;
  }

  getHighestYearExpense(): { year: number; amount: number } {
    if (this.years.length === 0) return { year: 0, amount: 0 };
    let max = { year: this.years[0], amount: this.getYearlyTotal(this.years[0]) };
    this.years.forEach(year => {
      const amount = this.getYearlyTotal(year);
      if (amount > max.amount) {
        max = { year, amount };
      }
    });
    return max;
  }

  getLowestYearExpense(): { year: number; amount: number } {
    if (this.years.length === 0) return { year: 0, amount: 0 };
    let min = { year: this.years[0], amount: this.getYearlyTotal(this.years[0]) };
    this.years.forEach(year => {
      const amount = this.getYearlyTotal(year);
      if (amount < min.amount) {
        min = { year, amount };
      }
    });
    return min;
  }
}
