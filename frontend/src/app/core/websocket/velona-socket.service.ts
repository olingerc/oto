import { Injectable } from '@angular/core';

import { Observable, BehaviorSubject, Subject, Subscription } from 'rxjs';
import { map } from "rxjs/operators";
import { io, Socket } from "socket.io-client";
import * as _ from "lodash";

import { User } from '../user.model';
import { EnvService } from '../../core/env/env.service';
import { BioinfHttpService } from "../../bioinf-core/services/bioinf-http.service";
import { AlertService } from '../alert/alert.service';

@Injectable({
  "providedIn": "root"
})
export class VelonaSocketService {

  // We could be on server or devel machine
  // everything after the / is the socket namespace
  // bioinf server is configured with the bioinf namespace but giving none will works as well (NOTE: why?)
  private websocketUrl: string;

  private socket: Socket = null;
  private signalsListenedTo: any = {};

  // Signals
  private connectionStatus$: BehaviorSubject<string> = new BehaviorSubject('connecting...');
  private onTasksProgressMessage: Subject<any> = new Subject();

  static socketIoOptions(username, groupId, path) {
    // function because username changes
    let query = {};
    if (username) {
      query['username'] = username;
    }
    if (groupId) {
      query['groupId'] = groupId;
    }
    return {
      'multiplex': false,
      'transports': ['websocket', 'polling', 'flashsocket'],
      'path': path,
      'query':  query,
      'reconnectionAttempts': 3,
    };
  }

  constructor(
    private env: EnvService,
    private httpService: BioinfHttpService,
    private alertService: AlertService
  ) {
    this.websocketUrl = this.env.backendUrl + '/';
  }

  connectionStatus(): Observable<any> {
    return this.connectionStatus$.asObservable();
  }

  connect(path: string, currentUser: User) {
    this.connectionStatus$.next('connecting...');

    /*
    SOCKET
    */

    // Remember that I "force new connect" for every connection
    this.socket = io(
      this.websocketUrl,
      VelonaSocketService.socketIoOptions(
        currentUser.username,
        currentUser.activeGroup ? currentUser.activeGroup.id : null,
        path)
    );

    this.socket.on('connect', () => {
      this.connectionStatus$.next('connected');
    });

    this.socket.on('disconnect', () => {
      this.connectionStatus$.next('no connection');
    });

    this.socket.on('connect_failed', (data) => {
      this.connectionStatus$.next('no connection');
      console.error('connect_failed', data);
    });

    this.socket.on('connect_error', (data) => {
      this.connectionStatus$.next('no connection');
      console.error('Velona-socket-connection-error', data);
    });

    this.socket.on('error', (data) => {
      this.connectionStatus$.next('no connection');
      console.error('socket-error', data);
    });
  }

  disconnect(moduleName=null) {
    _.each(this.signalsListenedTo[moduleName], (signal) => {
      this.socket.off(signal);
    });
  }

  emit(signal, data = null) {
    if (data) {
      this.socket.emit(signal, data);
    } else {
      this.socket.emit(signal);
    }
  }

  addSubject$(moduleName, signal) {
    // Store signal for later disconnect
    if (!this.signalsListenedTo[moduleName]) {
      this.signalsListenedTo[moduleName] = [];
    }
    this.signalsListenedTo[moduleName].push(signal);

    // Create subscription
    let subscribe = (subscriber: any) => {
      this.socket.on(signal,
        (data: any) => subscriber.next(data)
      );
    };

    // Return observable
    const obs = new Observable(subscribe);
    return obs
  }

  setupSystemSocketSubscriptions() {
    this.addSubject$("system", "tasks_progress_message")
      .subscribe((data: any) => {
        this.onTasksProgressMessage.next(data.message);
      });
    

    this.addSubject$("system", "tasks_progress_error")
      .subscribe((data: any) => {
        this.onTasksProgressMessage.next(data.message);
      });
  }

  newTasksProgressMessage(): Observable<any> {
    return this.onTasksProgressMessage.asObservable();
  }

  sendTasksProgressMessage(data) {
    this.onTasksProgressMessage.next(data);
  }

  cancelExport(pipelineid, callback = null) {
    this.httpService.cancelExport(pipelineid)
      .subscribe(
        response => {
          if (callback && typeof(callback) === "function") {
            callback(null);
          }
        },
        error => {
          if (callback && typeof(callback) === "function") {
            callback(error);
          }
          this.alertService.error(error);
          console.error("error cancelling pipeline batch", error);
        }
      );
  }

}
