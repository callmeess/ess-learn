import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reading } from './reading';

describe('Reading', () => {
  let component: Reading;
  let fixture: ComponentFixture<Reading>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reading],
    }).compileComponents();

    fixture = TestBed.createComponent(Reading);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
