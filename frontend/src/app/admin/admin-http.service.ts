
import {catchError} from "rxjs/operators";
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";

import { Observable } from "rxjs";

import { HttpHandler } from "../core/http-handler";
import { EnvService } from "../core/env/env.service";

@Injectable()
export class AdminHttpService {

  private apiBase: string;;

  constructor(
    private http: HttpClient,
    private httpHandler: HttpHandler,
    private env: EnvService
  ) {
    this.apiBase = this.env.backendUrl;
  }

  /*
   * Url routes are to task_server, node proxies it if it sees tasksapi
   */

  getFailedJobs(first: number, rows: number): Observable<any> {
    const options = this.jwt();
    options.params = new HttpParams()
    .set("first", first.toString())
    .set("rows", rows.toString())
    ;

    return this.http.get(`${this.apiBase}/tasksapi/get_failed_jobs`, options).pipe(
    catchError(res => this.httpHandler.handleError(res)));
  }

  clearFailed(): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/clear_failed`, {}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  addWorker(queue: string): Observable<any> {
    const request = {
      queue
    };
    return this.http.post(`${this.apiBase}/tasksapi/add_worker`, request, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  killWorker(workerName: string): Observable<any> {
    const request = {
      worker_name: workerName
    };
    return this.http.post(`${this.apiBase}/tasksapi/kill_worker`, request, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getDetailedStatus(): Observable<any> {
    return this.http.get(`${this.apiBase}/tasksapi/status_detailed`, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getScheduledJobs(): Observable<any> {
    return this.http.get(`${this.apiBase}/tasksapi/get_scheduled_jobs`, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  nmapHaScan(which_part: string, replace: boolean): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/nmapha/scan`, {which_part, replace}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  detectGarage(): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/garage/detect`, {}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
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
