import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoadmapDetails } from './roadmap-details';

describe('RoadmapDetails', () => {
  let component: RoadmapDetails;
  let fixture: ComponentFixture<RoadmapDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoadmapDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(RoadmapDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
