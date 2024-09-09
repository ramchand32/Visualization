import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VaasHistoryComponent } from './vaas-history.component';

describe('VaasHistoryComponent', () => {
  let component: VaasHistoryComponent;
  let fixture: ComponentFixture<VaasHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VaasHistoryComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VaasHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
