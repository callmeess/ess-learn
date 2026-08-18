import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AnalyticsPageComponent } from './analytics';
import { DashboardService } from '../../../core/services';
import { DashboardDto } from '../../../core/models';

describe('AnalyticsPageComponent', () => {
  let component: AnalyticsPageComponent;
  let fixture: ComponentFixture<AnalyticsPageComponent>;

  beforeEach(async () => {
    const dashboardServiceStub = {
      getDashboard: () => of({} as DashboardDto)
    };

    await TestBed.configureTestingModule({
      imports: [AnalyticsPageComponent],
      providers: [{ provide: DashboardService, useValue: dashboardServiceStub }]
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
