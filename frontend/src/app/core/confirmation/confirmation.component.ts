import { Component, OnDestroy } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { ConfirmationDialog } from './confirmation-dialog.component';
import { ConfirmationService } from './confirmation.service';
import { ConfirmationConfig } from './confirmation-config.model';

@Component({
  selector: 'oto-confirmation-dialog',
  template: "<div></div>"
})
export class ConfirmationComponent implements OnDestroy {

  confrimationSubscription: Subscription;

  constructor(
    private dialog: MatDialog,
    private confirmationService: ConfirmationService
  ) {
    this.confrimationSubscription = this.confirmationService.confirmationAsked()
      .subscribe(config => {
        this.confirm(config);
      });
  }

  ngOnDestroy() {
    this.confrimationSubscription.unsubscribe();
  }

  confirm(config: ConfirmationConfig) {
    let dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '500px',
      data: config
    });

    dialogRef.beforeClosed().subscribe(response => {
      if (response && config.accept) {
        config.accept();
      }

      if (!response) {
        if (config.reject) {
          config.reject();
        } else {
          dialogRef.close();
        }
      }
    });
  }

}
