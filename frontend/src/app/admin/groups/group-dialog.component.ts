import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Lab } from '../../core/lab.model';
import { UserService } from '../../core/user/user.service';
import { AlertService } from '../../core/alert/alert.service';

@Component({
  selector: 'group-dialog',
  templateUrl: 'group-dialog.component.html',
})
export class GroupDialogComponent {

  public groupForm: FormGroup;
  public loading: boolean;
  public labs: Lab[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<GroupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
    private alertService: AlertService
  ) {

    this.groupForm = this.fb.group({
      id: null, // for updates
      title: null,
      selectable: true,
      lab: null
    });

    if (data.group) {
      this.groupForm.patchValue(data.group);
      if (data.group.lab) {
        this.groupForm.controls["lab"].setValue(data.group.lab.id);
      }
    }

    if (data.labs) {
      this.labs = data.labs;
    }
  }

  confirmDialog(): void {
    if (this.data.action === "add") {
      this.userService.createGroup(this.groupForm.value)
        .subscribe(
          () => {
            this.loading = false;
            this.dialogRef.close();
            this.alertService.info("Group added");
          },
          error => {
            this.alertService.error(error, 'Error adding group');
            this.loading = false;
          });
    } else {
      this.userService.updateGroup(this.groupForm.value)
        .subscribe(
          () => {
            this.loading = false;
            this.dialogRef.close();
            this.alertService.info("Group updated");
          },
          error => {
            this.alertService.error(error, 'Error updating group');
            this.loading = false;
          });
    }
  }
}
