import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";

import { Observable } from "rxjs";

import { EnvService } from "./env/env.service";

@Injectable()
export class BioinfHttpService {

  private apiBase: string;

  constructor(
    private http: HttpClient,
    private env: EnvService
  ) {
    this.apiBase = this.env.backendUrl;
  }

  /*
   * Url routes are to task_server, node proxies it if it sees tasksapi
   */

  login(request: any): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/login`, {request}, this.jwt());
  }

  private jwt() {
    // create authorization header with jwt token
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let headers;
    if (currentUser && currentUser.token) {
      headers = new HttpHeaders().set('Authorization', currentUser.token);
    } else {
      headers = new HttpHeaders().set('Authorization', '');
    }
    let requestOptions = {
      headers: headers,
      responseType: 'json' as 'json',
      params: new HttpParams()
    };
    return requestOptions;
  }
}
