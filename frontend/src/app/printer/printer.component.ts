import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';

import { io, Socket } from "socket.io-client";

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

  }

}
