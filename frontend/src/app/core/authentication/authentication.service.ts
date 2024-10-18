
import { Observable , Subject, of } from 'rxjs';

import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';

import _ from 'lodash';

import { User } from '../user.model';
import { Privileges } from '../privileges.model';
import { AlertService } from '../alert/alert.service';
import { HttpHandler } from '../../core/http-handler';
import { EnvService } from '../../core/env/env.service';

@Injectable({
  "providedIn": "root"
})
export class AuthenticationService {

  private apiBase: string;

  private currentUserChanged$ = new Subject<User>();

  public debugMode = false;

  // currentUser only for internal use, externals should get from localStorage
  // to avoid unnecessary injections of this service just to get currentUser
  public currentUser: User;

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertService: AlertService,
    private httpHandler: HttpHandler,
    private env: EnvService
  ) {
    this.apiBase = this.env.backendUrl;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  login(username: string, password: string): Observable<boolean> {

    return this.http.post(`${this.apiBase}/api/auth/login`, { username, password })
      .pipe(map(
          (loginUser: any) => {
            // login successful if there's a jwt token in the response
            if (loginUser && loginUser.token) {
              if (loginUser.last_active_groupid) {
                loginUser.activeGroup = _.find(loginUser.groups, {id: loginUser.last_active_groupid});
              }

              this.setCurrentUser(loginUser);

              // return true to indicate successful login
              return true;
            } else {
              // return false to indicate failed login
              return false;
            }
        }
      ),
      catchError(res => this.httpHandler.handleError(res)),);
  }

  logout(callback): void {
    // clear token remove user from local storage to log user out
    localStorage.removeItem('currentUser');

    // update service
    this.currentUser = null;

    this.debugMode = false;

    // notify any subscribers of logout via observable subject
    this.currentUserChanged$.next(null);

    if (callback && typeof(callback) === 'function') {
      callback();
    }
  }

  checkTokenValidity() {
    return this.http
      .get(`${this.apiBase}/api/auth/ping`, this.jwt()).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.error.message.startsWith('Your login has expired')) {
          throw new Error("expired");
        } else {
          return of([]);
        }
      }));
  }

  getCurrentUserChange(): Observable<any> {
    // return observable to be notified of status updates (login/logout)
    return this.currentUserChanged$.asObservable();
  }

  setCurrentUser(user) {
    // NOTE: user objects coming back from the server have no token
    // do not use them in this function but prefer updating currentUser
    // and using that in this method

    // store username and jwt token in local storage to keep user logged in between page refreshes
    localStorage.setItem('currentUser', JSON.stringify(user));

    // update service
    this.currentUser = user;

    // notify any subscribers of successful login via observable subject
    this.currentUserChanged$.next(user);
  }

  authorize(privilege: string) {
    if (_.find(Privileges.privileges, {"key": privilege}) == undefined) {
      this.alertService.error("Unknown privilege: " + privilege);
    }

    return this.currentUser && this.currentUser.active_privileges && this.currentUser.active_privileges.indexOf(privilege) > -1;
  }

  authorizeMany(privileges: string[]) {
    let authorized = false;
    _.each(privileges, (privilege) => {
      if (_.find(Privileges.privileges, {"key": privilege}) == undefined) {
        this.alertService.error("Unknown privilege: " + privilege);
      }
      // test for each until authoriuzed = true
      if (!authorized && this.currentUser.active_privileges) {
        authorized = this.currentUser.active_privileges.indexOf(privilege) > -1;
      }
    });
    return authorized;

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
