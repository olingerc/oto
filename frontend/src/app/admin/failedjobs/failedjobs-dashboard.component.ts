import { Component, ViewChild } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';

import _ from "lodash";
import moment from "moment";

import { AlertService } from "../../core/alert/alert.service";
import { UtilitiesService } from "../../core/utilities.service";
import { AdminHttpService } from "../admin-http.service";
import { JobdetailsDialog } from '../scheduledjobs/jobdetails-dialog.component';
import { PrimeTemplate } from "primeng/api";
import { TableModule } from "primeng/table";
import { MatIconModule } from "@angular/material/icon";
import { DatePipe } from "@angular/common";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatCardModule } from "@angular/material/card";
import { FlexModule } from "@ngbracket/ngx-layout/flex";

@Component({
    selector: "app-failedjobs-dashboard",
    templateUrl: "./failedjobs-dashboard.component.html",
    styleUrls: ["./failedjobs-dashboard.component.scss"],
    standalone: true,
    imports: [FlexModule, MatCardModule, MatToolbarModule, MatButtonModule, MatTooltipModule, MatIconModule, TableModule, PrimeTemplate, DatePipe]
})
export class FailedjobsDashboardComponent {

  public loading = true;
  public selectedJob: any;
  public allJobs: any[] = [];
  public totalJobs: number;
  public emptyMessage: string = null; // on page init, do not show 'no records'

  @ViewChild("jobsTable", { static: true } as any) public jobsTable: any;

  constructor(
    private dialog: MatDialog,
    private alertService: AlertService,
    private httpService: AdminHttpService,
    private utilities: UtilitiesService,
  ) {
  }


  loadJobs(event) {
    this.emptyMessage = null;
    this.loading = true;
    this.httpService.getFailedJobs(event.first,
                                   event.rows)
      .subscribe(
        response => {
          this.totalJobs = response.total;
          this.allJobs = response.data;
          this.emptyMessage = "No failed jobs";
          this.loading = false;
        },
        error => {
          this.alertService.error("Error getting jobs.");
          console.error(error);
        });
  }

  reloadTable() {
    // reset paging (use this if the underlying number of records changes, not on column change)
    const metaData = this.jobsTable.createLazyLoadMetadata();
    this.jobsTable.onLazyLoad.emit(metaData);
  }


  logToConsole(obj) {
    console.log(obj);
  }

  clearFailed() {
    this.httpService.clearFailed()
    .subscribe(
      response => {
        this.reloadTable();
      },
      error => {
        this.alertService.error(error.error)
      }
    );
  }

  prettyMs(seconds) {
    if (!seconds) {
      return "";
    }
    return this.utilities.prettyMs(seconds * 1000, {verbose: true});
  }

  timeToFinish(start, end) {
    const seconds = moment(end).diff(moment(start), "seconds");
    if (seconds === 0) {
      return "less than a second";
    }
    return this.prettyMs(seconds);
  }

  trackById(index, item) {
    return item.id;
  }

  
  showJobDetails(job) {
    let dialogRef = this.dialog.open(JobdetailsDialog, {
      width: '800px',
      autoFocus: false,
      data: {
        job: job
      }
    });
  }

}
