import { Component, OnDestroy, OnInit } from "@angular/core";

import * as _ from "lodash";

import { AlertService } from "../../core/alert/alert.service";
import { AdminHttpService } from "../admin-http.service";
import { ConfirmationService } from "../../core/confirmation/confirmation.service";

@Component({
  selector: "app-danger-zone-dashboard",
  templateUrl: "./danger-zone.component.html",
  styleUrls: ["./danger-zone.component.scss"]
})
export class DangerZoneComponent implements OnInit, OnDestroy {

  constructor(
    private alertService: AlertService,
    private httpService: AdminHttpService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  }

  ngOnDestroy() {
  }

  reinjectAll() {
    this.confirmationService.confirm({
      header: "Recount",
      icon: "delete",
      message: "Are you absolutely sure you want to do this?",
      accept: () => {
      }
    });
  }

}
