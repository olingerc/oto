import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from "@angular/common/http";
import { Subscription, interval } from "rxjs";

import { io, Socket } from "socket.io-client";
import * as moment from 'moment';

import { EnvService } from "../core/env/env.service";
import { UtilitiesService } from "../core/utilities.service";

@Component({
  selector: 'printer-component-sidenav',
  templateUrl: './printer.component.html',
  styleUrls:['./printer.component.scss']
})
export class PrinterComponent implements OnInit, OnDestroy {

  @ViewChild("streaming", { static: true } as any) public streamingCanvas: ElementRef;

  private socket: Socket = null;
  private autoRefresh: Subscription
  
  public socketStatus = "Init";
  public printerStatus: any;
  public printerError: HttpErrorResponse;
  public jobEndTime: string;


  constructor(
    private http: HttpClient,
    public utils: UtilitiesService
  ) {

  }

  ngOnInit() {
    const namespace = "cam1";
    this.socket = io(
      "/" + namespace,
      {
        'multiplex': false,
        'transports': ['websocket', 'polling', 'flashsocket'],
        'path': "/camssocket",
        'reconnectionAttempts': 3,
      }
    );

    this.socket.on('connect', () => {
      this.socketStatus = "Connected. Waiting..."
    });

    this.socket.on('data', (data) => {
      this.socketStatus = "Receiving";
      var bytes = new Uint8Array(data);
      var blob = new Blob([bytes], {type: 'application/octet-binary'});
      var url = URL.createObjectURL(blob);
      var img = new Image();
      var ctx = this.streamingCanvas.nativeElement.getContext("2d");
      img.onload = () => {
        URL.revokeObjectURL(url);
        const iWidth = img.naturalWidth;
        const iHeight = img.naturalHeight;
        this.streamingCanvas.nativeElement.width = iWidth;
        this.streamingCanvas.nativeElement.height = iHeight;
        ctx.drawImage(img, 0, 0);
      };
      // img.src = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/130527/yellow-flower.jpg';
      img.src = url;
    });

    this.socket.on('disconnect', () => {
      this.socketStatus = "Disconnected."
    });

    this.socket.on('connect_failed', (data) => {
      console.error('connect_failed', data);
      this.socketStatus = "Error."
    });

    this.socket.on('connect_error', (data) => {
      console.error('socket-connection-error', data);
      this.socketStatus = "Error."
    });

    this.socket.on('error', (data) => {
      console.error('socket-error', data);
      this.socketStatus = "Error."
    });

    
    /* Printer Status */
    this.autoRefresh = interval(2000).subscribe(() => { this.getPrinterStatus() });
    this.getPrinterStatus();

  }

  ngOnDestroy(): void {
    this.autoRefresh.unsubscribe();
  }

  getPrinterStatus() {
    const options = this.jwt();
    this.http.get(`/api/printer/status`, options)
      .subscribe(
        data =>{
          this.printerStatus = data;
          this.printerError = null;

          if (this.printerStatus.job) {
            const printTime = this.printerStatus.job.progress.printTimeLeft;
            const endTime = moment().add(printTime, 'seconds');
            if (endTime.format('DD/MM/YYYY') == moment().format('DD/MM/YYYY')) {
              this.jobEndTime = endTime.format('HH:mm');
            } else {
              this.jobEndTime = endTime.format('DD/MM/YYYY HH:mm');
            }
          }
        },
        error => {
          console.log("EE")
          this.printerStatus = null;
          this.printerError = error;
        }
      );
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
