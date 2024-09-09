import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { SessionModel } from '../models/session.model';
const hostname = environment.VAAS_BASE_URL;
const instance = window.location.pathname.split('/')[1].replace('-', '');
const baseUrl = hostname + 'report';
const userUrl = hostname + 'report/users';
const sendFileUrl = hostname + 'report/savefile';
const sessionUrl = hostname + 'session/' + instance;
const extractDataUrl = hostname + 'report/extractdata';
const stylesheetDataUrl = hostname + 'report/stylesheet';
const baseUrlForShepherd =
  window.location.origin + '/' + instance + '/api/shepherd/reports';
@Injectable({
  providedIn: 'root'
})
export class VisualizationService {
  constructor(private http: HttpClient) {}
  public static moduleName = 'Visualization';
  public static path = `https://${window.location.hostname}/${
    window.location.pathname.split('/')[1]
  }`;

  getAll() {
    return this.http.get(`${baseUrl}/${instance}`);
  }

  getbyid(id: any) {
    return this.http.get(`${baseUrl}/${id}`);
  }

  getForShepherd(id: string) {
    return this.http.get(`${baseUrlForShepherd}/${id}`);
  }

  getrecordsof(emailid: any) {
    return this.http.get(`${baseUrl}/${instance}/${emailid}`);
  }

  getusers() {
    return this.http.get(`${userUrl}/${instance}`);
  }

  create(data: any) {
    return this.http.post(baseUrl, data);
  }

  sendFile(data: any) {
    return this.http.post(sendFileUrl, data);
  }

  update(id: any, data: any) {
    return this.http.put(`${baseUrl}/${id}`, data);
  }

  delete(id: any) {
    return this.http.delete(`${baseUrl}/${id}`);
  }

  getSessionID() {
    return this.http.get(sessionUrl, { withCredentials: true });
  }

  shareReport(url: string, data: any) {
    return this.http.post(url, data);
  }

  extractData(data: any) {
    return this.http.post(extractDataUrl, data);
  }

  downloadStylesheet() {
    return this.http.get(stylesheetDataUrl, { responseType: 'blob' });
  }

  checkForSubscription(sessionModel: SessionModel) {
    if (sessionModel.validity.toLowerCase() == 'valid') {
      if (
        sessionModel.subscriptions.includes(VisualizationService.moduleName)
      ) {
        return;
      }
    }
    window.location.href = `${VisualizationService.path}/catalog`;
  }
}
