/**
 * This service automatically generates an error
 * on 401 and 403
 */


import {catchError} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { User } from '../user.model';
import { Group } from '../group.model';
import { Lab } from '../lab.model';
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

  getLdapUsers(): Observable<any> {
    return this.http.get(`${this.apiBase}/api/auth/usersldap`, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  create(user: User): Observable<any> {
    return this.http.post(`${this.apiBase}/api/auth/users`, user, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  // can not be used to change password
  update(user: User): Observable<any> {
    return this.http.put(`${this.apiBase}/api/auth/users/` + user.id, user, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  changeActiveGroup(user: User, group: Group): Observable<any> {
    return this.http.post(`${this.apiBase}/api/auth/users/changeactivegroup/` + user.id, {groupId: group ? group.id : null}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  changeActiveRole(user: User, role: any): Observable<any> {
    return this.http.post(`${this.apiBase}/api/auth/users/changeactiverole/` + user.id, {role: role}, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  addPasswordByUser(id: string, password: string): Observable<any> {
    return this.http.put(`${this.apiBase}/api/auth/users/addpassword/` + id,
      {password: password},
      this.jwt()).pipe(
        catchError(res => this.httpHandler.handleError(res)));
  }

  changePasswordByUser(id: string, oldPassword: string, newPassword): Observable<any> {
    return this.http.put(`${this.apiBase}/api/auth/users/changepassword/` + id,
      {old: oldPassword, new: newPassword},
      this.jwt()).pipe(
        catchError(res => this.httpHandler.handleError(res)));
  }

  removePasswordByAdmin(id: string): Observable<any> {
    return this.http.put(`${this.apiBase}/api/auth/users/removepasswordbyadmin/` + id,
      null,
      this.jwt()).pipe(
        catchError(res => this.httpHandler.handleError(res)));
  }

  
  removeTasksApiToken(id: string): Observable<any> {
    return this.http.put(`${this.apiBase}/api/auth/users/removetasksapitoken/` + id,
      null,
      this.jwt()).pipe(
        catchError(res => this.httpHandler.handleError(res)));
  }

  deleteByUser(id: string, oldPassword: string): Observable<any> {
    return this.http.post(`${this.apiBase}/api/auth/users/deletebyuser/` + id,
      {old: oldPassword},
      this.jwt()).pipe(
        catchError(res => this.httpHandler.handleError(res)));
  }

  deleteByAdmin(id: string): Observable<any> {
    return this.http.delete(`${this.apiBase}/api/auth/users/` + id, this.jwt()).pipe(
    catchError(res => this.httpHandler.handleError(res)));
  }

  getGroups(labTitle: string = null): Observable<any> {
    let options = this.jwt();
    if (labTitle) {
      options.params = new HttpParams().set('labtitle', labTitle);
    }

    return this.http.get(`${this.apiBase}/api/auth/groups`, options).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  createGroup(group: Group): Observable<any> {
    return this.http.post(`${this.apiBase}/api/auth/groups`, group, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  updateGroup(group: Group): Observable<any> {
    return this.http.put(`${this.apiBase}/api/auth/groups/` + group.id, group, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  deleteGroup(id: string): Observable<any> {
    return this.http.delete(`${this.apiBase}/api/auth/groups/` + id, this.jwt()).pipe(
    catchError(res => this.httpHandler.handleError(res)));
  }

  getLabs(): Observable<any> {
    return this.http.get(`${this.apiBase}/api/auth/labs`, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  createLab(lab: Lab): Observable<any> {
    return this.http.post(`${this.apiBase}/api/auth/labs`, lab, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  updateLab(lab: Lab): Observable<any> {
    return this.http.put(`${this.apiBase}/api/auth/labs/` + lab.id, lab, this.jwt()).pipe(
      catchError(res => this.httpHandler.handleError(res)));
  }

  deleteLab(id: string): Observable<any> {
    return this.http.delete(`${this.apiBase}/api/auth/labs/` + id, this.jwt()).pipe(
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
