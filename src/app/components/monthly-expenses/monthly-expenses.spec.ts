import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyExpenses } from './monthly-expenses';

describe('MonthlyExpenses', () => {
  let component: MonthlyExpenses;
  let fixture: ComponentFixture<MonthlyExpenses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyExpenses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyExpenses);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
