import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearlyOverview } from './yearly-overview';

describe('YearlyOverview', () => {
  let component: YearlyOverview;
  let fixture: ComponentFixture<YearlyOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YearlyOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YearlyOverview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
