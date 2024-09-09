import { Component, Input, OnInit } from '@angular/core';
@Component({
  selector: 'validation-table',
  templateUrl: './validation-table.component.html',
  styleUrls: ['./validation-table.component.css']
})
export class ValidationTableComponent {
  @Input() public data: any;

  public tabStrips = [
    'Event Log',
    'Codec Sets',
    'Locations',
    'Network Regions',
    'Connections',
    'Intervening Regions'
  ];

  public getKeysFromObject(object: any) {
    if (object) {
      return Object.keys(object);
    } else {
      return [];
    }
  }
}
