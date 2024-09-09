import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkRegionTableComponent } from './network-region-table.component';

describe('NetworkRegionTableComponent', () => {
  let component: NetworkRegionTableComponent;
  let fixture: ComponentFixture<NetworkRegionTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NetworkRegionTableComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkRegionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
