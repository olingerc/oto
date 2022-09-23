import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { UserService } from '../../core/user/user.service';

@Component({
  selector: 'navbar-setpassword-dialog',
  templateUrl: 'navbar-setpassword-dialog.component.html'
})
export class NavbarSetPasswordDialog {

  setPasswordForm: FormGroup;
  public setPasswordError = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NavbarSetPasswordDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
  ) {
    this.setPasswordForm = this.fb.group(
      {
        password1: this.fb.control('', [Validators.required]),
        password2: this.fb.control('', [Validators.required])
      }
    );
  }

  confirmDialog(): void {
    if (this.setPasswordForm.get('password1').value !== this.setPasswordForm.get('password2').value) {
      this.setPasswordForm.controls["password1"].setErrors({invalid: true});
      this.setPasswordForm.controls["password2"].setErrors({invalid: true});
      return;
    }

    let password = this.setPasswordForm.get('password1').value;
    this.userService.addPasswordByUser(this.data.userId, password)
      .subscribe(
        data => {
          this.dialogRef.close(true);
        },
        error => {
          this.setPasswordError = error;
        });
  }

}
