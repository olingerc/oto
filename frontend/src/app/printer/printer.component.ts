import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from "@angular/common/http";
import { Subscription, interval } from "rxjs";

import moment from 'moment';

import { UtilitiesService } from "../core/utilities.service";
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf, JsonPipe, DecimalPipe } from '@angular/common';
import { FlexModule } from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'printer-component-sidenav',
    templateUrl: './printer.component.html',
    styleUrls: ['./printer.component.scss'],
    standalone: true,
    imports: [FlexModule, NgIf, MatProgressSpinnerModule, MatCardModule, JsonPipe, DecimalPipe]
})
export class PrinterComponent implements OnInit, OnDestroy {

  @ViewChild("streaming", { static: true } as any) public streamingCanvas: ElementRef;

  private autoRefresh: Subscription
  
  public printerStatus: any;
  public printerError: HttpErrorResponse;
  public jobEndTime: string;


  constructor(
    private http: HttpClient,
    public utils: UtilitiesService
  ) {

  }

  ngOnInit() {
   
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
