import { Injectable } from '@angular/core';
import { NotificationService } from '@progress/kendo-angular-notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  constructor(private notificationService: NotificationService) {}

  //show notification as appropriate,
  public showNotification(notifStyle: string, message: string): void {
    type val = 'success' | 'none' | 'warning' | 'error' | 'info';
    const msg = message;
    this.notificationService.show({
      content: msg,
      animation: {
        type: 'slide',
        duration: 2500
      },
      type: { style: notifStyle as val },
      position: { horizontal: 'center', vertical: 'top' },
      closable: notifStyle == 'error' || notifStyle == 'info'
    });
  }
}
