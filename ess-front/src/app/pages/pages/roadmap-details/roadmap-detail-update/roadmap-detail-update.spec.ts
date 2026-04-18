import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoadmapDetailUpdate } from './roadmap-detail-update';

describe('RoadmapDetailUpdate', () => {
  let component: RoadmapDetailUpdate;
  let fixture: ComponentFixture<RoadmapDetailUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoadmapDetailUpdate],
    }).compileComponents();

    fixture = TestBed.createComponent(RoadmapDetailUpdate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
