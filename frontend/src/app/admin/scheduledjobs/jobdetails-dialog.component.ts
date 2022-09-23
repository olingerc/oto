import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import * as _ from 'lodash';
import * as moment from 'moment';

import { UtilitiesService } from '../../core/utilities.service';

@Component({
  selector: 'jobdetails-dialog',
  templateUrl: 'jobdetails-dialog.component.html'
})
export class JobdetailsDialog {

  public job: any;

  constructor(
    private utilities: UtilitiesService,
    public dialogRef: MatDialogRef<JobdetailsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.job = data.job;
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


}
