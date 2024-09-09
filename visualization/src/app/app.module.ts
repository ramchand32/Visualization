import { CommonsModule, CommonsIconsModule, TreeViewerModule } from 'commons';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VaasHomeComponent } from './vaas-home/vaas-home.component';
import { VaasHistoryComponent } from './vaas-history/vaas-history.component';
import { IconsModule } from '@progress/kendo-angular-icons';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LabelModule } from '@progress/kendo-angular-label';
import { UploadsModule } from '@progress/kendo-angular-upload';
import { HttpClientModule } from '@angular/common/http';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { GridModule } from '@progress/kendo-angular-grid';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { VisualizationService } from './services/visualization.service';
import { GstoolscookieService } from './services/gstoolscookie.service';
import { NotificationsService } from './services/notifications.service';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { NetworkRegionTableComponent } from './vaas-home/network-region-table/network-region-table.component';
import { ValidationTableComponent } from './vaas-home/validation-table/validation-table.component';

@NgModule({
  declarations: [
    AppComponent,
    VaasHomeComponent,
    VaasHistoryComponent,
    NetworkRegionTableComponent,
    ValidationTableComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonsModule,
    CommonsIconsModule,
    BrowserModule,
    AppRoutingModule,
    IconsModule,
    BrowserAnimationsModule,
    InputsModule,
    FormsModule,
    ReactiveFormsModule,
    LabelModule,
    UploadsModule,
    HttpClientModule,
    ButtonsModule,
    GridModule,
    NotificationModule,
    DialogsModule,
    LayoutModule,
    DropDownsModule,
    TreeViewerModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [VisualizationService, GstoolscookieService, NotificationsService],
  bootstrap: [AppComponent]
})
export class AppModule {}
