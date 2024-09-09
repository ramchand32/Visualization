import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  FileInfo,
  FileRestrictions,
  SelectEvent
} from '@progress/kendo-angular-upload';
import { Router } from '@angular/router';
import { VisualModel } from '../models/visual.model';
import { VisualizationService } from '../services/visualization.service';
import { VisualizationTypeModel } from '../models/visualizationtype.model';
import { GstoolscookieService } from '../services/gstoolscookie.service';
import { SessionModel } from '../models/session.model';
import { map, Observable, Subscription, switchMap } from 'rxjs';
import { NotificationsService } from '../services/notifications.service';
import { ShepherdService } from 'angular-shepherd';
import * as JSZip from 'jszip';
import * as js2xmlparser from 'js2xmlparser';
import { environment } from '../../environments/environment';

@Component({
  selector: 'vaas-home',
  templateUrl: './vaas-home.component.html',
  styleUrls: ['./vaas-home.component.css']
})
export class VaasHomeComponent implements OnInit, OnDestroy {
  public form!: FormGroup;
  public serviceName = environment.SERVICE;
  public opened = false;
  public filtered_vstypes: any[] = [];
  public myRestrictions: FileRestrictions = {};
  public myFiles: Array<any> | null = null;
  public formData!: FormData;
  public vstypetext = '';
  public reqName = '';
  public isLoading = false;
  public submitted = false;
  public selectedReportType = '';
  public flagForLaunch = false;
  public selectedConfigValues: any;
  public openedTreeView = false;
  public pvaViewTitle = 'View PVA';
  public pvaData: any;
  public networkRegionSelection = 'AllRegions';
  public hideUnselectedNetworkRegions = true;
  public IPConnections = true;
  public IPWithIGAROverflow = true;
  public IGARConnections = true;
  public showSelectedNetworkView = false;
  public selectedNetworkRegions = [];
  public zip: any;
  public showValidationPanel = false;
  public extractedData: any = {};
  public ASCIInventoriedNodesOnly = false;
  public configValuesChanged = false;
  public flagForConnectionSettings = false;

  public static NRVExtractedDataCategories = [
    'Event Log',
    'Codec Sets',
    'Locations',
    'Network Regions',
    'Connections',
    'Intervening Regions'
  ];

  public description =
    'Here is the place where the description for each visualization type is shown.';

  public hintText!: string;
  public visualization_types: VisualizationTypeModel[] = [
    { title: 'Network Region Viewer (NRV)' },
    { title: 'ASCI Visualization Tool (AVT)' }
  ];
  public data: any = {
    confirmation: '',
    reqNameControl: '',
    files: []
  };
  public show = false;

  private vm: VisualModel = {
    ReportType: '',
    ActualConfig: '',
    UniqueConfig: '',
    RequestedBy: '',
    RequestName: '',
    Instance: '',
    Options: {}
  };
  private sessionModel!: SessionModel;
  private manageSessionObs!: Observable<string>;
  private createRecordObs!: Observable<object>;
  private sessionSubscription$!: Subscription;
  private createRecordSubcription$!: Subscription;
  isPreviewDataLoaded = false;
  previewData!: any;

  constructor(
    private router: Router,
    private visualizationService: VisualizationService,
    private notificationService: NotificationsService,
    private shepherdService: ShepherdService,
    private gstoolscookieService: GstoolscookieService // private sanitizer: DomSanitizer
  ) {
    this.filtered_vstypes = this.visualization_types;
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      confirmation: new FormControl(this.data['confirmation'], [
        Validators.required
      ]),
      reqNameControl: new FormControl(this.data.reqNameControl, [
        Validators.required,
        Validators.maxLength(50),
        Validators.minLength(3),
        Validators.pattern(/^[\w][\w_\s-]+$/)
      ]),
      files: new FormControl(this.data.files, [Validators.required])
    });
    this.valueChange(this.visualization_types[0].title);
    this.manageSession();
  }

  ngOnDestroy(): void {
    if (this.sessionSubscription$) this.sessionSubscription$.unsubscribe();
    if (this.createRecordSubcription$)
      this.createRecordSubcription$.unsubscribe();
  }

  public get isValid(): string {
    return (
      this.form.controls['confirmation'].invalid &&
      this.form.controls['confirmation'].errors?.['required']
    );
  }

  //Manage session subscription.
  private manageSession() {
    this.manageSessionObs = this.gstoolscookieService.getUserInfo().pipe(
      map(response => {
        this.sessionModel = <SessionModel>response;
        this.visualizationService.checkForSubscription(this.sessionModel);
        return this.sessionModel.validity;
      })
    );
    if (this.sessionSubscription$) this.sessionSubscription$.unsubscribe();
    this.sessionSubscription$ = this.manageSessionObs.subscribe(
      (bTrue: any) => {
        //If session is invalid it automatically redirects to home page
      }
    );
  }

  //get Preview data
  public getPreview() {
    this.isPreviewDataLoaded = false;
    this.previewData = undefined;
    this.gstoolscookieService.preview().subscribe({
      next: (dataArray: any) => {
        this.previewData = dataArray;
        this.isPreviewDataLoaded = true;
      },
      error: (err: any) => {
        this.notificationService.showNotification('error', err.error);
        this.isPreviewDataLoaded = true;
      }
    });
  }

  // Clear files selected ,
  // this is when user switches between visualization types.
  public clearModel(): void {
    this.myFiles = null;
    this.configValuesChanged = true;
    this.selectedConfigValues = [];
    this.selectedNetworkRegions = [];
    this.extractedData = {};
    this.form.controls['files'].reset();
  }

  //Any change in the selected visualization type .
  public valueChange(e: string): void {
    this.selectedReportType = e;
    if (e.includes('NRV')) {
      this.myRestrictions = {
        allowedExtensions: ['.pva', '.dll']
      };
      this.hintText = 'Select a .PVA File ';
      this.description =
        '<div>Network Region Viewer exports network region data from a ProVision configuration into a Visio diagram.Network Region Viewer references a number of ProVision objects to create the diagram.For the tool to run successfully your project must include a locations object and an ip-network-region object.Network Region Viewer will also reference the following objects if they are available in the Config folder:<ul><li>cabinet</li><li>ip-interface</li><li>media-gateway</li><li>remote-office</li><li>signaling-group</li><li>survivable-processor</li><li>ip-codec-set</li><li>ip-network-map</li></ul></div>';
    } else {
      this.myRestrictions = {
        allowedExtensions: ['.xml']
      };
      this.hintText = 'Select a .XML File ';
      this.description =
        "<div>The ASCI Visualization Tool is the latest in the series of visualization.It can be used to draw a Visio diagram using an XML-formatted version of the Inventory Report data.This XML file will contain all of the data required to create a visual diagrams.The scope will be limited to data currently found in the ASCI Inventory Report.<br><b>Note:</b> It is recommended to schedule ASCI scans using ASCI's 'crawl' feature to get a complete network diagram.<div>";
    }
    this.clearModel();
  }

  //When a file is selected...
  public select(e: SelectEvent): void {
    this.selectedConfigValues = [];
    this.extractedData = {};
    e.files.forEach((file: FileInfo) => {
      if (!file.validationErrors) {
        // const reader = new FileReader();
        // reader.readAsDataURL(file.rawFile!);
        this.formData = new FormData();
        this.formData.append('file', file.rawFile!);
      }
    });
  }

  //Show Preview
  public onpreview() {
    this.opened = true;
    this.getPreview();
  }

  public onLaunch() {
    if (this.flagForLaunch === false) {
      this.oneClickLaunch();
    }
  }
  public oneClickLaunch() {
    this.flagForLaunch = true;
    this.flagForConnectionSettings = true;
    this.visualizationService
      .getForShepherd('?tool=visualization&route=vaas-home')
      .subscribe(res => {
        const response: any = res;
        const builtInButtons: any = response.metadata.buttons;
        let steps: any = response.steps;

        Object.keys(builtInButtons).forEach((key: any) => {
          if (key.toLowerCase().includes('cancel')) {
            builtInButtons[key]['action'] = () => {
              document.body.classList.remove('disable-scroll');
              this.form.enable();
              this.flagForLaunch = false;
              this.flagForConnectionSettings = false;
              this.shepherdService.cancel();
            };
            delete builtInButtons[key]['type'];
          } else if (key.toLowerCase().includes('next')) {
            builtInButtons[key]['actions'] = () => this.shepherdService.next();
          } else if (key.toLowerCase().includes('back')) {
            builtInButtons[key]['actions'] = () => this.shepherdService.back();
          } else if (key.toLowerCase().includes('complete')) {
            builtInButtons[key]['action'] = () => {
              document.body.classList.remove('disable-scroll');
              this.form.enable();
              this.flagForLaunch = false;
              this.flagForConnectionSettings = false;
              return this.shepherdService.complete();
            };
            delete builtInButtons[key]['type'];
          }
        });

        this.shepherdService.defaultStepOptions = {
          classes: 'shepherd-theme-custom',
          modalOverlayOpeningPadding: 6,
          modalOverlayOpeningRadius: 5,
          scrollTo: true,
          scrollToHandler: (e: any) => {
            const y = e.getBoundingClientRect().top + window.scrollY - 60;
            window.scroll({
              top: y,
              behavior: 'smooth'
            });
          },
          popperOptions: {
            modifiers: [{ name: 'offset', options: { offset: [0, 38] } }]
          }
        };

        this.shepherdService.modal = true;
        this.shepherdService.confirmCancel = false;
        document.body.classList.add('disable-scroll');

        this.form.disable();

        steps = steps.map((step: any) => ({
          ...step,
          showOn(): boolean {
            const element = document.querySelector(step.attachTo.element);
            return Boolean(element);
          },
          buttons: step.buttons.map((button: string) => builtInButtons[button])
        }));
        this.shepherdService.addSteps(steps);
        this.shepherdService.start();
      });
  }

  // Close preview dialog
  public close(status: string): void {
    this.opened = false;
  }

  //goto visualization history page.
  public visualizations() {
    this.router.navigate(['VisHistory'], {});
  }

  //search text for visualization type filters option.
  vstype() {
    this.filtered_vstypes = this.vstypetext
      ? this.visualization_types.filter(p =>
          p.title.toLowerCase().includes(this.vstypetext.toLowerCase())
        )
      : this.visualization_types;
  }

  //Update information necessary for req to be sent.
  private updateVisualModel(ufilename: string) {
    if (this.myFiles != null) {
      this.vm.ReportType = this.selectedReportType;
      this.vm.ActualConfig = this.myFiles[0].name;
      this.vm.UniqueConfig = ufilename;
      this.vm.RequestedBy = this.sessionModel.email;
      this.vm.RequestName = this.reqName;
      if (this.selectedReportType.includes('NRV')) {
        this.vm.Options.SelectedConfig = this.buildSelectedConfigPath();
        this.vm.Options.SelectedRegions = this.selectedNetworkRegions;
        this.vm.Options.NetworkRegions = this.networkRegionSelection;
        this.vm.Options.HideUnselectedNetworkRegions =
          this.hideUnselectedNetworkRegions.toString();
        this.vm.Options.IPConnections = this.IPConnections.toString();
        this.vm.Options.IPWithIGAROverflow = this.IPWithIGAROverflow.toString();
        this.vm.Options.IGARConnections = this.IGARConnections.toString();
      } else if (this.selectedReportType.includes('AVT')) {
        this.vm.Options.ASCIInventoriedNodesOnly =
          this.ASCIInventoriedNodesOnly.toString();
      }
      this.vm.Instance = window.location.pathname
        .split('/')[1]
        .replace('-', '');
    }
  }

  //Submit the request.
  public submitFormValues() {
    if (this.networkRegionSelection === 'SelectedRegions') {
      if (
        JSON.stringify(this.extractedData) === '{}' ||
        this.configValuesChanged === true
      ) {
        this.isLoading = true;
        this.visualizationService
          .extractData(this.buildNRVExtractionFormData())
          .subscribe((data: any) => {
            this.extractedData = this.parseExtractedData(data);
            this.isLoading = false;
            this.showSelectedNetworkView = true;
            this.configValuesChanged = false;
          });
      } else {
        this.showSelectedNetworkView = true;
      }
    } else {
      this.submit(this.form.value, this.form.valid);
    }
  }

  public submit(value: any, valid: boolean): void {
    this.submitted = true;

    if (valid) {
      this.closeSelectedNetworkView();
      this.manageSession();
      this.isLoading = true;
      this.createRecordObs = this.visualizationService
        .sendFile(this.formData)
        .pipe(
          switchMap(ufname => {
            this.updateVisualModel(ufname.toString());
            return this.visualizationService.create(this.vm);
          })
        );

      this.createRecordSubcription$ = this.createRecordObs.subscribe(
        response => {
          if (response.toString() == 'Added Successfully') {
            const msg = `Your request '${this.reqName}' has been submitted successfully.You can view its status by clicking on 'Visualization history' button.`;
            this.notificationService.showNotification('success', msg);
            this.form.reset({
              confirmation: this.visualization_types[0].title,
              reqNameControl: '',
              files: []
            });
            this.valueChange(this.visualization_types[0].title);
          } else {
            console.error(
              'Sending record data failed!!!' + response.toString()
            );
            this.notificationService.showNotification(
              'error',
              'Sending record data failed!!!'
            );
          }
          this.isLoading = false;
        }
      );
    } else {
      this.form?.markAllAsTouched();
    }
    this.submitted = false;
  }

  public handleTreeEvent(event: any) {
    switch (event.eventType) {
      case 'close':
        this.closeTreeView();
        break;
      case 'select':
        this.openedTreeView = false;
        this.selectPVAConfig(event.value.data, event.value.selectedKeys);
        break;
      default:
    }
  }

  public closeTreeView() {
    this.openedTreeView = false;
  }
  public selectPVAConfig(data: any, selectedKeys: any) {
    let text = '';
    for (const index of selectedKeys[0].split('_')) {
      text += data[index].text;
      text += '/';
      data = data[index].items;
    }
    if (
      this.selectedConfigValues.length > 0 &&
      selectedKeys != this.selectedConfigValues[0].index
    ) {
      this.configValuesChanged = true;
    }
    this.selectedConfigValues = [{ index: selectedKeys, value: text }];
  }

  public openConfigTreeView() {
    this.gatherDataFromArchive();
  }

  public gatherDataFromArchive() {
    const data: any = [];
    const projectExtension = '.prj';
    const switchExtension = '.swi';
    const configExtension = '.cfg';
    if (this.myFiles !== null) {
      new JSZip()
        .loadAsync(this.myFiles[0], { base64: true })
        .then((zip: any) => {
          this.zip = zip;
          for (const key of Object.keys(zip.files)) {
            const value = zip.files[key];
            if (value.dir === true) {
              const splitString = value.name.split('/');
              if (
                splitString.length === 2 &&
                (splitString[0].includes(projectExtension) ||
                  splitString[0].includes(switchExtension) ||
                  splitString[0].includes(configExtension))
              ) {
                data.push({
                  text: splitString[0]
                    .replace(projectExtension, '')
                    .replace(switchExtension, '')
                    .replace(configExtension, ''),
                  items: []
                });
              } else if (
                splitString.length === 3 &&
                ((splitString[0].includes(switchExtension) &&
                  splitString[1].includes(configExtension)) ||
                  (splitString[0].includes(projectExtension) &&
                    splitString[1].includes(switchExtension)))
              ) {
                if (
                  data[data.length - 1] !== undefined &&
                  data[data.length - 1].items !== undefined
                ) {
                  data[data.length - 1].items.push({
                    text: splitString[1]
                      .replace(switchExtension, '')
                      .replace(configExtension, ''),
                    items: []
                  });
                }
              } else if (
                splitString.length === 4 &&
                splitString[2].includes(configExtension)
              ) {
                if (
                  data[data.length - 1] !== undefined &&
                  data[data.length - 1].items !== undefined
                ) {
                  const innerObject = data[data.length - 1].items;
                  if (
                    innerObject[innerObject.length - 1] !== undefined &&
                    innerObject[innerObject.length - 1].items !== undefined
                  ) {
                    innerObject[innerObject.length - 1].items.push({
                      text: splitString[2].replace(configExtension, ''),
                      items: []
                    });
                  }
                }
              }
            }
          }
          this.pvaData = data;
          this.openedTreeView = true;
        });
    }
  }

  public rowSelectionEvent(event: any) {
    this.selectedNetworkRegions = event.selectedRecords;
  }

  private buildNRVExtractionFormData() {
    const data = new FormData();
    data.set('config', this.buildSelectedConfigPath());
    if (this.myFiles) {
      data.append('file', this.myFiles[0]);
    }

    return data;
  }
  private buildSelectedConfigPath() {
    const configParts = this.selectedConfigValues[0].value.split('/');
    let configPath = '';
    if (configParts.length > 1) {
      configPath = configParts[configParts.length - 2] + '.cfg';
    }
    if (configParts.length > 2) {
      configPath = configParts[configParts.length - 3] + '.swi/' + configPath;
    }
    if (configParts.length > 3) {
      configPath = configParts[configParts.length - 4] + '.prj/' + configPath;
    }
    configPath = '/' + configPath;
    return configPath;
  }

  public validateConfig() {
    if (
      JSON.stringify(this.extractedData) === '{}' ||
      this.configValuesChanged === true
    ) {
      this.isLoading = true;
      this.visualizationService
        .extractData(this.buildNRVExtractionFormData())
        .subscribe((data: any) => {
          this.extractedData = this.parseExtractedData(data);
          this.isLoading = false;
          this.showValidationPanel = true;
          this.configValuesChanged = false;
        });
    } else {
      this.showValidationPanel = true;
    }
  }
  public closeValidateView() {
    this.showValidationPanel = false;
  }
  public closeSelectedNetworkView() {
    this.showSelectedNetworkView = false;
  }
  public getReportFile() {
    const xmlHeader =
      '<?xml version="1.0" standalone="yes"?>\n<?xml-stylesheet type="text/xsl" href="NRVReport.xsl"?>';
    const blob = new Blob(
      [
        js2xmlparser
          .parse('NRVDataset', this.prepareJSONForConvert(this.extractedData))
          .replace("<?xml version='1.0'?>", xmlHeader)
      ],
      { type: 'xml' }
    );
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = 'NRVReport.xml';
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
    window.URL.revokeObjectURL(elem.href);
  }
  private prepareJSONForConvert(json: any) {
    let jsonString = JSON.stringify(json).replace(/\s(?=\w+":)/g, '');
    const regex = new RegExp(/\s(?=\w+":)/g);
    while (regex.test(jsonString)) {
      jsonString = jsonString.replace(regex, '');
    }
    return JSON.parse(jsonString);
  }
  public parseExtractedData(data: any) {
    const extractedData: any = {};
    for (const tabStrip of VaasHomeComponent.NRVExtractedDataCategories) {
      extractedData[tabStrip] = JSON.parse(data[tabStrip]);
    }
    return extractedData;
  }

  public configOptionsConnectionTypeChange() {
    if (
      this.IPConnections === false &&
      this.IPWithIGAROverflow === false &&
      this.IGARConnections === false
    ) {
      this.IPConnections = true;
    }
  }
}
