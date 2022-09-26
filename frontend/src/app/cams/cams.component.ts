import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import JSMpeg from '@cycjimmy/jsmpeg-player';

@Component({
  selector: 'cams-component-sidenav',
  templateUrl: './cams.component.html',
  styleUrls:['./cams.component.scss']
})
export class CamsComponent implements OnInit {

  @ViewChild("streaming", { static: true } as any) public streamingCanvas: ElementRef;

  ngOnInit() {
    let player = new JSMpeg.Player('ws://localhost:6147', {
      canvas: this.streamingCanvas.nativeElement, autoplay: true, audio: false, loop: true
    });
  }

}
