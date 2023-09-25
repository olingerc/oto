import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as _ from 'lodash';

import { User } from '../../core/user.model';
import { UserService } from '../../core/user/user.service';
import { AlertService } from '../../core/alert/alert.service';
import { Privileges } from '../../core/privileges.model';
import { EnvService } from "../../core/env/env.service";
import { UtilitiesService } from "../../core/utilities.service";

@Component({
  selector: 'user-dialog',
  templateUrl: 'user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss'],
})
export class UserDialogComponent {

  public userForm: FormGroup;
  public user: User;
  public loading = false;
  public myArrayFilterByKey: any;
  public myArrayFilter: any;

  public privTypes = Privileges.privileges;
  public limsConfigs: any[];

  private validateEmail(c: FormControl) {
    // tslint:disable-next-line
    let EMAIL_REGEXP = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    return (!c.value || c.value === '') ? null : {
      validateEmail: {
        valid: false
      }
    };
  }

  constructor(
    private fb: FormBuilder,
    private env: EnvService,
    public dialogRef: MatDialogRef<UserDialogComponent>,
    private userService: UserService,
    private alertService: AlertService,
    private utilities: UtilitiesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.userForm = this.fb.group({
      id: null, // for updates
      username: [null, Validators.required],
      fullname: null,
      password: null,
      email: [null, this.validateEmail]
    });

    if (data.user) {
      this.user = data.user;
      this.userForm.patchValue(data.user);
    }

  }

  selectUser(event) {
    let user = event.data;
    this.userForm.patchValue({
      "username": user.sAMAccountName,
      "fullname": user.name,
      "email": user.mail
    });
  }

  addPrivilege(user, priv) {
    this.loading = true;
    user.privileges.push(priv);
    user.privileges = _.uniq(user.privileges);

    this.userService.update(user)
      .subscribe(
        updatedUser => {
          user = updatedUser;
          this.loading = false;
        },
        error => {
          this.alertService.error(error, 'Error adding privilege');
          this.loading = false;
        });
  }

  removePrivilege(user, privilegeToRemove) {
    this.loading = true;
    user.privileges = _.pull(user.privileges, privilegeToRemove);
    this.userService.update(user)
      .subscribe(
        () => {
          this.loading = false;
        },
        error => {
          this.alertService.error(error, 'Error removing privilege');
          this.loading = false;
        });
  }

  removePassword(user) {
    this.loading = true;
    this.userService.removePasswordByAdmin(user.id)
      .subscribe(
        () => {
          this.loading = false;
          user.default_password_changed = false;
          this.alertService.info("Password reset");
          this.dialogRef.close();
        },
        error => {
          this.alertService.error(error, 'Error removing password');
          this.loading = false;
        });
  }

  deleteUser(userId) {
    this.loading = true;
    this.userService.deleteByAdmin(userId)
      .subscribe(
        () => {
          this.loading = false;
          this.alertService.info("User deleted");
          this.dialogRef.close();
        },
        error => {
          this.alertService.error(error, 'Error deleting user');
          this.loading = false;
        });
  }

  confirmDialog(): void {
    this.loading = true;
    if (this.data.action === "add") {
      this.userService.create(this.userForm.value)
        .subscribe(
          () => {
            this.loading = false;
            this.dialogRef.close();
            this.alertService.info("User added");
          },
          error => {
            this.alertService.error(error, 'Error adding user');
            this.loading = false;
          });
    } else {
      this.userService.update(this.userForm.value)
        .subscribe(
          () => {
            this.loading = false;
            this.dialogRef.close();
            this.alertService.info("User updated");
          },
          error => {
            this.alertService.error(error, 'Error updating user');
            this.loading = false;
          });
    }
  }
}
