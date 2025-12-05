import { Component, signal } from '@angular/core';
import { MonthlyExpenses } from './components/monthly-expenses/monthly-expenses';
import { Reminders } from './components/reminders/reminders'; 

@Component({
  selector: 'app-root',
  imports: [ MonthlyExpenses ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('spend-wise');
}
