import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparisonHistoryComponent } from './comparison-history.component';

describe('ComparisonHistoryComponent', () => {
  let component: ComparisonHistoryComponent;
  let fixture: ComponentFixture<ComparisonHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ComparisonHistoryComponent]
    });
    fixture = TestBed.createComponent(ComparisonHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
