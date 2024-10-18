import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FlexModule } from '@ngbracket/ngx-layout/flex';
import { NgIf } from '@angular/common';

@Component({
    selector: 'confirmation-dialog-dialog',
    templateUrl: 'confirmation-dialog.component.html',
    standalone: true,
    imports: [NgIf, MatDialogModule, FlexModule, MatIconModule, MatButtonModule]
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
