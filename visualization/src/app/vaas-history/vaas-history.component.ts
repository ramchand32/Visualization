import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { VisualizationService } from '../services/visualization.service';
import { GstoolscookieService } from '../services/gstoolscookie.service';
import { SessionModel } from '../models/session.model';
import { map, Observable, Subscription, switchMap, timer } from 'rxjs';
import { GridTemplate } from 'commons';
import { ActionsModel } from '../models/actions.model';
import { NotificationsService } from '../services/notifications.service';
import { environment } from '../../environments/environment';
declare let moment: any;

@Component({
  selector: 'vaas-history',
  templateUrl: './vaas-history.component.html',
  styleUrls: ['./vaas-history.component.css']
})
export class VaasHistoryComponent implements OnInit, OnDestroy {
  // grid and its details.
  public shareMyReport = false;
  public accessableBy = [];
  public serviceName = environment.SERVICE;
  public shareEvent: any;
  public totalItems = 0;
  public isLoading = true;
  public timezone = 'UTC';
  public dataDisplay: GridTemplate = {
    columns: [
      {
        field: 'ReportType',
        title: 'Visualization Type',
        hidden: false,
        columnChooser: true,
        type: 'text',
        filterable: true,
        sortable: true
      },
      {
        field: 'RequestName',
        title: 'Request Name',
        hidden: false,
        columnChooser: true,
        type: 'text',
        filterable: true,
        sortable: true
      },
      {
        field: 'CreatedAt',
        title: 'Request On',
        hidden: false,
        columnChooser: true,
        // type: 'date',
        type: 'text',
        filterable: false,
        sortable: true
      },
      {
        field: 'UpdatedAt',
        title: 'Updated On',
        hidden: false,
        columnChooser: true,
        // type: 'date',
        type: 'text',
        filterable: false,
        sortable: true
      },
      {
        field: 'RequestedBy',
        title: 'Requested By',
        hidden: false,
        columnChooser: true,
        type: 'text',
        filterable: true,
        sortable: true
      },
      {
        field: 'ActualConfig',
        title: 'Configuration File',
        hidden: false,
        columnChooser: true,
        type: 'text',
        filterable: true,
        sortable: true
      },
      {
        field: 'State',
        title: 'Status',
        hidden: false,
        columnChooser: true,
        type: 'text',
        filterable: true,
        sortable: true
      },
      {
        field: 'actions',
        title: 'Result',
        hidden: false,
        columnChooser: true,
        type: 'actions',
        filterable: false,
        sortable: false
      },
      {
        field: 'share',
        title: 'Actions',
        hidden: false,
        columnChooser: true,
        type: 'actions',
        filterable: false,
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
        selectable: false
      }
    },
    selected: []
  };

  public visualizationState = ['Open', 'In Progress', 'Failed', 'Complete'];
  public visualizationHttpRef: {
    [index: number]: [Array<string>, Array<string>];
  } = {};

  private sessionModel!: SessionModel;

  //Observables and subscriptions
  private reportsObs!: Observable<object>;
  private userRecordsObs!: Observable<string>;
  public users: any;
  public isAdmin = false;
  private sessionSubscription$!: Subscription;
  private reportsSubscription$!: Subscription;
  private timerSubscription$!: Subscription;
  private bOnce = true;
  private bUpdateGridCount = 1;
  private timeout =
    environment.GS_SESSION_IDLE_TIMEOUT / environment.GS_GRID_UPDATE_TIMEOUT;

  constructor(
    private router: Router,
    private visualizationService: VisualizationService,
    private gstoolscookieService: GstoolscookieService,
    private notificaitonService: NotificationsService
  ) {}

  ngOnInit(): void {
    this.manageSession();
    this.getusers();
    this.setVisualizationRef();
  }

  //Destroys the created subscriptions.
  ngOnDestroy(): void {
    if (this.reportsSubscription$) this.reportsSubscription$.unsubscribe();
    if (this.sessionSubscription$) this.sessionSubscription$.unsubscribe();
    if (this.timerSubscription$) this.timerSubscription$.unsubscribe();
  }

  //Manage session subscription.
  private manageSession() {
    this.userRecordsObs = this.gstoolscookieService.getUserInfo().pipe(
      map(response => {
        this.sessionModel = <SessionModel>response;
        this.visualizationService.checkForSubscription(this.sessionModel);
        return this.sessionModel.validity;
      })
    );
    if (this.sessionSubscription$) this.sessionSubscription$.unsubscribe();
    this.sessionSubscription$ = this.userRecordsObs.subscribe((bTrue: any) => {
      if (bTrue.toLowerCase() == 'valid') {
        if (this.bOnce) {
          this.bOnce = false;
          this.isAdmin = this.sessionModel.isAdmin;
          this.timezone = this.sessionModel.timezone;
          //Columns that has to be shown only for Admin
          this.dataDisplay.columns[3].hidden = !this.isAdmin;
          this.dataDisplay.columns[4].hidden = !this.isAdmin;
          this.dataDisplay.uisettings.settings.hiddenColumns = this.isAdmin;
          this.createTimerSubcription(this.sessionModel.email);
        }
      }
    });
  }

  // static part of references for actions
  private setVisualizationRef() {
    this.visualizationHttpRef[0] = [[], []];
    this.visualizationHttpRef[1] = [[], []];
    this.visualizationHttpRef[2] = [
      [environment.VAAS_BASE_URL + 'report/error/'],
      []
    ];
    this.visualizationHttpRef[3] = [
      [environment.VAAS_BASE_URL + 'report/pdf/'],
      [environment.VAAS_BASE_URL + 'report/vsdx/']
    ];
  }

  getusers() {
    this.visualizationService.getusers().subscribe({
      next: (res: any) => {
        this.users = res;
      },
      error: (err: any) => {
        this.notificaitonService.showNotification('error', err);
      }
    });
  }

  userFilterValueChange($event: any) {
    if ($event.RequestedBy) {
      this.createTimerSubcription($event.RequestedBy);
    } else {
      this.createTimerSubcription(this.sessionModel.email);
    }
  }

  //Set actions for different results
  private setActions(state: number, id: string) {
    const val1: ActionsModel = {
      tooltip: '',
      action: '',
      kendoIcon: '',
      event: '',
      color: '',
      font: ''
    };
    const val2: ActionsModel = {
      tooltip: '',
      action: '',
      kendoIcon: '',
      event: '',
      color: '',
      font: ''
    };
    const valList: Array<ActionsModel> = [];

    if (state < 2) {
      valList.push(val1);
      return valList;
    } else if (state === 2) {
      val1.tooltip = 'View Error File';
      val1.action = this.visualizationHttpRef[state][0] + id;
      val1.kendoIcon = 'error-file-icon';
      val1.event = 'href';
      val1.color = 'k-color-error';
      val1.font = '24px';
      valList.push(val1);
    } else {
      //its state 3
      if (state === 3) {
        val1.tooltip = 'View PDF';
        val1.action = this.visualizationHttpRef[state][0] + id;
        val1.kendoIcon = 'pdf-icon';
        val1.event = 'href';
        val1.color = 'k-color-error';
        val1.font = '24px';
        valList.push(val1);

        val2.tooltip = 'View Visio';
        val2.action = this.visualizationHttpRef[state][1] + id;
        val2.kendoIcon = 'visio-icon';
        val2.event = 'href';
        val2.color = 'k-color-primary';
        val2.font = '24px';
        valList.push(val2);
      }
    }
    return valList;
  }

  //Show loading progress in Grid.
  private showProgress(bTrue: boolean) {
    return (this.isLoading = bTrue);
  }

  //sets up a timer subscription which calls
  //out http request after a certain time interval.
  private createTimerSubcription(email = '') {
    this.reportsObs = this.visualizationService.getrecordsof(email);
    this.updateGrid();
    if (this.timerSubscription$) this.timerSubscription$.unsubscribe();
    this.timerSubscription$ = timer(0, environment.GS_GRID_UPDATE_TIMEOUT)
      .pipe(
        map(() => {
          this.updateGrid();
          this.bUpdateGridCount++;
        })
      )
      .subscribe();
  }

  //date format to display.
  private createDate(dbDate: any) {
    let format = 'MM-DD-YYYY, HH:mm z';
    const dateutc = moment.utc(dbDate).tz(this.sessionModel.timezone);
    const checktzname = moment.tz(this.sessionModel.timezone).zoneAbbr();
    let datetz = '';

    if (checktzname[0] == '+' || checktzname[0] == '-') {
      format = 'MM-DD-YYYY, HH:mm';
    }
    datetz = moment.tz(dateutc, this.sessionModel.timezone).format(format);

    return `${datetz}`;
  }

  //Updating values of grid.
  public updateGrid() {
    //check for valid session for every timeout
    if (this.bUpdateGridCount % this.timeout == 0) {
      this.manageSession();
    }
    this.showProgress(true);
    if (this.reportsSubscription$) this.reportsSubscription$.unsubscribe();
    this.reportsSubscription$ = this.reportsObs.subscribe(
      (gridData: any) => {
        this.dataDisplay.data = gridData.map(
          (data: {
            ReportId: number;
            State: number;
            CreatedAt: any;
            UpdatedAt: any;
          }) => {
            const dateCreated = this.createDate(data.CreatedAt);
            const dateUpdated = this.sessionModel.isAdmin
              ? this.createDate(data.UpdatedAt)
              : '';
            const state = this.visualizationState[data.State];
            const actions = this.setActions(
              data.State,
              data.ReportId.toString()
            );
            return {
              ...data,
              State: state,
              CreatedAt: dateCreated,
              UpdatedAt: dateUpdated,
              actions: actions,
              share:
                data.State === 3
                  ? [
                      {
                        tooltip: 'Share My Report',
                        action: 'share',
                        kendoIcon: 'share-icon',
                        event: 'click',
                        color: 'k-color-primary'
                      }
                    ]
                  : []
            };
          }
        );
        this.totalItems = gridData.length;
        this.showProgress(false);
      },
      (error: any) => {
        this.showProgress(false);
        this.notificaitonService.showNotification(
          'error',
          'Somethings wrong! Error fetching grid data.. '
        );
      },
      () => {
        this.showProgress(false);
      }
    );
  }

  //Go to VaaS Home page.
  public goToVaasHome() {
    this.router.navigate(['/']);
  }

  public handleEvent(event: any) {
    this.shareMyReport = !this.shareMyReport;
    this.shareEvent = event;
    if (event.data.SharedWith.length > 0) {
      this.accessableBy = event.data.SharedWith.split(',');
    }
    this.visualizationService.getbyid(event.data.ReportId).subscribe({
      next: (res: any) => {
        this.shareEvent = res;
      },
      error: (err: any) => {
        this.notificaitonService.showNotification('error', err);
      }
    });
  }

  public submit(access: any) {
    const postData = {
      user: this.sessionModel.user,
      service: 'Visualization',
      report_type: this.shareEvent.ReportType,
      request_name: this.shareEvent.RequestName,
      config_file_name: this.shareEvent.ActualConfig.split(),
      created_time: Date.parse(this.shareEvent.CreatedAt) / 1000,
      result: {
        pdf:
          environment.VAAS_BASE_URL + 'report/pdf/' + this.shareEvent.ReportId,
        visio:
          environment.VAAS_BASE_URL + 'report/vsdx/' + this.shareEvent.ReportId
      },
      access: access.users,
      status: 'Success'
    };
    this.visualizationService
      .shareReport(
        `https://${window.location.hostname}/gstoolspvn/api/analytics/reports`,
        postData
      )
      .subscribe({
        next: (res: any) => {
          const reportPostData = {
            ReportId: this.shareEvent.ReportId,
            SharedWith: access.users.toString()
          };
          this.updateReport(reportPostData);
          this.notificaitonService.showNotification('success', res);
          this.shareMyReport = false;
        },
        error: err => {
          this.notificaitonService.showNotification('error', err);
          this.shareMyReport = false;
        }
      });
  }

  public updateReport(reportPostData: any) {
    this.visualizationService
      .update(this.shareEvent.ReportId, reportPostData)
      .subscribe({
        next: (res: any) => {
          this.updateGrid();
        },
        error: err => {
          this.notificaitonService.showNotification('error', err);
        }
      });
  }
  public handleReportEvent(event: any) {
    switch (event.eventType) {
      case 'close':
        this.shareMyReport = false;
        break;
      case 'submit':
        this.submit(event.value);
        break;
      default:
        this.notificaitonService.showNotification('error', 'Illegal Event!');
        break;
    }
  }
}
