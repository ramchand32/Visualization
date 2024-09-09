import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GstoolscookieService {
  private instance = window.location.pathname.split('/')[1].replace('-', '');
  private BASEURL = `https://${window.location.hostname}/${this.instance}/api/validity`;

  constructor(private http: HttpClient) {}

  getUserInfo() {
    return this.http.get(`${this.BASEURL}`, {
      withCredentials: true
    });
  }

  logout() {
    return this.http.get(
      `https://${window.location.hostname}/gstoolspvn/api/logout`
    );
  }

  preview() {
    return this.http.get(
      `https://${window.location.hostname}/gstoolspvn/api/catalog/preview?service=Visualization`
    );
  }
}
