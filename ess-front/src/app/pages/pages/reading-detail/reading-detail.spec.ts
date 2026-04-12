import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadingDetail } from './reading-detail';

describe('ReadingDetail', () => {
  let component: ReadingDetail;
  let fixture: ComponentFixture<ReadingDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadingDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ReadingDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
