import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { UserService } from '../../core/user/user.service';
import { AlertService } from '../../core/alert/alert.service';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { MatButtonModule } from '@angular/material/button';

import { MatChipsModule } from '@angular/material/chips';
import { AutofocusDirective } from '../../shared/directives/focus.directive';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'navbar-edituser-dialog',
    templateUrl: 'navbar-edituser-dialog.component.html',
    standalone: true,
    imports: [MatDialogModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, AutofocusDirective, MatChipsModule, MatButtonModule]
})
export class NavbarEditUserDialog {

  public editUserForm: FormGroup;
  public removeUserPasswordInput: FormControl;

  public removingUser = false;
  public removeUserPassword = '';
  public removeUserError = false;

  private validateEmail(c: FormControl) {
    // tslint:disable-next-line
    let EMAIL_REGEXP = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    return (!c.value || c.value === '') && EMAIL_REGEXP.test(c.value) ? null : {
      validateEmail: {
        valid: false
      }
    };
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public dialogRef: MatDialogRef<NavbarEditUserDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService
  ) {
    this.editUserForm = this.fb.group(
      {
        id: null, // for updates to server
        email: [null, this.validateEmail],
        fullname: null
      }
    );
    this.removeUserPasswordInput = new FormControl('', [
      Validators.required
    ]);
    this.editUserForm.patchValue(data.user.forForm());
  }

  startRemovingUser() {
    this.removeUserPassword = '';
    this.removeUserError = false;
    this.removingUser = true;
  }

  confirmRemovingUser() {
    this.removeUserError = false;

    this.userService.deleteByUser(this.data.user.username, this.removeUserPassword)
      .subscribe(
        data => {
          this.removingUser = false;
          this.authenticationService.logout(
            () => {
              this.router.navigate(['/login']);
            }
          );
        },
        error => {
          if (error.indexOf && error.indexOf('incorrect password') > -1) {
            this.removeUserPasswordInput.setErrors({invalid: true});
          } else {
            this.removeUserError = true;
          }
        });
  }

  confirmDialog(): void {
    let updatedUser = this.editUserForm.value;
    this.userService.update(updatedUser)
      .subscribe(
        data => {
          this.alertService.info('User has been update successfully.');
          this.dialogRef.close(updatedUser);
        },
        error => {
          this.alertService.error(error);
          console.log(error);
        }
      );
  }

}
