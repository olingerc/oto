
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
    "veriseq_parse",
    "veriseq_import_glims",
    "ngssync_do_sequencer_check",
    "ngssync_parse",
    "ngssync_copy_new_run",
    "ngssync_update_run",
    "ngssync_ask_to_delete",
    "create_homepage",
    "execute_glims_import",
    "execute_parse_hub"
  ]

  public importInterval: any;
  public remainingJobs: any[] = [];
  public scheduledJobs: any = {};
  public veriseqJobs: any[] = [];
  public ngssyncJobs: any[] = [];
  public tasksStatus: any;

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
    this.getTasksSate();
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

  getTasksSate() {
    this.httpService.getTasksStatus()
    .subscribe(
      (response) => {
        this.tasksStatus = response;
      },
      (error) => {
        this.tasksStatus = null;
      }
    );
  }

  loadJobs() {
    this.loading = true;
    this.httpService.getScheduledJobs()
      .subscribe(
        response => {
          this.scheduledJobs = response;
          this.veriseqJobs = [
            ...response.veriseq_parse || [],
            ...response.veriseq_import_glims || []
          ];
          this.ngssyncJobs = [
            ...response.ngssync_do_sequencer_check || [],
            ...response.ngssync_parse || [],
            ...response.ngssync_copy_new_run || [],
            ...response.ngssync_update_run || [],
            ...response.ngssync_ask_to_delete || [],
          ];
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

  launchImports(which_part, replace = false) {
    this.httpService.importGlims(which_part, replace)
      .subscribe(
        job => {
          this.loadJobs();
        },
        error => {
          this.alertService.error(error);
          console.error(error);
        });
  }

  generateHomepage() {
    this.httpService.generateHomepage()
      .subscribe(
        job => {
          this.loadJobs();
        },
        error => {
          this.alertService.error(error);
          console.error(error);
        });
  }

  doInfraCheck() {
    this.httpService.doInfraCheck()
      .subscribe(
        job => {
          this.loadJobs();
        },
        error => {
          this.alertService.error(error);
          console.error(error);
        });
  }

  parseHub() {
    this.httpService.parseHubToDb()
      .subscribe(
        job => {
          this.loadJobs();
        },
        error => {
          this.alertService.error(error);
          console.error(error);
        });
  }

  parseVeriseq() {
    this.httpService.parseVeriseq()
      .subscribe(
        job => {
          this.loadJobs();
        },
        error => {
          this.alertService.error(error);
          console.error(error);
        });
  }

  parseVeriseqComplete() {
    this.httpService.parseVeriseqComplete()
      .subscribe(
        job => {
          this.loadJobs();
        },
        error => {
          this.alertService.error(error);
          console.error(error);
        });
  }

  checkRecent() {
    this.httpService.checkRecent()
      .subscribe(
        job => {
          this.loadJobs();
        },
        error => {
          this.alertService.error(error);
          console.error(error);
        });
  }

  checkAll() {
    this.httpService.checkAll()
      .subscribe(
        job => {
          this.loadJobs();
        },
        error => {
          this.alertService.error(error);
          console.error(error);
        });
  }

  copyNewRuns() {
    this.httpService.copyNewRuns()
      .subscribe(
        job => {
          this.loadJobs();
        },
        error => {
          this.alertService.error(error);
          console.error(error);
        });
  }

  importGlimsVeriseq() {
    this.httpService.importGlimsVeriseq()
      .subscribe(
        job => {
          this.loadJobs();
        },
        error => {
          this.alertService.error(error);
          console.error(error);
        });
  }

  convertConseil() {
    this.httpService.convertConseil()
      .subscribe(
        job => {
          this.loadJobs();
        },
        error => {
          this.alertService.error(error);
          console.error(error);
        });
  }

  doCompleteVdbRecount() {
    this.httpService.doCompleteVdbRecount()
      .subscribe(
        job => {
          this.loadJobs();
        },
        error => {
          this.alertService.error(error);
          console.error(error);
        }
      );
  }

  updateContextCounts() {
    this.httpService.updateContextCounts()
      .subscribe(
        job => {
          this.loadJobs();
        },
        error => {
          this.alertService.error(error);
          console.error(error);
        }
      );
  }

  findNewMappings() {
    this.httpService.findNewMappings()
      .subscribe(
        job => {
          this.loadJobs();
        },
        error => {
          this.alertService.error(error);
          console.error(error);
        }
      );
  }

  findNewMappingsCnv() {
    this.httpService.findNewMappingsCnv()
      .subscribe(
        job => {
          this.loadJobs();
        },
        error => {
          this.alertService.error(error);
          console.error(error);
        }
      );
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
