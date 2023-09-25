import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';

import { io, Socket } from "socket.io-client";

@Component({
  selector: 'cams-component-sidenav',
  templateUrl: './cams.component.html',
  styleUrls:['./cams.component.scss']
})
export class CamsComponent implements OnInit {

  @ViewChild("streaming", { static: true } as any) public streamingCanvas: ElementRef;
  @ViewChild("streaming2", { static: true } as any) public streamingCanvas2: ElementRef;

  private socket: Socket = null;
  private socket2: Socket = null;
  public socketStatus = "Init";
  public socketStatus2 = "Init";

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


    const namespace2 = "cam1";
    this.socket2 = io(
      "/" + namespace2,
      {
        'multiplex': false,
        'transports': ['websocket', 'polling', 'flashsocket'],
        'path': "/camssocket",
        'reconnectionAttempts': 3,
      }
    );

    this.socket2.on('connect', () => {
      this.socketStatus2 = "Connected. Waiting..."
    });

    this.socket2.on('data', (data) => {
      this.socketStatus2 = "Receiving";
      var bytes = new Uint8Array(data);
      var blob = new Blob([bytes], {type: 'application/octet-binary'});
      var url = URL.createObjectURL(blob);
      var img = new Image();
      var ctx = this.streamingCanvas2.nativeElement.getContext("2d");
      img.onload = () => {
        URL.revokeObjectURL(url);
        const iWidth = img.naturalWidth;
        const iHeight = img.naturalHeight;
        this.streamingCanvas2.nativeElement.width = iWidth;
        this.streamingCanvas2.nativeElement.height = iHeight;
        ctx.drawImage(img, 0, 0);
      };
      img.src = url;
    });

    this.socket2.on('disconnect', () => {
      this.socketStatus2 = "Disconnected 2."
    });

    this.socket2.on('connect_failed', (data) => {
      console.error('connect_failed 2' , data);
      this.socketStatus2 = "Error."
    });

    this.socket2.on('connect_error', (data) => {
      console.error('socket-connection-error 2', data);
      this.socketStatus2 = "Error."
    });

    this.socket2.on('error', (data) => {
      console.error('socket-error 2', data);
      this.socketStatus2 = "Error."
    });

  }

}
