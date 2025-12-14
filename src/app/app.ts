import { Component, signal } from '@angular/core';
import { MonthlyExpenses } from './components/monthly-expenses/monthly-expenses';
import { YearlyOverview } from './components/yearly-overview/yearly-overview'; 
import { ExpenseTrends } from './components/expense-trends/expense-trends';
import { Settings } from './components/settings/settings';
@Component({
  selector: 'app-root',
  imports: [ MonthlyExpenses, YearlyOverview, ExpenseTrends, Settings ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('spend-wise');
  activeTab: string = 'monthly';
}
