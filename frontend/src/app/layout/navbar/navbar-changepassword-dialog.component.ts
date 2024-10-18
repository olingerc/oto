import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { UserService } from '../../core/user/user.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { AutofocusDirective } from '../../shared/directives/focus.directive';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'navbar-changepassword-dialog',
    templateUrl: 'navbar-changepassword-dialog.component.html',
    standalone: true,
    imports: [MatDialogModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, AutofocusDirective, NgIf, MatIconModule, MatButtonModule]
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
          console.log(error)
          if (error.indexOf && error.indexOf('incorrect password') > -1) {
            this.changePasswordForm.controls["oldPassword"].setErrors({invalid: true});
          } else {
            this.changePasswordError = error;
          }
        });
  }

}
