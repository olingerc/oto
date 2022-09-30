import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

import { io, Socket } from "socket.io-client";

import { EnvService } from "../core/env/env.service";

@Component({
  selector: 'printer-component-sidenav',
  templateUrl: './printer.component.html',
  styleUrls:['./printer.component.scss']
})
export class PrinterComponent implements OnInit {

  @ViewChild("streaming", { static: true } as any) public streamingCanvas: ElementRef;

  private socket: Socket = null;
  public socketStatus = "Init";
  public printerStatus: any = {"waiting": true};

  constructor(
    private http: HttpClient,
    private env: EnvService
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
        // incoming is 640
        ctx.drawImage(img,0,0,320, 180);
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

    /* Printer */
    this.getPrinterStatus();

  }

  getPrinterStatus() {
    const options = this.jwt();
    this.http.get(`/api/printer/status`, options)
      .subscribe(data =>{
        this.printerStatus = data;
      });
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
