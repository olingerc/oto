import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { UserService } from '../../core/user/user.service';

@Component({
  selector: 'navbar-changepassword-dialog',
  templateUrl: 'navbar-changepassword-dialog.component.html'
})
export class NavbarChangePasswordDialog {

  public changePasswordForm: FormGroup;
  public changePasswordError = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NavbarChangePasswordDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
  ) {
    this.changePasswordForm = fb.group(
      {
        oldPassword: this.fb.control('', [Validators.required]),
        password1: this.fb.control('', [Validators.required]),
        password2: this.fb.control('', [Validators.required])
      }
    );
  }

  confirmDialog(): void {
    this.changePasswordForm.clearValidators();
    if (this.changePasswordForm.get('password1').value !== this.changePasswordForm.get('password2').value) {
      this.changePasswordForm.controls["password1"].setErrors({invalid: true});
      this.changePasswordForm.controls["password2"].setErrors({invalid: true});
      return;
    }

    this.userService.changePasswordByUser(
      this.data.userId,
      this.changePasswordForm.get('oldPassword').value,
      this.changePasswordForm.get('password1').value
    )
      .subscribe(
        data => {
          this.dialogRef.close(true);
        },
        error => {
          if (error.endsWith('incorrect password')) {
            this.changePasswordForm.controls["oldPassword"].setErrors({invalid: true});
          } else {
            this.changePasswordError = error;
          }
        });
  }

}
