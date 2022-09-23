import { Component, OnDestroy, OnInit } from "@angular/core";

import { Subscription } from "rxjs";
import { map } from "rxjs/operators";
import * as _ from "lodash";
import * as moment from "moment";

import { VelonaSocketService } from "../../core/websocket/velona-socket.service";
import { AlertService } from "../../core/alert/alert.service";
import { UtilitiesService } from "../../core/utilities.service";
import { BioinfHttpService } from "../../bioinf-core/services/bioinf-http.service";

@Component({
  selector: "app-queues-dashboard",
  templateUrl: "./queues-dashboard.component.html",
  styleUrls: ["./queues-dashboard.component.scss"]
})
export class QueuesDashboardComponent implements OnInit, OnDestroy {

  public socketStatus = "connecting...";
  public knownQueues: any[] = [];
  public activeQueue: any;
  public queues: any = {};
  public pipelines: any = [];
  public loading = true;
  public selectedJob: any;

  private statusChangeSubscription: Subscription;

  constructor(
    private socketService: VelonaSocketService,
    private alertService: AlertService,
    private bioinfHttpService: BioinfHttpService,
    private utilities: UtilitiesService,
  ) { }

  ngOnInit() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    this.bioinfHttpService.login({"username": currentUser.username, "groupId": currentUser.lastActiveGroupId})
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
            this.socketService.emit("request_queued_monitor");
          }
        },
        (error) => {
          console.error(error);
        }
      );
  }

  ngOnDestroy() {
    this.statusChangeSubscription.unsubscribe();
    this.socketService.emit("request_workers_monitor_disconnect");
    this.socketService.disconnect("queues-dashboard");
  }

  addSubscriptions() {
    this.socketService
      .addSubject$("queues-dashboard", "queued_monitor")
      .subscribe((data: any) => {
        this.loading = false;
        // this.knownQueues = data.known_queues;
        // this.queues = data.queued_jobs;
        this.pipelines = data.unfinished_pipelines;
      });

    this.socketService
      .addSubject$("queues-dashboard", "request_queued_monitor_error")
      .subscribe(data => console.error(data));

    this.socketService
      .addSubject$("queues-dashboard", "queued_monitor_error")
      .subscribe(data => console.error(data));

  }

  prettyMs(seconds) {
    if (!seconds) {
      return "forever";
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

  getLink(pl) {
    return pl.status == "SUCCESS" ? `/bioinf/results/${pl.pipelineid}` : `/bioinf/progress/${pl.pipelineid}`;
  }

  trackJobs(index, job) {
    return job.id;
  }
}
