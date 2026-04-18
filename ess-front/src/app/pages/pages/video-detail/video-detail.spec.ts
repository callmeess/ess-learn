import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoDetail } from './video-detail';

describe('VideoDetail', () => {
  let component: VideoDetail;
  let fixture: ComponentFixture<VideoDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
