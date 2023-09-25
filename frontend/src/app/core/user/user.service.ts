/**
 * This service automatically generates an error
 * on 401 and 403
 */


import {catchError} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { User } from '../user.model';
import { HttpHandler } from '../../core/http-handler';
import { EnvService } from '../../core/env/env.service';

@Injectable({
  "providedIn": "root"
})
export class UserService {

  private apiBase: string;

  constructor(
    private http: HttpClient,
    private httpHandler: HttpHandler,
    private env: EnvService
  ) {
    this.apiBase = this.env.backendUrl;
  }

  getAll(): Observable<any> {
    return this.http.get(`${this.apiBase}/api/auth/users`, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  getById(id: string): Observable<any> {
    return this.http.get(`${this.apiBase}/api/auth/users/` + id, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  create(user: User): Observable<any> {
    return this.http.post(`${this.apiBase}/api/auth/users`, user, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  // can not be used to change password
  update(user: User): Observable<any> {
    return this.http.put(`${this.apiBase}/api/auth/users/` + user.username, user, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  changeActiveRole(user: User, role: any): Observable<any> {
    return this.http.post(`${this.apiBase}/api/auth/users/changeactiverole/` + user.username, {role: role}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  addPasswordByUser(username: string, password: string): Observable<any> {
    return this.http.put(`${this.apiBase}/api/auth/users/addpassword/` + username,
      {password: password},
      this.jwt()).pipe(
        catchError(res => this.httpHandler.handleError(res)));
  }

  changePasswordByUser(username: string, oldPassword: string, newPassword): Observable<any> {
    return this.http.put(`${this.apiBase}/api/auth/users/changepassword/` + username,
      {old: oldPassword, new: newPassword},
      this.jwt()).pipe(
        catchError(res => this.httpHandler.handleError(res)));
  }

  removePasswordByAdmin(username: string): Observable<any> {
    return this.http.put(`${this.apiBase}/api/auth/users/removepasswordbyadmin/` + username,
      null,
      this.jwt()).pipe(
        catchError(res => this.httpHandler.handleError(res)));
  }

  
  deleteByUser(username: string, oldPassword: string): Observable<any> {
    return this.http.post(`${this.apiBase}/api/auth/users/deletebyuser/` + username,
      {old: oldPassword},
      this.jwt()).pipe(
        catchError(res => this.httpHandler.handleError(res)));
  }

  deleteByAdmin(id: string): Observable<any> {
    return this.http.delete(`${this.apiBase}/api/auth/users/` + id, this.jwt()).pipe(
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
      params: new HttpParams()
    };
    return requestOptions;
  }
}
