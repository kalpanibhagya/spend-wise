import { Component, signal } from '@angular/core';
import { MonthlyExpenses } from './components/monthly-expenses/monthly-expenses';
import { YearlyOverview } from './components/yearly-overview/yearly-overview'; 
import { ExpenseTrends } from './components/expense-trends/expense-trends';

@Component({
  selector: 'app-root',
  imports: [ MonthlyExpenses, YearlyOverview, ExpenseTrends ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('spend-wise');
  activeTab: string = 'monthly';
}
