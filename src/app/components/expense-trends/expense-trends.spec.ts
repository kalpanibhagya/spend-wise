import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseTrends } from './expense-trends';

describe('ExpenseTrends', () => {
  let component: ExpenseTrends;
  let fixture: ComponentFixture<ExpenseTrends>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseTrends]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseTrends);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
