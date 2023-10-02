
import { Component, OnInit, OnDestroy } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import * as _ from 'lodash';

import { AdminHttpService } from '../admin-http.service';
import { AlertService } from '../../core/alert/alert.service';
import { JobdetailsDialog } from './jobdetails-dialog.component';
import { UtilitiesService } from '../../core/utilities.service';

@Component({
  selector: 'app-admin-scheduledjobs',
  templateUrl: './scheduledjobs.component.html',
  styleUrls: ['./scheduledjobs.component.scss']
})
export class ScheduledjobsComponent implements OnInit, OnDestroy {

  private dedicatedTablesFor = [
  ]

  public importInterval: any;
  public remainingJobs: any[] = [];
  public scheduledJobs: any = {};

  public loading = false;
  public lastLoad: any = moment();

  constructor(
    private dialog: MatDialog,
    private httpService: AdminHttpService,
    private utilities: UtilitiesService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.loadJobs();
  }

  ngOnDestroy() {
    clearInterval(this.importInterval);
  }

  timeToFinish(start, end=null) {
    end = end || moment();
    const seconds = moment(end).diff(moment(start), "seconds");
    if (seconds === 0) {
      return "less than a second";
    }
    return this.prettyMs(seconds);
  }

  prettyMs(seconds) {
    if (!seconds) {
      return "";
    }
    return this.utilities.prettyMs(seconds * 1000, {verbose: true});
  }

  loadJobs() {
    this.loading = true;
    this.httpService.getScheduledJobs()
      .subscribe(
        response => {
          this.scheduledJobs = response;
          this.remainingJobs = _.flatten(Object.values(response));
          this.remainingJobs = _.filter(this.remainingJobs, (job) => {
            return this.dedicatedTablesFor.indexOf(job.description) == -1;
          });
          this.loading = false;
          this.lastLoad = moment();
        },
        error => {
          this.alertService.error('Error getting jobs.');
          console.error(error);
          this.loading = false;
        });
  }

  nmapHaScan() {
    this.httpService.nmapHaScan("covid", true)
      .subscribe(
        job => {
          this.loadJobs();
        },
        error => {
          this.alertService.error(error);
          console.error(error);
        });
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

  trackById(index, item) {
    return item.id;
  }

}
