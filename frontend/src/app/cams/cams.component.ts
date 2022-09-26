import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import JSMpeg from '@cycjimmy/jsmpeg-player';

import { io, Socket } from "socket.io-client";

@Component({
  selector: 'cams-component-sidenav',
  templateUrl: './cams.component.html',
  styleUrls:['./cams.component.scss']
})
export class CamsComponent implements OnInit {

  @ViewChild("streaming", { static: true } as any) public streamingCanvas: ElementRef;

  private socket: Socket = null;
  public socketStatus = "Init";

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
      img.onload = function() {
        URL.revokeObjectURL(url);
        ctx.drawImage(img,0,0);
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
