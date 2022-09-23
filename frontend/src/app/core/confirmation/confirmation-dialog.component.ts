import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { UserService } from '../../core/user/user.service';

@Component({
  selector: 'confirmation-dialog-dialog',
  templateUrl: 'confirmation-dialog.component.html'
})
export class ConfirmationDialog {

  public header: string;
  public message: string;
  public icon: string;

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.header = data.header;
    this.message = data.message;
    this.icon = data.icon;
  }

  confirmDialog(): void {
    this.dialogRef.close(true);
  }

  cancelDialog(): void {
    this.dialogRef.close(false);
  }

}
