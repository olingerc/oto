import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';

import { Subscription } from "rxjs";
import _ from "lodash";
import { ConfirmationService } from "../../core/confirmation/confirmation.service";

import { JobdetailsDialog } from '../scheduledjobs/jobdetails-dialog.component';
import { VelonaSocketService } from "../../core/websocket/velona-socket.service";
import { AlertService } from "../../core/alert/alert.service";
import { BioinfHttpService } from "../../core/bioinf-http.service";
import { AdminHttpService } from "../admin-http.service";
import { MyTruncatePipe } from "../../shared/pipes/truncate.pipe";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ExtendedModule } from "@ngbracket/ngx-layout/extended";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { NgClass } from "@angular/common";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatCardModule } from "@angular/material/card";
import { FlexModule } from "@ngbracket/ngx-layout/flex";

@Component({
    selector: "app-workers-dashboard",
    templateUrl: "./workers-dashboard.component.html",
    styleUrls: ["./workers-dashboard.component.scss"],
    standalone: true,
    imports: [FlexModule, MatCardModule, MatToolbarModule, MatButtonModule, MatIconModule, NgClass, ExtendedModule, MatTooltipModule, MyTruncatePipe]
})
export class WorkersDashboardComponent implements OnInit, OnDestroy {

  public socketStatus = "connecting...";
  public workers: any[];
  public workstationStatus: any = {};
  public workerDetail: any;
  public queues: string[] = [];
  public workerLoading = true;

  private statusChangeSubscription: Subscription;

  constructor(
    private dialog: MatDialog,
    private confirmationService: ConfirmationService,
    private socketService: VelonaSocketService,
    private alertService: AlertService,
    private bioinfHttpService: BioinfHttpService,
    private httpService: AdminHttpService
  ) { }

  ngOnInit() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    this.bioinfHttpService.login({"username": currentUser.username})
      .subscribe(
        response => {
          this.addSubscriptions();
        },
        error => {
          this.alertService.error(error)
        }
    );

    // ask for status on socket connect
    this.statusChangeSubscription = this.socketService.connectionStatus()
      .subscribe(
        (status: string) => {
          this.socketStatus = status;
          if (status !== "connected") {

          } else {
            // Let request_worker_monitor set connection status
            this.socketService.emit("request_worker_monitor");
          }
        },
        (error) => {
          console.error(error);
        }
      );

    // this.loadStatus();
    // I decided to wait for first websocket
  }

  ngOnDestroy() {
    this.statusChangeSubscription.unsubscribe();
    this.socketService.emit("request_worker_monitor_disconnect");
    this.socketService.disconnect("workers-dashboard");
  }

  drawStatus(status) {
    this.workstationStatus = status;
    this.workers = _.sortBy(status.w, (worker) => {
      return worker.queues[0];
    });
  }

  addSubscriptions() {
    this.socketService
      .addSubject$("workers-dashboard", "workers_monitor")
      .subscribe((data: any) => {
        this.workerLoading = false;
        this.drawStatus(data.status);
      });

    this.socketService
      .addSubject$("workers-dashboard", "request_workers_monitor_error")
      .subscribe(data => console.error(data));

    this.socketService
      .addSubject$("workers-dashboard", "cancel_worker_error")
      .subscribe(data => console.error(data));
  }

  /*loadStatus() {
    this.httpService.getDetailedStatus()
      .subscribe(
        response => {
          this.drawStatus(response);
        },
        error => {
          this.alertService.error("Error getting status. Contact admin.");
          console.error(error);
        });
  }*/

  /**
   * WORKERS
   */
  addWorker(queue) {
    this.workerLoading = true;
    this.httpService.addWorker(queue)
    .subscribe(
      response => {
        /* no use expecitn satus, here because doker has been created but not yet registered in redis
         status looks in redis */
        this.workerLoading = false;
      },
      error => {
        this.alertService.error(error)
      }
    );
  }

  defaultWorkers() {
    // this.cancelAllWorkers();
    this.socketService.emit("default_workers");
  }

  cancel_worker(workerNname) {
    this.socketService.emit("cancel_worker", {
      "worker_name": workerNname
    });
  }

  kill_worker(workerNname) {
    this.confirmationService.confirm({
      header: "Kill worker",
      icon: "delete",
      message: "Are you absolutely sure you want to kill the worker?",
      accept: () => {
        this.workerLoading = true;
        this.httpService.killWorker(workerNname)
        .subscribe(
          response => {
            this.workerLoading = false;
            this.drawStatus(response.status);
          },
          error => {
            this.alertService.error(error.error)
          }
        );
      }
    });
  }

  cancelAllWorkers() {
    this.socketService.emit("cancel_all_workers");
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

  trackWorkers(index, item) {
    return item.name;
  }

}
