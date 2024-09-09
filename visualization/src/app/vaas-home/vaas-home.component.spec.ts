import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VaasHomeComponent } from './vaas-home.component';

describe('VaasHomeComponent', () => {
  let component: VaasHomeComponent;
  let fixture: ComponentFixture<VaasHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VaasHomeComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VaasHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
