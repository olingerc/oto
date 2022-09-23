import { Component, OnInit } from "@angular/core";

import * as _ from 'lodash';

import { EnvService } from "../../core/env/env.service";
import { AlertService } from "../../core/alert/alert.service";
import { AdminHttpService } from "../admin-http.service";
import { UtilitiesService } from "../../core/utilities.service";

@Component({
  selector: "app-infrastructure-dashboard",
  templateUrl: "./infrastructure-dashboard.component.html",
  styleUrls: ["./infrastructure-dashboard.component.scss"]
})
export class InfrastructureDashboardComponent implements OnInit {

  constructor(
    private alertService: AlertService,
    private httpService: AdminHttpService,
    private env: EnvService,
    private utils: UtilitiesService
  ) { }

  ngOnInit() {
    /*this.httpService.getInfraChecks()
    .subscribe(
      response => {
        this.dragenDatasetRecent = this.compileDragenRecentDataset(response.dragen);
        this.drawDragenRecentChart();
        this.spaceDatasetRecent = this.compileSpaceRecentDataset(response.space);
        this.drawSpaceRecentChart();
        this.allDragenDataset = this.compileAllDragen(response.dragen);
        this.drawAllDragenChart();
        this.allSpaceDataset = this.compileAllSpace(response.space);
        this.drawAllSpaceChart();
      },
      error => {
        this.alertService.error(error)
      }
    );*/
  }
}
