import { Component, OnDestroy } from '@angular/core';
import { map, Observable, Subscription, switchMap, timer } from 'rxjs';
import { SessionModel } from './models/session.model';
import { GstoolscookieService } from './services/gstoolscookie.service';
import { VisualizationService } from './services/visualization.service';
import { CookieService } from 'ngx-cookie-service';
import {
  CommonsIconsRegistry,
  Menu,
  UserDetails,
  CSVIcon,
  PDFIcon,
  VisioIcon,
  ErrorFileIcon
} from 'commons';
import {
  searchIcon,
  xIcon,
  checkIcon,
  questionCircleIcon,
  shareIcon,
  homeIcon
} from '@progress/kendo-svg-icons';
import { environment } from '../environments/environment';

@Component({
  selector: 'visualization-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  manageSessionObs!: Observable<string>;
  sessionSubscription$!: Subscription;
  public sessionModel!: SessionModel;
  public userDetails!: UserDetails;
  public path = `https://${window.location.hostname}/${
    window.location.pathname.split('/')[1]
  }`;
  public displayMenuData: Menu[] = [];
  public menuData: Menu[] = [
    {
      text: 'My Profile',
      link: 'myProfile',
      displayFor: ''
    },
    {
      text: 'My History',
      link: 'myHistory',
      displayFor: ''
    },
    {
      text: 'My Subscriptions',
      link: 'mySubscriptions',
      displayFor: 'user'
    },
    {
      text: 'Manage Catalog',
      link: 'manageCatalog',
      displayFor: 'admin'
    },
    {
      text: 'Manage Categories',
      link: 'manageCategories',
      displayFor: 'admin'
    },
    {
      text: 'Manage Subscriptions',
      link: 'manageSubscriptions',
      displayFor: 'admin'
    },
    {
      text: 'Manage Admins',
      link: 'manageAdmins',
      displayFor: 'admin'
    },
    {
      text: 'Log Out',
      link: '',
      displayFor: ''
    }
  ];

  constructor(
    private visualizationService: VisualizationService,
    private gstoolscookieService: GstoolscookieService,
    private cookieService: CookieService,
    private commonsIconsRegistry: CommonsIconsRegistry
  ) {
    this.commonsIconsRegistry.registerIcons({
      searchIcon,
      xIcon,
      checkIcon,
      questionCircleIcon,
      CSVIcon,
      VisioIcon,
      PDFIcon,
      ErrorFileIcon,
      shareIcon,
      homeIcon
    });
    this.getSessionDetails();
  }

  private getSessionDetails() {
    this.manageSessionObs = this.gstoolscookieService.getUserInfo().pipe(
      map(response => {
        this.sessionModel = <SessionModel>response;
        return this.sessionModel.validity;
      })
    );

    if (this.sessionSubscription$) this.sessionSubscription$.unsubscribe();

    this.sessionSubscription$ = this.manageSessionObs.subscribe(
      (isValid: string) => {
        if (isValid.toLowerCase() === 'valid') {
          this.userDetails = {
            isLoggedIn: true,
            isAdmin: this.sessionModel.isAdmin,
            userInitials: this.sessionModel.name.split(',')[1]
              ? (
                  this.sessionModel.name.split(',')[0].trim().charAt(0) +
                  this.sessionModel.name.split(',')[1].trim().charAt(0)
                )
                  .split('')
                  .reverse()
                  .join('')
              : this.sessionModel.name.split(',')[0].trim().charAt(0) +
                this.sessionModel.name
                  .split(',')[0]
                  .trim()
                  .charAt(1)
                  .split('')
                  .reverse()
                  .join('')
          };
          this.displayMenuData = this.menuData.filter(
            element =>
              element.displayFor === '' ||
              (this.userDetails.isAdmin && element.displayFor === 'admin') ||
              (!this.userDetails.isAdmin && element.displayFor === 'user')
          );
        }
      }
    );
  }

  public eventRequest(event: any) {
    console.log('Event:' + event);
    if (event.eventType === 'menu') {
      if (event.value === 'logo' || event.value === 'home') {
        this.userDetails.isLoggedIn
          ? (window.location.href = `${this.path}/catalog`)
          : (window.location.href = `${this.path}/home`);
      } else {
        this.onMenuClick(event.value);
      }
    }
  }

  public onMenuClick(event: Menu) {
    if (event.text === 'Log Out') {
      this.gstoolscookieService.logout().subscribe({
        next: res => {
          this.cookieService.deleteAll('/', window.location.hostname);
          this.cookieService.deleteAll('/', '.avaya.com');
          window.location.href = `${this.path}/home`;
        },
        error: err => {
          console.log('logout err--', err);
          window.location.href = `${this.path}/home`;
        }
      });
    } else {
      window.location.href = `${this.path}/${event.link}`;
    }
  }

  ngOnDestroy(): void {
    // this.manageSession$.unsubscribe();
    if (this.sessionSubscription$) this.sessionSubscription$.unsubscribe();
  }
}
