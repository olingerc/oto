
import { Component, OnInit, OnDestroy } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import moment from 'moment';
import _ from 'lodash';

import { AdminHttpService } from '../admin-http.service';
import { AlertService } from '../../core/alert/alert.service';
import { JobdetailsDialog } from './jobdetails-dialog.component';
import { UtilitiesService } from '../../core/utilities.service';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { VisibleForPrivilegesDirective } from '../../shared/directives/visible-for-privileges.directive';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { FlexModule } from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-admin-scheduledjobs',
    templateUrl: './scheduledjobs.component.html',
    styleUrls: ['./scheduledjobs.component.scss'],
    standalone: true,
    imports: [FlexModule, MatButtonModule, MatTooltipModule, MatIconModule, MatCardModule, VisibleForPrivilegesDirective, MatToolbarModule, TableModule, PrimeTemplate, DatePipe]
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

  checkMinecraftServerStatus() {
    this.httpService.checkMinecraftServerStatus()
      .subscribe(
        job => {
          this.loadJobs();
        },
        error => {
          this.alertService.error(error);
          console.error(error);
        });
  }


  detectGarage() {
    this.httpService.detectGarage()
      .subscribe(
        job => {
          this.loadJobs();
        },
        error => {
          this.alertService.error(error);
          console.error(error);
        });
  }

  checkOvh() {
    this.httpService.checkOvh()
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
