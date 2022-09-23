
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

  getQueuedJobs(): Observable<any> {
    return this.http.get(`${this.apiBase}/tasksapi/get_queued_jobs`, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getScheduledJobs(): Observable<any> {
    return this.http.get(`${this.apiBase}/tasksapi/get_scheduled_jobs`, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  generateHomepage(): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/glimshome`, {}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  doInfraCheck(): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/infracheck`, {}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  parseHubToDb(): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/hub/parse`, {}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  importGlims(which_part: string, replace: boolean): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/glimsimport/import`, {which_part, replace}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  parseVeriseq(): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/veriseq/parse`, {}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  parseVeriseqComplete(): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/veriseq/parsecomplete`, {}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  checkRecent(): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/ngssync/parseonlyrecent`, {}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  checkAll(): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/ngssync/parsecomplete`, {}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  copyNewRuns(): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/ngssync/copynewruns`, {}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  importGlimsVeriseq(): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/veriseq/importglims`, {}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  createInitialVeriseqDb(): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/veriseq/createdb`, {}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  convertConseil(): Observable<any> {
    return this.http.post(`${this.apiBase}/tasksapi/conseil/convert`, {}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getTasksStatus(): Observable<any> {
    const options = this.jwt();

    return this.http.get(`${this.apiBase}/tasksapi/state`, options).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getInfraChecks(): Observable<any> {
    return this.http.get(`${this.apiBase}/tasksapi/infracheck/get`, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  doCompleteVdbRecount(): Observable<any> {
    return this.http.get(`${this.apiBase}/tasksapi/bioinf_variants/docompletevdbrecount`, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  updateContextCounts(): Observable<any> {
    return this.http.get(`${this.apiBase}/tasksapi/bioinf_variants/updatecontexttotals`, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  reinjectAll(): Observable<any> {
    return this.http.get(`${this.apiBase}/tasksapi/bioinf_variants/reinjectall`, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  findNewMappings(): Observable<any> {
    return this.http.get(`${this.apiBase}/tasksapi/bioinf_variants/findnewmappings`, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  findNewMappingsCnv(): Observable<any> {
    return this.http.get(`${this.apiBase}/tasksapi/bioinf_variants/findnewmappingscnv`, this.jwt()).pipe(
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
