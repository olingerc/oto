import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from "@angular/common/http";
import { Subscription, interval } from "rxjs";

import { io, Socket } from "socket.io-client";

import { EnvService } from "../core/env/env.service";

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


  constructor(
    private http: HttpClient
  ) {

  }

  ngOnInit() {
    const namespace = "cam0";
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
      this.socketStatus = "Receiving"
      var bytes = new Uint8Array(data);
      var blob = new Blob([bytes], {type: 'application/octet-binary'});
      var url = URL.createObjectURL(blob);
      var img = new Image;
      var ctx = this.streamingCanvas.nativeElement.getContext("2d");
      img.onload = () => {
        URL.revokeObjectURL(url);
        // incoming is 640 * 360
        const ratio = 640 / 360;
        const iWidth = 640;
        const iHeight = 360;
        const width =this.streamingCanvas.nativeElement.offsetHeight * ratio;
        const height =this.streamingCanvas.nativeElement.offsetHeight;
        console.log(width, height)
        ctx.drawImage(
          img,
          0,
          0,
          iWidth, iHeight, // source
          0,
          0,
          width, height, // destination
          );
      };
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

    this.autoRefresh = interval(2000).subscribe(() => { this.getPrinterStatus() });

    /* Printer */
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
