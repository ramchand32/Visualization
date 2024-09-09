import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GridTemplate } from 'commons';

@Component({
  selector: 'network-region-table',
  templateUrl: './network-region-table.component.html',
  styleUrls: ['./network-region-table.component.css']
})
export class NetworkRegionTableComponent implements OnInit {
  @Output() public rowSelectionEvent = new EventEmitter();
  @Input() public data: any;

  ngOnInit(): void {
    this.updateGridData(this.data['Network Regions']);
  }

  public isLoading = false;

  public dataDisplay: GridTemplate = {
    columns: [
      {
        field: 'NetworkRegion',
        title: 'Region',
        hidden: false,
        columnChooser: true,
        type: 'text',
        filterable: true,
        sortable: false
      },
      {
        field: 'NetworkName',
        title: 'Name',
        hidden: false,
        columnChooser: true,
        type: 'text',
        filterable: true,
        sortable: false
      }
    ],
    data: [],
    title: '',
    type: '',
    uisettings: {
      gridname1: {
        filter: {
          filters: [
            {
              field: 'Title',
              operator: 'contains',
              value: ''
            }
          ],
          logic: 'and'
        },
        sort: [{ field: 'CreatedAt', dir: 'desc' }]
      },
      settings: {
        dropdown: false,
        filterable: false,
        pageable: {},
        reorderable: false,
        resizable: false,
        skip: 0,
        sortable: true,
        type: '',
        hiddenColumns: false,
        selectable: true
      }
    },
    selected: []
  };

  public selectionEvent(event: any) {
    const selectedRecords = [];
    for (const rowIndex of event.selection) {
      const row: any = this.dataDisplay.data[rowIndex];
      selectedRecords.push(row.NetworkRegion);
    }
    this.rowSelectionEvent.emit({ selectedRecords });
  }

  public updateGridData(gridData: any) {
    this.dataDisplay.data = gridData.map((data: any) => {
      return {
        NetworkRegion: data['Region'],
        NetworkName: data['Name']
      };
    });
  }
}
